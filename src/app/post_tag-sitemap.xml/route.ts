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
        key: { in: ['seo_sitemap_include_tags', 'seo_sitemap_empty_tags'] }
      }
    });

    const includeTags = settings.find(s => s.key === 'seo_sitemap_include_tags')?.value === 'true';
    const includeEmpty = settings.find(s => s.key === 'seo_sitemap_empty_tags')?.value === 'true';

    if (!includeTags) {
      return new NextResponse('Sitemap disabled', { status: 404 });
    }

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    const filteredTags = includeEmpty ? tags : tags.filter(t => t._count.posts > 0);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    for (const tag of filteredTags) {
      xml += `  <url>\n`;
      xml += `    <loc>${appUrl}/tag/${tag.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(tag.updatedAt).toISOString()}</lastmod>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating tags sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
