import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { baseEditorOptions } from '../data/appConfig';
import { SaveIcon, EyeIcon, CodeIcon } from './icons';
import { DBFileSystemNode, EditorSettings } from '../types';
import { formatBytes } from '../utils/format';
import Tooltip from './Tooltip';
import MarkdownPreview from './MarkdownPreview';

interface EditorPanelProps {
  activeFile: DBFileSystemNode | null;
  editorContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  isDirty: boolean;
  editorSettings: EditorSettings;
}

const getLanguageForPath = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'r':
      return 'r';
    case 'rmd':
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    default:
      return 'plaintext';
  }
};

const isMarkdownFile = (path: string): boolean => {
    const lowerPath = path.toLowerCase();
    return lowerPath.endsWith('.md') || lowerPath.endsWith('.rmd');
};


const EditorPanel: React.FC<EditorPanelProps> = ({
  activeFile,
  editorContent,
  onContentChange,
  onSave,
  isDirty,
  editorSettings,
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setViewMode('edit');
  }, [activeFile]);

  const saveTooltipText = !activeFile
    ? "No file selected"
    : !isDirty
    ? "No changes to save"
    : "Save file (Ctrl+S)";

  const isDarkTheme = editorSettings.theme === 'vs-dark';
  const language = activeFile ? getLanguageForPath(activeFile.path) : 'plaintext';

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
        <div className="flex items-center space-x-2">
            {activeFile && isMarkdownFile(activeFile.path) && (
                 <div className={`flex rounded-md p-0.5 ${isDarkTheme ? 'bg-gray-800' : 'bg-slate-200'}`}>
                    <Tooltip text="Edit (Code View)">
                        <button
                            onClick={() => setViewMode('edit')}
                            className={`px-2 py-0.5 rounded-md text-sm ${viewMode === 'edit' ? (isDarkTheme ? 'bg-gray-600' : 'bg-white shadow-sm') : 'hover:bg-slate-300/50'}`}
                            aria-pressed={viewMode === 'edit'}
                        >
                            <CodeIcon className="w-4 h-4" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Preview">
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`px-2 py-0.5 rounded-md text-sm ${viewMode === 'preview' ? (isDarkTheme ? 'bg-gray-600' : 'bg-white shadow-sm') : 'hover:bg-slate-300/50'}`}
                            aria-pressed={viewMode === 'preview'}
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            )}
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
      </div>
      <div className="flex-grow min-h-0">
        {activeFile ? (
            viewMode === 'edit' || !isMarkdownFile(activeFile.path) ? (
              <Editor
                key={activeFile.path} // Re-mounts the editor when the file changes
                height="100%"
                language={language}
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
                <MarkdownPreview content={editorContent} isDarkTheme={isDarkTheme} />
            )
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