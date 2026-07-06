import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: slugify(data.title, { lower: true, strict: true }),
        description: data.description,
        type: data.type,
        price: data.price ? parseFloat(data.price) : 0,
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        sku: data.sku || null,
        manageStock: data.manageStock,
        stockQuantity: parseInt(data.stockQuantity) || 0,
        status: data.status,
        featuredImage: data.featuredImage || null,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
