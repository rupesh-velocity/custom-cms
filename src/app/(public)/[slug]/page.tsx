import { redirect, notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { optimizeHtmlImages } from '@/lib/html-optimizer';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import PasswordProtectedForm from '@/components/PasswordProtectedForm';
import BlogSidebar from '@/components/BlogSidebar';
import { Facebook, Twitter, Linkedin, Link as LinkIcon, User } from 'lucide-react';
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
  
  data = await prisma.post.findUnique({ 
    where: { slug },
    include: { author: true, categories: true }
  });
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

export default async function PublicPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params.slug;
  
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
  let totalPages = 1;
  let currentPage = 1;
  
  const isLoggedIn = !!cookieStore.get('cms_session');

  if (isPostsPage) {
    const limitSetting = await prisma.setting.findUnique({ where: { key: 'blog_pages_at_most' } });
    const feedIncludeSetting = await prisma.setting.findUnique({ where: { key: 'feed_include' } });
    const limit = parseInt(limitSetting?.value || '10');
    feedInclude = feedIncludeSetting?.value || 'full_text';
    currentPage = parseInt((searchParams?.page as string) || '1') || 1;
    const skip = (currentPage - 1) * limit;

    const visibilityFilter = isLoggedIn ? {} : { visibility: { not: 'Private' } };

    posts = await prisma.post.findMany({
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
    totalPages = Math.ceil(totalPosts / limit);
  }

  const showAuthorBoxSetting = await prisma.setting.findUnique({ where: { key: 'show_author_box' } });
  const showAuthorBox = showAuthorBoxSetting?.value !== 'false';

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
        <div className="min-h-screen bg-[#f8f9fa] py-16 px-4 w-full font-sans">
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12">
            <div className="flex-1 min-w-0">
              <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight font-outfit">{data.title || 'Blog'}</h1>
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
                          <div className="prose prose-lg prose-blue max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(post.contentHtml, seoSettings, post.title) }} />
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
                          href={`/${slug}?page=${i + 1}`}
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
      ) : data.__type === 'post' ? (
        <div className="min-h-screen bg-[#f8f9fa] py-16 px-4 w-full font-sans">
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12">
            <main className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {data.featuredImage && (
                <div className="w-full h-[400px] md:h-[500px]">
                  <img src={data.featuredImage} alt={data.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-8 md:p-12 lg:px-16">
                <header className="mb-10 text-center max-w-3xl mx-auto">
                  <div className="flex justify-center flex-wrap items-center gap-2 text-sm text-[#5e3fde] font-bold mb-4 tracking-wide uppercase">
                    {data.categories?.map((cat: any, i: number) => (
                      <span key={cat.id}>
                        {cat.name}{i < data.categories.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight font-outfit leading-tight mb-6">{data.title}</h1>
                  <div className="flex items-center justify-center gap-3 text-sm text-gray-500 font-medium">
                    {data.author?.firstName && <span>By <strong className="text-gray-900">{data.author.firstName} {data.author.lastName}</strong></span>}
                    {data.author?.firstName && <span>•</span>}
                    <span>
                      {new Date(data.publishedAt || data.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                </header>
                
                <div className="prose prose-lg md:prose-xl prose-blue mx-auto text-gray-800" dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(data.contentHtml, seoSettings, data.title) }} />
                
                {/* Share Buttons */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <h3 className="text-gray-900 font-bold font-outfit text-xl">Share this article</h3>
                  <div className="flex items-center gap-3">
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=YOUR_DOMAIN/${data.slug}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#1DA1F2] hover:text-white transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=YOUR_DOMAIN/${data.slug}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#4267B2] hover:text-white transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=YOUR_DOMAIN/${data.slug}&title=${encodeURIComponent(data.title)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#0077B5] hover:text-white transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <button onClick={() => navigator.clipboard.writeText(`YOUR_DOMAIN/${data.slug}`)} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 transition-colors">
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Author Box */}
                {showAuthorBox && data.author && (
                  <div className="mt-12 bg-gray-50 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-gray-100">
                    <div className="w-24 h-24 bg-[#5e3fde] text-white rounded-full flex items-center justify-center shrink-0 shadow-lg">
                      <User className="w-10 h-10" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-xl font-bold text-gray-900 font-outfit mb-2">{data.author.firstName} {data.author.lastName}</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Author at this blog. Writing about technology, design, and modern web development.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </main>
            
            <BlogSidebar />
          </div>
        </div>
      ) : (
        <main className="w-full font-sans">
          {data.title && !data.hideTitle && (
            <div className="max-w-7xl mx-auto px-6 pt-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight font-outfit">{data.title}</h1>
            </div>
          )}
          <div className="mt-12" dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(data.contentHtml, seoSettings, data.title) }} />
        </main>
      )}
    </>
  );
}
