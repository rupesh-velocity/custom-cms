import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Fetch settings
  const settingsRecords = await prisma.setting.findMany({
    where: {
      key: { in: ['homepage_displays', 'homepage_page_id', 'blog_pages_at_most', 'feed_include'] }
    }
  });
  
  const settings = settingsRecords.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const displayMode = settings.homepage_displays || 'latest_posts';

  // 2. Render Static Page Mode
  if (displayMode === 'static_page') {
    const pageId = parseInt(settings.homepage_page_id || '0');
    if (!pageId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Homepage not configured</h1>
            <p className="text-gray-500">Please go to Admin &gt; Settings &gt; Reading and select a static page.</p>
            <Link href="/admin/settings/reading" className="inline-block mt-4 text-blue-600 hover:underline">Go to Settings</Link>
          </div>
        </div>
      );
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId, status: 'Published' }
    });

    if (!page) return notFound();

    return (
      <div className="min-h-screen bg-white">
        <main className="w-full">
          <div dangerouslySetInnerHTML={{ __html: page.contentHtml || '' }} />
        </main>
      </div>
    );
  }

  // 3. Render Latest Posts Mode
  const limit = parseInt(settings.blog_pages_at_most || '10');
  const feedInclude = settings.feed_include || 'full_text';

  const posts = await prisma.post.findMany({
    where: { status: 'Published' },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="border-b border-gray-200 pb-8 mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Latest Updates</h1>
        </header>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts published yet.</p>
        ) : (
          <div className="space-y-16">
            {posts.map((post: any) => (
              <article key={post.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <Link href={`/${post.slug}`} className="block group">
                  <h2 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-4">
                    {post.title}
                  </h2>
                </Link>
                <div className="text-sm text-gray-500 mb-6">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
                
                {feedInclude === 'full_text' ? (
                  <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }} />
                ) : (
                  <div className="prose prose-blue max-w-none">
                    <p>{(post.contentText || '').substring(0, 300)}...</p>
                    <Link href={`/${post.slug}`} className="text-blue-600 font-medium hover:underline mt-4 inline-block">
                      Read more &rarr;
                    </Link>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
