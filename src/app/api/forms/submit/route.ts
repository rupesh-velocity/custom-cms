import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { formId, data } = await req.json();
    
    if (!formId) return NextResponse.json({ error: 'Missing formId' }, { status: 400 });

    const form = await prisma.form.findUnique({ where: { id: parseInt(formId) } });
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    await prisma.formSubmission.create({
      data: {
        formId: parseInt(formId),
        data: JSON.stringify(data)
      }
    });

    return NextResponse.json({ success: true, message: 'Thank you for your submission!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}
