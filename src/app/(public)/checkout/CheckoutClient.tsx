'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProductData {
  id: number;
  title: string;
  price: number;
  image: string | null;
}

interface CheckoutClientProps {
  product: ProductData;
  isAuthenticated: boolean;
  initialEmail: string;
  initialName: string;
}

export default function CheckoutClient({ product, isAuthenticated, initialEmail, initialName }: CheckoutClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    password: '',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/26',
    cvc: '123'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/checkout/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.id,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      toast.success('Payment successful!');
      router.push('/my-account');
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Checkout Form */}
      <div className="w-full lg:w-2/3 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>
        <form onSubmit={handleCheckout} className="space-y-6">
          
          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5e3fde] outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" name="email" required
                  disabled={isAuthenticated}
                  value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5e3fde] outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            {!isAuthenticated && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Create a Password (to access your course later)</label>
                <input 
                  type="password" name="password" required
                  value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5e3fde] outline-none"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Payment Details (Mock) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Credit Card</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number (Mock Data)</label>
              <input 
                type="text" name="cardNumber" required
                value={formData.cardNumber} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                <input 
                  type="text" name="expiry" required
                  value={formData.expiry} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input 
                  type="text" name="cvc" required
                  value={formData.cvc} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full py-3 px-6 bg-[#5e3fde] text-white font-bold rounded-lg hover:bg-[#4b32b2] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : `Pay $${product.price} Now`}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="flex gap-4 items-start mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden relative">
              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{product.title}</h3>
              <p className="text-[#5e3fde] font-bold mt-1">${product.price}</p>
            </div>
          </div>
          <hr className="border-gray-100 mb-4" />
          <div className="flex justify-between items-center text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${product.price}</span>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Secured by MockPay. Your card will not be charged.
          </p>
        </div>
      </div>
    </div>
  );
}
