import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { LicensingService } from './licensing.service';
import { ActivateLicenseDto } from './dto/activate-license.dto';

@ApiTags('Licensing')
@Controller('licensing')
export class LicensingController {
  constructor(private licensingService: LicensingService) {}

  @Get('status')
  @ApiOperation({ summary: 'Public: check if app is licensed' })
  getStatus() {
    return this.licensingService.getStatus();
  }

  @Post('activate')
  @ApiOperation({ summary: 'Public: activate a license key (first-time setup or renewal)' })
  activate(@Body() dto: ActivateLicenseDto) {
    return this.licensingService.activate(dto);
  }

  @Get('current')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current active license info' })
  getCurrent() {
    return this.licensingService.getCurrent();
  }

  @Get('limits/:resource')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Check license limit for a resource' })
  checkLimit(@Param('resource') resource: 'users' | 'products' | 'sites') {
    return this.licensingService.checkLimit(resource);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all licenses (admin)' })
  findAll() {
    return this.licensingService.findAll();
  }

  @Delete(':id/revoke')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke a license' })
  revoke(@Param('id') id: string) {
    return this.licensingService.revoke(id);
  }
}
