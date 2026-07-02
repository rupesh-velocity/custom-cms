import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalPosts, totalPages, totalUsers] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.user.count(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total Posts</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">{totalPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total Pages</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">{totalPages}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Active Users</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">{totalUsers}</p>
        </div>
      </div>
    </div>
  );
}
