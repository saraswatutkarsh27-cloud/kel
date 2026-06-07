import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const getRootDir = () => process.cwd();

function resolvePath(filePath: string): string {
  const rootDir = getRootDir();
  const resolved = path.resolve(rootDir, filePath);
  if (!resolved.startsWith(path.resolve(rootDir))) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path") || "";
    const searchQuery = searchParams.get("search");

    if (searchQuery) {
      const results = searchInDirectory(getRootDir(), "", searchQuery);
      return NextResponse.json({ success: true, data: results.slice(0, 200) });
    }

    const fullPath = resolvePath(filePath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: "Path not found" }, { status: 404 });
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      return NextResponse.json({ success: true, data: scanDirectory(fullPath, filePath) });
    } else {
      return NextResponse.json({ success: true, data: fs.readFileSync(fullPath, "utf-8") });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, path: filePath, content, newPath } = body;
    if (!action || !filePath) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    switch (action) {
      case "read": {
        const fullPath = resolvePath(filePath);
        if (!fs.existsSync(fullPath)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: fs.readFileSync(fullPath, "utf-8") });
      }
      case "write": {
        if (content === undefined) return NextResponse.json({ success: false, error: "Missing content" }, { status: 400 });
        const fullPath = resolvePath(filePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, content, "utf-8");
        return NextResponse.json({ success: true });
      }
      case "create":
      case "mkdir": {
        const fullPath = resolvePath(filePath);
        const dir = action === "mkdir" ? fullPath : path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (action === "create" && !fs.existsSync(fullPath)) fs.writeFileSync(fullPath, "", "utf-8");
        return NextResponse.json({ success: true });
      }
      case "delete": {
        const fullPath = resolvePath(filePath);
        if (fs.existsSync(fullPath)) {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) fs.rmSync(fullPath, { recursive: true, force: true });
          else fs.unlinkSync(fullPath);
        }
        return NextResponse.json({ success: true });
      }
      case "rename": {
        if (!newPath) return NextResponse.json({ success: false, error: "Missing newPath" }, { status: 400 });
        const fullOld = resolvePath(filePath);
        const fullNew = resolvePath(newPath);
        if (fs.existsSync(fullOld)) {
          const dir = path.dirname(fullNew);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.renameSync(fullOld, fullNew);
        }
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function scanDirectory(dirPath: string, relativePath: string): any[] {
  const items: any[] = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        items.push({ name: entry.name, path: rel, kind: "directory", children: scanDirectory(full, rel) });
      } else {
        items.push({ name: entry.name, path: rel, kind: "file", size: fs.statSync(full).size });
      }
    }
  } catch {}
  return items.sort((a, b) => a.kind !== b.kind ? (a.kind === "directory" ? -1 : 1) : a.name.localeCompare(b.name));
}

function searchInDirectory(dirPath: string, relativePath: string, query: string): { path: string; line: number; content: string }[] {
  const results: { path: string; line: number; content: string }[] = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...searchInDirectory(full, rel, query));
      } else if (entry.isFile()) {
        try {
          const content = fs.readFileSync(full, "utf-8");
          content.split("\n").forEach((line, i) => {
            if (line.toLowerCase().includes(query.toLowerCase())) results.push({ path: rel, line: i + 1, content: line.trim() });
          });
        } catch {}
      }
    }
  } catch {}
  return results;
}
