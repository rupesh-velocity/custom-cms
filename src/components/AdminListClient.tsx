'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminListClient({ items, type }: { items: any[], type: 'pages' | 'posts' }) {
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
          <button className="border border-[#2271b1] text-[#2271b1] bg-[#f6f7f7] px-3 py-1 rounded-[3px] text-[13px] hover:bg-[#f0f0f1] h-[30px]">
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
           <button className="border border-[#2271b1] text-[#2271b1] bg-[#f6f7f7] px-3 py-1 rounded-[3px] text-[13px] hover:bg-[#f0f0f1] h-[30px]">
             Search {type === 'pages' ? 'Pages' : 'Posts'}
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
                <td className="p-2 font-medium text-[#2271b1] align-top">
                  <Link href={`/admin/${type}/${item.id}`} className="font-bold text-[#2271b1] text-[14px] hover:underline">
                    {item.title || '(no title)'}
                  </Link>
                  {item.status !== 'Published' && item.status !== 'Trash' && <span className="font-bold text-gray-500 ml-1">— {item.status}</span>}
                  
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2 mt-1 text-[13px] font-normal transition-opacity duration-150">
                     <Link href={`/admin/${type}/${item.id}`} className="text-[#2271b1] hover:underline">Edit</Link>
                     <span className="text-[#ddd]">|</span>
                     <button className="text-[#2271b1] hover:underline">Quick Edit</button>
                     <span className="text-[#ddd]">|</span>
                     {item.status !== 'Trash' && (
                       <>
                         <button onClick={() => handleTrash(item.id)} className="text-[#b32d2e] hover:underline">Trash</button>
                         <span className="text-[#ddd]">|</span>
                       </>
                     )}
                     <Link href={`/${item.slug}`} className="text-[#2271b1] hover:underline" target="_blank">View</Link>
                  </div>
                </td>
                <td className="p-2 text-[#2271b1] align-top">CIIS</td>
                <td className="p-2 align-top text-[#50575e]">
                  {item.status === 'Published' ? 'Published' : 'Last Modified'}
                  <br />
                  <span className="text-gray-500">{new Date(item.publishedAt || item.updatedAt).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' }).replace(',', ' at').replace(/\//g, '/')}</span>
                </td>
                <td className="p-2 align-top text-[#50575e]">
                   <div className="flex gap-2 items-center">
                     <span className="bg-[#46b450] text-white px-2 py-0.5 rounded text-[12px] font-bold">83 / 100</span>
                   </div>
                   <div className="mt-2 text-[12px]">
                     <div>Keyword: <span className="text-gray-900">{item.focusKeyword || 'N/A'}</span></div>
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
