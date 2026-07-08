import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { country, state, city, zip, rate, name } = await req.json();

    if (!country || rate === undefined || !name) {
      return NextResponse.json({ error: 'Country, Rate, and Name are required' }, { status: 400 });
    }

    const updatedTax = await prisma.taxRate.update({
      where: { id: parseInt(id) },
      data: {
        country,
        state: state || '*',
        city: city || '*',
        zip: zip || '*',
        rate: parseFloat(rate),
        name
      }
    });

    return NextResponse.json(updatedTax);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.taxRate.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
