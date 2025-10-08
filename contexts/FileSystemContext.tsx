import { createContext, useContext } from 'react';

export interface FileSystemOperations {
  createNode: (path: string, type: 'file' | 'folder', content?: string) => Promise<{ success: boolean; message: string }>;
  editFile: (path: string, content: string) => Promise<{ success: boolean; message: string }>;
  duplicateNode: (path: string) => Promise<{ success: boolean; message: string }>;
  getResourceFilesContent: () => Promise<{ path: string; content: string }[]>;
}

const FileSystemContext = createContext<FileSystemOperations | undefined>(undefined);

export const FileSystemProvider = FileSystemContext.Provider;

export const useFileSystem = (): FileSystemOperations => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};