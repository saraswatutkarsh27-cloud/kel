import * as fs from "fs";
import * as path from "path";

interface FileInfo {
  name: string;
  path: string;
  kind: "file" | "directory";
  size?: number;
  children?: FileInfo[];
}

interface FileResult {
  success: boolean;
  data?: string | FileInfo[] | FileInfo;
  error?: string;
}

class FileAPI {
  private rootDir: string;

  constructor(rootDir?: string) {
    this.rootDir = rootDir || process.cwd();
  }

  setRootDir(dir: string): void {
    this.rootDir = dir;
  }

  getRootDir(): string {
    return this.rootDir;
  }

  /**
   * Resolve a file path relative to the root directory.
   * Prevents path traversal attacks.
   */
  private resolvePath(filePath: string): string {
    const resolved = path.resolve(this.rootDir, filePath);
    // Ensure the resolved path is within the root directory
    if (!resolved.startsWith(path.resolve(this.rootDir))) {
      throw new Error("Path traversal detected");
    }
    return resolved;
  }

  /**
   * Read a file's content.
   */
  readFile(filePath: string): FileResult {
    try {
      const fullPath = this.resolvePath(filePath);
      const content = fs.readFileSync(fullPath, "utf-8");
      return { success: true, data: content };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Write content to a file.
   */
  writeFile(filePath: string, content: string): FileResult {
    try {
      const fullPath = this.resolvePath(filePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, "utf-8");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Create a new file.
   */
  createFile(filePath: string): FileResult {
    try {
      const fullPath = this.resolvePath(filePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, "", "utf-8");
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Create a new directory.
   */
  createDirectory(dirPath: string): FileResult {
    try {
      const fullPath = this.resolvePath(dirPath);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete a file or directory.
   */
  deleteItem(itemPath: string): FileResult {
    try {
      const fullPath = this.resolvePath(itemPath);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Rename a file or directory.
   */
  renameItem(oldPath: string, newPath: string): FileResult {
    try {
      const fullOldPath = this.resolvePath(oldPath);
      const fullNewPath = this.resolvePath(newPath);
      if (fs.existsSync(fullOldPath)) {
        fs.renameSync(fullOldPath, fullNewPath);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * List all files and directories in a path recursively.
   */
  listFiles(dirPath: string = ""): FileResult {
    try {
      const fullPath = this.resolvePath(dirPath);
      if (!fs.existsSync(fullPath)) {
        return { success: false, error: `Directory not found: ${dirPath}` };
      }
      const items = this.scanDirectory(fullPath, dirPath);
      return { success: true, data: items };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Recursively scan a directory for all files and folders.
   */
  private scanDirectory(dirPath: string, relativePath: string): FileInfo[] {
    const items: FileInfo[] = [];
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

        const itemRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        const itemFullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          const children = this.scanDirectory(itemFullPath, itemRelativePath);
          items.push({
            name: entry.name,
            path: itemRelativePath,
            kind: "directory",
            children,
          });
        } else {
          const stat = fs.statSync(itemFullPath);
          items.push({
            name: entry.name,
            path: itemRelativePath,
            kind: "file",
            size: stat.size,
          });
        }
      }
    } catch {
      // Silently skip directories we can't read
    }
    return items.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Search for text across all files in the project.
   */
  searchFiles(query: string, dirPath: string = ""): { path: string; line: number; content: string }[] {
    const results: { path: string; line: number; content: string }[] = [];
    const fullPath = this.resolvePath(dirPath);
    this.searchInDirectory(fullPath, "", query.toLowerCase(), results);
    return results;
  }

  private searchInDirectory(
    dirPath: string,
    relativePath: string,
    query: string,
    results: { path: string; line: number; content: string }[]
  ): void {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        const itemRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        const itemFullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          this.searchInDirectory(itemFullPath, itemRelativePath, query, results);
        } else if (entry.isFile()) {
          try {
            const content = fs.readFileSync(itemFullPath, "utf-8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].toLowerCase().includes(query)) {
                results.push({
                  path: itemRelativePath,
                  line: i + 1,
                  content: lines[i].trim(),
                });
              }
            }
          } catch {
            // Skip binary files
          }
        }
      }
    } catch {
      // Skip
    }
  }
}

export default FileAPI;
