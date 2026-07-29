export type EmailStatus = 'SCHEDULED' | 'SENT' | 'FAILED';

export interface EmailRecord {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  status: EmailStatus;
  scheduledAt: string;
  sentAt?: string | null;
  etherealPreviewUrl?: string | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEmailPayload {
  subject: string;
  body: string;
  recipients: string[];
  scheduledTime: string;
}

export interface StatsResponse {
  scheduled: number;
  sent: number;
  failed: number;
  total: number;
}
