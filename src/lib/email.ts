import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Velocity CMS" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendCoursePurchaseEmail(userEmail: string, courseName: string, amount: string) {
  const subject = `Your receipt for ${courseName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #5e3fde; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Thank you for your purchase!</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333; line-height: 1.5;">
          Your purchase of <strong>${courseName}</strong> was successful. You now have full access to this course.
        </p>
        <div style="background-color: #f6f7f7; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #111;">Order Details</h3>
          <p style="margin: 0; color: #555;">Course: ${courseName}</p>
          <p style="margin: 8px 0 0 0; color: #555;">Total Paid: <strong>$${amount}</strong></p>
        </div>
        <p style="font-size: 16px; color: #333; margin-top: 32px;">
          Happy learning!<br>
          <span style="color: #666;">- The Velocity Team</span>
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}
