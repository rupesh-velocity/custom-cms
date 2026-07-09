import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

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

    const submission = await prisma.formSubmission.create({
      data: {
        formId: parseInt(formId),
        data: JSON.stringify(data)
      }
    });

    if (form.notificationEmail) {
      const emails = form.notificationEmail.split(',').map((e: string) => e.trim()).filter(Boolean);
      
      if (emails.length > 0) {
        // Fetch SMTP settings
        const smtpSettings = await prisma.setting.findMany({
            where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'from_email'] } }
          });
          const smtpMap = smtpSettings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
          
          const host = smtpMap.smtp_host || process.env.SMTP_HOST;
          const port = parseInt(smtpMap.smtp_port || process.env.SMTP_PORT || '587');
          const user = smtpMap.smtp_user || process.env.SMTP_USER;
          const pass = smtpMap.smtp_pass || process.env.SMTP_PASS;
          const from = smtpMap.from_email || process.env.SMTP_FROM || user || 'noreply@example.com';
          
          if (host && user && pass) {
            const transporter = nodemailer.createTransport({
              host,
              port,
              secure: port === 465,
              auth: { user, pass }
            });
            
            let fields = [];
            try { fields = JSON.parse(form.fields || '[]'); } catch(e) {}

            let htmlContent = `<table border="1" cellpadding="10" cellspacing="0" style="width:100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px; border-color: #e5e7eb;">`;
            for (const key in data) {
              const field = fields.find((f: any) => f.id === key);
              const label = field ? field.label : key;
              let val = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
              htmlContent += `<tr><td style="background-color: #f1f5f9; font-weight: 700; color: #333; border-bottom: none;">${label}</td></tr>`;
              htmlContent += `<tr><td style="background-color: #ffffff; padding-left: 20px; color: #555;">${val || ''}</td></tr>`;
            }
            htmlContent += `</table>`;
            
            try {
              await transporter.sendMail({
                from: `"${form.title}" <${from}>`,
                to: emails.join(', '),
                subject: `New submission: ${form.title}`,
                html: htmlContent
              });
            } catch (err) {
              console.error("Failed to send email notification", err);
            }
          }
        }
      }

    return NextResponse.json({ success: true, message: 'Thank you for your submission!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}
