import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const products = await prisma.product.findMany({
      where: search ? {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
