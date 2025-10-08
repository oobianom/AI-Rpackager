import React, { useState, useEffect, useRef } from 'react';
import * as fileSystemService from '../services/fileSystemService';
import { buildFileTree } from '../utils/fileTree';
import { FileSystemNode } from '../types';
import JSZip from 'jszip';

interface TerminalLine {
    type: 'input' | 'output' | 'error';
    content: string;
}

const Terminal: React.FC = () => {
    const [lines, setLines] = useState<TerminalLine[]>([
        { type: 'output', content: "Welcome to the terminal. Type 'help' for available commands." }
    ]);
    const [input, setInput] = useState<string>('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [installedPackages, setInstalledPackages] = useState<string[]>([]);
    const endOfLinesRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        endOfLinesRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
    }, [lines]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const buildPackage = async (path: string) => {
        setLines(prev => [...prev, { type: 'output', content: `* building package ‘${path.split('/').pop()}’ ...` }]);
        try {
            const allNodes = await fileSystemService.getAllNodes();
            const packageDirNode = allNodes.find(n => n.path === path && n.type === 'folder');
    
            if (!packageDirNode) {
                setLines(prev => [...prev, { type: 'error', content: `ERROR: directory ‘${path}’ does not exist` }]);
                return;
            }
    
            const descriptionNode = allNodes.find(n => n.path === `${path}/DESCRIPTION`);
            if (!descriptionNode || !descriptionNode.content) {
                setLines(prev => [...prev, { type: 'error', content: `ERROR: file ‘${path}/DESCRIPTION’ not found` }]);
                return;
            }
    
            const content = descriptionNode.content;
            const packageNameMatch = content.match(/^Package:\s*(.*)/m);
            const versionMatch = content.match(/^Version:\s*(.*)/m);
    
            if (!packageNameMatch || !versionMatch) {
                setLines(prev => [...prev, { type: 'error', content: 'ERROR: Package or Version not found in DESCRIPTION file' }]);
                return;
            }
            
            const packageName = packageNameMatch[1].trim();
            const version = versionMatch[1].trim();
            const archiveName = `${packageName}_${version}.tar.gz`;
    
            const packageNodes = allNodes.filter(n => n.path.startsWith(`${path}/`));
            const zip = new JSZip();
            
            const packageFolderInZip = zip.folder(packageName);
    
            packageNodes.forEach(node => {
                const relativePath = node.path.substring(path.length + 1);
                if (node.type === 'folder') {
                    packageFolderInZip!.folder(relativePath);
                } else {
                    packageFolderInZip!.file(relativePath, node.content || '');
                }
            });
            
            const zipContentBase64 = await zip.generateAsync({ type: 'base64', compression: "DEFLATE" });
    
            await fileSystemService.addNode({
                path: `/${archiveName}`,
                type: 'file',
                content: zipContentBase64,
                size: zipContentBase64.length,
                lastModified: Date.now()
            });
    
            setLines(prev => [...prev, { type: 'output', content: `* created ‘/${archiveName}’` }]);
    
        } catch (e: any) {
            setLines(prev => [...prev, { type: 'error', content: `ERROR: Build failed. ${e.message}` }]);
        }
    };
    
    const checkPackage = async (path: string) => {
        const addCheckLine = (message: string, status: 'OK' | 'WARNING' | 'ERROR') => {
            const statusColor = status === 'OK' ? '<span class="text-green-400">OK</span>' : status === 'WARNING' ? '<span class="text-yellow-400">WARNING</span>' : '<span class="text-red-400">ERROR</span>';
            setLines(prev => [...prev, { type: 'output', content: `${message} ... ${statusColor}` }]);
        };
        
        let errors = 0;
        let warnings = 0;
        
        setLines(prev => [...prev, { type: 'output', content: `* using R version 4.3.0 (mock)`}]);
        setLines(prev => [...prev, { type: 'output', content: `* using platform: wasm-unknown-emscripten (wasm32)`}]);
        setLines(prev => [...prev, { type: 'output', content: `* using session charset: UTF-8`}]);
    
        try {
            const allNodes = await fileSystemService.getAllNodes();
            const packageDirNode = allNodes.find(n => n.path === path && n.type === 'folder');
            if (!packageDirNode) {
                 setLines(prev => [...prev, { type: 'error', content: `ERROR: directory ‘${path}’ does not exist` }]);
                return;
            }
            
            // Check for DESCRIPTION file
            const descriptionPath = `${path}/DESCRIPTION`;
            addCheckLine(`* checking for file ‘${path.split('/').pop()}/DESCRIPTION’`, 'OK');

            const descriptionNode = allNodes.find(n => n.path === descriptionPath);
            if (!descriptionNode || !descriptionNode.content) {
                setLines(prev => [...prev, { type: 'output', content: '  <span class="text-red-400">ERROR</span>: DESCRIPTION file not found.'}]);
                errors++;
            } else {
                // Check DESCRIPTION meta-information
                const content = descriptionNode.content;
                const checks = {
                    'Package': /^Package:\s*.+/m, 'Version': /^Version:\s*.+/m,
                    'License': /^License:\s*.+/m, 'Title': /^Title:\s*.+/m,
                    'Author': /^Author:\s*.+/m
                };
    
                let metaInfoOk = true;
                for (const [field, regex] of Object.entries(checks)) {
                    if (!regex.test(content)) {
                        setLines(prev => [...prev, { type: 'output', content: `  <span class="text-red-400">ERROR</span>: Field ‘${field}’ is missing from DESCRIPTION.`}]);
                        errors++;
                        metaInfoOk = false;
                    }
                }
                 addCheckLine(`* checking DESCRIPTION meta-information`, metaInfoOk ? 'OK' : 'ERROR');
            }
            
            const namespaceNode = allNodes.find(n => n.path === `${path}/NAMESPACE`);
            if (!namespaceNode) {
                addCheckLine(`* checking for namespace`, 'WARNING');
                setLines(prev => [...prev, { type: 'output', content: `  File ‘NAMESPACE’ not found. It will be auto-generated.` }]);
                warnings++;
            } else {
                addCheckLine(`* checking for namespace`, 'OK');
            }
    
            const rDirNode = allNodes.find(n => n.path === `${path}/R` && n.type === 'folder');
            if (!rDirNode) {
                addCheckLine(`* checking for R code`, 'WARNING');
                setLines(prev => [...prev, { type: 'output', content: '  No R code found.'}]);
                warnings++;
            } else {
                addCheckLine(`* checking for R code`, 'OK');
            }
            
            addCheckLine(`* checking for man pages`, 'OK'); // mock
            addCheckLine(`* checking for vignettes`, 'OK'); // mock
    
            setLines(prev => [...prev, { type: 'output', content: ` ` }]);
            if (errors > 0 || warnings > 0) {
                setLines(prev => [...prev, { type: 'output', content: `R CMD check results: ${warnings} WARNING(s), ${errors} ERROR(s).`}]);
            } else {
                setLines(prev => [...prev, { type: 'output', content: 'R CMD check results: OK'}]);
            }
            
        } catch(e: any) {
            setLines(prev => [...prev, { type: 'error', content: `ERROR: Check failed. ${e.message}` }]);
        }
    };

    const createPackageSkeleton = async (packageName: string) => {
        const basePath = `/Package/${packageName}`;
        const existingNode = await fileSystemService.getNode(basePath);
        if (existingNode) {
            setLines(prev => [...prev, { type: 'error', content: `Error: Directory '${basePath}' already exists.` }]);
            return;
        }

        setLines(prev => [...prev, { type: 'output', content: `* creating package skeleton in '${basePath}'` }]);

        const dirs = [`${basePath}/R`, `${basePath}/man`];
        const files = [
            {
                path: `${basePath}/DESCRIPTION`,
                content: `Package: ${packageName}\nType: Package\nTitle: What the Package Does (one line, title case)\nVersion: 0.1.0\nAuthor: Who wrote it\nMaintainer: The package maintainer <yourself@somewhere.net>\nDescription: More about what it does (maybe more than one line)\nLicense: MIT\nEncoding: UTF-8\n`
            },
            { path: `${basePath}/NAMESPACE`, content: `exportPattern(^[[:alpha:]]+)\n` }
        ];
        
        try {
            await fileSystemService.addNode({ path: basePath, type: 'folder', lastModified: Date.now() });
            for (const dirPath of dirs) {
                await fileSystemService.addNode({ path: dirPath, type: 'folder', lastModified: Date.now() });
            }
            for (const file of files) {
                await fileSystemService.addNode({ path: file.path, type: 'file', content: file.content, size: file.content.length, lastModified: Date.now() });
            }
             setLines(prev => [...prev, { type: 'output', content: `Done. Run 'ls' to see the new structure and 'Refresh Explorer' to update the file tree.` }]);
        } catch (e: any) {
             setLines(prev => [...prev, { type: 'error', content: `Error creating skeleton: ${e.message}` }]);
        }
    };

    const installPackage = async (path: string) => {
        setLines(prev => [...prev, { type: 'output', content: `* installing *source* package ‘${path.split('/').pop()}’ ...` }]);
        
        if (path.endsWith('.tar.gz')) {
             setLines(prev => [...prev, { type: 'error', content: 'Installing from archives is not yet supported. Please specify a source directory.' }]);
             return;
        }
        
        const descriptionPath = `${path}/DESCRIPTION`;
        const descriptionNode = await fileSystemService.getNode(descriptionPath);
        if (!descriptionNode || !descriptionNode.content) {
            setLines(prev => [...prev, { type: 'error', content: `ERROR: failed to find DESCRIPTION file in ‘${path}’` }]);
            return;
        }
        
        const packageNameMatch = descriptionNode.content.match(/^Package:\s*(.*)/m);
        if (!packageNameMatch) {
            setLines(prev => [...prev, { type: 'error', content: 'ERROR: Could not find Package name in DESCRIPTION' }]);
            return;
        }
        const packageName = packageNameMatch[1].trim();

        setLines(prev => [...prev, { type: 'output', content: `** using mock R installation` }]);
        setLines(prev => [...prev, { type: 'output', content: `** R` }]);
        setLines(prev => [...prev, { type: 'output', content: `** inst` }]);
        setLines(prev => [...prev, { type: 'output', content: `** preparing package for lazy loading` }]);
        setLines(prev => [...prev, { type: 'output', content: `** help` }]);
        setLines(prev => [...prev, { type: 'output', content: `** building package indices` }]);
        setLines(prev => [...prev, { type: 'output', content: `** testing if installed package can be loaded` }]);
        setLines(prev => [...prev, { type: 'output', content: `* DONE (${packageName})` }]);

        setInstalledPackages(prev => {
            if (prev.includes(packageName)) return prev;
            return [...prev, packageName].sort();
        });
    };

    const removePackage = async (packageName: string) => {
        if (!installedPackages.includes(packageName)) {
            setLines(prev => [...prev, { type: 'error', content: `Error in REMOVE: package ‘${packageName}’ is not installed` }]);
            return;
        }
        
        setLines(prev => [...prev, { type: 'output', content: `Removing package from mock library... (simulation)` }]);
        setInstalledPackages(prev => prev.filter(p => p !== packageName));
    };

    const handleRCommand = async (args: string[]) => {
        if (args.length < 2 || args[0] !== 'CMD') {
            setLines(prev => [...prev, { type: 'error', content: "Usage: R CMD <build|check|INSTALL|REMOVE> <args>" }]);
            return;
        }
    
        const subCommand = args[1];
        const commandArgs = args.slice(2);
    
        switch (subCommand) {
            case 'build':
                if (commandArgs.length !== 1) { setLines(prev => [...prev, { type: 'error', content: 'Usage: R CMD build <path>'}]); return; }
                await buildPackage(commandArgs[0]);
                break;
            case 'check':
                if (commandArgs.length !== 1) { setLines(prev => [...prev, { type: 'error', content: 'Usage: R CMD check <path>'}]); return; }
                await checkPackage(commandArgs[0]);
                break;
            case 'INSTALL':
                if (commandArgs.length !== 1) { setLines(prev => [...prev, { type: 'error', content: 'Usage: R CMD INSTALL <path>'}]); return; }
                await installPackage(commandArgs[0]);
                break;
            case 'REMOVE':
                 if (commandArgs.length !== 1) { setLines(prev => [...prev, { type: 'error', content: 'Usage: R CMD REMOVE <packagename>'}]); return; }
                await removePackage(commandArgs[0]);
                break;
            default:
                setLines(prev => [...prev, { type: 'error', content: `Unknown R CMD command: ${subCommand}` }]);
                break;
        }
    };

    const processCommand = async (command: string) => {
        const [cmd, ...args] = command.trim().split(' ');
        const newLines: TerminalLine[] = [...lines, { type: 'input', content: `$> ${command}` }];
        setLines(newLines);

        switch (cmd) {
            case 'help':
                setLines(prev => [...prev, { type: 'output', content: 'Available commands:\n  <span class="text-green-400">help</span>             - Show this help message\n  <span class="text-green-400">ls</span>               - List files and directories\n  <span class="text-green-400">echo &lt;text&gt;</span>      - Print text to the console\n  <span class="text-green-400">clear</span>            - Clear the terminal screen\n  <span class="text-green-400">touch &lt;path&gt;</span>     - Create an empty file\n  <span class="text-green-400">mkdir &lt;path&gt;</span>     - Create a new directory\n  <span class="text-green-400">rpkg new &lt;name&gt;</span>  - Create an R package skeleton\n  <span class="text-green-400">rpkg list</span>        - List installed R packages\n  <span class="text-green-400">R CMD build &lt;path&gt;</span> - Build an R package\n  <span class="text-green-400">R CMD check &lt;path&gt;</span> - Check an R package\n  <span class="text-green-400">R CMD INSTALL &lt;path&gt;</span> - Install an R package\n  <span class="text-green-400">R CMD REMOVE &lt;name&gt;</span>- Remove an R package' } ]);
                break;
            case 'ls':
                try {
                    const allNodes = await fileSystemService.getAllNodes();
                    const tree = buildFileTree(allNodes);
                    const formatTree = (nodes: FileSystemNode[], prefix = ''): string => {
                        let output = '';
                        nodes.forEach((node, index) => {
                            const isLast = index === nodes.length - 1;
                            const connector = isLast ? '└── ' : '├── ';
                            const nodeColor = node.type === 'folder' ? '\x1b[34m' : ''; // Blue for folders
                            const resetColor = '\x1b[0m';
                            output += `${prefix}${connector}${nodeColor}${node.name}${resetColor}\n`;
                            if (node.children) {
                                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                                output += formatTree(node.children, newPrefix);
                            }
                        });
                        return output;
                    };
                    const output = formatTree(tree);
                    const coloredOutput = output.replace(/\x1b\[34m/g, '<span class="text-sky-400">').replace(/\x1b\[0m/g, '</span>');
                    setLines(prev => [...prev, { type: 'output', content: coloredOutput }]);
                } catch (e) {
                    setLines(prev => [...prev, { type: 'error', content: 'Error reading file system.' }]);
                }
                break;
            case 'echo':
                setLines(prev => [...prev, { type: 'output', content: args.join(' ') }]);
                break;
            case 'clear':
                setLines([]);
                break;
            case 'touch':
                if (args.length !== 1) {
                    setLines(prev => [...prev, { type: 'error', content: 'Usage: touch <filepath>' }]);
                } else {
                    const path = args[0];
                    if (!path.startsWith('/')) {
                        setLines(prev => [...prev, { type: 'error', content: 'Error: Path must be absolute (start with /).' }]);
                        break;
                    }
                    try {
                        await fileSystemService.addNode({
                            path: path,
                            type: 'file',
                            content: '',
                            size: 0,
                            lastModified: Date.now(),
                        });
                        setLines(prev => [...prev, { type: 'output', content: `Created file: ${path}` }]);
                    } catch (e) {
                        setLines(prev => [...prev, { type: 'error', content: `touch: cannot touch '${path}': File or directory already exists` }]);
                    }
                }
                break;
            case 'mkdir':
                if (args.length !== 1) {
                    setLines(prev => [...prev, { type: 'error', content: 'Usage: mkdir <directorypath>' }]);
                } else {
                    const path = args[0];
                    if (!path.startsWith('/')) {
                        setLines(prev => [...prev, { type: 'error', content: 'Error: Path must be absolute (start with /).' }]);
                        break;
                    }
                    try {
                        await fileSystemService.addNode({
                            path: path,
                            type: 'folder',
                            content: undefined,
                            size: 0,
                            lastModified: Date.now(),
                        });
                        setLines(prev => [...prev, { type: 'output', content: `Created directory: ${path}` }]);
                    } catch (e) {
                        setLines(prev => [...prev, { type: 'error', content: `mkdir: cannot create directory '${path}': File or directory already exists` }]);
                    }
                }
                break;
            case 'rpkg':
                const [rpkgCmd, ...rpkgArgs] = args;
                switch (rpkgCmd) {
                    case 'new':
                        if (rpkgArgs.length !== 1) {
                            setLines(prev => [...prev, { type: 'error', content: 'Usage: rpkg new <packagename>' }]);
                        } else {
                            await createPackageSkeleton(rpkgArgs[0]);
                        }
                        break;
                    case 'list':
                        if (installedPackages.length === 0) {
                             setLines(prev => [...prev, { type: 'output', content: 'No packages installed.' }]);
                        } else {
                             setLines(prev => [...prev, { type: 'output', content: 'Installed packages (simulated):\n' + installedPackages.map(p => ` - ${p}`).join('\n') }]);
                        }
                        break;
                    default:
                        setLines(prev => [...prev, { type: 'error', content: `Unknown rpkg command: ${rpkgCmd}. Try 'rpkg new' or 'rpkg list'.` }]);
                        break;
                }
                break;
            case 'R':
                await handleRCommand(args);
                break;
            case '':
                break;
            default:
                setLines(prev => [...prev, { type: 'error', content: `Command not found: ${cmd}` }]);
                break;
        }
    };
    
    const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!input.trim()) {
                setLines([...lines, { type: 'input', content: '$> ' }]);
                return;
            };
            
            const command = input;
            await processCommand(command);

            setHistory(prev => [command, ...prev]);
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
        inputRef.current?.focus();
    }
    
    // Render ANSI color codes as spans
    const renderLineContent = (content: string) => {
        return <span dangerouslySetInnerHTML={{ __html: content }} />;
    };

    return (
        <div className="h-full flex flex-col p-2 bg-black text-slate-200 font-mono text-xs overflow-y-auto custom-scrollbar" onClick={handleConsoleClick}>
            <div className="flex-grow">
                {lines.map((line, index) => (
                    <div key={index} className={`flex ${line.type === 'input' ? '' : 'flex-col'}`}>
                        <pre className={`whitespace-pre-wrap ${
                            line.type === 'input' ? 'text-slate-300' :
                            line.type === 'error' ? 'text-red-400' : 'text-white'
                        }`}>
                            {line.type !== 'input' ? renderLineContent(line.content) : line.content}
                        </pre>
                    </div>
                ))}
                 <div ref={endOfLinesRef} />
            </div>
            <div className="flex items-center">
                <span>$&gt;</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    className="flex-grow bg-transparent border-none text-slate-200 focus:outline-none ml-2"
                    autoFocus
                />
                 <div className="blinking-cursor w-2 h-4"></div>
            </div>
        </div>
    );
};

export default Terminal;
