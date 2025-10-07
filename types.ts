export interface DBFileSystemNode {
  path: string;
  type: 'file' | 'folder';
  content?: string;
  size?: number;
  lastModified: number;
}

export interface FileSystemNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[];
  size?: number;
  lastModified: number;
}

export interface EditorSettings {
  theme: 'vs-dark' | 'light';
  fontSize: number;
  minimap: boolean;
  wordWrap: 'on' | 'off';
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
