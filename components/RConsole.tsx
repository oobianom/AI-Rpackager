import React, { useState, useEffect, useRef } from 'react';
import { upsertFile } from '../services/fileSystemService';

// Declare WebR on the global scope for TypeScript
declare global {
    interface Window {
        WebR: any;
    }
}

interface ConsoleLine {
    type: 'input' | 'output' | 'error';
    content: string;
}

const RConsole: React.FC = () => {
    const [lines, setLines] = useState<ConsoleLine[]>([]);
    const [input, setInput] = useState<string>('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const endOfLinesRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const webRRef = useRef<any>(null); // To hold the WebR instance
    const LOG_FILE_PATH = '/logR.txt';

    useEffect(() => {
        // Initialize WebR
        if (webRRef.current) return;

        const initializeWebR = async () => {
            if (!globalThis.WebR) {
                setLines(prev => [...prev, { type: 'error', content: 'WebR failed to load. Please refresh the page.' }]);
                setIsLoading(false);
                return;
            }

            const appendLine = (line: ConsoleLine) => {
                setLines(prev => [...prev, line]);
            };

            appendLine({ type: 'output', content: 'Booting R virtual machine... This may take a moment.' });
            
            // Do not pass callbacks to constructor to avoid DataCloneError
            const webR = new globalThis.WebR();
            
            webRRef.current = webR;
            await webR.init();

            // Set up an async loop to continuously read from WebR's output stream
            (async () => {
                for (;;) {
                    const output = await webR.read();
                    if (output.type === 'closed') {
                        return;
                    }
                    // Handle multiline output
                    const outputLines = output.data.split('\n');
                    for (const line of outputLines) {
                        if (line) { // Avoid printing empty lines from trailing newlines
                            appendLine({
                                type: output.type === 'stdout' ? 'output' : 'error',
                                content: line,
                            });
                        }
                    }
                }
            })();


            appendLine({ type: 'output', content: 'R is ready.' });
            
            appendLine({ type: 'output', content: 'Installing and loading required packages (dplyr, ggplot2)...' });
            // Using evalR to capture installation and library loading output
            await webR.evalR("webr::install(c('dplyr', 'ggplot2','quickcode'), quiet = FALSE)");
            await webR.flush();
            await webR.evalR("library(dplyr)");
            await webR.flush();
            await webR.evalR("library(quickcode)");
            await webR.flush();
            await webR.evalR("library(ggplot2)");
            await webR.flush();
            appendLine({ type: 'output', content: 'Packages loaded successfully.' });
            appendLine({ type: 'output', content: "Type 'help()' for help." });
            
            setIsLoading(false);
            setIsInitialized(true);
        };

        initializeWebR().catch(err => {
            console.error("WebR Initialization Error:", err);
            setLines(prev => [...prev, { type: 'error', content: `Failed to initialize R: ${(err as Error).message}` }]);
            setIsLoading(false);
        });

    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const logContent = lines.map(line => line.content).join('\n');
        
        const timer = setTimeout(() => {
            upsertFile(LOG_FILE_PATH, logContent).catch(err => {
                console.error("Failed to write to R log file:", err);
                const SYSTEM_ERROR_MSG = `[System Error] Could not write to ${LOG_FILE_PATH}.`;
                // Prevent spamming the console with the same error
                if (!lines.some(l => l.content === SYSTEM_ERROR_MSG)) {
                    setLines(prev => [...prev, { type: 'error', content: SYSTEM_ERROR_MSG }]);
                }
            });
        }, 500); // Debounce to prevent too many writes

        return () => clearTimeout(timer);
    }, [lines, isInitialized]);

    useEffect(() => {
        endOfLinesRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [lines, isLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const processCommand = async (command: string) => {
        if (!webRRef.current) return;

        setLines(prev => [...prev, { type: 'input', content: `> ${command}` }]);

        const shelter = new webRRef.current.Shelter();
        try {
            const result = await shelter.captureR(command);
            const value = result.value;

            // If the result is visible (i.e., not assigned to a variable), print it.
            // The output of this print will be caught by the main `webR.read()` loop.
            if (result.visible && value) {
                await webRRef.current.evalR('print(.)', {
                    env: {
                        '.': value,
                    },
                });
            }
        } catch (e) {
            console.error("R Execution Error:", e);
            // Most errors are caught by stderr, but this catches execution-level issues.
            setLines(prev => [...prev, { type: 'error', content: (e as Error).message }]);
        } finally {
            // Clean up the WebAssembly memory by closing the shelter
            await shelter.close();
            
            // Ensure all output is flushed from R to the JS console
            if (webRRef.current) {
                await webRRef.current.flush();
            }
        }
    };
    
    const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isLoading) return;
            if (!input.trim()) {
                setLines([...lines, { type: 'input', content: '> ' }]);
                return;
            };
            
            const command = input;
            await processCommand(command);

            if (command) {
                setHistory(prev => [command, ...prev]);
            }
            setHistoryIndex(-1);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            } else {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };
    
    const handleConsoleClick = () => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }

    return (
        <div className="h-full flex flex-col p-2 bg-slate-800 text-slate-200 font-mono text-xs overflow-y-auto custom-scrollbar" onClick={handleConsoleClick}>
            <div className="flex-grow">
                {lines.map((line, index) => (
                    <div key={index}>
                        <pre className={`whitespace-pre-wrap ${
                            line.type === 'input' ? 'text-slate-300' :
                            line.type === 'error' ? 'text-red-400' : 'text-white'
                        }`}>
                            {line.content}
                        </pre>
                    </div>
                ))}
                 <div ref={endOfLinesRef} />
            </div>
            <div className="flex items-center">
                <span>&gt;</span>
                {isLoading ? (
                    <span className="ml-2 text-slate-400">Initializing R environment...</span>
                ) : (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                            className="flex-grow bg-transparent border-none text-slate-200 focus:outline-none ml-2"
                            autoFocus
                        />
                         <div className="blinking-cursor w-2 h-4 bg-slate-200"></div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RConsole;