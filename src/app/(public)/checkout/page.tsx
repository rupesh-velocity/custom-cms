import { prisma } from '@/lib/prisma';
import CheckoutClient from './CheckoutClient';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
  const params = await searchParams;
  
  if (!params.productId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Invalid Checkout Link</h1>
        <p className="text-gray-500">No product was specified for checkout.</p>
      </div>
    );
  }
  
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.productId) }
  });

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Product Not Found</h1>
        <p className="text-gray-500">The product you are trying to purchase does not exist.</p>
      </div>
    );
  }
  
  // Check auth
  const cookieStore = await cookies();
  const token = cookieStore.get('cms_session')?.value;
  let userEmail = '';
  let userName = '';
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production');
      const { payload } = await jwtVerify(token, secret);
      const user = await prisma.user.findUnique({ where: { id: payload.id as number }});
      if (user) {
        userEmail = user.email;
        userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username;
      }
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Secure Checkout</h1>
        <CheckoutClient 
          product={{ 
            id: product.id, 
            title: product.title, 
            price: product.salePrice || product.price || 0,
            image: product.featuredImage 
          }} 
          isAuthenticated={!!userEmail}
          initialEmail={userEmail}
          initialName={userName}
        />
      </div>
    </div>
  );
}
