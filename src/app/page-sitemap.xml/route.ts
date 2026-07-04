import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Check if pages are enabled in sitemap
    const setting = await prisma.setting.findUnique({
      where: { key: 'seo_sitemap_include_pages' }
    });
    
    if (setting?.value === 'false') {
      return new NextResponse('Sitemap disabled for pages', { status: 404 });
    }

    const pages = await prisma.page.findMany({
      where: { 
        status: 'Published',
        noIndex: false
      },
      select: {
        slug: true,
        updatedAt: true
      },
      take: 1000
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pages.forEach(page => {
      xml += `  <url>\n`;
      // Handle homepage (slug === 'home' or similar, depending on implementation)
      // Usually, slug '' or 'home' is the homepage
      const loc = page.slug === 'home' ? appUrl : `${appUrl}/${page.slug}`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${page.updatedAt.toISOString()}</lastmod>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating page sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
