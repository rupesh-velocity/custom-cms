'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Files, Users, Settings, ChevronDown, ChevronRight, Menu as MenuIcon, Image as ImageIcon, BarChart2, ShoppingCart, Package } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  
  // Settings is considered active if we are on /admin/settings or any of its subpages
  const isSettingsActive = pathname.startsWith('/admin/settings') && pathname !== '/admin/settings/ecommerce';
  const isSeoActive = pathname.startsWith('/admin/seo');
  const isEcommerceActive = pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/products') || pathname === '/admin/settings/ecommerce' || pathname.startsWith('/admin/customers');

  return (
    <aside className="w-64 bg-white border-r border-gray-100 text-gray-600 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Brand */}
      <div className="p-6 mb-2 flex items-center gap-3">
        <img src="/velocity-logo.png" alt="Velocity Logo" className="h-8 w-auto object-contain" />
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Velocity CMS</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2 scrollbar-hide">
        <Link href="/admin" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname === '/admin' ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <div className="space-y-1">
          <Link 
            href="/admin/posts" 
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer",
              pathname.startsWith('/admin/posts') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText size={20} /> Posts
            </div>
            {pathname.startsWith('/admin/posts') ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </Link>

          {/* Sub-options for Posts */}
          <div className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            pathname.startsWith('/admin/posts') ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="pl-3 py-1 space-y-1 border-l-2 border-gray-100 ml-8 mt-1">
              <Link href="/admin/posts" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname === '/admin/posts' ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                All Posts
              </Link>
              <Link href="/admin/posts/new" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname === '/admin/posts/new' ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Add New
              </Link>
              <Link href="/admin/categories" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname.startsWith('/admin/categories') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Categories
              </Link>
        <div className="space-y-1">
          <Link 
            href="/admin/orders" 
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer",
              isEcommerceActive ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} /> E-Commerce
            </div>
            {isEcommerceActive ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </Link>

          {/* Sub-options for E-Commerce */}
          <div className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isEcommerceActive ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="pl-3 py-1 space-y-1 border-l-2 border-gray-100 ml-8 mt-1">
              <Link href="/admin/orders" className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname.startsWith('/admin/orders') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Orders
              </Link>
              <Link href="/admin/products" className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname.startsWith('/admin/products') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Products
              </Link>
              <Link href="/admin/customers" className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname.startsWith('/admin/customers') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Customers
              </Link>
              <Link href="/admin/settings/ecommerce" className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname === '/admin/settings/ecommerce' ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Settings
              </Link>
            </div>
          </div>
        </div>
        <Link href="/admin/pages" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/pages') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <Files size={20} /> Pages
        </Link>
        <Link href="/admin/media" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/media') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <ImageIcon size={20} /> Media
        </Link>
        <Link href="/admin/users" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/users') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <Users size={20} /> Users
        </Link>
        <Link href="/admin/menus" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", pathname.startsWith('/admin/menus') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900")}>
          <MenuIcon size={20} /> Menus
        </Link>
        
        <div className="space-y-1">
          <Link 
            href="/admin/seo" 
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer",
              isSeoActive ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-3">
              <BarChart2 size={20} /> SEO
            </div>
            {isSeoActive ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </Link>

          {/* Sub-options for SEO */}
          <div className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isSeoActive ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="pl-3 py-1 space-y-1 border-l-2 border-gray-100 ml-8 mt-1">
              <Link href="/admin/seo/general" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname.startsWith('/admin/seo/general') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                General Settings
              </Link>
              <Link href="/admin/seo/redirections" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname.startsWith('/admin/seo/redirections') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Redirections
              </Link>
              <Link href="/admin/seo/sitemap" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname.startsWith('/admin/seo/sitemap') ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Sitemap Settings
              </Link>
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <Link 
            href="/admin/settings" 
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer",
              isSettingsActive ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "hover:bg-gray-50 hover:text-gray-900"
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
            isSettingsActive ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="pl-3 py-1 space-y-1 border-l-2 border-gray-100 ml-8 mt-1">
              <Link href="/admin/settings/general" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname === '/admin/settings/general' ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                General
              </Link>
              <Link href="/admin/settings/reading" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname === '/admin/settings/reading' ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Reading
              </Link>
              <Link href="/admin/settings/advanced" className={clsx("block px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap", pathname === '/admin/settings/advanced' ? "bg-[#5e3fde]/10 text-[#5e3fde] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}>
                Advanced
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
