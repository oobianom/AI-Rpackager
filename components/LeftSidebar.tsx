import React, { useState } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import AIAssistant from './AIAssistant';
import Tooltip from './Tooltip';
import { PanelRightCloseIcon } from './icons';
import { sidebarConfig } from '../data/appConfig';

interface LeftSidebarProps {
  onClose: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onClose }) => {
  const [openPanels, setOpenPanels] = useState({
    console: sidebarConfig.leftSidebar.panels.console.defaultOpen,
    ai: sidebarConfig.leftSidebar.panels.ai.defaultOpen,
  });

  const togglePanel = (panel: keyof typeof openPanels) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  return (
    <div className="h-full flex flex-col border-r border-slate-200 bg-slate-100">
      <div className="flex items-center justify-between p-2 bg-slate-200 border-b border-slate-300">
        <h2 className="text-sm font-bold uppercase tracking-wider">{sidebarConfig.leftSidebar.title}</h2>
        <Tooltip text="Close Console">
          <button onClick={onClose} className="p-1 hover:bg-slate-300" aria-label="Close console panel">
            <PanelRightCloseIcon className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
      <div className="flex-grow flex flex-col overflow-y-auto">
        <CollapsiblePanel
          title={sidebarConfig.leftSidebar.panels.ai.title}
          isOpen={openPanels.ai}
          onToggle={() => togglePanel('ai')}
          className="border-b border-slate-200"
          contentClassName="flex-grow flex flex-col"
        >
          <AIAssistant />
        </CollapsiblePanel>
        <CollapsiblePanel
          title={sidebarConfig.leftSidebar.panels.console.title}
          isOpen={openPanels.console}
          onToggle={() => togglePanel('console')}
          className="border-b border-slate-200"
        >
          <div className="p-4 text-sm text-slate-500 bg-slate-800 h-48">
            <p>&gt; Console output will appear here...</p>
          </div>
        </CollapsiblePanel>
      </div>
    </div>
  );
};

export default LeftSidebar;
