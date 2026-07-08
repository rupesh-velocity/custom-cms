import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const taxes = await prisma.taxRate.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(taxes);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { country, state, city, zip, rate, name } = await req.json();

    if (!country || rate === undefined || !name) {
      return NextResponse.json({ error: 'Country, Rate, and Name are required' }, { status: 400 });
    }

    const newTax = await prisma.taxRate.create({
      data: {
        country,
        state: state || '*',
        city: city || '*',
        zip: zip || '*',
        rate: parseFloat(rate),
        name
      }
    });

    return NextResponse.json(newTax, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
