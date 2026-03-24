import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class StorageController {
  constructor(private storageService: StorageService) {}

  // ─── SITES ───────────────────────
  @Get('sites')
  @ApiOperation({ summary: 'Lister les sites' })
  findAllSites() {
    return this.storageService.findAllSites();
  }

  @Get('sites/:id')
  @ApiOperation({ summary: 'Détail d\'un site avec zones et emplacements' })
  findSite(@Param('id') id: string) {
    return this.storageService.findSiteById(id);
  }

  @Post('sites')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Créer un site' })
  createSite(@Body() body: { code: string; name: string; type?: string; address?: string }) {
    return this.storageService.createSite(body);
  }

  @Put('sites/:id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Modifier un site' })
  updateSite(@Param('id') id: string, @Body() body: any) {
    return this.storageService.updateSite(id, body);
  }

  @Delete('sites/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer un site (soft-delete)' })
  deleteSite(@Param('id') id: string) {
    return this.storageService.deleteSite(id);
  }

  // ─── ZONES ───────────────────────
  @Get('sites/:siteId/zones')
  @ApiOperation({ summary: 'Zones d\'un site' })
  findZones(@Param('siteId') siteId: string) {
    return this.storageService.findZonesBySite(siteId);
  }

  @Get('zones/:id')
  @ApiOperation({ summary: 'Détail d\'une zone' })
  findZone(@Param('id') id: string) {
    return this.storageService.findZoneById(id);
  }

  @Post('sites/:siteId/zones')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Créer une zone' })
  createZone(@Param('siteId') siteId: string, @Body() body: { code: string; name: string; type?: string }) {
    return this.storageService.createZone(siteId, body);
  }

  @Put('zones/:id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Modifier une zone' })
  updateZone(@Param('id') id: string, @Body() body: { code?: string; name?: string; type?: string }) {
    return this.storageService.updateZone(id, body);
  }

  @Delete('zones/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer une zone (soft-delete)' })
  deleteZone(@Param('id') id: string) {
    return this.storageService.deleteZone(id);
  }

  // ─── LOCATIONS ───────────────────
  @Get('zones/:zoneId/locations')
  @ApiOperation({ summary: 'Emplacements d\'une zone' })
  findLocations(@Param('zoneId') zoneId: string) {
    return this.storageService.findLocationsByZone(zoneId);
  }

  @Get('locations/:id')
  @ApiOperation({ summary: 'Détail d\'un emplacement' })
  findLocation(@Param('id') id: string) {
    return this.storageService.findLocationById(id);
  }

  @Post('zones/:zoneId/locations')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Créer un emplacement' })
  createLocation(@Param('zoneId') zoneId: string, @Body() body: { code: string; label?: string; maxCapacity?: number }) {
    return this.storageService.createLocation(zoneId, body);
  }

  @Put('locations/:id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Modifier un emplacement' })
  updateLocation(@Param('id') id: string, @Body() body: { code?: string; label?: string; maxCapacity?: number }) {
    return this.storageService.updateLocation(id, body);
  }

  @Delete('locations/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer un emplacement (soft-delete)' })
  deleteLocation(@Param('id') id: string) {
    return this.storageService.deleteLocation(id);
  }
}
