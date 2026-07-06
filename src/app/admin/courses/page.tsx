import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AdminListClient from '@/components/AdminListClient';

export const dynamic = 'force-dynamic';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const statusFilter = params?.status || 'All';

  const whereClause = statusFilter !== 'All' ? { status: statusFilter } : { status: { not: 'Trash' } };

  const [allCount, publishedCount, draftCount, trashCount] = await Promise.all([
    prisma.course.count({ where: { status: { not: 'Trash' } } }),
    prisma.course.count({ where: { status: 'Published' } }),
    prisma.course.count({ where: { status: 'Draft' } }),
    prisma.course.count({ where: { status: 'Trash' } }),
  ]);

  const courses = await prisma.course.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="font-sans text-[13px] text-[#3c434a]">
      <div className="flex items-center gap-4 mb-2 pt-2">
        <h1 className="text-[23px] text-[#1d2327] font-normal">Courses</h1>
        <Link 
          href="/admin/courses/new"
          className="border border-[#5e3fde] text-[#5e3fde] bg-[#f6f7f7] px-2.5 py-1 rounded-[3px] hover:bg-[#f0f0f1] transition-colors"
        >
          Add Course
        </Link>
      </div>

      <div className="flex text-[13px] mb-2 text-[#50575e]">
        <Link href="/admin/courses" className={statusFilter === 'All' ? 'font-semibold text-black' : 'text-[#5e3fde] hover:underline'}>All <span className="text-gray-500 font-normal">({allCount})</span></Link>
        <span className="mx-1 text-gray-300">|</span>
        <Link href="/admin/courses?status=Published" className={statusFilter === 'Published' ? 'font-semibold text-black' : 'text-[#5e3fde] hover:underline'}>Published <span className="text-gray-500 font-normal">({publishedCount})</span></Link>
        <span className="mx-1 text-gray-300">|</span>
        <Link href="/admin/courses?status=Draft" className={statusFilter === 'Draft' ? 'font-semibold text-black' : 'text-[#5e3fde] hover:underline'}>Draft <span className="text-gray-500 font-normal">({draftCount})</span></Link>
        <span className="mx-1 text-gray-300">|</span>
        <Link href="/admin/courses?status=Trash" className={statusFilter === 'Trash' ? 'font-semibold text-black' : 'text-[#5e3fde] hover:underline'}>Trash <span className="text-gray-500 font-normal">({trashCount})</span></Link>
      </div>

      <AdminListClient items={courses} type="courses" />
    </div>
  );
}
