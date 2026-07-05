import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function BlogSidebar() {
  const recentPosts = await prisma.post.findMany({
    where: { status: 'Published' },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });

  return (
    <aside className="w-full lg:w-[320px] shrink-0 space-y-8">
      {/* Search Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-outfit">Search</h3>
        <form action="/search" method="GET" className="relative">
          <input 
            type="text" 
            name="q" 
            placeholder="Search posts..." 
            className="w-full pl-4 pr-10 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-[#5e3fde] focus:ring-2 focus:ring-[#5e3fde]/20 rounded-xl transition-all duration-200 outline-none text-gray-700"
            required
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5e3fde] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>
      </div>

      {/* Recent Posts Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-outfit">Recent Posts</h3>
        <div className="space-y-4">
          {recentPosts.length > 0 ? recentPosts.map(post => (
            <div key={post.id} className="group">
              <Link href={`/${post.slug}`} className="block">
                <h4 className="text-gray-800 font-medium group-hover:text-[#5e3fde] transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </Link>
            </div>
          )) : (
            <p className="text-gray-500 text-sm">No posts yet.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
