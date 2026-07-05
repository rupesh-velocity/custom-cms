import { redirect, notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { optimizeHtmlImages } from '@/lib/html-optimizer';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import PasswordProtectedForm from '@/components/PasswordProtectedForm';

export const dynamic = 'force-dynamic';

async function getPageOrPost(slug: string) {
  let data: any = await prisma.page.findUnique({ where: { slug } });
  if (data) {
    return data.status !== 'Draft' ? { ...data, __type: 'page' } : null;
  }
  
  data = await prisma.post.findUnique({ where: { slug } });
  if (data) {
    return data.status !== 'Draft' ? { ...data, __type: 'post' } : null;
  }
  
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPageOrPost(slug);
  
  if (!data) {
    return {
      title: 'Not Found',
      description: 'The page you are looking for does not exist.'
    };
  }

  return {
    title: data.seoTitle || data.title,
    description: data.metaDescription,
    alternates: {
      canonical: `/${data.slug}`,
    },
    robots: {
      index: !data.noIndex,
      follow: !data.noIndex,
    }
  };
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 1. Check for global redirection first
  const redirection = await prisma.redirection.findFirst({
    where: {
      sourceUrl: `/${slug}`,
      status: true
    }
  });

  if (redirection) {
    redirect(redirection.destinationUrl);
  }

  const data = await getPageOrPost(slug);
  
  if (!data) {
    notFound();
  }

  const cookieStore = await cookies();

  if (data.visibility === 'Private') {
    if (!cookieStore.get('cms_session')) {
      notFound();
    }
  }

  // Check if this slug is actually the homepage
  const displayModeSetting = await prisma.setting.findUnique({ where: { key: 'homepage_displays' } });
  const homepageSetting = await prisma.setting.findUnique({ where: { key: 'homepage_page_id' } });
  const postsPageSetting = await prisma.setting.findUnique({ where: { key: 'posts_page_id' } });
  
  // If this page is currently set as the static homepage, redirect to root
  if (displayModeSetting?.value === 'static_page' && homepageSetting?.value === String(data.id)) {
    redirect('/');
  }

  const isPostsPage = displayModeSetting?.value === 'static_page' && postsPageSetting?.value === String(data.id);

  // Handle page/post level SEO redirect if configured
  if (data.redirectUrl) {
    if (data.redirectType === '301') {
      permanentRedirect(data.redirectUrl);
    } else {
      redirect(data.redirectUrl);
    }
  }

  // 2. Fetch SEO global settings for optimizing HTML and adding webmaster tags
  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: 'seo_' } }
  });
  
  const seoSettings = settings.reduce((acc: Record<string, string>, curr) => {
    acc[curr.key] = curr.value || '';
    return acc;
  }, {});

  // 3. Fetch blog settings if this is the posts page
  let posts: any[] = [];
  let feedInclude = 'full_text';
  if (isPostsPage) {
    const limitSetting = await prisma.setting.findUnique({ where: { key: 'blog_pages_at_most' } });
    const feedIncludeSetting = await prisma.setting.findUnique({ where: { key: 'feed_include' } });
    const limit = parseInt(limitSetting?.value || '10');
    feedInclude = feedIncludeSetting?.value || 'full_text';

    const allPosts = await prisma.post.findMany({
      where: { status: 'Published' },
      orderBy: { createdAt: 'desc' },
    });
    
    const isLoggedIn = !!cookieStore.get('cms_session');
    posts = allPosts.filter(p => p.visibility !== 'Private' || isLoggedIn).slice(0, limit);
  }

  return (
    <>
      {data.schemaJson && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: data.schemaJson }} 
        />
      )}
      
      {/* Webmaster Tools Verification tags are now handled globally in layout.tsx */}

      {data.visibility === 'Password Protected' && cookieStore.get(`post_pass_${data.id}`)?.value !== data.password ? (
        <PasswordProtectedForm id={data.id} type={data.__type} title={data.title} />
      ) : isPostsPage ? (
        <div className="min-h-screen bg-gray-50 py-12 px-8 w-full">
          <div className="max-w-3xl mx-auto space-y-12">
            <header className="border-b border-gray-200 pb-8 mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{data.title || 'Blog'}</h1>
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
                    
                    {post.visibility === 'Password Protected' && cookieStore.get(`post_pass_${post.id}`)?.value !== post.password ? (
                      <div className="prose prose-blue max-w-none">
                        <p>This content is password protected.</p>
                        <Link href={`/${post.slug}`} className="text-blue-600 font-medium hover:underline mt-4 inline-block">
                          Enter Password &rarr;
                        </Link>
                      </div>
                    ) : feedInclude === 'full_text' ? (
                      <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(post.contentHtml, seoSettings, post.title) }} />
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
      ) : (
        <main className="w-full">
          {data.title && !data.hideTitle && (
            <div className="max-w-7xl mx-auto px-6 pt-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{data.title}</h1>
            </div>
          )}
          <div className="mt-8" dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(data.contentHtml, seoSettings, data.title) }} />
        </main>
      )}
    </>
  );
}
