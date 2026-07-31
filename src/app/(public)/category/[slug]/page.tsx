import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import BlogSidebar from '@/components/BlogSidebar';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import { generateFullMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return generateFullMetadata({
    title: `${category.name} Archives`,
    rawTitle: `${category.name} Archives`,
    description: `Browse all posts in the ${category.name} category.`,
    rawContentText: `Browse all posts in the ${category.name} category.`,
    category: category.name,
    type: 'website',
    url: `/category/${category.slug}`,
  });
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params.slug;

  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) {
    notFound();
  }

  const settingsRecords = await prisma.setting.findMany({
    where: {
      key: { in: ['blog_pages_at_most', 'feed_include'] }
    }
  });

  const settings = settingsRecords.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const limit = parseInt(settings.blog_pages_at_most || '10');
  const currentPage = parseInt((searchParams?.page as string) || '1') || 1;
  const skip = (currentPage - 1) * limit;

  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get('cms_session');
  
  const visibilityFilter = isLoggedIn ? {} : { visibility: { not: 'Private' } };

  const posts = await prisma.post.findMany({
    where: { 
      status: 'Published',
      ...visibilityFilter,
      categories: {
        some: {
          slug: category.slug
        }
      }
    },
    orderBy: { publishedAt: 'desc' },
    include: { author: true, categories: true },
    skip,
    take: limit,
  });

  const totalPosts = await prisma.post.count({
    where: { 
      status: 'Published',
      ...visibilityFilter,
      categories: {
        some: {
          slug: category.slug
        }
      }
    }
  });
  const totalPages = Math.ceil(totalPosts / limit);

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full font-sans pt-8 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 mb-12">
        <div className="bg-gradient-to-br from-[#5e3fde] to-[#8a72ec] rounded-3xl p-10 md:p-14 text-center lg:text-left shadow-lg relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
          
          <div className="text-white/80 font-bold tracking-wide uppercase mb-2 text-sm relative z-10">Category</div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-outfit relative z-10">{category.name}</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          {posts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
              <p className="text-gray-500 text-lg">No posts published in this category yet.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {posts.map((post: any) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row overflow-hidden group/card">
                  {post.featuredImage && (
                    <Link href={`/${post.slug}`} className="block w-full sm:w-1/3 lg:w-[30%] shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0">
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
                      </div>
                      {/* Placeholder to maintain minimum aspect ratio on mobile, but let it stretch on desktop */}
                      <div className="w-full pb-[56.25%] sm:pb-0"></div>
                    </Link>
                  )}
                  <div className="flex-1 min-w-0 p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#5e3fde] font-semibold mb-2">
                      {post.categories?.map((cat: any, i: number) => (
                        <span key={cat.id}>
                          <Link href={`/category/${cat.slug}`} className="hover:underline">{cat.name}</Link>
                          {i < post.categories.length - 1 ? ' • ' : ''}
                        </span>
                      ))}
                    </div>
                    <Link href={`/${post.slug}`} className="block group">
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#5e3fde] transition-colors mb-3 font-outfit leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 font-medium">
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
                      <div className="prose prose-blue max-w-none text-gray-700 text-sm md:text-base">
                        <p>{(post.contentText || '').substring(0, 180)}...</p>
                        <Link href={`/${post.slug}`} className="text-[#5e3fde] font-medium hover:underline mt-3 inline-flex items-center gap-1">
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
                      href={`/category/${slug}?page=${i + 1}`}
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
