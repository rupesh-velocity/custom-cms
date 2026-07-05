import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import { optimizeHtmlImages } from '@/lib/html-optimizer';
import { cookies } from 'next/headers';
import PasswordProtectedForm from '@/components/PasswordProtectedForm';
import BlogSidebar from '@/components/BlogSidebar';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settingsRecords = await prisma.setting.findMany({
    where: { key: { in: ['homepage_displays', 'homepage_page_id'] } }
  });
  const settings = settingsRecords.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  if (settings.homepage_displays === 'static_page' && settings.homepage_page_id) {
    const pageId = parseInt(settings.homepage_page_id);
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (page) {
      return {
        title: page.seoTitle || page.title,
        description: page.metaDescription || (page.contentText ? page.contentText.substring(0, 160) : ''),
        robots: {
          index: !page.noIndex,
          follow: true,
        }
      };
    }
  }

  return {
    title: 'Velocity CMS',
    description: 'A powerful headless CMS built with Next.js',
  };
}

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  // 1. Fetch settings
  const settingsRecords = await prisma.setting.findMany({
    where: {
      OR: [
        { key: { in: ['homepage_displays', 'homepage_page_id', 'blog_pages_at_most', 'feed_include'] } },
        { key: { startsWith: 'seo_' } }
      ]
    }
  });
  
  const settings = settingsRecords.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const displayMode = settings.homepage_displays || 'latest_posts';

  // 1.5 Global Redirection for Homepage
  const redirection = await prisma.redirection.findFirst({
    where: {
      sourceUrl: `/`,
      status: true
    }
  });

  if (redirection) {
    redirect(redirection.destinationUrl);
  }

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

    const page = await prisma.page.findFirst({
      where: { id: pageId, status: 'Published' }
    });

    if (!page) return notFound();

    if (page.visibility === 'Private') {
      const cookieStore = await cookies();
      if (!cookieStore.get('cms_session')) {
        return notFound();
      }
    }

    if (page.redirectUrl) {
      if (page.redirectType === '301') {
        permanentRedirect(page.redirectUrl);
      } else {
        redirect(page.redirectUrl);
      }
    }

    return (
      <div className="min-h-screen bg-white">
        {page.schemaJson && (
          <script 
            type="application/ld+json" 
            dangerouslySetInnerHTML={{ __html: page.schemaJson }} 
          />
        )}
        {page.visibility === 'Password Protected' && (!await cookies().then(c => c.get(`post_pass_${page.id}`)?.value === page.password)) ? (
          <PasswordProtectedForm id={page.id} type="page" title={page.title} />
        ) : (
          <main className="w-full">
            <div dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(page.contentHtml, settings, page.title) }} />
          </main>
        )}
      </div>
    );
  }

  // 3. Render Latest Posts Mode
  const limit = parseInt(settings.blog_pages_at_most || '10');
  const feedInclude = settings.feed_include || 'full_text';
  const currentPage = parseInt((searchParams?.page as string) || '1') || 1;
  const skip = (currentPage - 1) * limit;

  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get('cms_session');
  
  const visibilityFilter = isLoggedIn ? {} : { visibility: { not: 'Private' } };

  const posts = await prisma.post.findMany({
    where: { 
      status: 'Published',
      ...visibilityFilter
    },
    orderBy: { publishedAt: 'desc' },
    include: { author: true, categories: true },
    skip,
    take: limit,
  });

  const totalPosts = await prisma.post.count({
    where: { 
      status: 'Published',
      ...visibilityFilter
    }
  });
  const totalPages = Math.ceil(totalPosts / limit);

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-16 px-4 w-full font-sans">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight font-outfit">Latest Updates</h1>
          </header>

          {posts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
              <p className="text-gray-500 text-lg">No posts published yet.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {posts.map((post: any) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {post.featuredImage && (
                    <Link href={`/${post.slug}`} className="block h-64 md:h-80 w-full overflow-hidden">
                      <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </Link>
                  )}
                  <div className="p-8">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#5e3fde] font-semibold mb-3">
                      {post.categories?.map((cat: any, i: number) => (
                        <span key={cat.id}>
                          {cat.name}{i < post.categories.length - 1 ? ' • ' : ''}
                        </span>
                      ))}
                    </div>
                    <Link href={`/${post.slug}`} className="block group">
                      <h2 className="text-3xl font-bold text-gray-900 group-hover:text-[#5e3fde] transition-colors mb-4 font-outfit leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 font-medium">
                      {post.author?.firstName && <span>By {post.author.firstName} {post.author.lastName}</span>}
                      {post.author?.firstName && <span>•</span>}
                      <span>
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {post.visibility === 'Password Protected' && cookieStore.get(`post_pass_${post.id}`)?.value !== post.password ? (
                      <div className="prose prose-blue max-w-none text-gray-600">
                        <p>This content is password protected.</p>
                        <Link href={`/${post.slug}`} className="text-[#5e3fde] font-medium hover:underline mt-4 inline-flex items-center gap-1">
                          Enter Password &rarr;
                        </Link>
                      </div>
                    ) : feedInclude === 'full_text' ? (
                      <div className="prose prose-lg prose-blue max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(post.contentHtml, settings, post.title) }} />
                    ) : (
                      <div className="prose prose-lg prose-blue max-w-none text-gray-700">
                        <p>{(post.contentText || '').substring(0, 250)}...</p>
                        <Link href={`/${post.slug}`} className="text-[#5e3fde] font-medium hover:underline mt-6 inline-flex items-center gap-1">
                          Read more &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Link
                      key={i}
                      href={`/?page=${i + 1}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                        currentPage === i + 1 
                          ? 'bg-[#5e3fde] text-white' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <BlogSidebar />
      </div>
    </div>
  );
}
