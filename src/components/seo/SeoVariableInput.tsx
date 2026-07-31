'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Variable {
  label: string;
  desc: string;
  tag: string;
}

const VARIABLES: Variable[] = [
  { label: 'Title', desc: 'Title of the post/page', tag: '%title%' },
  { label: 'Site Name', desc: 'Name of the website', tag: '%sitename%' },
  { label: 'Separator Character', desc: 'Separator character, as set in the Title Settings', tag: '%sep%' },
  { label: 'Excerpt', desc: 'Excerpt of the post/page', tag: '%excerpt%' },
  { label: 'Site Description', desc: 'Site description', tag: '%sitedesc%' },
  { label: 'Current Date', desc: 'Current date', tag: '%currentdate%' },
  { label: 'Current Day', desc: 'Current day of the week', tag: '%currentday%' },
  { label: 'Current Month', desc: 'Current month', tag: '%currentmonth%' },
  { label: 'Current Year', desc: 'Current year', tag: '%currentyear%' },
  { label: 'Author Name', desc: 'Name of the author', tag: '%name%' },
  { label: 'Author ID', desc: 'ID of the author', tag: '%userid%' },
  { label: 'Category', desc: 'Post category', tag: '%category%' },
  { label: 'Post ID', desc: 'ID of the post', tag: '%id%' },
  { label: 'Post Date', desc: 'Date the post was published', tag: '%date%' },
  { label: 'Modified Date', desc: 'Date the post was last modified', tag: '%modified%' },
];

interface SeoVariableInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

export default function SeoVariableInput({ value, onChange, placeholder, multiline = false, rows = 3 }: SeoVariableInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInsert = (tag: string) => {
    const el = inputRef.current;
    if (!el) {
      onChange(value + ' ' + tag);
      setIsOpen(false);
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    
    const newVal = value.substring(0, start) + tag + value.substring(end);
    onChange(newVal);
    setIsOpen(false);
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const filtered = VARIABLES.filter(v => v.label.toLowerCase().includes(search.toLowerCase()) || v.tag.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={containerRef}>
      <div className={`flex border border-gray-300 rounded-md focus-within:border-[#5e3fde] focus-within:ring-1 focus-within:ring-[#5e3fde] transition-colors bg-white ${isOpen ? 'border-[#5e3fde] ring-1 ring-[#5e3fde]' : ''}`}>
        {multiline ? (
          <textarea
            ref={inputRef as any}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="flex-1 px-3 py-2 text-[14px] outline-none rounded-l-md resize-none placeholder:text-[#1d2327] placeholder:opacity-100"
          />
        ) : (
          <input
            ref={inputRef as any}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-[14px] outline-none rounded-l-md placeholder:text-[#1d2327] placeholder:opacity-100"
          />
        )}
        <button
          type="button"
          onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
          className={`px-3 border-l border-gray-300 hover:bg-gray-50 flex items-center justify-center rounded-r-md ${isOpen ? 'text-[#5e3fde] bg-gray-50' : 'text-[#00b8e6]'}`}
        >
          <ChevronDown size={18} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-xl z-50">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-1.5 text-[13px] outline-none focus:border-[#5e3fde]"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-3 text-sm text-gray-500 text-center">No variables found.</div>
            )}
            {filtered.map(v => (
              <button
                key={v.tag}
                onClick={() => handleInsert(v.tag)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-semibold text-gray-800 text-[13px]">{v.label}</span>
                  <span className="text-gray-500 font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">{v.tag}</span>
                </div>
                <div className="text-[11px] text-gray-500">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
