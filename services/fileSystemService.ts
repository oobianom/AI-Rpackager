import { DBFileSystemNode } from '../types';

const DB_NAME = 'FileSystemDB';
const STORE_NAME = 'files';
const DB_VERSION = 1;

let db: IDBDatabase;

const readmeContent = `# Welcome to the AI-Powered R Package Builder!

This is a browser-based Integrated Development Environment (IDE) designed to streamline the creation of R packages. It combines a powerful code editor, a file explorer, an AI assistant, a live R console, and a command-line terminal to give you everything you need in one place.

## ✨ Key Features

*   **File Explorer**: Manage your project's files and directories with an intuitive tree view.
*   **Code Editor**: A full-featured editor powered by Monaco (the engine behind VS Code) with syntax highlighting and Markdown preview.
*   **AI Assistant**: A Gemini-powered assistant that can understand your requests and interact with the file system to create, edit, and structure your R package.
*   **R Console**: A live, interactive R environment running directly in your browser via WebR.
*   **Terminal**: A simulated command line for managing the R package lifecycle (building, checking, installing).
*   **Customizable Settings**: Tailor the editor's appearance and provide your own Gemini API key.

---

## 🚀 Getting Started

The interface is divided into three main sections:

1.  **Left Sidebar**: Contains the **AI Assistant** and the **Command Line** (R Console & Terminal). You can toggle between them.
2.  **Middle Sidebar**: The **File Explorer**, where you can see and manage your project files.
3.  **Main Panel**: The **Editor**, where you'll write and edit your code.

For the best experience, go to **Settings (⚙️ icon)** > **AI Settings** and add your own Google Gemini API key.

---

##  консоль R Console

The R Console tab provides a real, interactive R session powered by WebR. It comes with the \`dplyr\` and \`ggplot2\` packages pre-installed and loaded, so you can start analyzing data immediately.

### Examples

**1. Basic R Commands:**
\`\`\`R
print("Hello, R!")
x <- 1:10
mean(x)
\`\`\`

**2. Using dplyr:**
\`\`\`R
# The 'mtcars' dataset is available by default
library(dplyr)
mtcars %>% 
  select(mpg, cyl, hp) %>% 
  filter(hp > 150) %>%
  head()
\`\`\`
> **Note**: Graphical output (plots) is not yet displayed, but the R code to generate them will execute successfully.

---

## 🖥️ Terminal

The Terminal provides a simulated environment to run commands for building and checking your R package.

### Available Commands

*   \`help\`: Shows the list of available commands.
*   \`ls\`: Lists all files and folders in the project.
*   \`rpkg new <packagename>\`: Creates a standard R package directory skeleton inside \`/Package\`.
*   \`R CMD build <path>\`: Builds the package source directory into a \`.tar.gz\` archive.
*   \`R CMD check <path>\`: Runs a series of checks to ensure your package is well-formed.
*   \`R CMD INSTALL <path>\`: Simulates installing your package into the environment's library.
*   \`R CMD REMOVE <packagename>\`: Simulates removing an installed package.

### Example Workflow

1.  **Create a new package skeleton:**
    \`\`\`bash
    rpkg new myCoolPackage
    \`\`\`
2.  **Check the new package:**
    \`\`\`bash
    R CMD check /Package/myCoolPackage
    \`\`\`
3.  **Build the package:**
    \`\`\`bash
    R CMD build /Package/myCoolPackage
    \`\`\`
    This will create \`myCoolPackage_0.1.0.tar.gz\` in the root directory.

---

## 🤖 AI Assistant

The AI Assistant, "R Packager," can help you write code, create files, and structure your package. It has access to a set of tools to modify the file system within the \`/Package\` directory.

**Important**: For security, the AI can only create, edit, or duplicate files and folders **inside the /Package directory**.

### Example Prompts

You can ask it to perform tasks like:

*   **Simple file creation**:
    > "Create a new R file named \`utils.R\` inside the \`/Package/myCoolPackage/R\` directory."

*   **Writing code**:
    > "In the file \`/Package/myCoolPackage/R/utils.R\`, write a function named \`add_numbers\` that takes two arguments, \`a\` and \`b\`, and returns their sum. Include Roxygen2 documentation for the function."

*   **Full package setup**:
    > "Create a complete R package named 'statstools'.
    > 1. Create the 'DESCRIPTION' file with standard fields.
    > 2. Create the 'NAMESPACE' file.
    > 3. Create an 'R' directory with a file 'calculations.R'.
    > 4. Inside 'calculations.R', create a function 'calculate_sd' that computes the standard deviation of a numeric vector."

Click the **"Show Sample Prompts"** button for more ideas!

---

## ⚙️ Settings

Click the gear icon in the top-right corner to access settings:

*   **Editor**: Change the theme (dark/light), font size, minimap, and word wrap settings.
*   **File System**: Reset the entire project back to its original state. **Warning: This is irreversible!**
*   **AI Settings**: Add your personal Gemini API key. This is recommended to avoid rate limits associated with the application's default key.
`;

