import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { formId, data, recaptchaToken } = await req.json();
    
    if (!formId) return NextResponse.json({ error: 'Missing formId' }, { status: 400 });

    const form = await prisma.form.findUnique({ where: { id: parseInt(formId) } });
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    if (form.settings) {
      const settings = JSON.parse(form.settings);
      if (settings.enableRecaptchaV3 && settings.recaptchaSecretKey) {
        if (!recaptchaToken) return NextResponse.json({ error: 'reCAPTCHA token missing' }, { status: 400 });
        
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${settings.recaptchaSecretKey}&response=${recaptchaToken}`;
        const verifyRes = await fetch(verifyUrl, { method: 'POST' });
        const verifyData = await verifyRes.json();
        
        if (!verifyData.success || verifyData.score < 0.5) {
          return NextResponse.json({ error: 'Spam detected by reCAPTCHA.' }, { status: 400 });
        }
      }
    }

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
