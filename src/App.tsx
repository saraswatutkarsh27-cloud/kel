import React, { useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { FileExplorer } from './components/FileExplorer';
import { AIChat } from './components/AIChat';
import type { FileSystemItem } from './lib/fileSystem';
import { getFilesRecursively, readFile, writeFile } from './lib/fileSystem';
import { X, Save, Circle } from 'lucide-react';

interface OpenFile {
  item: FileSystemItem;
  content: string;
  originalContent: string;
  isDirty: boolean;
}

const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([]);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [geminiKey, setGeminiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);

  const activeFile = openFiles.find(f => f.item.path === activeFilePath) || null;

  const handleOpenFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
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

  const closeFile = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const fileToClose = openFiles.find(f => f.item.path === path);
    if (fileToClose?.isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    const updatedFiles = openFiles.filter((f) => f.item.path !== path);
    setOpenFiles(updatedFiles);
    if (activeFilePath === path) {
      if (updatedFiles.length > 0) {
        setActiveFilePath(updatedFiles[updatedFiles.length - 1].item.path);
      } else {
        setActiveFilePath(null);
      }
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
        // Fallback
        handleEditorChange(code);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] font-sans">
      {/* Header/Toolbar */}
      <div className="h-10 bg-[#323233] flex items-center px-4 justify-between border-b border-[#2b2b2b]">
        <div className="flex items-center gap-4">
          <span className="font-bold text-white text-sm">JS CODE IDE</span>
          <button onClick={handleOpenFolder} className="text-xs hover:text-white">Open Folder</button>
          <button
            onClick={saveFile}
            disabled={!activeFile || !activeFile.isDirty}
            className={`flex items-center gap-1 text-xs ${activeFile?.isDirty ? 'text-white hover:text-blue-400' : 'text-gray-500 cursor-not-allowed'}`}
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
            className="bg-[#2d2d2d] border border-[#444] rounded px-2 py-0.5 text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <FileExplorer items={fileSystem} onFileSelect={handleFileSelect} onOpenFolder={handleOpenFolder} />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex h-9 bg-[#252526] overflow-x-auto">
            {openFiles.map((file) => (
              <div
                key={file.item.path}
                onClick={() => setActiveFilePath(file.item.path)}
                className={`flex items-center gap-2 px-3 py-1 text-sm border-r border-[#1e1e1e] cursor-pointer min-w-fit ${
                  activeFilePath === file.item.path ? 'bg-[#1e1e1e] text-white' : 'hover:bg-[#2a2d2e]'
                }`}
              >
                <span>{file.item.name}</span>
                {file.isDirty ? (
                  <Circle size={8} className="fill-white text-white" onClick={(e) => closeFile(e, file.item.path)} />
                ) : (
                  <X
                    size={14}
                    className="hover:bg-[#333] rounded"
                    onClick={(e) => closeFile(e, file.item.path)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1">
            {activeFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                path={activeFile.item.path}
                defaultLanguage="typescript"
                language={activeFile.item.name.split('.').pop()}
                value={activeFile.content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
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
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] text-white text-[11px] flex items-center px-3 justify-between">
        <div>{activeFile ? activeFile.item.path : 'No file selected'}</div>
        <div>Gemini AI Ready</div>
      </div>
    </div>
  );
};

export default App;
