import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import BlogSidebar from '@/components/BlogSidebar';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Archives`,
    description: `Browse all posts in the ${category.name} category.`,
    alternates: {
      canonical: `/category/${category.slug}`,
    }
  };
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
    <div className="min-h-screen bg-[#f8f9fa] py-16 px-4 w-full font-sans">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <header className="mb-12">
            <div className="text-[#5e3fde] font-bold tracking-wide uppercase mb-2 text-sm">Category</div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight font-outfit">{category.name}</h1>
          </header>

          {posts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
              <p className="text-gray-500 text-lg">No posts published in this category yet.</p>
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
