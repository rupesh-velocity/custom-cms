import { notFound, redirect, permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { optimizeHtmlImages } from '@/lib/html-optimizer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(context: any) {
  const params = await context.params;
  const slug = params.slug;

  let data: any = await prisma.page.findUnique({ where: { slug } });
  if (!data) {
    data = await prisma.post.findUnique({ where: { slug } });
  }

  if (!data) return {};

  return {
    title: data.seoTitle || data.title,
    description: data.metaDescription || (data.contentText ? data.contentText.substring(0, 160) : ''),
    robots: {
      index: !data.noIndex,
      follow: true,
    }
  };
}

export default async function FrontendPage(context: any) {
  const params = await context.params;
  const slug = params.slug;
  
  // Check if this slug is actually the homepage
  const displayModeSetting = await prisma.setting.findUnique({ where: { key: 'homepage_displays' } });
  const homepageSetting = await prisma.setting.findUnique({ where: { key: 'homepage_page_id' } });
  
  // Try to find a Page first
  let data: any = await prisma.page.findUnique({ where: { slug } });
  
  // If this page is currently set as the static homepage, redirect to root
  if (data && displayModeSetting?.value === 'static_page' && homepageSetting?.value === String(data.id)) {
    redirect('/');
  }
  
  // If no Page is found, try to find a Post
  if (!data) {
    data = await prisma.post.findUnique({ where: { slug } });
  }

  // If still no data, or if it's explicitly set to Draft, show 404
  if (!data || data.status === 'Draft') {
    notFound();
  }

  // Handle SEO redirect if configured
  if (data.redirectUrl) {
    if (data.redirectType === '301') {
      permanentRedirect(data.redirectUrl);
    } else {
      redirect(data.redirectUrl);
    }
  }

  return (
    <>
      <main className="w-full">
        {data.title && !data.hideTitle && (
          <div className="max-w-7xl mx-auto px-6 pt-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1d2327]">
              {data.title}
            </h1>
          </div>
        )}
        
        <div dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(data.contentHtml) }} />
      </main>
    </>
  );
}
