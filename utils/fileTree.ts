import { DBFileSystemNode, FileSystemNode } from '../types';

export function buildFileTree(nodes: DBFileSystemNode[]): FileSystemNode[] {
    const tree: FileSystemNode[] = [];
    const map: { [key: string]: FileSystemNode } = {};

    // First pass: create all nodes and map them by path
    nodes.forEach(node => {
        const parts = node.path.split('/').filter(p => p);
        const name = parts[parts.length - 1];
        map[node.path] = {
            name: name || '/', // handle root if necessary
            path: node.path,
            type: node.type,
            children: node.type === 'folder' ? [] : undefined,
            size: node.size,
            lastModified: node.lastModified,
        };
    });

    // Second pass: link children to their parents
    Object.values(map).forEach(node => {
        const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
        
        if (parentPath && map[parentPath] && map[parentPath].type === 'folder') {
            map[parentPath].children?.push(node);
        } else {
            // It's a root node
            tree.push(node);
        }
    });

    // Sort children alphabetically, folders first
    const sortNodes = (nodeList: FileSystemNode[]) => {
        nodeList.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
        nodeList.forEach(node => {
            if (node.children) {
                sortNodes(node.children);
            }
        });
    };

    sortNodes(tree);

    return tree;
}