import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import JSZip from 'jszip';
import saveAs from 'file-saver';

import LeftSidebar from './components/LeftSidebar';
import MiddleSidebar from './components/MiddleSidebar';
import EditorPanel from './components/EditorPanel';
import DraggableResizer from './components/DraggableResizer';
import SettingsPage from './components/SettingsPage';
import { PanelRightCloseIcon, SettingsIcon } from './components/icons';
import Tooltip from './components/Tooltip';

import { DBFileSystemNode, FileSystemNode, EditorSettings } from './types';
import * as fileService from './services/fileSystemService';
import { buildFileTree } from './utils/fileTree';
import { defaultEditorSettings } from './data/appConfig';

const MIN_PANEL_WIDTH = 200;
const MAX_PANEL_WIDTH = 600;

const App: React.FC = () => {
  // Layout State
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isMiddleSidebarOpen, setIsMiddleSidebarOpen] = useState<boolean>(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(350);
  const [middlePanelWidth, setMiddlePanelWidth] = useState<number>(250);
  const [isSettingsPageOpen, setIsSettingsPageOpen] = useState<boolean>(false);

  // File System State
  const [dbNodes, setDbNodes] = useState<DBFileSystemNode[]>([]);
  const [fileTree, setFileTree] = useState<FileSystemNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<FileSystemNode | null>(null);
  const [activeFile, setActiveFile] = useState<DBFileSystemNode | null>(null);
  const [nodeToRename, setNodeToRename] = useState<string | null>(null);

  // Editor State
  const [editorContent, setEditorContent] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(defaultEditorSettings);

  const loadFileSystem = useCallback(async () => {
    try {
      await fileService.initDB();
      const nodes = await fileService.getAllNodes();
      setDbNodes(nodes);
      const tree = buildFileTree(nodes);
      setFileTree(tree);
    } catch (error) {
      console.error("Failed to load file system:", error);
      toast.error("Failed to load file system.");
    }
  }, []);

  useEffect(() => {
    loadFileSystem();
  }, [loadFileSystem]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleNodeSelect = useCallback(async (node: FileSystemNode) => {
    if (isDirty && activeFile) {
      const confirmed = window.confirm("You have unsaved changes. Do you want to discard them?");
      if (!confirmed) {
        return;
      }
    }
    
    setSelectedNode(node);
    if (node.type === 'file') {
      try {
        const fileNode = await fileService.getNode(node.path);
        if (fileNode) {
          setActiveFile(fileNode);
          setEditorContent(fileNode.content || '');
          setIsDirty(false);
        }
      } catch (error) {
        console.error("Failed to load file:", error);
        toast.error(`Failed to load file: ${node.name}`);
      }
    } else {
      setActiveFile(null);
      setEditorContent('');
      setIsDirty(false);
    }
  }, [isDirty, activeFile]);

  const handleEditorContentChange = (content: string) => {
    setEditorContent(content);
    if (activeFile) {
        setIsDirty(content !== (activeFile.content || ''));
    }
  };

  const handleSave = async () => {
    if (activeFile && isDirty) {
      try {
        await fileService.saveFileContent(activeFile.path, editorContent);
        setIsDirty(false);
        setActiveFile(prev => prev ? {...prev, content: editorContent, size: editorContent.length, lastModified: Date.now()} : null);
        toast.success(`'${activeFile.path}' saved.`);
        await loadFileSystem();
      } catch (error) {
        console.error("Failed to save file:", error);
        toast.error(`Failed to save file: ${activeFile.path}`);
      }
    }
  };

  const handleNewFile = async (parentPath: string) => {
      let fileName = prompt("Enter new file name:");
      if (!fileName) return;

      const newPath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;

      if (dbNodes.some(n => n.path === newPath)) {
        toast.error(`File or folder "${fileName}" already exists at this location.`);
        return;
      }

      const newNode: DBFileSystemNode = {
          path: newPath,
          type: 'file',
          content: '',
          size: 0,
          lastModified: Date.now(),
      };
      await fileService.addNode(newNode);
      await loadFileSystem();
      setNodeToRename(newPath);
  };

  const handleNewFolder = async (path: string) => {
      if (dbNodes.some(n => n.path === path)) {
        toast.error(`File or folder already exists at path "${path}".`);
        return;
      }
      const newNode: DBFileSystemNode = {
          path,
          type: 'folder',
          lastModified: Date.now(),
      };
      await fileService.addNode(newNode);
      await loadFileSystem();
  };
  
  const handleUploadFile = async (fileName: string, content: string) => {
    const path = `/Resources/${fileName}`;
    if (dbNodes.some(n => n.path === path)) {
        toast.error(`File "${fileName}" already exists in Resources.`);
        return;
    }
    const newNode: DBFileSystemNode = {
        path,
        type: 'file',
        content,
        size: content.length,
        lastModified: Date.now(),
    };
    await fileService.addNode(newNode);
    await loadFileSystem();
    toast.success(`File "${fileName}" uploaded to Resources.`);
  };

  const handleDeleteNode = async (path: string) => {
    await fileService.deleteNode(path);
    if (activeFile?.path.startsWith(path)) {
        setActiveFile(null);
        setEditorContent('');
        setIsDirty(false);
    }
    await loadFileSystem();
    toast.success(`Deleted: ${path}`);
  };

  const handleRenameNode = async (oldPath: string, newName: string) => {
    try {
        await fileService.renameNode(oldPath, newName);
        if (activeFile?.path.startsWith(oldPath)) {
            const newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newName;
            const updatedFile = await fileService.getNode(newPath);
            if(updatedFile) setActiveFile(updatedFile);
        }
        await loadFileSystem();
        toast.success(`Renamed to ${newName}`);
    } catch(e) {
        toast.error("Rename failed. A file or folder with that name may already exist.");
    }
  };

  const handleDuplicateNode = async (path: string) => {
      await fileService.duplicateNode(path);
      await loadFileSystem();
      toast.success(`Duplicated: ${path}`);
  };
  
  const handleDownloadAll = async () => {
    const zip = new JSZip();
    dbNodes.forEach(node => {
        const pathInZip = node.path.substring(1);
        if (node.type === 'folder') {
            zip.folder(pathInZip);
        } else if (node.type === 'file') {
            zip.file(pathInZip, node.content || '');
        }
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'r-package-project.zip');
    toast.success("Project downloaded as zip.");
  };

  const handleResetFileSystem = async () => {
    await fileService.resetDB();
    setActiveFile(null);
    setEditorContent('');
    setIsDirty(false);
    setSelectedNode(null);
    await loadFileSystem();
  };

  if (isSettingsPageOpen) {
    return (
      <SettingsPage 
        onClose={() => setIsSettingsPageOpen(false)}
        editorSettings={editorSettings}
        onEditorSettingsChange={setEditorSettings}
        onResetFileSystem={handleResetFileSystem}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-100 flex overflow-hidden">
      <Toaster richColors />
      {isLeftSidebarOpen && (
        <div style={{ width: leftPanelWidth }} className="flex-shrink-0 h-full flex flex-col">
          <LeftSidebar onClose={() => setIsLeftSidebarOpen(false)} />
        </div>
      )}
      {isLeftSidebarOpen && <DraggableResizer onDrag={(dx) => setLeftPanelWidth(w => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, w + dx)))} />}

      {isMiddleSidebarOpen && (
        <div style={{ width: middlePanelWidth }} className="flex-shrink-0 h-full flex flex-col">
          <MiddleSidebar 
            onClose={() => setIsMiddleSidebarOpen(false)}
            fileTree={fileTree}
            selectedNode={selectedNode}
            nodeToRename={nodeToRename}
            onNodeSelect={handleNodeSelect}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onUploadFile={handleUploadFile}
            onDeleteNode={handleDeleteNode}
            onRenameNode={handleRenameNode}
            onDuplicateNode={handleDuplicateNode}
            onDownloadAll={handleDownloadAll}
            onRenameTriggered={() => setNodeToRename(null)}
          />
        </div>
      )}
      {isMiddleSidebarOpen && <DraggableResizer onDrag={(dx) => setMiddlePanelWidth(w => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, w + dx)))} />}
      
      <main className="flex-grow h-full flex flex-col">
        <div className="flex items-center p-2 bg-slate-200 border-b border-slate-300 flex-shrink-0">
            {!isMiddleSidebarOpen && (
                <Tooltip text="Open Explorer">
                    <button onClick={() => setIsMiddleSidebarOpen(true)} className="p-1 mr-2 hover:bg-slate-300 rounded" aria-label="Open file explorer">
                        <PanelRightCloseIcon className="w-5 h-5" />
                    </button>
                </Tooltip>
            )}
            <div className="flex-grow"></div>
            <Tooltip text="Settings">
              <button onClick={() => setIsSettingsPageOpen(true)} className="p-1 hover:bg-slate-300 rounded" aria-label="Open settings">
                <SettingsIcon className="w-5 h-5" />
              </button>
            </Tooltip>
        </div>
        <EditorPanel 
          activeFile={activeFile}
          editorContent={editorContent}
          onContentChange={handleEditorContentChange}
          onSave={handleSave}
          isDirty={isDirty}
          editorSettings={editorSettings}
        />
      </main>
    </div>
  );
};

export default App;