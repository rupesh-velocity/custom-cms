import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const product = await prisma.product.create({
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
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        featuredImage: data.featuredImage || null,
        attributes: data.attributes && data.attributes.length > 0 ? {
          create: data.attributes.map((attr: any) => ({
            name: attr.name,
            options: attr.options,
            visible: attr.visible !== undefined ? attr.visible : true,
            variation: attr.variation !== undefined ? attr.variation : false,
            isGlobal: attr.isGlobal !== undefined ? attr.isGlobal : false
          }))
        } : undefined,
        variations: data.variations && data.variations.length > 0 ? {
          create: data.variations.map((v: any) => ({
            attributes: v.attributes,
            price: v.price ? parseFloat(v.price) : 0,
            salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
            sku: v.sku || null,
            manageStock: v.manageStock || false,
            stockQuantity: parseInt(v.stockQuantity) || 0
          }))
        } : undefined,
      },
      include: {
        attributes: true,
        variations: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
