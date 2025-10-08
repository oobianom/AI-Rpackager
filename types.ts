export interface FileSystemNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[];
  size?: number;
  lastModified?: number;
}

export interface DBFileSystemNode {
    path: string; // e.g., /src/components/AIAssistant.tsx
    type: 'file' | 'folder';
    content?: string;
    size?: number;
    lastModified?: number;
}

export interface Message {
    role: 'user' | 'model';
    content: string;
    toolsUsed?: string[];
}

export interface EditorSettings {
    theme: 'vs-dark' | 'light';
    fontSize: number;
    minimap: boolean;
    wordWrap: 'on' | 'off';
}