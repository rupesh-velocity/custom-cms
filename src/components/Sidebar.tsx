'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Files, Users, Settings, ChevronDown, ChevronRight, Menu as MenuIcon, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  
  // Settings is considered active if we are on /admin/settings or any of its subpages
  const isSettingsActive = pathname.startsWith('/admin/settings');

  return (
    <aside className="w-64 bg-white border-r border-gray-100 text-gray-600 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Brand */}
      <div className="p-6 mb-2 flex items-center gap-3">
        <img src="/velocity-logo.png" alt="Velocity Logo" className="h-8 w-auto object-contain" />
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Velocity CMS</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2">
        <Link href="/admin" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname === '/admin' ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/admin/posts" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/posts') ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <FileText size={20} /> Posts
        </Link>
        <Link href="/admin/pages" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/pages') ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <Files size={20} /> Pages
        </Link>
        <Link href="/admin/media" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/media') ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <ImageIcon size={20} /> Media
        </Link>
        <Link href="/admin/users" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/users') ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <Users size={20} /> Users
        </Link>
        <Link href="/admin/menus" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/menus') ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <MenuIcon size={20} /> Menus
        </Link>
        
        <div className="space-y-1">
          <Link 
            href="/admin/settings" 
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer",
              isSettingsActive ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-3">
              <Settings size={20} /> Settings
            </div>
            {isSettingsActive ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </Link>

          {/* Sub-options for Settings */}
          <div className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isSettingsActive ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="pl-11 pr-4 py-2 space-y-2 border-l-2 border-gray-100 ml-6">
              <Link href="/admin/settings/general" className={clsx("block px-4 py-2 rounded-lg text-sm transition-colors", pathname === '/admin/settings/general' ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                General
              </Link>
              <Link href="/admin/settings/reading" className={clsx("block px-4 py-2 rounded-lg text-sm transition-colors", pathname === '/admin/settings/reading' ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Reading
              </Link>
              <Link href="/admin/settings/advanced" className={clsx("block px-4 py-2 rounded-lg text-sm transition-colors", pathname === '/admin/settings/advanced' ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Advanced
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
