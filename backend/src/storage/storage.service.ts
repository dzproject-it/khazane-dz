import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) {}

  // ─── SITES ───────────────────────
  findAllSites() {
    return this.prisma.site.findMany({
      where: { isActive: true },
      include: { _count: { select: { zones: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findSiteById(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: { zones: { include: { locations: true } } },
    });
    if (!site) throw new NotFoundException('Site introuvable');
    return site;
  }

  createSite(data: { code: string; name: string; type?: any; address?: string }) {
    return this.prisma.site.create({ data });
  }

  updateSite(id: string, data: any) {
    return this.prisma.site.update({ where: { id }, data });
  }

  deleteSite(id: string) {
    return this.prisma.site.update({ where: { id }, data: { isActive: false } });
  }

  // ─── ZONES ───────────────────────
  findZonesBySite(siteId: string) {
    return this.prisma.zone.findMany({
      where: { siteId, isActive: true },
      include: { _count: { select: { locations: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async findZoneById(id: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
      include: { site: true, locations: true },
    });
    if (!zone) throw new NotFoundException('Zone introuvable');
    return zone;
  }

  createZone(siteId: string, data: { code: string; name: string; type?: any }) {
    return this.prisma.zone.create({ data: { ...data, siteId } });
  }

  updateZone(id: string, data: { code?: string; name?: string; type?: any }) {
    return this.prisma.zone.update({ where: { id }, data });
  }

  deleteZone(id: string) {
    return this.prisma.zone.update({ where: { id }, data: { isActive: false } });
  }

  // ─── LOCATIONS ───────────────────
  findLocationsByZone(zoneId: string) {
    return this.prisma.location.findMany({
      where: { zoneId, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async findLocationById(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { zone: { include: { site: true } } },
    });
    if (!location) throw new NotFoundException('Emplacement introuvable');
    return location;
  }

  createLocation(zoneId: string, data: { code: string; label?: string; maxCapacity?: number }) {
    return this.prisma.location.create({ data: { ...data, zoneId } });
  }

  updateLocation(id: string, data: { code?: string; label?: string; maxCapacity?: number }) {
    return this.prisma.location.update({ where: { id }, data });
  }

  deleteLocation(id: string) {
    return this.prisma.location.update({ where: { id }, data: { isActive: false } });
  }
}
