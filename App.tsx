import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import LeftSidebar from './components/LeftSidebar';
import MiddleSidebar from './components/MiddleSidebar';
import EditorPanel from './components/EditorPanel';
import DraggableResizer from './components/DraggableResizer';
import Tooltip from './components/Tooltip';
import SettingsPage from './components/SettingsPage';
import MobileWarningModal from './components/MobileWarningModal';
import { DownloadIcon, LogoIcon, PanelLeftCloseIcon, PanelRightCloseIcon, SettingsIcon } from './components/icons';
import * as fileSystemService from './services/fileSystemService';
import * as geminiService from './services/geminiService';
import { DBFileSystemNode, FileSystemNode, EditorSettings as EditorSettingsType } from './types';
import { buildFileTree } from './utils/fileTree';
import { defaultEditorSettings } from './data/appConfig';
import { FileSystemProvider } from './contexts/FileSystemContext';

const App: React.FC = () => {
  const isMobile = () => window.innerWidth <= 768;

  const [leftSidebarVisible, setLeftSidebarVisible] = useState(!isMobile());
  const [middleSidebarVisible, setMiddleSidebarVisible] = useState(!isMobile());
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isMobileWarningVisible, setIsMobileWarningVisible] = useState(false);

  const [leftSidebarWidth, setLeftSidebarWidth] = useState(350);
  const [middleSidebarWidth, setMiddleSidebarWidth] = useState(250);

  const [fileTree, setFileTree] = useState<FileSystemNode[]>([]);
  const [activeFile, setActiveFile] = useState<DBFileSystemNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<FileSystemNode | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [nodeToRename, setNodeToRename] = useState<string | null>(null);
  
  const [editorSettings, setEditorSettings] = useState<EditorSettingsType>(() => {
    try {
      const savedSettings = localStorage.getItem('editorSettings');
      return savedSettings ? JSON.parse(savedSettings) : defaultEditorSettings;
    } catch (error) {
      console.error("Failed to parse editor settings from localStorage", error);
      return defaultEditorSettings;
    }
  });

  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem('userApiKey') || '');
  const [apiKeyStatus, setApiKeyStatus] = useState<'unchecked' | 'valid' | 'invalid'>('unchecked');

  useEffect(() => {
    const dismissed = sessionStorage.getItem('mobileWarningDismissed');
    if (isMobile() && !dismissed) {
        setIsMobileWarningVisible(true);
    }
      
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
        const isMobileView = event.matches;
        setLeftSidebarVisible(!isMobileView);
        setMiddleSidebarVisible(!isMobileView);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);
    
    return () => {
        mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('editorSettings', JSON.stringify(editorSettings));
    } catch (error) {
      console.error("Failed to save editor settings to localStorage", error);
    }
  }, [editorSettings]);
  
  useEffect(() => {
    const validateOnLoad = async () => {
        if (userApiKey) {
            const isValid = await geminiService.validateApiKey(userApiKey);
            setApiKeyStatus(isValid ? 'valid' : 'invalid');
        } else {
            setApiKeyStatus('unchecked');
        }
    };
    validateOnLoad();
  }, []); // Run only once on initial load

  const handleApiKeySave = useCallback(async (newKey: string) => {
    localStorage.setItem('userApiKey', newKey);
    setUserApiKey(newKey);
    if (newKey) {
        const isValid = await geminiService.validateApiKey(newKey);
        setApiKeyStatus(isValid ? 'valid' : 'invalid');
        return isValid;
    } else {
        setApiKeyStatus('unchecked');
        return true; 
    }
  }, []);


  const isDirty = editorContent !== originalContent;

  const loadFileSystem = useCallback(async (selectDefault = false) => {
    await fileSystemService.initDB();
    const nodes = await fileSystemService.getAllNodes();
    const tree = buildFileTree(nodes);
    setFileTree(tree);
    
    // Check if active file still exists
    if (activeFile) {
      const stillExists = nodes.some(n => n.path === activeFile.path);
      if (!stillExists) {
        setActiveFile(null);
        setSelectedNode(null);
        setEditorContent('');
        setOriginalContent('');
      } else {
        // refresh active file info
        const updatedNode = await fileSystemService.getNode(activeFile.path);
        if (updatedNode) {
            setActiveFile(updatedNode);
            setOriginalContent(updatedNode.content || '');
        }
      }
    } else if (selectDefault) {
      // On first load or reset, open README
      handleFileSelect('/README.md');
    }
  }, [activeFile]);

  useEffect(() => {
    loadFileSystem(true);
  }, []);
  
  const handleCloseMobileWarning = () => {
    setIsMobileWarningVisible(false);
    sessionStorage.setItem('mobileWarningDismissed', 'true');
  };

  const handleFileSelect = useCallback(async (path: string) => {
    const node = await fileSystemService.getNode(path);
    if (node && node.type === 'file') {
      const content = node.content || '';
      setActiveFile(node);
      setEditorContent(content);
      setOriginalContent(content);
    }
  }, []);

  const handleNodeSelectInExplorer = useCallback((node: FileSystemNode) => {
      setSelectedNode(node);
      if (node.type === 'file') {
          handleFileSelect(node.path);
      }
  }, [handleFileSelect]);

  const handleSave = useCallback(async () => {
    if (activeFile && isDirty) {
      await fileSystemService.saveFileContent(activeFile.path, editorContent);
      setOriginalContent(editorContent);
      // Refresh file data to get new timestamp/size
      const updatedNode = await fileSystemService.getNode(activeFile.path);
      if(updatedNode) setActiveFile(updatedNode);
    }
  }, [activeFile, editorContent, isDirty]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);


  const handleLeftResize = useCallback((dx: number) => {
    setLeftSidebarWidth(prevWidth => Math.max(200, Math.min(prevWidth + dx, 600)));
  }, []);

  const handleMiddleResize = useCallback((dx: number) => {
    setMiddleSidebarWidth(prevWidth => Math.max(150, Math.min(prevWidth + dx, 500)));
  }, []);

  const handleNewFolder = useCallback(async (parentPath: string) => {
    const allNodes = await fileSystemService.getAllNodes();
    let newName = 'NewFolder';
    let count = 1;
    const constructPath = (name: string) => parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    
    while (allNodes.some(node => node.path === constructPath(newName))) {
        newName = `NewFolder-${count}`;
        count++;
    }
    const newPath = constructPath(newName);

    await fileSystemService.addNode({
        path: newPath,
        type: 'folder',
        content: undefined,
        size: 0,
        lastModified: Date.now(),
    });

    await loadFileSystem();
    setNodeToRename(newPath);
  }, [loadFileSystem]);

  const handleNewFile = useCallback(async (parentPath: string) => {
    const allNodes = await fileSystemService.getAllNodes();
    let newName = 'Untitled.R';
    let count = 1;
    const constructPath = (name: string) => parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    
    while (allNodes.some(node => node.path === constructPath(newName))) {
        newName = `Untitled-${count}.R`;
        count++;
    }
    
    const newPath = constructPath(newName);

    await fileSystemService.addNode({
        path: newPath,
        type: 'file',
        content: '',
        size: 0,
        lastModified: Date.now(),
    });

    await loadFileSystem();
    setNodeToRename(newPath);
  }, [loadFileSystem]);

  const handleUploadFile = useCallback(async (fileName: string, content: string) => {
    await fileSystemService.addNode({
      path: `/Resources/${fileName}`,
      type: 'file',
      content,
      size: content.length,
      lastModified: Date.now(),
    });
    await loadFileSystem();
  }, [loadFileSystem]);

  const handleDeleteNode = useCallback(async (path: string) => {
    if (selectedNode && (path === selectedNode.path || selectedNode.path.startsWith(path + '/'))) {
        setSelectedNode(null);
    }
    // If the active file in the editor is being deleted, close it.
    if (activeFile && (path === activeFile.path || activeFile.path.startsWith(path + '/'))) {
        setActiveFile(null);
        setEditorContent('');
        setOriginalContent('');
    }
    await fileSystemService.deleteNode(path);
    await loadFileSystem();
  }, [loadFileSystem, selectedNode, activeFile]);

  const handleRenameNode = useCallback(async (oldPath: string, newName: string) => {
    const newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newName;
    
    await fileSystemService.renameNode(oldPath, newName);
    
    if (activeFile && activeFile.path.startsWith(oldPath)) {
        const updatedFilePath = activeFile.path.replace(oldPath, newPath);
        const renamedNode = await fileSystemService.getNode(updatedFilePath);
        if (renamedNode) {
            setActiveFile(renamedNode);
        }
    }
    
    if (selectedNode && selectedNode.path.startsWith(oldPath)) {
        setSelectedNode(null);
    }
    
    await loadFileSystem();
  }, [loadFileSystem, activeFile, selectedNode]);

  const handleDuplicateNode = useCallback(async (path: string) => {
    await fileSystemService.duplicateNode(path);
    await loadFileSystem();
  }, [loadFileSystem]);

  const handleDownloadAll = useCallback(async () => {
    const nodes = await fileSystemService.getAllNodes();
    const zip = new JSZip();

    nodes.forEach(node => {
        const path = node.path.substring(1); 
        if (path) {
          if (node.type === 'folder') {
              zip.folder(path);
          } else {
              zip.file(path, node.content || '');
          }
        }
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'r-package-project.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
  }, []);
  
  const handleResetFileSystem = useCallback(async () => {
    await fileSystemService.resetDB();
    setActiveFile(null);
    setSelectedNode(null);
    await loadFileSystem(true);
  }, [loadFileSystem]);

  // AI Tool Handlers with validation
  const handleAICreateNode = useCallback(async (path: string, type: 'file' | 'folder', content = '') => {
    if (!path.startsWith('/Package/')) {
      return { success: false, message: "Error: I can only create files or folders inside the /Package directory." };
    }
    const existingNode = await fileSystemService.getNode(path);
    if (existingNode) {
      return { success: false, message: `Error: A file or folder already exists at path '${path}'.` };
    }
    try {
      await fileSystemService.addNode({
        path,
        type,
        content: type === 'file' ? content : undefined,
        size: content.length,
        lastModified: Date.now(),
      });
      await loadFileSystem();
      return { success: true, message: `Successfully created ${type} at ${path}.` };
    } catch (error) {
      console.error(`Failed to create ${type} at ${path}:`, error);
      return { success: false, message: `An unexpected error occurred while creating ${type} at ${path}.` };
    }
  }, [loadFileSystem]);

  const handleAIEditFile = useCallback(async (path: string, content: string) => {
    if (!path.startsWith('/Package/')) {
      return { success: false, message: "Error: I can only edit files inside the /Package directory." };
    }
    const node = await fileSystemService.getNode(path);
    if (!node) {
      return { success: false, message: `Error: File not found at path '${path}'.` };
    }
    if (node.type === 'folder') {
      return { success: false, message: `Error: Cannot edit a folder. Path '${path}' points to a folder.` };
    }
    try {
      await fileSystemService.saveFileContent(path, content);
      if (activeFile?.path === path) {
        setEditorContent(content);
        setOriginalContent(content);
      }
      await loadFileSystem();
      return { success: true, message: `Successfully edited file at ${path}.` };
    } catch (error) {
      console.error(`Failed to edit file at ${path}:`, error);
      return { success: false, message: `An unexpected error occurred while editing file at ${path}.` };
    }
  }, [loadFileSystem, activeFile]);

  const handleAIDuplicateNode = useCallback(async (path: string) => {
    if (!path.startsWith('/Package/')) {
      return { success: false, message: "Error: I can only duplicate items inside the /Package directory." };
    }
    const node = await fileSystemService.getNode(path);
    if (!node) {
      return { success: false, message: `Error: File or folder not found at path '${path}'.` };
    }
    try {
      await fileSystemService.duplicateNode(path);
      await loadFileSystem();
      return { success: true, message: `Successfully duplicated item from ${path}.` };
    } catch (error) {
      console.error(`Failed to duplicate item from ${path}:`, error);
      return { success: false, message: `An unexpected error occurred while duplicating item from ${path}.` };
    }
  }, [loadFileSystem]);

  const fileSystemContextValue = {
    createNode: handleAICreateNode,
    editFile: handleAIEditFile,
    duplicateNode: handleAIDuplicateNode,
    getResourceFilesContent: fileSystemService.getResourceFilesContent,
  };
  
  return (
    <FileSystemProvider value={fileSystemContextValue}>
      {isMobileWarningVisible && <MobileWarningModal onClose={handleCloseMobileWarning} />}
      <div className={`h-screen w-screen bg-slate-100 text-slate-900 flex flex-col font-sans`}>
        <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-slate-200 flex-shrink-0">
          {/* Left Section: Logo and Title */}
          <div className="flex items-center space-x-3">
            <LogoIcon className="w-7 h-7 text-sky-600" />
            <h1 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
              AI-Powered R Package Builder
            </h1>
          </div>

          {/* Center Section: Active File */}
          <div className="hidden md:block text-sm text-slate-500 font-mono truncate max-w-sm" title={activeFile?.path}>
            {activeFile ? activeFile.path : ''}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center space-x-2">
            <Tooltip text="Download Project as .zip">
              <button onClick={handleDownloadAll} className="p-2 hover:bg-slate-100 rounded-md" aria-label="Download project">
                <DownloadIcon className="w-5 h-5 text-slate-600" />
              </button>
            </Tooltip>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <Tooltip text="Settings">
              <button onClick={() => setIsSettingsVisible(true)} className="p-2 hover:bg-slate-100 rounded-md" aria-label="Open settings">
                <SettingsIcon className="w-5 h-5 text-slate-600" />
              </button>
            </Tooltip>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            
            <div className="flex items-center">
              <Tooltip text={leftSidebarVisible ? "Close Helper Panel" : "Open Helper Panel"}>
                <button 
                  onClick={() => setLeftSidebarVisible(!leftSidebarVisible)} 
                  className={`p-2 rounded-md transition-colors ${leftSidebarVisible ? 'bg-slate-200 text-sky-600' : 'hover:bg-slate-100 text-slate-600'}`} 
                  aria-label="Toggle left sidebar"
                >
                  <PanelLeftCloseIcon className="w-5 h-5" />
                </button>
              </Tooltip>
              <Tooltip text={middleSidebarVisible ? "Close Explorer" : "Open Explorer"}>
                <button 
                  onClick={() => setMiddleSidebarVisible(!middleSidebarVisible)} 
                  className={`p-2 rounded-md transition-colors ${middleSidebarVisible ? 'bg-slate-200 text-sky-600' : 'hover:bg-slate-100 text-slate-600'}`} 
                  aria-label="Toggle middle sidebar"
                >
                  <PanelRightCloseIcon className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </header>
        
        {isSettingsVisible ? (
          <SettingsPage 
            onClose={() => setIsSettingsVisible(false)}
            editorSettings={editorSettings}
            onEditorSettingsChange={setEditorSettings}
            onResetFileSystem={handleResetFileSystem}
            userApiKey={userApiKey}
            apiKeyStatus={apiKeyStatus}
            onApiKeySave={handleApiKeySave}
          />
        ) : (
          <main className="flex-grow flex overflow-hidden">
            {leftSidebarVisible && (
              <div style={{ width: `${leftSidebarWidth}px` }} className="flex-shrink-0 h-full">
                <LeftSidebar 
                  onClose={() => setLeftSidebarVisible(false)} 
                  userApiKey={userApiKey}
                />
              </div>
            )}
            {leftSidebarVisible && <DraggableResizer onDrag={handleLeftResize} />}

            {middleSidebarVisible && (
              <div style={{ width: `${middleSidebarWidth}px` }} className="flex-shrink-0 h-full">
                <MiddleSidebar 
                  onClose={() => setMiddleSidebarVisible(false)} 
                  fileTree={fileTree}
                  selectedNode={selectedNode}
                  nodeToRename={nodeToRename}
                  onRenameTriggered={() => setNodeToRename(null)}
                  onNodeSelect={handleNodeSelectInExplorer}
                  onNewFile={handleNewFile}
                  onNewFolder={handleNewFolder}
                  onUploadFile={handleUploadFile}
                  onDeleteNode={handleDeleteNode}
                  onRenameNode={handleRenameNode}
                  onDuplicateNode={handleDuplicateNode}
                  onRefresh={loadFileSystem}
                />
              </div>
            )}
            {middleSidebarVisible && <DraggableResizer onDrag={handleMiddleResize} />}

            <div className="flex-grow min-w-0 h-full">
              <EditorPanel 
                activeFile={activeFile}
                editorContent={editorContent}
                onContentChange={setEditorContent}
                onSave={handleSave}
                isDirty={isDirty}
                editorSettings={editorSettings}
              />
            </div>
          </main>
        )}
      </div>
    </FileSystemProvider>
  );
};

export default App;