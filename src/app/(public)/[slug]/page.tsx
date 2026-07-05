import { redirect, notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { optimizeHtmlImages } from '@/lib/html-optimizer';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import PasswordProtectedForm from '@/components/PasswordProtectedForm';
import BlogSidebar from '@/components/BlogSidebar';
import CopyLinkButton from '@/components/CopyLinkButton';
import { Link as LinkIcon, User } from 'lucide-react';

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);


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
  if (data.__type === 'page' && displayModeSetting?.value === 'static_page' && homepageSetting?.value === String(data.id)) {
    redirect('/');
  }

  const isPostsPage = data.__type === 'page' && displayModeSetting?.value === 'static_page' && postsPageSetting?.value === String(data.id);

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
        <div className="min-h-screen bg-[#f8f9fa] w-full font-sans">
          <div className="bg-[#f5f3ff] border-b border-[#e2d9ff] py-8 px-4 mb-10">
            <div className="max-w-[1200px] mx-auto text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1e1b4b] tracking-tight font-outfit">{data.title || 'Blog'}</h1>
              <p className="mt-2 text-lg text-[#4338ca] font-medium max-w-2xl mx-auto lg:mx-0">Discover our latest news, articles, and insights.</p>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-12 pb-16">
            <div className="flex-1 min-w-0">
              {posts.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
                  <p className="text-gray-500 text-lg">No posts published yet.</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {posts.map((post: any) => (
                    <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row">
                      {post.featuredImage && (
                        <Link href={`/${post.slug}`} className="block sm:w-[40%] shrink-0 overflow-hidden border-b sm:border-b-0 sm:border-r border-gray-100">
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 aspect-[4/3] sm:aspect-auto sm:h-full" />
                        </Link>
                      )}
                      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#5e3fde] font-semibold mb-3">
                          {post.categories?.map((cat: any, i: number) => (
                            <span key={cat.id}>
                              <Link href={`/category/${cat.slug}`} className="hover:underline">{cat.name}</Link>
                              {i < post.categories.length - 1 ? ' • ' : ''}
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
                        <Link href={`/category/${cat.slug}`} className="hover:underline">{cat.name}</Link>
                        {i < data.categories.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight font-outfit leading-tight mb-6">{data.title}</h1>
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
                      <TwitterIcon className="w-5 h-5" />
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=YOUR_DOMAIN/${data.slug}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#4267B2] hover:text-white transition-colors">
                      <FacebookIcon className="w-5 h-5" />
                    </a>
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=YOUR_DOMAIN/${data.slug}&title=${encodeURIComponent(data.title)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#0077B5] hover:text-white transition-colors">
                      <LinkedinIcon className="w-5 h-5" />
                    </a>
                    <CopyLinkButton url={`https://YOUR_DOMAIN/${data.slug}`} />
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
