'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUserName, setCurrentUserName] = useState('Admin User');

  useEffect(() => {
    fetchProducts();
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
  }, [search]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?search=${search}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  return (
    <div className="max-w-[1200px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link 
          href="/admin/products/new"
          className="bg-[#5e3fde] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4b32b2] transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                  <input type="checkbox" className="rounded text-[#5e3fde] focus:ring-[#5e3fde]" />
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Image</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-[#5e3fde] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={32} className="text-gray-300" />
                      <p className="text-sm">No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <input type="checkbox" className="rounded text-[#5e3fde] focus:ring-[#5e3fde]" />
                    </td>
                    <td className="py-4 px-6">
                      {product.featuredImage ? (
                        <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden">
                          <img src={product.featuredImage} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/admin/products/${product.id}/edit`} className="font-medium text-gray-900 hover:text-[#5e3fde]">
                        {product.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.type === 'SIMPLE' ? 'Simple Product' : 'Variable Product'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {product.sku || <span className="text-gray-400 italic">No SKU</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#5e3fde] hover:underline cursor-pointer">
                      {product.author ? (product.author.firstName ? `${product.author.firstName} ${product.author.lastName || ''}`.trim() : product.author.username) : currentUserName}
                    </td>
                    <td className="py-4 px-6">
                      {product.manageStock ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      ${product.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-[#5e3fde] hover:bg-[#5e3fde]/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
