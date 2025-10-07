import React, { useState, useRef, useEffect } from 'react';
import { FileSystemNode } from '../types';
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, FileIcon, PencilIcon, CopyIcon, Trash2Icon } from './icons';

interface FileSystemTreeProps {
  node: FileSystemNode;
  level?: number;
  selectedNode: FileSystemNode | null;
  nodeToRenamePath: string | null;
  onNodeSelect: (node: FileSystemNode) => void;
  onDeleteNode: (path: string) => void;
  onRenameNode: (oldPath: string, newName: string) => void;
  onDuplicateNode: (path: string) => void;
  onRenameTriggered: () => void;
}

const FileSystemTree: React.FC<FileSystemTreeProps> = ({ 
  node, 
  level = 0, 
  selectedNode, 
  nodeToRenamePath,
  onNodeSelect, 
  onDeleteNode, 
  onRenameNode, 
  onDuplicateNode,
  onRenameTriggered
}) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open root level
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (nodeToRenamePath === node.path) {
        setIsRenaming(true);
        onRenameTriggered(); 
    }
  }, [nodeToRenamePath, node.path, onRenameTriggered]);

  const isFolder = node.type === 'folder';
  const isSelected = selectedNode?.path === node.path;

  const handleClick = () => {
    if (isRenaming) return;
    onNodeSelect(node);
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${node.name}?`)) {
      onDeleteNode(node.path);
    }
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
  };
  
  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicateNode(node.path);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRenameNode(node.path, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setRenameValue(node.name);
      setIsRenaming(false);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center p-1 rounded-sm group ${isSelected ? 'bg-sky-200 hover:bg-sky-200' : 'hover:bg-slate-200'}`}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleClick()}
        aria-label={`Select ${node.type} ${node.name}`}
        aria-expanded={isFolder ? isOpen : undefined}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDownIcon className="w-4 h-4 mr-1 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 mr-1 flex-shrink-0" />}
            <FolderIcon className="w-4 h-4 mr-2 text-sky-600 flex-shrink-0" />
          </>
        ) : (
          <>
            <div className="w-4 h-4 mr-1 flex-shrink-0"></div> {/* Spacer */}
            <FileIcon className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />
          </>
        )}
        
        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="text-sm bg-white border border-sky-500 rounded-sm px-1 flex-grow"
          />
        ) : (
          <span className="text-sm truncate flex-grow">{node.name}</span>
        )}
        
        {isHovered && !isRenaming && (
          <div className="flex items-center space-x-1 ml-auto pr-1 opacity-100 group-hover:opacity-100 transition-opacity">
            <button onClick={handleRename} className="p-0.5 hover:bg-slate-300 rounded" aria-label={`Rename ${node.name}`}><PencilIcon className="w-3.5 h-3.5" /></button>
            <button onClick={handleDuplicate} className="p-0.5 hover:bg-slate-300 rounded" aria-label={`Duplicate ${node.name}`}><CopyIcon className="w-3.5 h-3.5" /></button>
            <button onClick={handleDelete} className="p-0.5 hover:bg-slate-300 rounded" aria-label={`Delete ${node.name}`}><Trash2Icon className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((childNode) => (
            <FileSystemTree 
                key={childNode.path} 
                node={childNode} 
                level={level + 1} 
                selectedNode={selectedNode}
                nodeToRenamePath={nodeToRenamePath}
                onNodeSelect={onNodeSelect}
                onDeleteNode={onDeleteNode}
                onRenameNode={onRenameNode}
                onDuplicateNode={onDuplicateNode}
                onRenameTriggered={onRenameTriggered}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileSystemProps {
    fileTree: FileSystemNode[];
    selectedNode: FileSystemNode | null;
    nodeToRename: string | null;
    onNodeSelect: (node: FileSystemNode) => void;
    onDeleteNode: (path: string) => void;
    onRenameNode: (oldPath: string, newName: string) => void;
    onDuplicateNode: (path: string) => void;
    onRenameTriggered: () => void;
}

const FileSystem: React.FC<FileSystemProps> = (props) => {
  return (
    <div>
      {props.fileTree.map((node) => (
        <FileSystemTree key={node.path} node={node} {...props} nodeToRenamePath={props.nodeToRename} />
      ))}
    </div>
  );
};

export default FileSystem;