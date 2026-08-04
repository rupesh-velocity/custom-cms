import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.schemaTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, schema } = await request.json();
    const template = await prisma.schemaTemplate.create({
      data: {
        name,
        schema: typeof schema === 'string' ? schema : JSON.stringify(schema)
      }
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
