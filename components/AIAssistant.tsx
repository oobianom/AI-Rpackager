import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PlusIcon } from './icons';
import { ChatMessage } from '../types';
import { generateContentWithHistory } from '../services/geminiService';
import Tooltip from './Tooltip';
import SamplePromptsModal from './SamplePromptsModal';
import { parseCodeFromMarkdown } from '../utils/parser';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateContentWithHistory(input, messages);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    setIsModalOpen(false);
  };
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Consider adding a toast notification for better UX
  };

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const codeBlocks = parseCodeFromMarkdown(part);
        if (codeBlocks.length > 0) {
          const { lang, code } = codeBlocks[0];
          return (
            <div key={index} className="bg-gray-800 rounded-md my-2">
              <div className="flex justify-between items-center px-4 py-1 bg-gray-900 text-xs text-gray-400 rounded-t-md">
                <span>{lang}</span>
                <button onClick={() => handleCopyCode(code)} className="hover:text-white">Copy</button>
              </div>
              <pre className="p-4 text-sm text-white overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
              <div className="whitespace-pre-wrap text-sm">{renderMessageContent(msg.parts[0].text)}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-lg p-3 rounded-lg bg-slate-200 text-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t border-slate-200 bg-white">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the AI assistant..."
            className="w-full p-2 pr-20 border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            rows={2}
            disabled={isLoading}
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center">
            <Tooltip text="Sample Prompts">
                <button onClick={() => setIsModalOpen(true)} className="p-2 hover:bg-slate-200 rounded-full" disabled={isLoading} aria-label="Show sample prompts">
                    <PlusIcon className="w-4 h-4 text-slate-600" />
                </button>
            </Tooltip>
            <Tooltip text="Send">
                <button onClick={handleSend} className="p-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 disabled:bg-slate-400" disabled={isLoading || input.trim() === ''} aria-label="Send message">
                    <SendIcon className="w-4 h-4" />
                </button>
            </Tooltip>
          </div>
        </div>
      </div>
      <SamplePromptsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPrompt={handleSelectPrompt}
      />
    </div>
  );
};

export default AIAssistant;
