import React, { useRef } from 'react';
import FileSystem from './FileSystem';
import Tooltip from './Tooltip';
import { PanelLeftCloseIcon, PlusIcon, UploadIcon, FolderIcon, DownloadIcon } from './icons';
import { sidebarConfig } from '../data/appConfig';
import { FileSystemNode } from '../types';

interface MiddleSidebarProps {
  onClose: () => void;
  fileTree: FileSystemNode[];
  selectedNode: FileSystemNode | null;
  nodeToRename: string | null;
  onNodeSelect: (node: FileSystemNode) => void;
  onNewFile: (parentPath: string) => void;
  onNewFolder: (path: string) => void;
  onUploadFile: (fileName: string, content: string) => void;
  onDeleteNode: (path: string) => void;
  onRenameNode: (oldPath: string, newName: string) => void;
  onDuplicateNode: (path: string) => void;
  onDownloadAll: () => void;
  onRenameTriggered: () => void;
}

const MiddleSidebar: React.FC<MiddleSidebarProps> = ({ 
    onClose, 
    fileTree, 
    selectedNode,
    nodeToRename,
    onNodeSelect,
    onNewFile,
    onNewFolder,
    onUploadFile,
    onDeleteNode,
    onRenameNode,
    onDuplicateNode,
    onDownloadAll,
    onRenameTriggered,
}) => {
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const getParentPathForNewNode = (): string => {
        if (!selectedNode) {
            return '/';
        }
        if (selectedNode.type === 'folder') {
            return selectedNode.path;
        }
        // If it's a file, return its parent directory
        return selectedNode.path.substring(0, selectedNode.path.lastIndexOf('/')) || '/';
    };

    const handleNewFile = () => {
        const parentPath = getParentPathForNewNode();
        onNewFile(parentPath);
    };
    
    const handleNewFolder = () => {
        const folderName = prompt("Enter new folder name:");
        if (folderName) {
            const parentPath = getParentPathForNewNode();
            const newPath = parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`;
            onNewFolder(newPath);
        }
    };

    const handleUploadClick = () => {
        uploadInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                onUploadFile(file.name, content);
            };
            reader.readAsText(file);
        }
         // Reset input value to allow uploading the same file again
        if(uploadInputRef.current) {
            uploadInputRef.current.value = '';
        }
    };

  return (
    <div className="h-full flex flex-col border-r border-slate-200">
      <div className="flex items-center justify-between p-2 bg-slate-200 border-b border-slate-300">
        <h2 className="text-sm font-bold uppercase tracking-wider">{sidebarConfig.middleSidebar.title}</h2>
        <div className="flex items-center space-x-1">
            <Tooltip text="New File">
              <button onClick={handleNewFile} className="p-1 hover:bg-slate-300 rounded" aria-label="New file">
                <PlusIcon className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="New Folder">
              <button onClick={handleNewFolder} className="p-1 hover:bg-slate-300 rounded" aria-label="New folder">
                <FolderIcon className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Upload to Resources">
              <button onClick={handleUploadClick} className="p-1 hover:bg-slate-300 rounded" aria-label="Upload file">
                <UploadIcon className="w-4 h-4" />
                <input type="file" ref={uploadInputRef} onChange={handleFileChange} className="hidden" />
              </button>
            </Tooltip>
             <Tooltip text="Download Project">
              <button onClick={onDownloadAll} className="p-1 hover:bg-slate-300 rounded" aria-label="Download project">
                <DownloadIcon className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Close Explorer">
              <button onClick={onClose} className="p-1 hover:bg-slate-300" aria-label="Close file explorer">
                <PanelLeftCloseIcon className="w-5 h-5" />
              </button>
            </Tooltip>
        </div>
      </div>
      <div className="flex-grow p-2 overflow-y-auto">
        <FileSystem 
            fileTree={fileTree} 
            selectedNode={selectedNode}
            nodeToRename={nodeToRename}
            onRenameTriggered={onRenameTriggered}
            onNodeSelect={onNodeSelect} 
            onDeleteNode={onDeleteNode}
            onRenameNode={onRenameNode}
            onDuplicateNode={onDuplicateNode}
        />
      </div>
    </div>
  );
};

export default MiddleSidebar;