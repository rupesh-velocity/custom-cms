import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    const data = await req.json();

    let slug = data.slug;
    if (!slug && data.name) {
      slug = slugify(data.name, { lower: true, strict: true });
    }

    // Ensure slug uniqueness (except for the current tag)
    if (slug) {
      const existing = await prisma.tag.findUnique({
        where: { slug }
      });
      if (existing && existing.id !== id) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        slug: slug !== undefined ? slug : undefined,
        description: data.description !== undefined ? data.description : undefined,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error updating tag' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    
    // Check if tag exists
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    await prisma.tag.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting tag' }, { status: 500 });
  }
}
