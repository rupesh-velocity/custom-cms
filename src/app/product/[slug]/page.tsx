import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findFirst({
    where: { slug: resolvedParams.slug }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
        <p className="text-gray-600 mb-6">
          This is a placeholder for the frontend product page. The complete E-Commerce frontend store will be built in Phase 4!
        </p>
        <Link href="/admin/products" className="text-[#5e3fde] hover:underline">
          &larr; Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
