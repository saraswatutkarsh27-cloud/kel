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
