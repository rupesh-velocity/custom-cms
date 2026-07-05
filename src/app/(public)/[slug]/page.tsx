import { redirect, notFound, permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { optimizeHtmlImages } from '@/lib/html-optimizer';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import PasswordProtectedForm from '@/components/PasswordProtectedForm';

export const dynamic = 'force-dynamic';

async function getPageOrPost(slug: string) {
  let data: any = await prisma.page.findUnique({ where: { slug } });
  if (!data) {
    data = await prisma.post.findUnique({ where: { slug } });
  }
  return data && data.status !== 'Draft' ? data : null;
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

  if (data.visibility === 'Private') {
    const cookieStore = await cookies();
    if (!cookieStore.get('cms_session')) {
      notFound();
    }
  }

  // Check if this slug is actually the homepage
  const displayModeSetting = await prisma.setting.findUnique({ where: { key: 'homepage_displays' } });
  const homepageSetting = await prisma.setting.findUnique({ where: { key: 'homepage_page_id' } });
  
  // If this page is currently set as the static homepage, redirect to root
  if (displayModeSetting?.value === 'static_page' && homepageSetting?.value === String(data.id)) {
    redirect('/');
  }

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

  return (
    <>
      {data.schemaJson && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: data.schemaJson }} 
        />
      )}
      
      {/* Webmaster Tools Verification tags are now handled globally in layout.tsx */}

      {data.visibility === 'Password Protected' && (!await cookies().then(c => c.get(`post_pass_${data.id}`)?.value === data.password)) ? (
        <PasswordProtectedForm id={data.id} type={'contentHtml' in data ? (data.slug === slug && data.title ? 'post' : 'page') : 'post'} title={data.title} />
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
