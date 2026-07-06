'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProductClient({ productId }: { productId: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error(data.error);
          router.push(`/login?redirect=${window.location.pathname}`);
          return;
        }
        throw new Error(data.error || 'Checkout failed');
      }
      
      toast.success('Purchase successful!');
      router.push('/my-account');
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className="w-full md:w-auto px-8 py-3 bg-[#5e3fde] text-white rounded-lg font-medium text-lg hover:bg-[#4b32b2] disabled:opacity-50 transition-colors shadow-sm shadow-[#5e3fde]/20"
    >
      {isLoading ? 'Processing...' : 'Buy Now (Mock Checkout)'}
    </button>
  );
}
