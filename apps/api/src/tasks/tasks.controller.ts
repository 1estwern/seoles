import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQuery } from './dto/list-tasks.query';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  list(@Query() query: ListTasksQuery, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.tasks.list(query, user.id, user.role);
  }

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: { id: string; email: string; role: UserRole },
  ) {
    return this.tasks.create(dto, user);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.tasks.get(id, user.id, user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: { id: string; email: string; role: UserRole },
  ) {
    return this.tasks.update(id, dto, user);
  }

  @Post(':id/links')
  addLink(
    @Param('id') id: string,
    @Body() dto: CreateLinkDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.tasks.addLink(id, dto, user);
  }

  @Get(':id/audit')
  audit(@Param('id') id: string, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.tasks.auditLog(id, user.id, user.role);
  }
}
