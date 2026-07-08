import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {

    const zones = await prisma.shippingZone.findMany({
      include: {
        methods: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(zones);
  } catch (error) {
    console.error('Failed to fetch shipping zones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, regions } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newZone = await prisma.shippingZone.create({
      data: {
        name,
        regions: JSON.stringify(regions || []),
      },
      include: {
        methods: true
      }
    });

    return NextResponse.json(newZone, { status: 201 });
  } catch (error) {
    console.error('Failed to create shipping zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
