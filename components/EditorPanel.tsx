import React from 'react';
import Editor from '@monaco-editor/react';
import { baseEditorOptions } from '../data/appConfig';
import { SaveIcon } from './icons';
import { DBFileSystemNode, EditorSettings } from '../types';
import { formatBytes } from '../utils/format';
import Tooltip from './Tooltip';

interface EditorPanelProps {
  activeFile: DBFileSystemNode | null;
  editorContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  isDirty: boolean;
  editorSettings: EditorSettings;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  activeFile,
  editorContent,
  onContentChange,
  onSave,
  isDirty,
  editorSettings,
}) => {
  const saveTooltipText = !activeFile
    ? "No file selected"
    : !isDirty
    ? "No changes to save"
    : "Save file";

  const isDarkTheme = editorSettings.theme === 'vs-dark';

  return (
    <div className={`h-full w-full flex flex-col ${isDarkTheme ? 'bg-gray-800 text-slate-300' : 'bg-white text-slate-800'}`}>
      <div className={`flex items-center justify-between p-2 border-b text-sm ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-slate-100 border-slate-200'}`}>
        <div className="flex items-center space-x-4">
            <span>{activeFile?.path || 'No file selected'}</span>
            {activeFile && (
                <div className={`text-xs flex items-center space-x-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{formatBytes(activeFile.size || 0)}</span>
                    <span>|</span>
                    <span>
                        Updated: {new Date(activeFile.lastModified || 0).toLocaleString()}
                    </span>
                </div>
            )}
        </div>
        <Tooltip text={saveTooltipText}>
          <button
            onClick={onSave}
            disabled={!isDirty || !activeFile}
            className={`flex items-center px-2 py-1 rounded-md ${
                isDarkTheme 
                ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
                : 'bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400'
            } disabled:cursor-not-allowed`}
            aria-label="Save file"
          >
            <SaveIcon className="w-4 h-4 mr-1" />
            Save
          </button>
        </Tooltip>
      </div>
      <div className="flex-grow">
        {activeFile ? (
          <Editor
            key={activeFile.path} // Re-mounts the editor when the file changes
            height="100%"
            defaultLanguage="typescript"
            value={editorContent}
            onChange={(value) => onContentChange(value || '')}
            theme={editorSettings.theme}
            options={{
                ...baseEditorOptions,
                fontSize: editorSettings.fontSize,
                wordWrap: editorSettings.wordWrap,
                minimap: { enabled: editorSettings.minimap },
            }}
          />
        ) : (
          <div className={`flex items-center justify-center h-full ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Select a file to begin editing.
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPanel;
