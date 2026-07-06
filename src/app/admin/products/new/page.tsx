'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TipTapEditor from '@/components/TipTapEditor';

export default function NewProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [product, setProduct] = useState({
    title: '',
    description: '',
    type: 'SIMPLE',
    price: '',
    salePrice: '',
    sku: '',
    manageStock: false,
    stockQuantity: 0,
    status: 'Published',
    featuredImage: ''
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!product.title) {
      toast.error('Product title is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/products/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      
      if (!res.ok) throw new Error('Failed to create product');
      
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Error creating product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] text-[#2c3338]">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="p-2 border border-[#c3c4c7] rounded hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-normal flex-1">Add New Product</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-[#5e3fde] text-white rounded-[3px] text-[13px] font-medium hover:bg-[#4b32b2] disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Product
        </button>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-[#c3c4c7] p-0">
            <input
              type="text"
              name="title"
              value={product.title}
              onChange={handleChange}
              placeholder="Product Name"
              className="w-full text-xl px-4 py-3 outline-none border-b border-[#c3c4c7]"
            />
            <div className="p-4 h-[400px]">
              <TipTapEditor 
                content={product.description} 
                onChange={(content) => setProduct(prev => ({ ...prev, description: content }))}
              />
            </div>
          </div>

          {/* Product Data Meta Box */}
          <div className="bg-white border border-[#c3c4c7]">
            <div className="px-4 py-3 border-b border-[#c3c4c7] bg-[#f6f7f7] flex items-center gap-4">
              <h2 className="text-[14px] font-semibold text-gray-800">Product Data — </h2>
              <select 
                name="type" 
                value={product.type} 
                onChange={handleChange}
                className="border border-[#8c8f94] rounded-[3px] px-2 py-1 text-[13px] outline-none focus:border-[#5e3fde]"
              >
                <option value="SIMPLE">Simple product</option>
                <option value="VARIABLE" disabled>Variable product (Coming Soon)</option>
              </select>
            </div>
            
            <div className="flex min-h-[250px]">
              {/* Tabs Sidebar */}
              <div className="w-48 bg-[#f6f7f7] border-r border-[#c3c4c7] flex flex-col">
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`text-left px-4 py-2.5 text-[13px] ${activeTab === 'general' ? 'bg-white font-semibold border-l-4 border-[#5e3fde] text-[#5e3fde]' : 'hover:bg-[#f0f0f1] text-gray-700'}`}
                >
                  General
                </button>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`text-left px-4 py-2.5 text-[13px] ${activeTab === 'inventory' ? 'bg-white font-semibold border-l-4 border-[#5e3fde] text-[#5e3fde]' : 'hover:bg-[#f0f0f1] text-gray-700'}`}
                >
                  Inventory
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 p-6">
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                      <label className="text-[13px] text-gray-600 text-right">Regular price ($)</label>
                      <input 
                        type="number" 
                        name="price" 
                        value={product.price} 
                        onChange={handleChange}
                        className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-48 outline-none focus:border-[#5e3fde]" 
                        step="0.01"
                      />
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                      <label className="text-[13px] text-gray-600 text-right">Sale price ($)</label>
                      <input 
                        type="number" 
                        name="salePrice" 
                        value={product.salePrice} 
                        onChange={handleChange}
                        className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-48 outline-none focus:border-[#5e3fde]" 
                        step="0.01"
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'inventory' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                      <label className="text-[13px] text-gray-600 text-right">SKU</label>
                      <input 
                        type="text" 
                        name="sku" 
                        value={product.sku} 
                        onChange={handleChange}
                        className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-48 outline-none focus:border-[#5e3fde]" 
                      />
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4 pt-4 border-t border-gray-100">
                      <label className="text-[13px] text-gray-600 text-right">Manage stock?</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="manageStock" 
                          checked={product.manageStock} 
                          onChange={handleChange}
                          className="w-4 h-4 text-[#5e3fde] focus:ring-[#5e3fde] rounded" 
                        />
                        <span className="text-[13px] text-gray-600">Track stock quantity for this product</span>
                      </label>
                    </div>
                    
                    {product.manageStock && (
                      <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <label className="text-[13px] text-gray-600 text-right">Stock quantity</label>
                        <input 
                          type="number" 
                          name="stockQuantity" 
                          value={product.stockQuantity} 
                          onChange={handleChange}
                          className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-48 outline-none focus:border-[#5e3fde]" 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Box */}
          <div className="bg-white border border-[#c3c4c7]">
            <div className="px-4 py-3 border-b border-[#c3c4c7] font-semibold text-[14px]">
              Publish
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-600">Status:</span>
                <select 
                  name="status"
                  value={product.status}
                  onChange={handleChange}
                  className="border border-[#8c8f94] rounded-[3px] px-2 py-1 outline-none focus:border-[#5e3fde]"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2 bg-[#5e3fde] text-white rounded-[3px] text-[13px] font-medium hover:bg-[#4b32b2] disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Product Image */}
          <div className="bg-white border border-[#c3c4c7]">
            <div className="px-4 py-3 border-b border-[#c3c4c7] font-semibold text-[14px]">
              Product Image
            </div>
            <div className="p-4">
              <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#5e3fde] transition-colors cursor-pointer group">
                <ImageIcon size={32} className="mb-2 group-hover:text-[#5e3fde]" />
                <span className="text-sm">Set product image</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
