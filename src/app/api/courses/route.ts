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
    const { title, contentHtml, contentText, videos, metaDescription, focusKeyword, slug, status, featuredImage, createdAt, price, salePrice } = await req.json();
    
    let generatedSlug = slug || slugify(title, { lower: true, strict: true });
    
    // Ensure unique slug
    let uniqueSlug = generatedSlug;
    let counter = 1;
    while (await prisma.course.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${generatedSlug}-${counter}`;
      counter++;
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug: uniqueSlug,
        contentHtml: contentHtml || '',
        contentText: contentText || '',
        videos: videos || [],
        metaDescription: metaDescription || '',
        focusKeyword: focusKeyword || '',
        status: status || 'Draft',
        price: price || 0,
        salePrice: salePrice || null,
        featuredImage: featuredImage || null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
