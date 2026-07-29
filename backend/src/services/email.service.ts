import { prisma } from '../config/db';
import { addEmailToQueue } from '../queue/email.queue';
import { z } from 'zod';

export const scheduleEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
  scheduledTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date/time format',
  }),
});

export type ScheduleEmailInput = z.infer<typeof scheduleEmailSchema>;

export class EmailService {
  static async scheduleEmails(input: ScheduleEmailInput) {
    const validated = scheduleEmailSchema.parse(input);
    const scheduledDate = new Date(validated.scheduledTime);

    const createdEmails = await Promise.all(
      validated.recipients.map(async (recipient) => {
        const emailRecord = await prisma.email.create({
          data: {
            recipient: recipient.trim().toLowerCase(),
            subject: validated.subject,
            body: validated.body,
            status: 'SCHEDULED',
            scheduledAt: scheduledDate,
          },
        });

        // Enqueue BullMQ delayed job
        await addEmailToQueue(emailRecord.id, scheduledDate);

        return emailRecord;
      })
    );

    return {
      count: createdEmails.length,
      emails: createdEmails,
    };
  }

  static async getScheduledEmails() {
    return prisma.email.findMany({
      where: {
        status: 'SCHEDULED',
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  static async getSentEmails() {
    return prisma.email.findMany({
      where: {
        status: {
          in: ['SENT', 'FAILED'],
        },
      },
      orderBy: [
        { sentAt: 'desc' },
        { updatedAt: 'desc' },
      ],
    });
  }

  static async getStats() {
    const [scheduledCount, sentCount, failedCount, totalCount] = await Promise.all([
      prisma.email.count({ where: { status: 'SCHEDULED' } }),
      prisma.email.count({ where: { status: 'SENT' } }),
      prisma.email.count({ where: { status: 'FAILED' } }),
      prisma.email.count(),
    ]);

    return {
      scheduled: scheduledCount,
      sent: sentCount,
      failed: failedCount,
      total: totalCount,
    };
  }
}
