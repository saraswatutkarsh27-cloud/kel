import type { AITool, AIToolCall } from "./providers/index";
import { useFileSystemStore } from "@/stores/fileSystemStore";
import { wsClient } from "@/lib/ws-client";

export const agentTools: AITool[] = [
  {
    name: "read_file",
    description: "Read the content of a file at the given path.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "The path of the file to read, relative to project root." },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file at the given path. Creates intermediate directories if needed.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "The path of the file to write." },
        content: { type: "string", description: "The full content to write to the file." },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "create_file",
    description: "Create a new empty file at the given path.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "The path where the file should be created." },
      },
      required: ["path"],
    },
  },
  {
    name: "create_directory",
    description: "Create a new directory at the given path.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "The path of the directory to create." },
      },
      required: ["path"],
    },
  },
  {
    name: "delete_item",
    description: "Delete a file or directory at the given path.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "The path of the item to delete." },
      },
      required: ["path"],
    },
  },
  {
    name: "rename_item",
    description: "Rename or move a file or directory.",
    parameters: {
      type: "object",
      properties: {
        oldPath: { type: "string", description: "The current path of the item." },
        newPath: { type: "string", description: "The new path for the item." },
      },
      required: ["oldPath", "newPath"],
    },
  },
  {
    name: "list_files",
    description: "List all files and directories in the project workspace.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Optional subdirectory to list. Empty string lists root." },
      },
    },
  },
  {
    name: "search_code",
    description: "Search for text across all files in the project.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The text to search for." },
      },
      required: ["query"],
    },
  },
  {
    name: "run_terminal_command",
    description: "Execute a command in the IDE terminal. Use this to run build commands, tests, install packages, etc.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "The shell command to execute." },
      },
      required: ["command"],
    },
  },
];

export async function executeToolCall(toolCall: AIToolCall): Promise<unknown> {
  const { name, args } = toolCall;
  const store = useFileSystemStore.getState();

  try {
    switch (name) {
      case "read_file": {
        const path = args.path as string;
        const file = store.getFileByPath(path);
        if (file?.content !== undefined) return { content: file.content };
        if (store.useBackend) {
          const res = await fetch("/api/files?path=" + encodeURIComponent(path));
          const data = await res.json();
          if (data.success) return { content: data.data };
        }
        return { error: "File not found: " + path };
      }

      case "write_file": {
        const wPath = args.path as string;
        const content = args.content as string;
        const existing = store.getFileByPath(wPath);
        if (existing) {
          store.updateFile(wPath, { content, isDirty: true });
          store.updateTabContent(wPath, content);
        } else {
          store.addFile({ path: wPath, name: wPath.split("/").pop() || "", type: "file", content, isDirty: true });
        }
        if (store.useBackend) {
          await fetch("/api/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "write", path: wPath, content }) });
        }
        return { success: true, path: wPath };
      }

      case "create_file": {
        const cPath = args.path as string;
        store.addFile({ path: cPath, name: cPath.split("/").pop() || "", type: "file", content: "", isDirty: false });
        if (store.useBackend) {
          await fetch("/api/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", path: cPath }) });
        }
        return { success: true, path: cPath };
      }

      case "create_directory": {
        const dPath = args.path as string;
        store.addFolder({ path: dPath, name: dPath.split("/").pop() || "", type: "directory", isDirty: false, children: [] });
        if (store.useBackend) {
          await fetch("/api/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mkdir", path: dPath }) });
        }
        return { success: true, path: dPath };
      }

      case "delete_item": {
        const delPath = args.path as string;
        store.removeFile(delPath);
        if (store.useBackend) {
          await fetch("/api/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", path: delPath }) });
        }
        return { success: true, path: delPath };
      }

      case "rename_item": {
        const oldP = args.oldPath as string;
        const newP = args.newPath as string;
        store.renameFile(oldP, newP);
        if (store.useBackend) {
          await fetch("/api/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "rename", path: oldP, newPath: newP }) });
        }
        return { success: true, oldPath: oldP, newPath: newP };
      }

      case "list_files": {
        const listPath = (args.path as string) || "";
        if (store.useBackend) {
          const res = await fetch("/api/files?path=" + encodeURIComponent(listPath));
          const data = await res.json();
          if (data.success) return { files: data.data };
        }
        const formatTree = (items: typeof store.files, indent = ""): string => {
          let result = "";
          for (const item of items) {
            result += indent + "- " + item.name + (item.type === "directory" ? "/" : "") + "\n";
            if (item.children) result += formatTree(item.children, indent + "  ");
          }
          return result;
        };
        return { structure: formatTree(store.files), files: store.files };
      }

      case "search_code": {
        const query = args.query as string;
        if (store.useBackend) {
          const res = await fetch("/api/files?search=" + encodeURIComponent(query));
          const data = await res.json();
          if (data.success) return { results: data.data };
        }
        const results: { path: string; line: number; content: string }[] = [];
        const searchInFiles = (items: typeof store.files) => {
          for (const item of items) {
            if (item.type === "file" && item.content) {
              item.content.split("\n").forEach((line, i) => {
                if (line.toLowerCase().includes(query.toLowerCase())) {
                  results.push({ path: item.path, line: i + 1, content: line.trim() });
                }
              });
            }
            if (item.children) searchInFiles(item.children);
          }
        };
        searchInFiles(store.files);
        return { results: results.slice(0, 100) };
      }

      case "run_terminal_command": {
        const cmd = args.command as string;
        wsClient.sendAICommand(cmd);
        return { success: true, command: cmd, output: "Command sent to terminal" };
      }

      default:
        return { error: "Unknown tool: " + name };
    }
  } catch (err: any) {
    return { error: err.message };
  }
}
