'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TipTapEditor from '@/components/TipTapEditor';
import MediaModal from '@/components/MediaModal';
import { Accordion } from '@/components/ClassicSidebar';

export default function NewProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [tempSlug, setTempSlug] = useState('');
  const [origin, setOrigin] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);
  
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
    featuredImage: '',
    attributes: [] as { name: string; options: string }[],
    variations: [] as { attributes: string; price: string; salePrice: string; sku: string; manageStock: boolean; stockQuantity: number }[]
  });

  const [expanded, setExpanded] = useState({
    publish: true,
    productImage: true,
    productGallery: true,
    categories: true
  });
  const toggleAccordion = (section: keyof typeof expanded) => setExpanded(prev => ({...prev, [section]: !prev[section]}));

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
      const data = await res.json();
      
      toast.success('Product created successfully');
      router.push(`/admin/products/${data.id}/edit`);
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
            {product.title && (
              <div className="px-4 py-2 flex items-center gap-1 text-[13px] text-[#50575e] border-b border-[#c3c4c7]">
                <span className="font-semibold">Permalink:</span>
                <span className="text-[#0073aa]">
                  {origin ? origin : 'http://localhost:3000'}/product/
                  {isEditingSlug ? (
                    <input 
                      type="text" 
                      value={tempSlug} 
                      onChange={(e) => setTempSlug(e.target.value)}
                      className="border border-[#8c8f94] rounded-[3px] px-1 h-[22px] bg-white ml-1 text-black outline-none"
                    />
                  ) : (
                    <span>{product.slug || product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}</span>
                  )}
                  /
                </span>
                {isEditingSlug ? (
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => {
                      setProduct(prev => ({...prev, slug: tempSlug}));
                      setIsEditingSlug(false);
                    }} className="bg-[#f3f5f6] border border-[#0071a1] text-[#0071a1] px-2 py-0.5 rounded-[3px] hover:bg-[#f1f1f1]">OK</button>
                    <button onClick={() => setIsEditingSlug(false)} className="text-[#0071a1] underline px-2 py-0.5 hover:text-[#005a80]">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => {
                    setTempSlug(product.slug || product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                    setIsEditingSlug(true);
                  }} className="ml-2 bg-[#f3f5f6] border border-[#0071a1] text-[#0071a1] px-2 py-0.5 rounded-[3px] hover:bg-[#f1f1f1]">Edit</button>
                )}
              </div>
            )}
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
                <option value="VARIABLE">Variable product</option>
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
                <button 
                  onClick={() => setActiveTab('attributes')}
                  className={`text-left px-4 py-2.5 text-[13px] ${activeTab === 'attributes' ? 'bg-white font-semibold border-l-4 border-[#5e3fde] text-[#5e3fde]' : 'hover:bg-[#f0f0f1] text-gray-700'}`}
                >
                  Attributes
                </button>
                {product.type === 'VARIABLE' && (
                  <button 
                    onClick={() => setActiveTab('variations')}
                    className={`text-left px-4 py-2.5 text-[13px] ${activeTab === 'variations' ? 'bg-white font-semibold border-l-4 border-[#5e3fde] text-[#5e3fde]' : 'hover:bg-[#f0f0f1] text-gray-700'}`}
                  >
                    Variations
                  </button>
                )}
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
                {activeTab === 'attributes' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 mb-4">Add attributes (like Size or Color) and separate options with a pipe (|). e.g. Small | Medium | Large</p>
                    {product.attributes.map((attr, idx) => (
                      <div key={idx} className="flex gap-2 items-start border border-[#c3c4c7] p-3 bg-gray-50 mb-2">
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            placeholder="Name (e.g. Size)" 
                            value={attr.name}
                            onChange={(e) => {
                              const newAttrs = [...product.attributes];
                              newAttrs[idx].name = e.target.value;
                              setProduct(prev => ({...prev, attributes: newAttrs}));
                            }}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] outline-none"
                          />
                          <textarea 
                            placeholder="Values (e.g. Small | Medium | Large)" 
                            value={attr.options}
                            onChange={(e) => {
                              const newAttrs = [...product.attributes];
                              newAttrs[idx].options = e.target.value;
                              setProduct(prev => ({...prev, attributes: newAttrs}));
                            }}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] outline-none h-20"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newAttrs = product.attributes.filter((_, i) => i !== idx);
                            setProduct(prev => ({...prev, attributes: newAttrs}));
                          }}
                          className="text-red-500 text-xs px-2 py-1 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        setProduct(prev => ({
                          ...prev, 
                          attributes: [...prev.attributes, { name: '', options: '' }]
                        }));
                      }}
                      className="border border-[#c3c4c7] px-3 py-1.5 text-[13px] bg-white hover:bg-gray-50"
                    >
                      Add Attribute
                    </button>
                  </div>
                )}
                {activeTab === 'variations' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 mb-4">Add variations manually after you have defined attributes.</p>
                    {product.variations.map((v, idx) => (
                      <div key={idx} className="border border-[#c3c4c7] p-3 bg-gray-50 mb-4 space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-[13px]">Variation #{idx + 1}</span>
                          <button 
                            onClick={() => {
                              const newVars = product.variations.filter((_, i) => i !== idx);
                              setProduct(prev => ({...prev, variations: newVars}));
                            }}
                            className="text-red-500 text-xs hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[12px] text-gray-600 block">Attributes JSON (e.g. {"{\"Size\":\"Large\"}"})</label>
                            <input 
                              type="text"
                              value={v.attributes}
                              onChange={(e) => {
                                const newVars = [...product.variations];
                                newVars[idx].attributes = e.target.value;
                                setProduct(prev => ({...prev, variations: newVars}));
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[12px] text-gray-600 block">SKU</label>
                            <input 
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const newVars = [...product.variations];
                                newVars[idx].sku = e.target.value;
                                setProduct(prev => ({...prev, variations: newVars}));
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[12px] text-gray-600 block">Regular Price</label>
                            <input 
                              type="number"
                              value={v.price}
                              onChange={(e) => {
                                const newVars = [...product.variations];
                                newVars[idx].price = e.target.value;
                                setProduct(prev => ({...prev, variations: newVars}));
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[12px] text-gray-600 block">Sale Price</label>
                            <input 
                              type="number"
                              value={v.salePrice}
                              onChange={(e) => {
                                const newVars = [...product.variations];
                                newVars[idx].salePrice = e.target.value;
                                setProduct(prev => ({...prev, variations: newVars}));
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        setProduct(prev => ({
                          ...prev, 
                          variations: [...prev.variations, { attributes: '{}', price: '', salePrice: '', sku: '', manageStock: false, stockQuantity: 0 }]
                        }));
                      }}
                      className="border border-[#c3c4c7] px-3 py-1.5 text-[13px] bg-white hover:bg-gray-50"
                    >
                      Add Variation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[280px] shrink-0 font-sans">
          {/* Publish Box */}
          <Accordion id="publish" title="Publish" expanded={expanded.publish} toggleAccordion={() => toggleAccordion('publish')} noPadding>
            <div className="p-3 bg-white space-y-4">
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
            </div>
            <div className="p-3 bg-[#f6f7f7] border-t border-[#c3c4c7] flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#5e3fde] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-semibold hover:bg-[#4b32b2] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Publish'}
              </button>
            </div>
          </Accordion>

          {/* Product Image */}
          <Accordion id="productImage" title="Product image" expanded={expanded.productImage} toggleAccordion={() => toggleAccordion('productImage')}>
            {product.featuredImage ? (
              <div className="text-center">
                <img src={product.featuredImage} alt="Product image" className="w-full h-auto mb-2 rounded border border-gray-200" />
                <div className="flex gap-2 justify-center">
                  <button onClick={() => setIsMediaModalOpen(true)} className="text-[#0071a1] text-[13px] hover:underline">Replace image</button>
                  <button onClick={() => setProduct(prev => ({ ...prev, featuredImage: '' }))} className="text-[#b32d2e] text-[13px] hover:underline">Remove product image</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsMediaModalOpen(true)} className="text-[#0071a1] text-[13px] hover:underline">Set product image</button>
            )}
          </Accordion>
          
          {/* Product Gallery */}
          <Accordion id="productGallery" title="Product gallery" expanded={expanded.productGallery} toggleAccordion={() => toggleAccordion('productGallery')}>
            <button onClick={() => setIsMediaModalOpen(true)} className="text-[#0071a1] text-[13px] hover:underline">Add product gallery images</button>
          </Accordion>
          
          {/* Product Categories */}
          <Accordion id="categories" title="Product categories" expanded={expanded.categories} toggleAccordion={() => toggleAccordion('categories')}>
            <p className="text-xs text-gray-500">Categories coming soon.</p>
          </Accordion>
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
