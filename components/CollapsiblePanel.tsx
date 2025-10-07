import React, { ReactNode } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from './icons';

interface CollapsiblePanelProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  contentClassName?: string;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ title, children, isOpen, onToggle, className = '', contentClassName = '' }) => {
  return (
    <div className={className}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 text-sm font-semibold bg-slate-300 hover:bg-slate-400/80 focus:outline-none"
      >
        <div className="flex items-center">
            {isOpen ? <ChevronDownIcon className="w-4 h-4 mr-2" /> : <ChevronRightIcon className="w-4 h-4 mr-2" />}
            <span>{title}</span>
        </div>
      </button>
      {isOpen && <div className={`bg-slate-50 ${contentClassName}`}>{children}</div>}
    </div>
  );
};

export default CollapsiblePanel;