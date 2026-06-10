import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MakeNotifyPayload, MakeService } from './make.service';

@Controller('integrations/make')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class IntegrationsController {
  constructor(private make: MakeService) {}

  /** Manual test hook for Make scenario */
  @Post('notify')
  notify(@Body() body: MakeNotifyPayload) {
    return this.make.notify(body);
  }
}
