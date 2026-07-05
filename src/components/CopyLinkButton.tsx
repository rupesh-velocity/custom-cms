'use client';

import { Link as LinkIcon } from 'lucide-react';

export default function CopyLinkButton({ url }: { url: string }) {
  return (
    <button 
      onClick={() => {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }} 
      className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 transition-colors"
      title="Copy link"
    >
      <LinkIcon className="w-5 h-5" />
    </button>
  );
}
