export interface FileSystemItem {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: FileSystemItem[];
  path: string;
}

export async function getFilesRecursively(
  directoryHandle: FileSystemDirectoryHandle,
  path = ''
): Promise<FileSystemItem[]> {
  const items: FileSystemItem[] = [];
  // @ts-ignore
  for await (const entry of directoryHandle.values()) {
    const itemPath = path ? `${path}/${entry.name}` : entry.name;
    if (entry.kind === 'directory') {
      items.push({
        name: entry.name,
        kind: 'directory',
        handle: entry,
        path: itemPath,
        children: await getFilesRecursively(entry as FileSystemDirectoryHandle, itemPath),
      });
    } else {
      items.push({
        name: entry.name,
        kind: 'file',
        handle: entry,
        path: itemPath,
      });
    }
  }
  return items.sort((a, b) => {
    if (a.kind === b.kind) {
      return a.name.localeCompare(b.name);
    }
    return a.kind === 'directory' ? -1 : 1;
  });
}

export async function readFile(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile();
  return await file.text();
}

export async function writeFile(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function createFile(directoryHandle: FileSystemDirectoryHandle, name: string): Promise<FileSystemFileHandle> {
  return await directoryHandle.getFileHandle(name, { create: true });
}

export async function createDirectory(directoryHandle: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> {
  return await directoryHandle.getDirectoryHandle(name, { create: true });
}

export async function deleteItem(directoryHandle: FileSystemDirectoryHandle, name: string): Promise<void> {
  // @ts-ignore
  await directoryHandle.removeEntry(name, { recursive: true });
}

export function findHandleByPath(items: FileSystemItem[], path: string): FileSystemHandle | null {
  for (const item of items) {
    if (item.path === path) {
      return item.handle;
    }
    if (item.children) {
      const found = findHandleByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function findParentDirectoryHandle(items: FileSystemItem[], path: string, rootHandle: FileSystemDirectoryHandle | null): FileSystemDirectoryHandle | null {
  const parts = path.split('/');
  if (parts.length <= 1) return rootHandle;

  const parentPath = parts.slice(0, -1).join('/');
  const handle = findHandleByPath(items, parentPath);
  if (handle && handle.kind === 'directory') {
    return handle as FileSystemDirectoryHandle;
  }
  return null;
}
