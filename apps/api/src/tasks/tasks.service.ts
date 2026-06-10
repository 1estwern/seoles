import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus, UserRole } from '@prisma/client';
import { MakeService } from '../integrations/make.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQuery } from './dto/list-tasks.query';
import { UpdateTaskDto } from './dto/update-task.dto';

const taskInclude = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, email: true, specialty: true } },
  links: true,
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private projects: ProjectsService,
    private make: MakeService,
  ) {}

  async list(query: ListTasksQuery, userId: string, role: UserRole) {
    const where: Prisma.TaskWhereInput = {};

    if (role !== UserRole.ADMIN) {
      where.project = { members: { some: { userId } } };
    }
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.query?.trim()) {
      const q = query.query.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async get(id: string, userId: string, role: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });
    if (!task) throw new NotFoundException('Task not found');
    await this.projects.getForUser(task.projectId, userId, role);
    return task;
  }

  async create(dto: CreateTaskDto, actor: { id: string; email: string; role: UserRole }) {
    await this.projects.getForUser(dto.projectId, actor.id, actor.role);
    const task = await this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
      },
      include: taskInclude,
    });

    await this.audit(task.id, actor.id, 'created', { after: task });
    if (task.assigneeId) {
      await this.notifyAssigned(task, actor.email);
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, actor: { id: string; email: string; role: UserRole }) {
    const before = await this.get(id, actor.id, actor.role);
    const data: Prisma.TaskUpdateInput = {};
    const changed: string[] = [];

    if (dto.title !== undefined && dto.title !== before.title) {
      data.title = dto.title;
      changed.push('title');
    }
    if (dto.description !== undefined && dto.description !== before.description) {
      data.description = dto.description;
      changed.push('description');
    }
    if (dto.status !== undefined && dto.status !== before.status) {
      data.status = dto.status;
      changed.push('status');
    }
    if (dto.priority !== undefined && dto.priority !== before.priority) {
      data.priority = dto.priority;
      changed.push('priority');
    }
    if (dto.dueDate !== undefined) {
      const next = dto.dueDate ? new Date(dto.dueDate) : null;
      const prev = before.dueDate?.toISOString() ?? null;
      if (next?.toISOString() !== prev) {
        data.dueDate = next;
        changed.push('dueDate');
      }
    }
    if (dto.assigneeId !== undefined && dto.assigneeId !== before.assigneeId) {
      data.assignee = dto.assigneeId
        ? { connect: { id: dto.assigneeId } }
        : { disconnect: true };
      changed.push('assigneeId');
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });

    if (changed.length) {
      await this.audit(id, actor.id, 'updated', { before, after: task, changed });
      const notifyFields = ['status', 'description', 'dueDate'];
      const shouldNotify = changed.some((f) => notifyFields.includes(f) || f === 'assigneeId');
      if (shouldNotify) {
        await this.notifyUpdated(task, actor.email, changed);
      }
      if (changed.includes('assigneeId') && task.assigneeId) {
        await this.notifyAssigned(task, actor.email);
      }
    }
    return task;
  }

  async addLink(taskId: string, dto: CreateLinkDto, actor: { id: string; role: UserRole }) {
    await this.get(taskId, actor.id, actor.role);
    return this.prisma.taskLink.create({
      data: { taskId, url: dto.url, title: dto.title },
    });
  }

  async auditLog(taskId: string, userId: string, role: UserRole) {
    await this.get(taskId, userId, role);
    return this.prisma.taskAudit.findMany({
      where: { taskId },
      include: { actor: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private audit(taskId: string, actorId: string, action: string, diff: object) {
    return this.prisma.taskAudit.create({
      data: { taskId, actorId, action, diffJson: diff as Prisma.InputJsonValue },
    });
  }

  private async notifyAssigned(
    task: { id: string; projectId: string; title: string; assignee?: { email: string } | null },
    actorEmail: string,
  ) {
    const memberEmails = await this.projects.memberEmails(task.projectId);
    const recipientEmails = [...new Set([task.assignee?.email, ...memberEmails].filter(Boolean))] as string[];
    await this.make.notify({
      event: 'task_assigned',
      taskId: task.id,
      projectId: task.projectId,
      title: task.title,
      assigneeEmail: task.assignee?.email ?? null,
      actorEmail,
      recipientEmails,
    });
  }

  private async notifyUpdated(
    task: { id: string; projectId: string; title: string; assignee?: { email: string } | null },
    actorEmail: string,
    changedFields: string[],
  ) {
    const memberEmails = await this.projects.memberEmails(task.projectId);
    const recipientEmails = [...new Set([task.assignee?.email, ...memberEmails].filter(Boolean))] as string[];
    await this.make.notify({
      event: 'task_updated',
      taskId: task.id,
      projectId: task.projectId,
      title: task.title,
      assigneeEmail: task.assignee?.email ?? null,
      changedFields,
      actorEmail,
      recipientEmails,
    });
  }
}
