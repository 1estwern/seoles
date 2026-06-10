import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { MakeService } from './make.service';

@Module({
  controllers: [IntegrationsController],
  providers: [MakeService],
  exports: [MakeService],
})
export class IntegrationsModule {}
