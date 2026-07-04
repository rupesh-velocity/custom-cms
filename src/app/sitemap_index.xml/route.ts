import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Fetch settings to check if sitemaps are enabled
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['seo_sitemap_include_posts', 'seo_sitemap_include_pages'] }
      }
    });

    const includePosts = settings.find(s => s.key === 'seo_sitemap_include_posts')?.value !== 'false';
    const includePages = settings.find(s => s.key === 'seo_sitemap_include_pages')?.value !== 'false';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    if (includePosts) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${appUrl}/post-sitemap.xml</loc>\n`;
      // You can add lastmod here based on latest post
      xml += `  </sitemap>\n`;
    }

    if (includePages) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${appUrl}/page-sitemap.xml</loc>\n`;
      xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