const initialNodes: DBFileSystemNode[] = [
    { path: '/Package', type: 'folder', lastModified: Date.now() },
    { path: '/Resources', type: 'folder', lastModified: Date.now() },
    { 
        path: '/README.md', 
        type: 'file', 
        content: readmeContent,
        size: readmeContent.length,
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
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const getAllRequest = store.getAll();
        
        getAllRequest.onerror = () => {
            reject(getAllRequest.error);
        };
        
        getAllRequest.onsuccess = () => {
            const allNodes: DBFileSystemNode[] = getAllRequest.result;
            const pathsToDelete = [path];
            
            const nodeToDelete = allNodes.find(n => n.path === path);
            if (nodeToDelete && nodeToDelete.type === 'folder') {
                allNodes.forEach(node => {
                    if (node.path.startsWith(path + '/')) {
                        pathsToDelete.push(node.path);
                    }
                });
            }
            
            pathsToDelete.forEach(p => {
                store.delete(p);
            });
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}


function findUniquePathSync(path: string, allNodes: DBFileSystemNode[]): string {
    let newPath = path;
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

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const getAllRequest = store.getAll();
        getAllRequest.onerror = () => reject(getAllRequest.error);

        getAllRequest.onsuccess = () => {
            const allNodes: DBFileSystemNode[] = getAllRequest.result;
            const originalNode = allNodes.find(n => n.path === path);
            if (!originalNode) {
                transaction.abort();
                reject(new Error("Node not found"));
                return;
            }

            const newPath = findUniquePathSync(path, allNodes);
            const newNodes: DBFileSystemNode[] = [];

            const duplicateTime = Date.now();

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

            newNodes.forEach(node => store.add(node));
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function renameNode(oldPath: string, newName: string): Promise<void> {
    const database = await openDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const getAllRequest = store.getAll();
        getAllRequest.onerror = () => reject(getAllRequest.error);
        
        getAllRequest.onsuccess = () => {
            const allNodes: DBFileSystemNode[] = getAllRequest.result;
            const originalNode = allNodes.find(n => n.path === oldPath);
            if (!originalNode) {
                transaction.abort();
                reject(new Error("Node not found"));
                return;
            }

            const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
            const newPath = `${parentPath}/${newName}`;

            if(oldPath === newPath) {
                return; 
            }

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
            
            pathsToDelete.forEach(p => store.delete(p));
            nodesToUpdate.forEach(n => store.add(n));
        };
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function getResourceFilesContent(): Promise<{ path: string; content: string }[]> {
    const allNodes = await getAllNodes();
    return allNodes
        .filter(node => node.type === 'file' && node.path.startsWith('/Resources/'))
        .filter(node => node.content && node.content.trim() !== '')
        .map(node => ({ path: node.path, content: node.content || '' }));
}

export function upsertFile(path: string, content: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const getRequest = store.get(path);

        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
            let node = getRequest.result as DBFileSystemNode | undefined;
            
            if (node && node.type === 'folder') {
                reject(new Error(`Cannot write file content to a folder path: ${path}`));
                return;
            }

            if (node) {
                // Update existing file
                node.content = content;
                node.size = content.length;
                node.lastModified = Date.now();
            } else {
                // Create new file
                node = {
                    path,
                    type: 'file',
                    content,
                    size: content.length,
                    lastModified: Date.now(),
                };
            }
            
            const putRequest = store.put(node);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };
    });
}