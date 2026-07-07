import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const setting = await prisma.setting.findUnique({ where: { key: 'enable_physical_products' } });
  const enableProducts = setting?.value === 'true';

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Toaster position="top-right" />
      <Sidebar enableProducts={enableProducts} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
