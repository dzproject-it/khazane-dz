import { Controller, Get, Patch, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AlertStatus } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les alertes' })
  findAll(@Query('status') status?: AlertStatus) {
    return this.alertsService.findAll(status);
  }

  @Patch(':id/acknowledge')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Acquitter une alerte' })
  acknowledge(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.alertsService.acknowledge(id, user.id);
  }

  @Patch(':id/resolve')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Résoudre une alerte' })
  resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }
}
