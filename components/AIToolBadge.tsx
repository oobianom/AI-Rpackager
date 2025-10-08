import React from 'react';
import { FileIcon, FolderIcon, CopyIcon } from './icons';

interface AIToolBadgeProps {
  toolName: string;
}

const getToolInfo = (toolName: string) => {
    switch(toolName) {
        case 'createNode':
            return { icon: <FolderIcon className="w-3 h-3" />, label: 'Create' };
        case 'editFile':
            return { icon: <FileIcon className="w-3 h-3" />, label: 'Edit' };
        case 'duplicateNode':
            return { icon: <CopyIcon className="w-3 h-3" />, label: 'Duplicate' };
        default:
            return { icon: null, label: toolName };
    }
}

const AIToolBadge: React.FC<AIToolBadgeProps> = ({ toolName }) => {
  const { icon, label } = getToolInfo(toolName);
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
      {icon}
      {label}
    </span>
  );
};

export default AIToolBadge;
