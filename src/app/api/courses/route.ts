import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    let slug = data.slug || slugify(data.title, { lower: true, strict: true });
    
    // Ensure unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.course.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: uniqueSlug,
        contentHtml: data.contentHtml || '',
        contentText: data.contentText || '',
        videos: data.videos || [],
        metaDescription: data.metaDescription || '',
        focusKeyword: data.focusKeyword || '',
        status: data.status || 'Draft',
        featuredImage: data.featuredImage || null,
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
