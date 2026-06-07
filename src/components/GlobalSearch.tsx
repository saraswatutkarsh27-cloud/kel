import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, ArrowRight, X } from 'lucide-react';
import { FileSystemItem, readFile } from '../lib/fileSystem';

interface SearchResult {
  path: string;
  name: string;
  line: number;
  content: string;
  item: FileSystemItem;
}

interface GlobalSearchProps {
  items: FileSystemItem[];
  onResultClick: (item: FileSystemItem) => void;
}

const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-ide-accent/25 text-ide-accent-light rounded-sm px-0.5">{part}</mark>
      : part
  );
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ items, onResultClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchInItems = async (itemList: FileSystemItem[], q: string, resultsAcc: SearchResult[]) => {
    for (const item of itemList) {
      if (item.kind === 'file') {
        try {
          const content = await readFile(item.handle as FileSystemFileHandle);
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(q.toLowerCase())) {
              resultsAcc.push({
                path: item.path,
                name: item.name,
                line: index + 1,
                content: line.trim(),
                item: item,
              });
            }
          });
        } catch {
          // Skip files that can't be read
        }
      } else if (item.kind === 'directory' && item.children) {
        await searchInItems(item.children, q, resultsAcc);
      }
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    const newResults: SearchResult[] = [];
    await searchInItems(items, query, newResults);
    setResults(newResults);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  // Group results by file
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.path]) {
      acc[result.path] = [];
    }
    acc[result.path].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="w-64 h-full bg-ide-surface border-r border-ide-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 text-[11px] font-semibold uppercase tracking-wider text-ide-muted border-b border-ide-border flex items-center gap-2">
        <Search size={13} />
        Search
      </div>

      {/* Search Input */}
      <div className="px-3 py-2.5 border-b border-ide-border">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search in files..."
            className="w-full bg-ide-elevated border border-ide-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-ide-muted/40 focus:outline-none focus:border-ide-accent/30 transition-colors pr-8"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-ide-hover text-ide-muted hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
        {query && (
          <button
            onClick={handleSearch}
            className="mt-2 w-full text-[10px] px-2 py-1 bg-ide-accent/10 text-ide-accent-light border border-ide-accent/15 rounded-md hover:bg-ide-accent/20 transition-all duration-200 flex items-center justify-center gap-1"
          >
            <Search size={10} />
            Search
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <div className="flex flex-col items-center gap-2 p-6 animate-fade-in">
            <div className="w-5 h-5 border-2 border-ide-accent/30 border-t-ide-accent rounded-full animate-spin" />
            <span className="text-[10px] text-ide-muted">Searching...</span>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-6 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-ide-elevated border border-ide-border flex items-center justify-center">
              <Search size={16} className="text-ide-muted/40" />
            </div>
            <p className="text-[11px] text-ide-muted text-center">
              No results for "{query}"
            </p>
          </div>
        )}

        {!isSearching && !hasSearched && items.length > 0 && (
          <div className="flex flex-col items-center gap-3 p-6 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-ide-elevated border border-ide-border flex items-center justify-center">
              <Search size={16} className="text-ide-muted/30" />
            </div>
            <p className="text-[11px] text-ide-muted/60 text-center">
              Type to search across all files
            </p>
          </div>
        )}

        {!isSearching && items.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-6">
            <p className="text-[11px] text-ide-muted text-center">
              Open a folder to enable search
            </p>
          </div>
        )}

        {/* Grouped Results */}
        {Object.entries(groupedResults).map(([path, fileResults]) => (
          <div key={path} className="border-b border-ide-border">
            {/* File header */}
            <div
              onClick={() => fileResults[0] && onResultClick(fileResults[0].item)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ide-elevated/30 cursor-pointer hover:bg-ide-hover transition-colors"
            >
              <FileText size={11} className="text-ide-muted flex-shrink-0" />
              <span className="text-[11px] text-white font-medium truncate">{fileResults[0]?.name}</span>
              <span className="text-[9px] text-ide-muted/50 ml-auto">{fileResults.length}</span>
            </div>
            {/* Matches */}
            {fileResults.map((res, i) => (
              <div
                key={i}
                onClick={() => onResultClick(res.item)}
                className="flex items-center gap-2 px-3 py-1.5 pl-6 hover:bg-ide-hover cursor-pointer group transition-colors"
              >
                <ArrowRight size={9} className="text-ide-muted/30 group-hover:text-ide-accent/50 flex-shrink-0 transition-colors" />
                <span className="text-[9px] text-ide-muted/50 font-mono w-6 text-right flex-shrink-0">{res.line}</span>
                <div className="text-[10px] text-ide-muted truncate flex-1 font-mono">
                  {highlightMatch(res.content, query)}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Result count */}
        {!isSearching && results.length > 0 && (
          <div className="px-3 py-2 text-[9px] text-ide-muted/50 text-center">
            {results.length} result{results.length !== 1 ? 's' : ''} in {Object.keys(groupedResults).length} file{Object.keys(groupedResults).length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
