'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminListClient({ items, type }: { items: any[], type: 'pages' | 'posts' | 'courses' }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();

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
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <select className="border border-[#8c8f94] rounded-[3px] px-2 py-0.5 outline-none text-[13px] bg-white text-[#2c3338] h-[30px] leading-relaxed max-w-[150px]">
            <option>Bulk actions</option>
          </select>
          <button className="border border-[#5e3fde] text-[#5e3fde] bg-[#f6f7f7] px-3 py-1 rounded-[3px] text-[13px] hover:bg-[#f0f0f1] h-[30px]">
            Apply
          </button>
          
          <select className="border border-[#8c8f94] rounded-[3px] px-2 py-0.5 outline-none text-[13px] bg-white text-[#2c3338] h-[30px] ml-1">
            <option>All dates</option>
          </select>
          
          <select className="border border-[#8c8f94] rounded-[3px] px-2 py-0.5 outline-none text-[13px] bg-white text-[#2c3338] h-[30px] ml-1">
            <option>Rank Math</option>
          </select>
          
          <button className="border border-[#8c8f94] text-[#2c3338] bg-[#f6f7f7] px-3 py-1 rounded-[3px] text-[13px] hover:bg-[#f0f0f1] h-[30px] ml-1">
            Filter
          </button>
        </div>
        
        <div className="flex items-center gap-2">
           <input type="text" className="border border-[#8c8f94] rounded-[3px] px-2 py-0.5 outline-none text-[13px] w-[180px] h-[30px]" />
           <button className="border border-[#5e3fde] text-[#5e3fde] bg-[#f6f7f7] px-3 py-1 rounded-[3px] text-[13px] hover:bg-[#f0f0f1] h-[30px]">
             Search {type === 'pages' ? 'Pages' : (type === 'courses' ? 'Courses' : 'Posts')}
           </button>
        </div>
      </div>

      <div className="flex justify-end text-[13px] text-gray-500 mb-2">
         {items.length} items
      </div>

      <div className="bg-white border border-[#c3c4c7] shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#c3c4c7]">
              <th className="p-2 w-[40px] text-center font-normal">
                <input type="checkbox" onChange={handleSelectAll} checked={items.length > 0 && selectedIds.length === items.length} className="border-[#8c8f94] rounded-[2px]" />
              </th>
              <th className="p-2 font-semibold text-[#2c3338]">Title</th>
              <th className="p-2 font-semibold text-[#2c3338] w-[15%]">Author</th>
              <th className="p-2 font-semibold text-[#2c3338] w-[20%]">Date</th>
              <th className="p-2 font-semibold text-[#2c3338] w-[25%]">SEO Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f1]">
            {items.map(item => (
              <tr key={item.id} className="group hover:bg-[#f6f7f7]">
                <th className="p-2 w-[40px] text-center font-normal">
                  <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelect(item)} className="border-[#8c8f94] rounded-[2px]" />
                </th>
                <td className="p-2 font-medium text-[#5e3fde] align-top">
                  <Link href={type === 'courses' ? `/admin/courses/${item.id}/edit` : `/admin/${type}/${item.id}`} className="font-bold text-[#5e3fde] text-[14px] hover:underline">
                    {item.title || '(no title)'}
                  </Link>
                  {item.status !== 'Published' && item.status !== 'Trash' && <span className="font-bold text-gray-500 ml-1">— {item.status}</span>}
                  
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2 mt-1 text-[13px] font-normal transition-opacity duration-150">
                     <Link href={`/admin/${type}/${item.id}`} className="text-[#5e3fde] hover:underline">Edit</Link>
                     <span className="text-[#ddd]">|</span>
                     {item.status !== 'Trash' && (
                       <>
                         <button onClick={() => handleTrash(item.id)} className="text-[#b32d2e] hover:underline">Trash</button>
                         <span className="text-[#ddd]">|</span>
                       </>
                     )}
                     <Link href={`/${item.slug}`} className="text-[#5e3fde] hover:underline" target="_blank">View</Link>
                  </div>
                </td>
                <td className="p-2 align-top text-[13px]">
                   <span className="text-[#5e3fde] hover:underline cursor-pointer">
                     {item.author ? (item.author.firstName ? `${item.author.firstName} ${item.author.lastName || ''}`.trim() : item.author.username) : 'CIIS'}
                   </span>
                </td>
                <td className="p-2 align-top text-[13px] text-[#50575e]">
                   <div>{item.status === 'Published' ? 'Published' : (item.status === 'Draft' ? 'Last Modified' : item.status)}</div>
                   <div>{new Date(item.updatedAt || item.createdAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', ' at')}</div>
                </td>
                <td className="p-2 align-top text-[#50575e]">
                   <div className="flex gap-2 items-center">
                     {item.seoScore > 0 ? (
                       <span className={`px-2 py-0.5 rounded text-[12px] font-bold text-white ${item.seoScore >= 80 ? 'bg-[#46b450]' : item.seoScore >= 50 ? 'bg-[#f56e28]' : 'bg-[#dc3232]'}`}>
                         {item.seoScore} / 100
                       </span>
                     ) : (
                       <span className="bg-[#e7e7e7] text-[#50575e] px-2 py-0.5 rounded text-[12px] font-bold">N/A</span>
                     )}
                   </div>
                   <div className="mt-2 text-[12px]">
                     {item.focusKeyword ? (
                       <div>Keyword: <span className="text-gray-900">{item.focusKeyword}</span></div>
                     ) : (
                       <div>No Index</div>
                     )}
                     <div>Schema: <span className="text-gray-900">{item.schemaJson ? 'Custom' : 'N/A'}</span></div>
                   </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
