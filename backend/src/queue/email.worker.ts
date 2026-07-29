import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { QUEUE_NAME } from './email.queue';
import { redisOptions } from '../config/redis';
import { prisma } from '../config/db';
import { getTransporter, getSenderEmail } from '../config/mailer';

interface EmailJobData {
  emailId: string;
}

export function initEmailWorker() {
  const worker = new Worker<EmailJobData>(
    QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      const { emailId } = job.data;
      console.log(`🚀 [Worker] Processing email job for Email ID: ${emailId}`);

      const email = await prisma.email.findUnique({
        where: { id: emailId },
      });

      if (!email) {
        console.warn(`⚠️ [Worker] Email ID ${emailId} not found in database.`);
        return;
      }

      if (email.status === 'SENT') {
        console.log(`ℹ️ [Worker] Email ID ${emailId} was already sent.`);
        return;
      }

      try {
        const transporter = await getTransporter();
        const sender = getSenderEmail();

        const info = await transporter.sendMail({
          from: `"Email Scheduler" <${sender}>`,
          to: email.recipient,
          subject: email.subject,
          text: email.body,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
            <h2 style="color: #4f46e5;">${email.subject}</h2>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
              ${email.body.replace(/\n/g, '<br/>')}
            </div>
            <hr style="margin-top: 24px; border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #6b7280;">Sent via Email Scheduler MVP at ${new Date().toLocaleString()}</p>
          </div>`,
        });

        const etherealUrl = nodemailer.getTestMessageUrl(info);
        const previewUrl = etherealUrl ? etherealUrl.toString() : null;

        await prisma.email.update({
          where: { id: emailId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            etherealPreviewUrl: previewUrl,
            error: null,
          },
        });

        console.log(`✅ [Worker] Email sent successfully to ${email.recipient}!`);
        if (previewUrl) {
          console.log(`🔗 [Ethereal Preview URL]: ${previewUrl}`);
        }
      } catch (error: any) {
        console.error(`❌ [Worker] Failed to send email ID ${emailId}:`, error);

        await prisma.email.update({
          where: { id: emailId },
          data: {
            status: 'FAILED',
            error: error?.message || 'Unknown error occurred while sending email',
          },
        });

        throw error; // Let BullMQ handle retries if configured
      }
    },
    {
      connection: redisOptions,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`🎉 [Worker] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 [Worker] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}
