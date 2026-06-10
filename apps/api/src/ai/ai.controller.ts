import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('ai/conversations')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private ai: AiService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.ai.listConversations(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateConversationDto) {
    return this.ai.createConversation(user.id, dto);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.ai.getConversation(id, user.id);
  }

  @Post(':id/messages')
  send(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SendMessageDto,
  ) {
    return this.ai.sendMessage(id, user.id, dto);
  }
}
