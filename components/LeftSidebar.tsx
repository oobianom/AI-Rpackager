import React, { useState } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import AIAssistant from './AIAssistant';
import Tooltip from './Tooltip';
import { PanelLeftCloseIcon } from './icons';
import { sidebarConfig } from '../data/appConfig';
import RConsole from './RConsole';
import Terminal from './Terminal';

interface LeftSidebarProps {
  onClose: () => void;
  userApiKey: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onClose, userApiKey }) => {
  const [activeTab, setActiveTab] = useState<'r-console' | 'terminal'>('r-console');
  // Single state to control which panel is open.
  // false = AI Assistant is open (default)
  // true = Command Line is open
  const [isConsoleOpen, setIsConsoleOpen] = useState(sidebarConfig.leftSidebar.panels.console.defaultOpen);

  const togglePanels = () => {
    setIsConsoleOpen(prev => !prev);
  }

  return (
    <div className="h-full flex flex-col bg-slate-100 border-r border-slate-200">
      <div className="flex items-center justify-between p-2 bg-slate-200 border-b border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider">{sidebarConfig.leftSidebar.title0}</h2>
        <Tooltip text="Close Command Line Panel">
          <button onClick={onClose} className="p-1 hover:bg-slate-300" aria-label="Close left sidebar">
            <PanelLeftCloseIcon className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
      <div className="flex-grow flex flex-col overflow-hidden">
        <CollapsiblePanel
          title={sidebarConfig.leftSidebar.panels.console.title}
          isOpen={isConsoleOpen}
          onToggle={togglePanels}
          className={`border-b border-slate-200 ${isConsoleOpen ? 'flex-1 flex flex-col' : ''}`}
          contentClassName={`min-h-0 ${isConsoleOpen ? 'flex-1 flex flex-col' : ''}`}
        >
          <div className="flex border-b border-slate-200 text-sm">
            <button
              onClick={() => setActiveTab('r-console')}
              className={`px-4 py-2 ${activeTab === 'r-console' ? 'bg-slate-300' : 'bg-slate-200'} hover:bg-slate-400/50`}
            >
              R Console
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 ${activeTab === 'terminal' ? 'bg-slate-300' : 'bg-slate-200'} hover:bg-slate-400/50`}
            >
              Terminal
            </button>
          </div>
          <div className="flex-grow min-h-0">
            {activeTab === 'r-console' && <RConsole />}
            {activeTab === 'terminal' && <Terminal />}
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title={sidebarConfig.leftSidebar.panels.ai.title}
          isOpen={!isConsoleOpen}
          onToggle={togglePanels}
          className={`${!isConsoleOpen ? 'flex-1 flex flex-col min-h-0' : ''}`}
          contentClassName="flex-1 flex flex-col p-0"
        >
          <AIAssistant userApiKey={userApiKey} />
        </CollapsiblePanel>
      </div>
    </div>
  );
};

export default LeftSidebar;
