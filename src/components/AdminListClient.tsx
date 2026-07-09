'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Search, Edit2, Trash2, ExternalLink } from 'lucide-react';

export default function AdminListClient({ items, type }: { items: any[], type: 'pages' | 'posts' | 'courses' }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>('Admin User');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          const name = data.user.firstName 
            ? `${data.user.firstName} ${data.user.lastName || ''}`.trim() 
            : data.user.username;
          if (name) setCurrentUserName(name);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleTrash = async (id: number) => {
    try {
      const res = await fetch(`/api/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Trash' })
      });
      if (res.ok) {
        toast.success('Moved to Trash');
        router.refresh();
      }
    } catch (e) {
      toast.error('Error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm bg-white text-gray-700 focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all">
            <option>Bulk actions</option>
          </select>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium">
            Apply
          </button>
          
          <select className="hidden md:block border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm bg-white text-gray-700 focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all">
            <option>All dates</option>
          </select>
          
          <select className="hidden lg:block border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm bg-white text-gray-700 focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all">
            <option>Rank Math</option>
          </select>
          
          <button className="hidden md:block bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium">
            Filter
          </button>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${type}...`}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 text-center">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={items.length > 0 && selectedIds.length === items.length} 
                  className="rounded text-[#5e3fde] focus:ring-[#5e3fde]" 
                />
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Author</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Date</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">SEO Details</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[12%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)} 
                    onChange={() => handleSelect(item.id)} 
                    className="rounded text-[#5e3fde] focus:ring-[#5e3fde]" 
                  />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={type === 'courses' ? `/admin/courses/${item.id}/edit` : `/admin/${type}/${item.id}`} 
                      className="font-medium text-gray-900 hover:text-[#5e3fde] text-[15px]"
                    >
                      {item.title || '(no title)'}
                    </Link>
                    {item.status !== 'Published' && item.status !== 'Trash' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {item.status}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-[#5e3fde] hover:underline cursor-pointer">
                    {item.author ? (item.author.firstName ? `${item.author.firstName} ${item.author.lastName || ''}`.trim() : item.author.username) : currentUserName}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm font-medium text-gray-900">
                    {item.status === 'Published' ? 'Published' : (item.status === 'Draft' ? 'Modified' : item.status)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2 items-center mb-1.5">
                    {item.seoScore > 0 ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.seoScore >= 80 ? 'bg-green-100 text-green-800' : 
                        item.seoScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.seoScore} / 100
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        N/A
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {item.focusKeyword ? (
                      <div className="truncate max-w-[120px]" title={item.focusKeyword}>Keyword: <span className="font-medium text-gray-700">{item.focusKeyword}</span></div>
                    ) : (
                      <div>No Index</div>
                    )}
                    <div>Schema: <span className="font-medium text-gray-700">{item.schemaJson ? 'Custom' : 'N/A'}</span></div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={type === 'courses' ? `/admin/courses/${item.id}/edit` : `/admin/${type}/${item.id}`} 
                      className="p-2 text-gray-400 hover:text-[#5e3fde] hover:bg-[#5e3fde]/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <Link 
                      href={type === 'courses' ? `/courses/${item.slug}` : `/${item.slug}`} 
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-[#5e3fde] hover:bg-[#5e3fde]/10 rounded-lg transition-colors"
                      title="View"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    {item.status !== 'Trash' && (
                      <button 
                        onClick={() => handleTrash(item.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Trash"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  No {type} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
