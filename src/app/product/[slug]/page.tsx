import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductClient from './ProductClient';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findFirst({
    where: { slug: resolvedParams.slug }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="text-xl font-bold text-[#5e3fde] tracking-tight">YourLogo</div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/my-account" className="text-gray-600 hover:text-[#5e3fde] transition-colors">My Dashboard</Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-gray-100 min-h-[300px] relative">
             {product.featuredImage ? (
               <img src={product.featuredImage} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
             )}
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.title}</h1>
            <div className="text-2xl font-semibold text-[#5e3fde] mb-6">
              ${product.salePrice || product.price || 'Free'}
            </div>
            
            <div 
              className="prose prose-sm text-gray-600 mb-8"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />
            
            <ProductClient productId={product.id} />
            
            {product.linkedCourseId && (
              <p className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">Includes:</span> Full access to the video course. Watch immediately after purchase!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
