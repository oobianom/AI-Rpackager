import { DBFileSystemNode } from '../types';

const DB_NAME = 'FileSystemDB';
const STORE_NAME = 'files';
const DB_VERSION = 1;

let db: IDBDatabase;

const initialNodes: DBFileSystemNode[] = [
    { path: '/Package', type: 'folder', lastModified: Date.now() },
    { path: '/Resources', type: 'folder', lastModified: Date.now() },
    { 
        path: '/README.md', 
        type: 'file', 
        content: '# AI-Powered R Package Builder\n\nWelcome!\n\nThis is a simple README file to get you started.\n\nYou can edit this file and click "Save" to persist the changes.',
        size: 154,
        lastModified: Date.now(),
    },
];

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("IndexedDB error:", request.error);
            reject("Error opening IndexedDB.");
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                tempDb.createObjectStore(STORE_NAME, { keyPath: 'path' });
            }
        };
    });
}

async function seedInitialData(database: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        console.log("Seeding initial file system data...");
        initialNodes.forEach(node => {
            store.add(node);
        });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function initDB(): Promise<void> {
    const database = await openDB();
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();

    return new Promise((resolve) => {
      countRequest.onsuccess = async () => {
          if (countRequest.result === 0) {
              await seedInitialData(database);
          }
          resolve();
      };
    });
}

export async function resetDB(): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      transaction.oncomplete = async () => {
          await seedInitialData(database);
          resolve();
      };
    });
}

export function getAllNodes(): Promise<DBFileSystemNode[]> {
    return new Promise(async (resolve, reject) => {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export function getNode(path: string): Promise<DBFileSystemNode | undefined> {
    return new Promise(async (resolve, reject) => {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(path);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export function addNode(node: DBFileSystemNode): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(node);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export function saveFileContent(path: string, content: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const getRequest = store.get(path);

        getRequest.onsuccess = () => {
            const node = getRequest.result;
            if (node && node.type === 'file') {
                node.content = content;
                node.size = content.length;
                node.lastModified = Date.now();
                const putRequest = store.put(node);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            } else {
                reject(`File not found or not a file: ${path}`);
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
}


export async function deleteNode(path: string): Promise<void> {
    const database = await openDB();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const allNodes = await getAllNodes();

    const pathsToDelete = [path];
    
    // If it's a folder, find all children to delete
    const nodeToDelete = allNodes.find(n => n.path === path);
    if (nodeToDelete && nodeToDelete.type === 'folder') {
        allNodes.forEach(node => {
            if (node.path.startsWith(path + '/')) {
                pathsToDelete.push(node.path);
            }
        });
    }

    return new Promise((resolve, reject) => {
        pathsToDelete.forEach((p, index) => {
            const request = store.delete(p);
            if (index === pathsToDelete.length - 1) {
                request.onsuccess = () => resolve();
            }
        });
        transaction.onerror = () => reject(transaction.error);
    });
}


async function findUniquePath(path: string): Promise<string> {
    let newPath = path;
    const allNodes = await getAllNodes();
    const pathExists = (p: string) => allNodes.some(n => n.path === p);

    if (!pathExists(path)) {
        return path;
    }

    const directory = path.substring(0, path.lastIndexOf('/'));
    const baseName = path.substring(path.lastIndexOf('/') + 1);
    
    let suffix = ' (copy)';
    let extension = '';
    
    if (baseName.includes('.')) {
        extension = baseName.substring(baseName.lastIndexOf('.'));
        const nameWithoutExt = baseName.substring(0, baseName.lastIndexOf('.'));
        newPath = `${directory}/${nameWithoutExt}${suffix}${extension}`;
    } else {
        newPath = `${directory}/${baseName}${suffix}`;
    }

    let count = 2;
    while(pathExists(newPath)) {
        suffix = ` (copy ${count})`;
        if (baseName.includes('.')) {
            const nameWithoutExt = baseName.substring(0, baseName.lastIndexOf('.'));
            newPath = `${directory}/${nameWithoutExt}${suffix}${extension}`;
        } else {
             newPath = `${directory}/${baseName}${suffix}`;
        }
        count++;
    }
    return newPath;
}

export async function duplicateNode(path: string): Promise<void> {
    const database = await openDB();
    const allNodes = await getAllNodes();
    
    const originalNode = allNodes.find(n => n.path === path);
    if (!originalNode) throw new Error("Node not found");

    const newPath = await findUniquePath(path);
    const newNodes: DBFileSystemNode[] = [];

    const duplicateTime = Date.now();

    const originalName = originalNode.path.substring(originalNode.path.lastIndexOf('/') + 1);
    const newName = newPath.substring(newPath.lastIndexOf('/') + 1);

    if (originalNode.type === 'file') {
        newNodes.push({
            ...originalNode,
            path: newPath,
            lastModified: duplicateTime,
        });
    } else { // Folder
        newNodes.push({
            ...originalNode,
            path: newPath,
            lastModified: duplicateTime,
        });
        const children = allNodes.filter(n => n.path.startsWith(path + '/'));
        children.forEach(child => {
            const childNewPath = child.path.replace(path, newPath);
            newNodes.push({ ...child, path: childNewPath, lastModified: duplicateTime });
        });
    }

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        newNodes.forEach(node => store.add(node));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function renameNode(oldPath: string, newName: string): Promise<void> {
    const database = await openDB();
    const allNodes = await getAllNodes();
    
    const originalNode = allNodes.find(n => n.path === oldPath);
    if (!originalNode) throw new Error("Node not found");

    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = `${parentPath}/${newName}`;

    if(oldPath === newPath) return; // No change

    const nodesToUpdate: DBFileSystemNode[] = [];
    const pathsToDelete: string[] = [];

    const renameTime = Date.now();

    if (originalNode.type === 'file') {
        nodesToUpdate.push({ ...originalNode, path: newPath, lastModified: renameTime });
        pathsToDelete.push(oldPath);
    } else { // Folder
        nodesToUpdate.push({ ...originalNode, path: newPath, lastModified: renameTime });
        pathsToDelete.push(oldPath);

        const children = allNodes.filter(n => n.path.startsWith(oldPath + '/'));
        children.forEach(child => {
            const childNewPath = child.path.replace(oldPath, newPath);
            nodesToUpdate.push({ ...child, path: childNewPath, lastModified: renameTime });
            pathsToDelete.push(child.path);
        });
    }
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        pathsToDelete.forEach(p => store.delete(p));
        nodesToUpdate.forEach(n => store.add(n));
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}
