import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const appUrl = `${protocol}://${host}`;
    
    // Check if posts are enabled in sitemap
    const setting = await prisma.setting.findUnique({
      where: { key: 'seo_sitemap_include_posts' }
    });
    
    if (setting?.value === 'false') {
      return new NextResponse('Sitemap disabled for posts', { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: { 
        status: 'Published',
        noIndex: false
      },
      select: {
        slug: true,
        updatedAt: true
      },
      // You can add pagination using seo_sitemap_links_per_page here
      take: 1000
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    posts.forEach(post => {
      xml += `  <url>\n`;
      xml += `    <loc>${appUrl}/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating post sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
