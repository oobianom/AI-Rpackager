import React, { useState } from 'react';
import { EditorSettings } from '../types';
import { PanelLeftCloseIcon, CodeIcon, HardDriveIcon } from './icons';
import Tooltip from './Tooltip';
import ToggleSwitch from './ToggleSwitch';

interface SettingsPageProps {
  onClose: () => void;
  editorSettings: EditorSettings;
  onEditorSettingsChange: (settings: EditorSettings) => void;
  onResetFileSystem: () => void;
}

type ActiveTab = 'editor' | 'filesystem';

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onClose,
  editorSettings,
  onEditorSettingsChange,
  onResetFileSystem,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });

  const handleSettingChange = (key: keyof EditorSettings, value: any) => {
    onEditorSettingsChange({ ...editorSettings, [key]: value });
  };

  const handleReset = async () => {
    if (resetConfirmText === 'RESET') {
        try {
            await onResetFileSystem();
            setResetMessage({ text: 'File system has been successfully reset.', type: 'success' });
        } catch (error) {
            setResetMessage({ text: 'Failed to reset file system.', type: 'error' });
        } finally {
            setResetConfirmText('');
            setTimeout(() => setResetMessage({ text: '', type: '' }), 5000);
        }
    }
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'editor':
        return <EditorSettingsContent settings={editorSettings} onChange={handleSettingChange} />;
      case 'filesystem':
        return (
          <FileSystemSettingsContent 
            onReset={handleReset}
            confirmText={resetConfirmText}
            onConfirmTextChange={setResetConfirmText}
            message={resetMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-slate-100">
        <div className="flex items-center justify-between p-3 border-b border-slate-200 flex-shrink-0 bg-white">
            <h2 className="text-lg font-semibold text-slate-800">Settings</h2>
            <Tooltip text="Close Settings">
              <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded" aria-label="Close settings">
                <PanelLeftCloseIcon className="w-5 h-5 text-slate-600" />
              </button>
            </Tooltip>
        </div>
        <div className="flex-grow flex overflow-hidden">
            <aside className="w-56 flex-shrink-0 bg-slate-50 border-r border-slate-200 p-4">
                <nav className="space-y-2">
                    <NavItem icon={<CodeIcon />} label="Editor" isActive={activeTab === 'editor'} onClick={() => setActiveTab('editor')} />
                    <NavItem icon={<HardDriveIcon />} label="File System" isActive={activeTab === 'filesystem'} onClick={() => setActiveTab('filesystem')} />
                </nav>
            </aside>
            <main className="flex-grow p-6 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    </div>
  );
};

// FIX: Changed icon prop type to be more specific, telling TypeScript that the passed element accepts a className prop. This resolves the React.cloneElement error.
const NavItem: React.FC<{icon: React.ReactElement<{ className?: string }>, label: string, isActive: boolean, onClick: () => void}> = ({ icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive 
            ? 'bg-sky-100 text-sky-700' 
            : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        <span className={isActive ? 'text-sky-600' : 'text-slate-500'}>{React.cloneElement(icon, { className: 'w-5 h-5' })}</span>
        <span>{label}</span>
    </button>
);

const EditorSettingsContent: React.FC<{settings: EditorSettings, onChange: (key: keyof EditorSettings, value: any) => void}> = ({ settings, onChange }) => (
  <div className="max-w-2xl mx-auto space-y-8">
    <h3 className="text-xl font-bold text-slate-800">Editor</h3>
    
    <SettingRow label="Theme" description="Change the look and feel of the code editor.">
        <select
          value={settings.theme}
          onChange={(e) => onChange('theme', e.target.value)}
          className="p-2 w-48 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
        >
          <option value="vs-dark">Dark (VS Code)</option>
          <option value="light">Light</option>
        </select>
    </SettingRow>

    <SettingRow label="Font Size" description="Adjust the font size for the code editor.">
        <input
          type="number"
          value={settings.fontSize}
          onChange={(e) => onChange('fontSize', parseInt(e.target.value, 10) || 14)}
          className="p-2 w-24 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
        />
    </SettingRow>
    
    <SettingRow label="Minimap" description="Show a miniature version of your code on the side.">
        <ToggleSwitch
            checked={settings.minimap}
            onChange={(checked) => onChange('minimap', checked)}
        />
    </SettingRow>
    
    <SettingRow label="Word Wrap" description="Automatically wrap lines that exceed the editor width.">
        <ToggleSwitch
            checked={settings.wordWrap === 'on'}
            onChange={(checked) => onChange('wordWrap', checked ? 'on' : 'off')}
        />
    </SettingRow>
  </div>
);

const FileSystemSettingsContent: React.FC<{
    onReset: () => void,
    confirmText: string,
    onConfirmTextChange: (text: string) => void,
    message: { text: string, type: string }
}> = ({ onReset, confirmText, onConfirmTextChange, message }) => (
  <div className="max-w-2xl mx-auto space-y-8">
    <h3 className="text-xl font-bold text-slate-800">File System</h3>
    <div className="p-6 bg-white border border-red-300 rounded-lg">
      <h4 className="text-lg font-semibold text-red-800">Danger Zone</h4>
      <div className="mt-4 border-t border-red-200 pt-4 space-y-4">
        <div>
            <p className="font-semibold text-slate-700">Reset File System</p>
            <p className="text-sm text-slate-500 mt-1">
                This will permanently delete all files and folders, restoring the initial project structure. This action is irreversible.
            </p>
        </div>
        <div className="space-y-2">
            <label htmlFor="reset-confirm" className="text-sm font-medium text-slate-600">To confirm, type <span className="font-bold text-slate-800">RESET</span> below:</label>
            <input
                id="reset-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => onConfirmTextChange(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
        </div>
        <button
          onClick={onReset}
          disabled={confirmText !== 'RESET'}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
        >
          Reset Project Files
        </button>
        {message.text && (
            <p className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
            </p>
        )}
      </div>
    </div>
  </div>
);


const SettingRow: React.FC<{label: string, description: string, children: React.ReactNode}> = ({ label, description, children }) => (
    <div className="flex justify-between items-start py-4 border-b border-slate-200">
        <div>
            <p className="font-medium text-slate-800">{label}</p>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </div>
);


export default SettingsPage;
