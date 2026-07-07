import { ShoppingCart } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-normal text-gray-900">Orders</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-50 rounded-full">
            <ShoppingCart size={40} className="text-gray-400" />
          </div>
        </div>
        <h2 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">When customers place orders on your store, they will appear here.</p>
      </div>
    </div>
  );
}
