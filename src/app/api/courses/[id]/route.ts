import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const course = await prisma.course.findUnique({
      where: { id: parseInt(resolvedParams.id) }
    });
    
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const data = await req.json();
    
    const course = await prisma.course.update({
      where: { id: parseInt(resolvedParams.id) },
      data: {
        title: data.title,
        slug: data.slug || slugify(data.title, { lower: true, strict: true }),
        contentHtml: data.contentHtml,
        contentText: data.contentText,
        videos: data.videos,
        metaDescription: data.metaDescription,
        focusKeyword: data.focusKeyword,
        status: data.status,
        featuredImage: data.featuredImage,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.course.delete({
      where: { id: parseInt(resolvedParams.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
