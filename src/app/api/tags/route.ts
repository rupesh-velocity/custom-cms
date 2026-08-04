import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    return NextResponse.json(tags);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description,
      },
    });

    return NextResponse.json(tag);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A tag with this name/slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
