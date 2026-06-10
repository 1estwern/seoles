import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService {
  constructor(private config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('LLM_API_KEY'));
  }

  /**
   * MVP stub — returns placeholder until LLM_API_KEY is set.
   * Later: wire Anthropic Messages API or OpenAI chat completions.
   */
  async complete(userMessage: string, history: { role: string; content: string }[]): Promise<string> {
    const key = this.config.get<string>('LLM_API_KEY');
    if (!key) {
      return 'LLM not configured. Set LLM_API_KEY and LLM_PROVIDER in .env to enable AI replies.';
    }

    const provider = this.config.get<string>('LLM_PROVIDER') ?? 'claude';
    // Placeholder for future integration
    return `[${provider} stub] Received: "${userMessage.slice(0, 120)}..." (${history.length} prior messages). Implement provider call in LlmService.`;
  }
}
