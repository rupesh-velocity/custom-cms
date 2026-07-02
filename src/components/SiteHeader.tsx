import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ChevronDown } from 'lucide-react';

// Helper to build a nested tree from the flat items list
function buildTree(items: any[], parentId: number | null = null): any[] {
  return items
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id)
    }));
}

// Recursive component for rendering menu items
function MenuNode({ node, depth = 0 }: { node: any, depth?: number }) {
  const hasChildren = node.children && node.children.length > 0;

  if (!hasChildren) {
    if (depth === 0) {
      return (
        <Link href={node.url}>
          {node.label}
        </Link>
      );
    }
    return (
      <Link 
        href={node.url}
        className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600"
      >
        {node.label}
      </Link>
    );
  }

  // Dropdown node
  if (depth === 0) {
    return (
      <div className="relative group flex items-center cursor-pointer">
        <Link href={node.url}>
          {node.label}
        </Link>
        <span className="ml-1 text-[10px]">⌄</span>
        
        <div className="absolute top-full left-0 mt-2 hidden group-hover:block min-w-[200px] bg-white border border-gray-100 shadow-xl rounded-lg py-2 z-50">
          {node.children.map((child: any) => (
            <MenuNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer">
      <Link 
        href={node.url}
        className="flex items-center gap-1 justify-between px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600"
      >
        {node.label}
        <ChevronDown size={14} className="opacity-70 -rotate-90" />
      </Link>
      
      <div className="absolute top-0 left-full ml-1 hidden group-hover:block min-w-[200px] bg-white border border-gray-100 shadow-xl rounded-lg py-2 z-50">
        <div className="absolute -left-1 w-1 top-0 bottom-0"></div>
        {node.children.map((child: any) => (
          <MenuNode key={child.id} node={child} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}

export default async function SiteHeader() {
  // Fetch settings for branding
  const settingsRecords = await prisma.setting.findMany({
    where: {
      key: { in: ['site_title', 'site_icon', 'site_logo'] }
    }
  });
  
  const settings = settingsRecords.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const siteTitle = settings.site_title || 'Custom CMS';
  const siteIcon = settings.site_icon;
  const siteLogo = settings.site_logo;

  // Fetch primary menu
  let primaryMenu = await prisma.menu.findUnique({
    where: { slug: 'primary' },
    include: {
      items: {
        orderBy: { order: 'asc' }
      }
    }
  });

  // Fallback: If no menu with slug 'primary' exists, grab the first menu
  if (!primaryMenu) {
    const firstMenu = await prisma.menu.findFirst({
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });
    primaryMenu = firstMenu;
  }

  const menuTree = primaryMenu ? buildTree(primaryMenu.items) : [];

  return (
    <header className="site-header">
      <div className="container h-full flex items-center justify-between gap-6">
        <Link href="/">
          {siteLogo ? (
            <img src={siteLogo} alt={siteTitle} className="logo-img" />
          ) : siteIcon ? (
            <img src={siteIcon} alt={siteTitle} className="logo-img" />
          ) : (
            <span className="text-xl font-bold">{siteTitle}</span>
          )}
        </Link>
        
        <nav className="main-menu hidden lg:flex items-center gap-10">
          {menuTree.map((node: any) => (
            <MenuNode key={node.id} node={node} />
          ))}
          {!primaryMenu?.items?.length && (
            <div className="text-sm text-gray-400 italic">
              Create a menu to add links
            </div>
          )}
        </nav>
        
        <Link href="#on-demand" className="theme-btn theme-btn-primary hidden sm:inline-flex">
          <span>On Demand Classes</span><span className="btn-icon">↗</span>
        </Link>
      </div>
    </header>
  );
}
