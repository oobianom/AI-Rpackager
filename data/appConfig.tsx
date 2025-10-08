import { EditorSettings } from '../types';

export const sidebarConfig = {
  leftSidebar: {
    title0: 'Helper',
    title: 'Command Line',
    panels: {
      console: {
        title: 'Command Line',
        defaultOpen: false,
      },
      ai: {
        title: 'AI Assistant',
        defaultOpen: true,
      },
    },
  },
  middleSidebar: {
    title: 'Explorer',
  },
  editorPanel: {
    defaultFile: 'src/components/AIAssistant.tsx',
  },
};

export const defaultEditorSettings: EditorSettings = {
    theme: 'vs-dark',
    fontSize: 14,
    minimap: false,
    wordWrap: 'on',
};

// These are base options that won't be user-configurable for this app
export const baseEditorOptions = {
    scrollBeyondLastLine: false,
    // Add other non-configurable options here
};


export const aiConfig = {
    model: 'gemini-2.5-flash',
    systemInstruction: "You are a helpful AI assistant for a software developer. Be concise and provide code examples when relevant.",
};
