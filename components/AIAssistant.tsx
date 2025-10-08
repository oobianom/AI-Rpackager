import React, { useState, useRef, useEffect } from 'react';
import { continueConversation } from '../services/geminiService';
import { Message } from '../types';
import { SendIcon } from './icons';
import { useFileSystem } from '../contexts/FileSystemContext';
import SamplePromptsModal from './SamplePromptsModal';
import { Part, Content } from '@google/genai';
import AIToolBadge from './AIToolBadge';
import AIProgressTracker, { AIFileOperation } from './AIProgressTracker';

interface AIAssistantProps {
    userApiKey: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ userApiKey }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [fileOperations, setFileOperations] = useState<AIFileOperation[]>([]);

  const { createNode, editFile, duplicateNode, getResourceFilesContent } = useFileSystem();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initialMessage = !userApiKey
      ? "Hello! I am R Packager, your AI assistant. To get started, please provide your Gemini API key in the Settings page to use the assistant."
      : "Hello! I am R Packager, your AI assistant for building R packages. I can help you create, edit, and duplicate files and folders within your '/Package' directory. How can I assist you today?";
    
    setMessages([{ 
      role: 'model', 
      content: initialMessage 
    }]);
  }, []); // Run only once on mount to set the initial message based on key presence.


  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    setIsPromptsModalOpen(false);
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    // RAG: Retrieve context from /Resources folder
    const resourceFiles = await getResourceFilesContent();
    let contextString = '';
    if (resourceFiles.length > 0) {
        contextString = "Use the following content from the '/Resources' folder as context to answer my question:\n\n";
        for (const file of resourceFiles) {
            contextString += `--- START OF FILE: ${file.path} ---\n`;
            contextString += `${file.content}\n`;
            contextString += `--- END OF FILE: ${file.path} ---\n\n`;
        }
    }

    const finalInput = contextString ? `${contextString}${input}` : input;

    // Clear previous operation visuals when starting a new turn
    setFileOperations([]);
    const userMessage: Message = { role: 'user', content: finalInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const apiHistory: Content[] = newMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));
    
    try {
        let finalResponseFound = false;
        let toolsUsedInTurn: string[] = [];

        while (!finalResponseFound) {
            const response = await continueConversation(apiHistory, userApiKey);
            
            if (response.functionCalls && response.functionCalls.length > 0) {
                apiHistory.push({ role: 'model', parts: response.functionCalls.map(fc => ({ functionCall: fc })) });
                
                // FIX: Cast `call.args.path` to string to satisfy AIFileOperation type.
                const pendingOps: AIFileOperation[] = response.functionCalls.map(call => ({
                    path: call.args.path as string,
                    status: 'loading',
                }));
                setFileOperations(prev => [...prev, ...pendingOps]);

                const toolResponses: Part[] = [];
                for (const call of response.functionCalls) {
                    toolsUsedInTurn.push(call.name);
                    let result: { success: boolean, message: string };

                    // FIX: Cast function call arguments to their expected types to resolve TypeScript errors.
                    const path = call.args.path as string;

                    switch (call.name) {
                        case 'createNode':
                            result = await createNode(path, call.args.type as 'file' | 'folder', call.args.content as string);
                            break;
                        case 'editFile':
                            result = await editFile(path, call.args.content as string);
                            break;
                        case 'duplicateNode':
                            result = await duplicateNode(path);
                            break;
                        default:
                            result = { success: false, message: `Unknown function call: ${call.name}` };
                    }

                    if (result.success) {
                        setFileOperations(prev => prev.map(op => 
                            op.path === path ? { ...op, status: 'success' } : op
                        ));
                    } else {
                         setFileOperations(prev => prev.filter(op => op.path !== path));
                    }

                    toolResponses.push({
                        functionResponse: {
                            name: call.name,
                            response: { result: result.message },
                        }
                    });
                }
                apiHistory.push({ role: 'user', parts: toolResponses });
            } else {
                finalResponseFound = true;
                const modelResponseText = response.text;
                if (modelResponseText) {
                    const newModelMessage: Message = { 
                        role: 'model', 
                        content: modelResponseText,
                        toolsUsed: toolsUsedInTurn.length > 0 ? toolsUsedInTurn : undefined,
                    };
                    setMessages(prev => [...prev, newModelMessage]);
                } else {
                   const errorMessage: Message = { role: 'model', content: "I was unable to process that request. Please try again." };
                   setMessages(prev => [...prev, errorMessage]);
                }
            }
        }
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessageContent = error instanceof Error && error.message.includes("API Key") 
          ? "There's an issue with the API key. Please check your key in Settings or use the default."
          : "An error occurred while fetching the response.";

      const errorMessage: Message = { role: 'model', content: errorMessageContent };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
       setTimeout(() => {
          setFileOperations([]);
      }, 4000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50">
        <div className="flex-grow h-96 overflow-y-auto p-2 text-sm space-y-4 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-2 max-w-xs lg:max-w-md rounded-md ${msg.role === 'user' ? 'bg-blue-700 text-white' : 'bg-slate-100'}`}>
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 border-b border-slate-300 pb-2">
                        {msg.toolsUsed.map(toolName => <AIToolBadge key={toolName} toolName={toolName} />)}
                    </div>
                )}
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}
          {isLoading && !fileOperations.length && (
            <div className="flex items-start">
              <div className="p-2 bg-slate-200 rounded-md">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <AIProgressTracker operations={fileOperations} />

        <div className="p-2 border-t border-slate-200">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask R Packager... (Shift+Enter for new line)"
              disabled={isLoading}
              className="flex-grow bg-white border border-slate-300 focus:outline-none focus:border-sky-500 px-2 py-2 text-sm rounded-md resize-none max-h-48 overflow-y-auto custom-scrollbar"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="flex-shrink-0 px-3 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed rounded-md"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
           <button 
              onClick={() => setIsPromptsModalOpen(true)}
              className="text-xs text-sky-600 hover:text-sky-800 hover:underline mt-1.5 px-1"
            >
              Show Sample Prompts
            </button>
        </div>
      </div>
      {isPromptsModalOpen && <SamplePromptsModal onClose={() => setIsPromptsModalOpen(false)} onSelectPrompt={handleSelectPrompt} />}
    </>
  );
};

export default AIAssistant;