import axios from 'axios';
import { EmailRecord, ScheduleEmailPayload, StatsResponse } from '../types/email';

const API_BASE = '/api/emails';

export const emailApi = {
  scheduleEmails: async (payload: ScheduleEmailPayload) => {
    const response = await axios.post<{ success: boolean; message: string; data: { count: number } }>(
      `${API_BASE}/schedule`,
      payload
    );
    return response.data;
  },

  getScheduledEmails: async (): Promise<EmailRecord[]> => {
    const response = await axios.get<{ success: boolean; data: EmailRecord[] }>(`${API_BASE}/scheduled`);
    return response.data.data;
  },

  getSentEmails: async (): Promise<EmailRecord[]> => {
    const response = await axios.get<{ success: boolean; data: EmailRecord[] }>(`${API_BASE}/sent`);
    return response.data.data;
  },

  getStats: async (): Promise<StatsResponse> => {
    const response = await axios.get<{ success: boolean; data: StatsResponse }>(`${API_BASE}/stats`);
    return response.data.data;
  },
};
