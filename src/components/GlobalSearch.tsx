import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
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

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ items, onResultClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchInItems = async (itemList: FileSystemItem[], q: string, resultsAcc: SearchResult[]) => {
    for (const item of itemList) {
      if (item.kind === 'file') {
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
      } else if (item.kind === 'directory' && item.children) {
        await searchInItems(item.children, q, resultsAcc);
      }
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const newResults: SearchResult[] = [];
    await searchInItems(items, query, newResults);
    setResults(newResults);
    setIsSearching(false);
  };

  return (
    <div className="w-64 h-full bg-[#252526] border-r border-[#333] flex flex-col overflow-hidden">
      <div className="p-3 text-xs font-bold uppercase text-gray-400">Search</div>
      <div className="px-3 pb-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search"
            className="w-full bg-[#3c3c3c] text-white text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search size={14} className="absolute right-2 top-1.5 text-gray-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isSearching && <div className="p-3 text-xs text-gray-400">Searching...</div>}
        {!isSearching && results.length === 0 && query && (
          <div className="p-3 text-xs text-gray-400">No results found.</div>
        )}
        {results.map((res, i) => (
          <div
            key={i}
            onClick={() => onResultClick(res.item)}
            className="p-2 hover:bg-[#2a2d2e] cursor-pointer border-b border-[#333]"
          >
            <div className="flex items-center gap-1 text-xs text-blue-400 mb-1">
              <FileText size={12} />
              <span className="truncate font-semibold">{res.name}</span>
              <span className="text-gray-500">{res.line}</span>
            </div>
            <div className="text-[10px] text-gray-400 truncate pl-4 italic">
                {res.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
