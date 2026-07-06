'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TipTapEditor from '@/components/TipTapEditor';
import MediaModal from '@/components/MediaModal';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [product, setProduct] = useState({
    title: '',
    slug: '',
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

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast.error('Product not found');
          router.push('/admin/products');
          return;
        }
        setProduct({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          type: data.type || 'SIMPLE',
          price: data.price ? String(data.price) : '',
          salePrice: data.salePrice ? String(data.salePrice) : '',
          sku: data.sku || '',
          manageStock: data.manageStock || false,
          stockQuantity: data.stockQuantity || 0,
          status: data.status || 'Published',
          featuredImage: data.featuredImage || ''
        });
        setIsLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load product');
        setIsLoading(false);
      });
  }, [params?.id, router]);

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
      const res = await fetch(`/api/products/${params?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      
      if (!res.ok) throw new Error('Failed to update product');
      
      toast.success('Product updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Error updating product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  }

  return (
    <div className="max-w-[1200px] text-[#2c3338]">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="p-2 border border-[#c3c4c7] rounded hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-normal flex-1">Edit Product</h1>
        {product.slug && (
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="px-4 py-2 border border-[#5e3fde] text-[#5e3fde] rounded-[3px] text-[13px] font-medium hover:bg-[#5e3fde]/10 transition-colors flex items-center gap-2"
          >
            View Product
          </Link>
        )}
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
                {isSaving ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Product Image */}
          <div className="bg-white border border-[#c3c4c7]">
            <div className="px-4 py-3 border-b border-[#c3c4c7] font-semibold text-[14px]">
              Product Image
            </div>
            <div className="p-4">
              {product.featuredImage ? (
                <div className="text-center">
                  <img src={product.featuredImage} alt="Featured" className="w-full h-auto mb-2 rounded border border-gray-200" />
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setIsMediaModalOpen(true)} className="text-[#0071a1] text-[13px] hover:underline">Replace</button>
                    <button onClick={() => setProduct(prev => ({ ...prev, featuredImage: '' }))} className="text-[#b32d2e] text-[13px] hover:underline">Remove</button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsMediaModalOpen(true)}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#5e3fde] transition-colors cursor-pointer group"
                >
                  <ImageIcon size={32} className="mb-2 group-hover:text-[#5e3fde]" />
                  <span className="text-sm">Set product image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <MediaModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onInsert={(url) => setProduct(prev => ({ ...prev, featuredImage: url }))}
      />
    </div>
  );
}
