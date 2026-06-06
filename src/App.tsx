import React, { useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { FileExplorer } from './components/FileExplorer';
import { AIChat } from './components/AIChat';
import { GlobalSearch } from './components/GlobalSearch';
import type { FileSystemItem } from './lib/fileSystem';
import { getFilesRecursively, readFile, writeFile, createFile, createDirectory, deleteItem } from './lib/fileSystem';
import { X, Save, Circle, Search, Files, Settings } from 'lucide-react';

interface OpenFile {
  item: FileSystemItem;
  content: string;
  originalContent: string;
  isDirty: boolean;
}

const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([]);
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [geminiKey, setGeminiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  const [sidebarView, setSidebarView] = useState<'explorer' | 'search' | 'settings'>('explorer');
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('editor_font_size') || '14'));
  const [theme, setTheme] = useState<'vs-dark' | 'light'>(localStorage.getItem('editor_theme') as any || 'vs-dark');

  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);

  const activeFile = openFiles.find(f => f.item.path === activeFilePath) || null;

  const refreshFileSystem = async () => {
    if (rootHandle) {
      const files = await getFilesRecursively(rootHandle);
      setFileSystem(files);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      setRootHandle(handle);
      const files = await getFilesRecursively(handle);
      setFileSystem(files);
    } catch (err) {
      console.error('Directory access denied or failed', err);
    }
  };

  const handleFileSelect = async (item: FileSystemItem) => {
    if (item.kind === 'file') {
      const existing = openFiles.find((f) => f.item.path === item.path);
      if (!existing) {
        const content = await readFile(item.handle as FileSystemFileHandle);
        const newOpenFile: OpenFile = {
          item,
          content,
          originalContent: content,
          isDirty: false,
        };
        setOpenFiles([...openFiles, newOpenFile]);
      }
      setActiveFilePath(item.path);
    }
  };

  const handleCreateFile = async (parent: FileSystemDirectoryHandle) => {
    const name = prompt('Enter file name:');
    if (name) {
      await createFile(parent, name);
      await refreshFileSystem();
    }
  };

  const handleCreateFolder = async (parent: FileSystemDirectoryHandle) => {
    const name = prompt('Enter folder name:');
    if (name) {
      await createDirectory(parent, name);
      await refreshFileSystem();
    }
  };

  const handleDeleteItem = async (item: FileSystemItem) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        if (!item.path.includes('/')) {
            if (rootHandle) await deleteItem(rootHandle, item.name);
        } else {
            alert("Delete only supported for top-level items in this version.");
            return;
        }
        setOpenFiles(prev => prev.filter(f => !f.item.path.startsWith(item.path)));
        if (activeFilePath?.startsWith(item.path)) setActiveFilePath(null);
        await refreshFileSystem();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const closeFile = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const fileToClose = openFiles.find(f => f.item.path === path);
    if (fileToClose?.isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) return;
    }
    const updatedFiles = openFiles.filter((f) => f.item.path !== path);
    setOpenFiles(updatedFiles);
    if (activeFilePath === path) {
      if (updatedFiles.length > 0) setActiveFilePath(updatedFiles[updatedFiles.length - 1].item.path);
      else setActiveFilePath(null);
    }
  };

  const saveFile = async () => {
    if (activeFile && activeFile.item.handle.kind === 'file') {
      await writeFile(activeFile.item.handle as FileSystemFileHandle, activeFile.content);
      setOpenFiles(prev => prev.map(f =>
        f.item.path === activeFile.item.path
          ? { ...f, isDirty: false, originalContent: f.content }
          : f
      ));
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFilePath) {
      const newContent = value || '';
      setOpenFiles(prev => prev.map(f =>
        f.item.path === activeFilePath
          ? { ...f, content: newContent, isDirty: newContent !== f.originalContent }
          : f
      ));
    }
  };

  const handleApplyCode = (code: string) => {
    if (editorRef.current && monacoRef.current) {
      const selection = editorRef.current.getSelection();
      const range = new monacoRef.current.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: range, text: code, forceMoveMarkers: true };
      editorRef.current.executeEdits("my-source", [op]);
    } else if (activeFilePath) {
        handleEditorChange(code);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure TypeScript defaults to be less strict for the web IDE
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ["node_modules/@types"],
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      noEmit: true,
    });

    // Disable some common annoying diagnostics for a quick web editor
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: false
    });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value.trim(); // Trim whitespace
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const updateFontSize = (newSize: number) => {
    setFontSize(newSize);
    localStorage.setItem('editor_font_size', newSize.toString());
  };

  const updateTheme = (newTheme: 'vs-dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('editor_theme', newTheme);
  };

  return (
    <div className={`flex flex-col h-screen ${theme === 'vs-dark' ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-white text-black'} font-sans`}>
      {/* Header/Toolbar */}
      <div className={`h-10 ${theme === 'vs-dark' ? 'bg-[#323233] border-[#2b2b2b]' : 'bg-[#f3f3f3] border-[#cccccc]'} flex items-center px-4 justify-between border-b`}>
        <div className="flex items-center gap-4">
          <span className={`font-bold ${theme === 'vs-dark' ? 'text-white' : 'text-black'} text-sm`}>JS CODE IDE</span>
          <button onClick={handleOpenFolder} className="text-xs hover:opacity-80">Open Folder</button>
          <button
            onClick={saveFile}
            disabled={!activeFile || !activeFile.isDirty}
            className={`flex items-center gap-1 text-xs ${activeFile?.isDirty ? 'text-blue-500 hover:opacity-80' : 'opacity-30 cursor-not-allowed'}`}
          >
            <Save size={14} /> Save
          </button>
        </div>
        <div>
          <input
            type="password"
            placeholder="Gemini API Key"
            value={geminiKey}
            onChange={handleApiKeyChange}
            className={`bg-[#2d2d2d] border border-[#444] rounded px-2 py-0.5 text-xs focus:outline-none text-white`}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className={`w-12 ${theme === 'vs-dark' ? 'bg-[#333333]' : 'bg-[#2c2c2c]'} flex flex-col items-center py-4 gap-4 text-gray-400`}>
            <Files
                size={24}
                className={`cursor-pointer hover:text-white ${sidebarView === 'explorer' ? 'text-white' : ''}`}
                onClick={() => setSidebarView('explorer')}
            />
            <Search
                size={24}
                className={`cursor-pointer hover:text-white ${sidebarView === 'search' ? 'text-white' : ''}`}
                onClick={() => setSidebarView('search')}
            />
            <div className="flex-1" />
            <Settings
                size={24}
                className={`cursor-pointer hover:text-white ${sidebarView === 'settings' ? 'text-white' : ''}`}
                onClick={() => setSidebarView('settings')}
            />
        </div>

        {/* Sidebar */}
        {sidebarView === 'explorer' && (
            <FileExplorer
                items={fileSystem}
                onFileSelect={handleFileSelect}
                onOpenFolder={handleOpenFolder}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onDelete={handleDeleteItem}
                rootHandle={rootHandle}
            />
        )}
        {sidebarView === 'search' && (
            <GlobalSearch items={fileSystem} onResultClick={handleFileSelect} />
        )}
        {sidebarView === 'settings' && (
            <div className="w-64 h-full bg-[#252526] border-r border-[#333] p-4 flex flex-col gap-4">
                <div className="text-xs font-bold uppercase text-gray-400">Settings</div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs">Font Size: {fontSize}px</label>
                    <input
                        type="range" min="8" max="32" value={fontSize}
                        onChange={(e) => updateFontSize(parseInt(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs">Theme</label>
                    <select
                        value={theme}
                        onChange={(e) => updateTheme(e.target.value as any)}
                        className="bg-[#3c3c3c] text-white text-xs p-1 rounded focus:outline-none"
                    >
                        <option value="vs-dark">Visual Studio Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>
            </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className={`flex h-9 ${theme === 'vs-dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]'} overflow-x-auto border-b ${theme === 'vs-dark' ? 'border-[#1e1e1e]' : 'border-[#cccccc]'}`}>
            {openFiles.map((file) => (
              <div
                key={file.item.path}
                onClick={() => setActiveFilePath(file.item.path)}
                className={`flex items-center gap-2 px-3 py-1 text-sm border-r cursor-pointer min-w-fit ${
                  activeFilePath === file.item.path
                    ? (theme === 'vs-dark' ? 'bg-[#1e1e1e] text-white' : 'bg-white text-black')
                    : (theme === 'vs-dark' ? 'hover:bg-[#2a2d2e] border-[#1e1e1e]' : 'hover:bg-white/50 border-[#cccccc]')
                }`}
              >
                <span>{file.item.name}</span>
                {file.isDirty ? (
                  <Circle size={8} className={`fill-current ${theme === 'vs-dark' ? 'text-white' : 'text-blue-500'}`} />
                ) : (
                  <X
                    size={14}
                    className="hover:bg-gray-500/20 rounded"
                    onClick={(e) => closeFile(e, file.item.path)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            {activeFile ? (
              <Editor
                height="100%"
                theme={theme}
                path={activeFile.item.path}
                defaultLanguage="typescript"
                language={activeFile.item.name.split('.').pop()}
                value={activeFile.content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: fontSize,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Open a file to start editing
              </div>
            )}
          </div>
        </div>

        {/* AI Sidebar */}
        <AIChat
          apiKey={geminiKey}
          currentFileContent={activeFile?.content || ''}
          fileName={activeFile?.item.name || ''}
          onApplyCode={handleApplyCode}
          theme={theme}
          projectFiles={fileSystem}
          rootHandle={rootHandle}
          onRefreshFileSystem={refreshFileSystem}
        />
      </div>

      {/* Status Bar */}
      <div className={`h-6 ${theme === 'vs-dark' ? 'bg-[#007acc]' : 'bg-[#007acc]'} text-white text-[11px] flex items-center px-3 justify-between`}>
        <div className="truncate flex-1">{activeFile ? activeFile.item.path : 'No file selected'}</div>
        <div className="flex items-center gap-4">
            <div>{activeFile?.item.name.split('.').pop()?.toUpperCase()}</div>
            <div>UTF-8</div>
            <div>Gemini AI Ready</div>
        </div>
      </div>
    </div>
  );
};

export default App;
