import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const post = await prisma.post.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching post' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params;
    const data = await req.json();
    const post = await prisma.post.update({
      where: { id: parseInt(params.id) },
      data: {
        title: data.title,
        slug: data.slug,
        contentHtml: data.contentHtml,
        contentText: data.contentText,
        metaDescription: data.metaDescription,
        focusKeyword: data.focusKeyword,
        seoTitle: data.seoTitle,
        redirectUrl: data.redirectUrl,
        redirectType: data.redirectType,
        noIndex: data.noIndex,
        status: data.status,
        visibility: data.visibility,
        password: data.password,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        schemaJson: data.schemaJson,
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    await prisma.post.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}
