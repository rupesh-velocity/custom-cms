import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const page = await prisma.page.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching page' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params;
    const data = await req.json();
    const page = await prisma.page.update({
      where: { id: parseInt(params.id) },
      data: {
        title: data.title,
        slug: data.slug,
        contentHtml: data.contentHtml,
        contentText: data.contentText,
        metaDescription: data.metaDescription,
        focusKeyword: data.focusKeyword,
        status: data.status,
        hideTitle: data.hideTitle,
      },
    });
    return NextResponse.json(page);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error updating page' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    await prisma.page.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting page' }, { status: 500 });
  }
}
