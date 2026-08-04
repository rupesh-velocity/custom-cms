import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const appUrl = `${protocol}://${host}`;
    
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['seo_sitemap_include_categories', 'seo_sitemap_empty_categories'] }
      }
    });

    const includeCategories = settings.find(s => s.key === 'seo_sitemap_include_categories')?.value !== 'false';
    const includeEmpty = settings.find(s => s.key === 'seo_sitemap_empty_categories')?.value === 'true';

    if (!includeCategories) {
      return new NextResponse('Sitemap disabled', { status: 404 });
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    const filteredCategories = includeEmpty ? categories : categories.filter(c => c._count.posts > 0);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const cat of filteredCategories) {
      xml += `  <url>\n`;
      xml += `    <loc>${appUrl}/category/${cat.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(cat.updatedAt).toISOString()}</lastmod>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
