import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(userId: string, action: string, entityType: string, entityId: string, payload?: any, ipAddress?: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType, entityId, payload, ipAddress },
    });
  }

  findAll(page = 1, perPage = 50, entityType?: string) {
    const where: any = {};
    if (entityType) where.entityType = entityType;
    return this.prisma.auditLog.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
