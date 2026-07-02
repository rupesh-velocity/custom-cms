import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function generateMetadata(context: any) {
  const params = await context.params;
  const slug = params.slug;

  let data: any = await prisma.page.findUnique({ where: { slug } });
  if (!data) {
    data = await prisma.post.findUnique({ where: { slug } });
  }

  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription || (data.contentText ? data.contentText.substring(0, 160) : ''),
  };
}

export default async function FrontendPage(context: any) {
  const params = await context.params;
  const slug = params.slug;
  
  // Try to find a Page first
  let data: any = await prisma.page.findUnique({ where: { slug } });
  
  // If no Page is found, try to find a Post
  if (!data) {
    data = await prisma.post.findUnique({ where: { slug } });
  }

  // If still no data, or if it's explicitly set to Draft, show 404
  if (!data || data.status === 'Draft') {
    notFound();
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
        
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
      </main>
    </>
  );
}
