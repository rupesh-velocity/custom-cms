import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    let finalSlug = data.slug;
    let counter = 1;
    while (await prisma.page.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${data.slug}-${counter}`;
      counter++;
    }

    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: finalSlug,
        contentHtml: data.contentHtml,
        contentText: data.contentText,
        metaDescription: data.metaDescription,
        focusKeyword: data.focusKeyword,
        seoTitle: data.seoTitle,
        redirectUrl: data.redirectUrl,
        redirectType: data.redirectType,
        noIndex: data.noIndex || false,
        status: data.status || 'Draft',
        visibility: data.visibility || 'Public',
        password: data.password || null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        hideTitle: data.hideTitle || false,
        schemaJson: data.schemaJson || null,
      },
    });
    return NextResponse.json(page);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating page' }, { status: 500 });
  }
}

export async function GET() {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(pages);
}
