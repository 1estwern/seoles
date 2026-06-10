import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type MakeNotifyPayload = {
  event: 'task_assigned' | 'task_updated';
  taskId: string;
  projectId: string;
  title: string;
  assigneeEmail?: string | null;
  changedFields?: string[];
  actorEmail: string;
  recipientEmails: string[];
};

@Injectable()
export class MakeService {
  private readonly logger = new Logger(MakeService.name);

  constructor(private config: ConfigService) {}

  async notify(payload: MakeNotifyPayload) {
    const url = this.config.get<string>('MAKE_WEBHOOK_URL');
    if (!url) {
      this.logger.debug(`Make webhook skipped (no URL): ${payload.event}`);
      return { sent: false };
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, sentAt: new Date().toISOString() }),
      });
      if (!res.ok) {
        this.logger.warn(`Make webhook HTTP ${res.status}`);
        return { sent: false, status: res.status };
      }
      return { sent: true };
    } catch (err) {
      this.logger.error('Make webhook failed', err);
      return { sent: false };
    }
  }
}
