import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalPosts, totalPages, totalUsers, recentPages, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.user.count(),
    prisma.page.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.post.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }),
  ]);
  
  // Combine and sort recent activity
  const recentActivity = [...recentPages.map(p => ({ ...p, type: 'Page' })), ...recentPosts.map(p => ({ ...p, type: 'Post' }))]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2271b1] to-[#135e96] rounded-xl p-8 text-white shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Velocity CMS</h1>
          <p className="text-blue-100 text-lg">Here's what's happening with your site today.</p>
        </div>
        <div className="hidden md:block">
          <svg className="w-24 h-24 text-white opacity-20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2zm0 3.83L17.5 19h-11L12 5.83z"/>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#c3c4c7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-[#2271b1] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 8H20z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Posts</h3>
            <p className="text-3xl font-bold mt-1 text-[#2c3338]">{totalPosts}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-[#c3c4c7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Pages</h3>
            <p className="text-3xl font-bold mt-1 text-[#2c3338]">{totalPages}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-[#c3c4c7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Users</h3>
            <p className="text-3xl font-bold mt-1 text-[#2c3338]">{totalUsers}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#c3c4c7] shadow-sm">
          <div className="px-6 py-4 border-b border-[#c3c4c7] bg-gray-50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-[#2c3338]">Recent Activity</h3>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-[#2271b1]"></span>
                    <div>
                      <p className="text-[14px] text-[#2c3338]">
                        <span className="font-semibold">{item.title || '(no title)'}</span> ({item.type}) 
                        <span className="text-gray-500 ml-1">was updated.</span>
                      </p>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {new Date(item.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-[14px]">No recent activity.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#c3c4c7] shadow-sm">
          <div className="px-6 py-4 border-b border-[#c3c4c7] bg-gray-50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-[#2c3338]">Quick Links</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/admin/pages/new" className="flex items-center gap-3 p-4 rounded-lg border border-[#c3c4c7] hover:border-[#2271b1] hover:bg-blue-50 transition-colors group">
              <div className="text-gray-400 group-hover:text-[#2271b1]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                <h4 className="font-medium text-[#2c3338]">New Page</h4>
                <p className="text-[12px] text-gray-500">Create a static page</p>
              </div>
            </a>
            
            <a href="/admin/posts/new" className="flex items-center gap-3 p-4 rounded-lg border border-[#c3c4c7] hover:border-[#2271b1] hover:bg-blue-50 transition-colors group">
              <div className="text-gray-400 group-hover:text-[#2271b1]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div>
                <h4 className="font-medium text-[#2c3338]">New Post</h4>
                <p className="text-[12px] text-gray-500">Write a blog post</p>
              </div>
            </a>
            
            <a href="/admin/media" className="flex items-center gap-3 p-4 rounded-lg border border-[#c3c4c7] hover:border-[#2271b1] hover:bg-blue-50 transition-colors group">
              <div className="text-gray-400 group-hover:text-[#2271b1]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h4 className="font-medium text-[#2c3338]">Media Library</h4>
                <p className="text-[12px] text-gray-500">Upload images & files</p>
              </div>
            </a>
            
            <a href="/admin/settings/general" className="flex items-center gap-3 p-4 rounded-lg border border-[#c3c4c7] hover:border-[#2271b1] hover:bg-blue-50 transition-colors group">
              <div className="text-gray-400 group-hover:text-[#2271b1]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h4 className="font-medium text-[#2c3338]">Settings</h4>
                <p className="text-[12px] text-gray-500">Configure your site</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
