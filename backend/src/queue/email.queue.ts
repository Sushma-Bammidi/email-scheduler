import { Queue } from 'bullmq';
import { redisOptions } from '../config/redis';

export const QUEUE_NAME = 'email-scheduler-queue';

export const emailQueue = new Queue(QUEUE_NAME, {
  connection: redisOptions,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export async function addEmailToQueue(emailId: string, scheduledTime: Date) {
  const now = Date.now();
  const targetTime = new Date(scheduledTime).getTime();
  const delay = Math.max(0, targetTime - now);

  const job = await emailQueue.add(
    'send-email-job',
    { emailId },
    {
      delay,
      jobId: `email-${emailId}`, // unique job ID per email record
    }
  );

  console.log(`📌 Queued email job [ID: ${emailId}] with delay: ${delay}ms (Scheduled for: ${scheduledTime.toISOString()})`);
  return job;
}
