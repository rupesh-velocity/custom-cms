import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const slug = slugify(data.name, { lower: true, strict: true });
    
    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 });
  }
}
