import { Request, Response } from 'express';
import { EmailService } from '../services/email.service';
import { ZodError } from 'zod';

export class EmailController {
  static async schedule(req: Request, res: Response) {
    try {
      const result = await EmailService.scheduleEmails(req.body);
      return res.status(201).json({
        success: true,
        message: `Successfully scheduled ${result.count} email(s)`,
        data: result,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
      }

      console.error('Error scheduling email:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while scheduling email',
      });
    }
  }

  static async getScheduled(req: Request, res: Response) {
    try {
      const emails = await EmailService.getScheduledEmails();
      return res.status(200).json({
        success: true,
        data: emails,
      });
    } catch (error: any) {
      console.error('Error fetching scheduled emails:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch scheduled emails',
      });
    }
  }

  static async getSent(req: Request, res: Response) {
    try {
      const emails = await EmailService.getSentEmails();
      return res.status(200).json({
        success: true,
        data: emails,
      });
    } catch (error: any) {
      console.error('Error fetching sent emails:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sent emails',
      });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await EmailService.getStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching email stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch stats',
      });
    }
  }
}
