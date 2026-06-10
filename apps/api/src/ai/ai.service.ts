import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AiMessageRole } from '@prisma/client';
import { LlmService } from '../llm/llm.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private llm: LlmService,
  ) {}

  listConversations(userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  }

  createConversation(userId: string, dto: CreateConversationDto) {
    return this.prisma.aiConversation.create({
      data: { userId, title: dto.title ?? 'Новый диалог' },
    });
  }

  async getConversation(id: string, userId: string) {
    const conv = await this.prisma.aiConversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.userId !== userId) throw new ForbiddenException('Private conversation');
    return conv;
  }

  async sendMessage(conversationId: string, userId: string, dto: SendMessageDto) {
    const conv = await this.prisma.aiConversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.userId !== userId) throw new ForbiddenException('Private conversation');

    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: AiMessageRole.USER,
        content: dto.content,
      },
    });

    const history = await this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 40,
    });

    const reply = await this.llm.complete(
      dto.content,
      history.map((m) => ({ role: m.role, content: m.content })),
    );

    const assistant = await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: AiMessageRole.ASSISTANT,
        content: reply,
      },
    });

    return { userMessage: dto.content, assistant };
  }
}
