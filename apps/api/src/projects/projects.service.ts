import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) {
      return this.prisma.project.findMany({
        include: {
          members: { include: { user: { select: { id: true, email: true, specialty: true } } } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: { select: { id: true, email: true, specialty: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForUser(projectId: string, userId: string, role: UserRole) {
    await this.assertAccess(projectId, userId, role);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { include: { user: { select: { id: true, email: true, role: true, specialty: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, email: true } },
            links: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto, creatorId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        members: { create: { userId: creatorId, roleInProject: 'owner' } },
      },
      include: { members: true },
    });
  }

  async addMember(projectId: string, dto: AddMemberDto) {
    return this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: dto.userId } },
      create: {
        projectId,
        userId: dto.userId,
        roleInProject: dto.roleInProject,
      },
      update: { roleInProject: dto.roleInProject },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async memberEmails(projectId: string): Promise<string[]> {
    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { email: true } } },
    });
    return members.map((m) => m.user.email);
  }

  private async assertAccess(projectId: string, userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) return;
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member) throw new ForbiddenException('No access to this project');
  }
}
