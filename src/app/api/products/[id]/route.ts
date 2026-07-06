import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(resolvedParams.id) },
      include: { categories: true }
    });
    
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const data = await req.json();
    
    const product = await prisma.product.update({
      where: { id: parseInt(resolvedParams.id) },
      data: {
        title: data.title,
        slug: data.slug || slugify(data.title, { lower: true, strict: true }),
        description: data.description,
        type: data.type,
        price: data.price ? parseFloat(data.price) : 0,
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        sku: data.sku || null,
        manageStock: data.manageStock,
        stockQuantity: parseInt(data.stockQuantity) || 0,
        status: data.status,
        featuredImage: data.featuredImage || null,
      }
    });
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.product.delete({
      where: { id: parseInt(resolvedParams.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
