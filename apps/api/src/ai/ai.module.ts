import { Module } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService, LlmService],
})
export class AiModule {}
