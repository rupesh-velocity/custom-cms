'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

function MobileMenuNode({ node, onClick }: { node: any, onClick: () => void }) {
  const hasChildren = node.children && node.children.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  if (!hasChildren) {
    return (
      <Link 
        href={node.url}
        onClick={onClick}
        className="block py-3 text-lg font-medium text-gray-800 border-b border-gray-100"
      >
        {node.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-100">
      <div 
        className="flex items-center justify-between py-3 cursor-pointer text-lg font-medium text-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{node.label}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {isOpen && (
        <div className="pl-4 pb-2 space-y-1">
          {node.children.map((child: any) => (
            <MobileMenuNode key={child.id} node={child} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileMenu({ menuTree }: { menuTree: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-gray-800 hover:text-blue-600 transition-colors focus:outline-none"
        aria-label="Open Menu"
      >
        <Menu size={28} />
      </button>

      {/* Slide-out Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[101] shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 text-gray-500 hover:text-red-500 transition-colors focus:outline-none"
              aria-label="Close Menu"
            >
              <X size={28} />
            </button>
          </div>

          <nav className="flex flex-col">
            {menuTree.map((node) => (
              <MobileMenuNode key={node.id} node={node} onClick={() => setIsOpen(false)} />
            ))}
            
            <div className="mt-8">
              <Link 
                href="#on-demand" 
                onClick={() => setIsOpen(false)}
                className="theme-btn theme-btn-primary w-full text-center block"
              >
                <span>On Demand Classes</span><span className="btn-icon">↗</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
