import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    let finalSlug = data.slug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${data.slug}-${counter}`;
      counter++;
    }

    const post = await prisma.post.create({
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
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        schemaJson: data.schemaJson || null,
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
}

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(posts);
}
