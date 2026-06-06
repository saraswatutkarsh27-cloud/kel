import React, { useState, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { FileExplorer } from './components/FileExplorer';
import { AIChat } from './components/AIChat';
import { GlobalSearch } from './components/GlobalSearch';
import { InlineAI } from './components/InlineAI';
import type { FileSystemItem } from './lib/fileSystem';
import { getFilesRecursively, readFile, writeFile, createFile, createDirectory, deleteItem } from './lib/fileSystem';
import { X, Save, Circle, Search, Files, Settings, MessageSquare, Bot } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const [showChat, setShowChat] = useState(true);
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('editor_font_size') || '14'));
  const [theme, setTheme] = useState<'vs-dark' | 'light'>(localStorage.getItem('editor_theme') as any || 'vs-dark');

  const [inlineAI, setInlineAI] = useState<{ visible: boolean; position: { top: number; left: number } }>({ visible: false, position: { top: 0, left: 0 } });

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const activeFile = openFiles.find(f => f.item.path === activeFilePath) || null;

  const refreshFileSystem = async () => {
    if (rootHandle) {
      const files = await getFilesRecursively(rootHandle);
      setFileSystem(files);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setRootHandle(handle);
      const files = await getFilesRecursively(handle);
      setFileSystem(files);
    } catch (err) {
      console.error('Directory access denied', err);
    }
  };

  const handleFileSelect = async (item: FileSystemItem) => {
    if (item.kind === 'file') {
      const existing = openFiles.find((f) => f.item.path === item.path);
      if (!existing) {
        const content = await readFile(item.handle as FileSystemFileHandle);
        const newOpenFile: OpenFile = {
          item, content, originalContent: content, isDirty: false,
        };
        setOpenFiles([...openFiles, newOpenFile]);
      }
      setActiveFilePath(item.path);
    }
  };

  const handleCreateFile = async (parent: FileSystemDirectoryHandle) => {
    const name = prompt('Enter file name:');
    if (name) { await createFile(parent, name); await refreshFileSystem(); }
  };

  const handleCreateFolder = async (parent: FileSystemDirectoryHandle) => {
    const name = prompt('Enter folder name:');
    if (name) { await createDirectory(parent, name); await refreshFileSystem(); }
  };

  const handleDeleteItem = async (item: FileSystemItem) => {
    if (confirm(`Delete ${item.name}?`)) {
      try {
        if (!item.path.includes('/')) {
            if (rootHandle) await deleteItem(rootHandle, item.name);
        } else {
            alert("Delete supported for top-level only in this version."); return;
        }
        setOpenFiles(prev => prev.filter(f => !f.item.path.startsWith(item.path)));
        if (activeFilePath?.startsWith(item.path)) setActiveFilePath(null);
        await refreshFileSystem();
      } catch (e) { console.error(e); }
    }
  };

  const closeFile = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const fileToClose = openFiles.find(f => f.item.path === path);
    if (fileToClose?.isDirty && !confirm('Discard unsaved changes?')) return;
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
        f.item.path === activeFile.item.path ? { ...f, isDirty: false, originalContent: f.content } : f
      ));
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFilePath) {
      const newContent = value || '';
      setOpenFiles(prev => prev.map(f =>
        f.item.path === activeFilePath ? { ...f, content: newContent, isDirty: newContent !== f.originalContent } : f
      ));
    }
  };

  const handleApplyCode = (code: string) => {
    if (editorRef.current && monacoRef.current) {
      const selection = editorRef.current.getSelection();
      const range = new monacoRef.current.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
      const op = { identifier: { major: 1, minor: 1 }, range, text: code, forceMoveMarkers: true };
      editorRef.current.executeEdits("ai-edit", [op]);
    } else if (activeFilePath) {
        handleEditorChange(code);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      const position = editor.getPosition();
      if (!position) return;
      const pos = editor.getScrolledVisiblePosition(position);
      const domNode = editor.getDomNode();
      if (domNode && pos) {
        const rect = domNode.getBoundingClientRect();
        setInlineAI({ visible: true, position: { top: rect.top + pos.top + 20, left: rect.left + pos.left } });
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
      setShowChat(prev => !prev);
    });
  };

  const handleInlineAISubmit = async (prompt: string) => {
    if (!geminiKey || !prompt.trim() || !activeFile) return;
    setInlineAI({ ...inlineAI, visible: false });

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const selection = editorRef.current.getSelection();
      const selectedText = editorRef.current.getModel().getValueInRange(selection);

      const context = `Task: ${prompt}\n\nContext file: ${activeFile.item.name}\n\nSelected Code:\n\`\`\`\n${selectedText}\n\`\`\`\n\nEntire File Content:\n\`\`\`\n${activeFile.content}\n\`\`\`\n\nInstructions: Return ONLY the code to replace the selection or the new code to insert. Do not provide markdown formatting unless it is part of the code. Just the raw code.`;

      const result = await model.generateContent(context);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith('```')) {
          text = text.replace(/^```(?:\w+)?\n/, '').replace(/\n```$/, '');
      }

      handleApplyCode(text);
    } catch (e) {
      console.error('Inline AI error', e);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value.trim();
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  return (
    <div className={`flex flex-col h-screen ${theme === 'vs-dark' ? 'bg-[#0b0b0b] text-[#cccccc]' : 'bg-white text-black'} font-sans`}>
      {/* Header */}
      <div className={`h-11 ${theme === 'vs-dark' ? 'bg-[#0b0b0b] border-[#1e1e1e]' : 'bg-[#f3f3f3] border-[#cccccc]'} flex items-center px-4 justify-between border-b shadow-sm`}>
        <div className="flex items-center gap-4">
          <span className={`font-bold tracking-tight ${theme === 'vs-dark' ? 'text-white' : 'text-black'} text-sm flex items-center gap-2`}>
            <Bot size={18} className="text-blue-500" /> CURSOR CLONE
          </span>
          <button onClick={handleOpenFolder} className="text-xs opacity-60 hover:opacity-100 transition-opacity">Open Folder</button>
          <button
            onClick={saveFile}
            disabled={!activeFile || !activeFile.isDirty}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${activeFile?.isDirty ? 'bg-blue-600 text-white hover:bg-blue-500' : 'opacity-30 cursor-not-allowed'}`}
          >
            <Save size={14} /> Save
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333] rounded px-2 py-0.5">
            <span className="text-[10px] text-gray-500 font-mono">⌘K Inline AI</span>
          </div>
          <input
            type="password"
            placeholder="Gemini API Key"
            value={geminiKey}
            onChange={handleApiKeyChange}
            className={`bg-[#1e1e1e] border border-[#333] rounded px-2 py-0.5 text-xs focus:outline-none text-white w-40`}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className={`w-12 ${theme === 'vs-dark' ? 'bg-[#0b0b0b] border-[#1e1e1e]' : 'bg-[#2c2c2c]'} flex flex-col items-center py-4 gap-6 text-gray-500 border-r`}>
            <Files size={22} className={`cursor-pointer hover:text-white transition-colors ${sidebarView === 'explorer' ? 'text-blue-500' : ''}`} onClick={() => setSidebarView('explorer')} />
            <Search size={22} className={`cursor-pointer hover:text-white transition-colors ${sidebarView === 'search' ? 'text-blue-500' : ''}`} onClick={() => setSidebarView('search')} />
            <div className="flex-1" />
            <MessageSquare size={22} className={`cursor-pointer hover:text-white transition-colors ${showChat ? 'text-blue-500' : ''}`} onClick={() => setShowChat(!showChat)} />
            <Settings size={22} className={`cursor-pointer hover:text-white transition-colors ${sidebarView === 'settings' ? 'text-blue-500' : ''}`} onClick={() => setSidebarView('settings')} />
        </div>

        {/* Sidebar */}
        <div className={sidebarView ? 'block' : 'hidden'}>
            {sidebarView === 'explorer' && (
                <FileExplorer items={fileSystem} onFileSelect={handleFileSelect} onOpenFolder={handleOpenFolder} onCreateFile={handleCreateFile} onCreateFolder={handleCreateFolder} onDelete={handleDeleteItem} rootHandle={rootHandle} />
            )}
            {sidebarView === 'search' && <GlobalSearch items={fileSystem} onResultClick={handleFileSelect} />}
            {sidebarView === 'settings' && (
                <div className="w-64 h-full bg-[#0b0b0b] border-r border-[#1e1e1e] p-4 flex flex-col gap-4">
                    <div className="text-xs font-bold uppercase text-gray-500">Settings</div>
                    <div className="flex flex-col gap-2 text-xs">
                        <label>Font Size: {fontSize}px</label>
                        <input type="range" min="8" max="32" value={fontSize} onChange={(e) => { setFontSize(parseInt(e.target.value)); localStorage.setItem('editor_font_size', e.target.value); }} />
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                        <label>Theme</label>
                        <select value={theme} onChange={(e) => { setTheme(e.target.value as any); localStorage.setItem('editor_theme', e.target.value); }} className="bg-[#1e1e1e] border border-[#333] p-1 rounded">
                            <option value="vs-dark">Dark</option><option value="light">Light</option>
                        </select>
                    </div>
                </div>
            )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0b0b]">
          {/* Tabs */}
          <div className={`flex h-9 ${theme === 'vs-dark' ? 'bg-[#0b0b0b]' : 'bg-[#f3f3f3]'} overflow-x-auto border-b ${theme === 'vs-dark' ? 'border-[#1e1e1e]' : 'border-[#cccccc]'}`}>
            {openFiles.map((file) => (
              <div
                key={file.item.path}
                onClick={() => setActiveFilePath(file.item.path)}
                className={`flex items-center gap-2 px-3 py-1 text-xs border-r transition-all cursor-pointer min-w-fit ${
                  activeFilePath === file.item.path
                    ? (theme === 'vs-dark' ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-t-blue-500' : 'bg-white text-black border-t-2 border-t-blue-500')
                    : (theme === 'vs-dark' ? 'text-gray-500 hover:text-gray-300 border-[#1e1e1e]' : 'text-gray-400 hover:bg-white/50 border-[#cccccc]')
                }`}
              >
                <span>{file.item.name}</span>
                {file.isDirty ? <Circle size={6} className="fill-blue-500 text-blue-500" /> : <X size={12} className="hover:bg-white/10 rounded" onClick={(e) => closeFile(e, file.item.path)} />}
              </div>
            ))}
          </div>

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
                  minimap: { enabled: false },
                  fontSize: fontSize,
                  wordWrap: 'on',
                  automaticLayout: true,
                  padding: { top: 10 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
                <Bot size={48} className="opacity-20" />
                <div className="text-center">
                    <p className="text-sm">Welcome to Cursor Clone</p>
                    <p className="text-xs opacity-50">Open a folder to start coding with AI</p>
                </div>
              </div>
            )}
            {inlineAI.visible && (
              <InlineAI
                onClose={() => setInlineAI({ ...inlineAI, visible: false })}
                onSubmit={handleInlineAISubmit}
                position={inlineAI.position}
              />
            )}
          </div>
        </div>

        {/* AI Sidebar */}
        {showChat && (
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
        )}
      </div>

      <div className={`h-6 ${theme === 'vs-dark' ? 'bg-[#007acc]' : 'bg-[#007acc]'} text-white text-[10px] flex items-center px-3 justify-between`}>
        <div className="truncate flex-1">{activeFile ? activeFile.item.path : 'Ready'}</div>
        <div className="flex items-center gap-4 opacity-80">
            <div>{activeFile?.item.name.split('.').pop()?.toUpperCase() || 'PLAIN TEXT'}</div>
            <div>UTF-8</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> AI Ready</div>
        </div>
      </div>
    </div>
  );
};

export default App;
