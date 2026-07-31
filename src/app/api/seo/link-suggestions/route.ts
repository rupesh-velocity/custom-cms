import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const currentSlug = searchParams.get('slug');
  
  if (!keyword || keyword.trim() === '') {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const [pages, posts] = await Promise.all([
      prisma.page.findMany({
        where: {
          slug: { not: currentSlug || undefined },
          OR: [
            { title: { contains: keyword } },
            { focusKeyword: { contains: keyword } }
          ],
          status: 'Published'
        },
        select: { id: true, title: true, slug: true, isPillar: true },
        orderBy: [
          { isPillar: 'desc' },
        ],
        take: 5
      }),
      prisma.post.findMany({
        where: {
          slug: { not: currentSlug || undefined },
          OR: [
            { title: { contains: keyword } },
            { focusKeyword: { contains: keyword } }
          ],
          status: 'Published'
        },
        select: { id: true, title: true, slug: true, isPillar: true },
        orderBy: [
          { isPillar: 'desc' },
        ],
        take: 5
      })
    ]);

    const suggestions = [
      ...pages.map(p => ({ ...p, type: 'page' })),
      ...posts.map(p => ({ ...p, type: 'post' }))
    ].sort((a, b) => (b.isPillar ? 1 : 0) - (a.isPillar ? 1 : 0));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching link suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
