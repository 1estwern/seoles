import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: { id: string; role: UserRole }) {
    return this.projects.listForUser(user.id, user.role);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: { id: string }) {
    return this.projects.create(dto, user.id);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.projects.getForUser(id, user.id, user.role);
  }

  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.projects.addMember(id, dto);
  }
}
