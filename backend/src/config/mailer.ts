import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: nodemailer.Transporter;

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) {
    return transporter;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    console.log(`✉️  Using custom SMTP server: ${SMTP_HOST}:${SMTP_PORT}`);
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: parseInt(SMTP_PORT || '587', 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } else {
    console.log('✉️  No custom SMTP configured. Creating Nodemailer Ethereal Email test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log(`✅ Ethereal Test Account created! User: ${testAccount.user}`);
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

export function getSenderEmail(): string {
  return process.env.SENDER_EMAIL || 'noreply@emailscheduler.app';
}
