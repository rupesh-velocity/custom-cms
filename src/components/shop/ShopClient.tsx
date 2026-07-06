'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Image as ImageIcon, BookOpen, ShoppingBag } from 'lucide-react';

interface ShopItem {
  id: string;
  originalId: number;
  type: 'course' | 'product';
  title: string;
  slug: string;
  image: string | null;
  price: number | null;
  salePrice: number | null;
  url: string;
}

export default function ShopClient({ initialItems, mode = 'all' }: { initialItems: ShopItem[], mode?: 'all' | 'courses' | 'products' }) {
  const [items] = useState<ShopItem[]>(initialItems);
  const [filter, setFilter] = useState<'all' | 'course' | 'product'>(mode === 'courses' ? 'course' : mode === 'products' ? 'product' : 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-transparent py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          
          {mode === 'all' ? (
            <div className="flex bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto shadow-sm">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-white text-[#5e3fde] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                All Items
              </button>
              <button
                onClick={() => setFilter('course')}
                className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${filter === 'course' ? 'bg-white text-[#5e3fde] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <BookOpen size={16} />
                Courses
              </button>
              <button
                onClick={() => setFilter('product')}
                className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${filter === 'product' ? 'bg-white text-[#5e3fde] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <ShoppingBag size={16} />
                Products
              </button>
            </div>
          ) : (
            <div className="w-full md:w-auto font-outfit text-xl font-bold text-gray-800">
              {mode === 'courses' ? 'Explore Courses' : 'Explore Products'}
            </div>
          )}

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <Link href={item.url} key={item.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <ImageIcon size={48} className="text-gray-300" />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${item.type === 'course' ? 'bg-[#5e3fde]/90 text-white' : 'bg-green-500/90 text-white'}`}>
                      {item.type === 'course' ? 'Course' : 'Product'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#5e3fde] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      {item.price !== null ? (
                        <>
                          {item.salePrice ? (
                            <>
                              <span className="text-lg font-bold text-gray-900">${item.salePrice.toFixed(2)}</span>
                              <span className="text-sm text-gray-400 line-through">${item.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">View Details</span>
                      )}
                    </div>
                    <span className="text-[#5e3fde] bg-[#5e3fde]/10 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-[#5e3fde] group-hover:text-white transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
            <button 
              onClick={() => { setFilter('all'); setSearchQuery(''); }}
              className="mt-6 text-[#5e3fde] font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
