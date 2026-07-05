import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AdminListClient from '@/components/AdminListClient';

export const dynamic = 'force-dynamic';

export default async function PagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const statusFilter = params?.status || 'All';

  const whereClause = statusFilter !== 'All' ? { status: statusFilter } : {};

  const [allCount, publishedCount, draftCount, trashCount] = await Promise.all([
    prisma.page.count(),
    prisma.page.count({ where: { status: 'Published' } }),
    prisma.page.count({ where: { status: 'Draft' } }),
    prisma.page.count({ where: { status: 'Trash' } }),
  ]);

  const pages = await prisma.page.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="font-sans text-[13px] text-[#3c434a]">
      <div className="flex items-center gap-4 mb-2 pt-2">
        <h1 className="text-[23px] text-[#1d2327] font-normal">Pages</h1>
        <Link 
          href="/admin/pages/new"
          className="border border-[#2271b1] text-[#2271b1] bg-[#f6f7f7] px-2.5 py-1 rounded-[3px] hover:bg-[#f0f0f1] transition-colors"
        >
          Add Page
        </Link>
      </div>

      <div className="flex text-[13px] mb-2 text-[#50575e]">
        <Link href="/admin/pages" className={statusFilter === 'All' ? 'font-semibold text-black' : 'text-[#2271b1] hover:underline'}>All <span className="text-gray-500 font-normal">({allCount})</span></Link>
        <span className="mx-1 text-gray-300">|</span>
        <Link href="/admin/pages?status=Published" className={statusFilter === 'Published' ? 'font-semibold text-black' : 'text-[#2271b1] hover:underline'}>Published <span className="text-gray-500 font-normal">({publishedCount})</span></Link>
        <span className="mx-1 text-gray-300">|</span>
        <Link href="/admin/pages?status=Draft" className={statusFilter === 'Draft' ? 'font-semibold text-black' : 'text-[#2271b1] hover:underline'}>Draft <span className="text-gray-500 font-normal">({draftCount})</span></Link>
        <span className="mx-1 text-gray-300">|</span>
        <Link href="/admin/pages?status=Trash" className={statusFilter === 'Trash' ? 'font-semibold text-black' : 'text-[#2271b1] hover:underline'}>Trash <span className="text-gray-500 font-normal">({trashCount})</span></Link>
      </div>

      <AdminListClient items={pages} type="pages" />
    </div>
  );
}
