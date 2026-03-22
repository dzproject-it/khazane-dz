import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertStatus } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: AlertStatus) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.alert.findMany({
      where,
      include: {
        threshold: { include: { product: { select: { sku: true, name: true } }, site: true } },
      },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  async acknowledge(id: string, userId: string) {
    return this.prisma.alert.update({
      where: { id },
      data: { status: AlertStatus.ACKNOWLEDGED, acknowledgedBy: userId },
    });
  }

  async resolve(id: string) {
    return this.prisma.alert.update({
      where: { id },
      data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
    });
  }

  /** Appelé après chaque mouvement pour vérifier les seuils */
  async checkThresholds(productId: string) {
    const thresholds = await this.prisma.stockThreshold.findMany({
      where: { productId, isActive: true },
    });

    for (const threshold of thresholds) {
      // Somme du stock pour ce produit (filtré par site si applicable)
      const stockAgg = await this.prisma.stockLevel.aggregate({
        where: {
          productId,
          ...(threshold.siteId
            ? { location: { zone: { siteId: threshold.siteId } } }
            : {}),
        },
        _sum: { quantity: true },
      });

      const currentQty = stockAgg._sum.quantity || 0;

      if (currentQty <= threshold.minQuantity) {
        // Vérifier qu'une alerte active n'existe pas déjà
        const existing = await this.prisma.alert.findFirst({
          where: { thresholdId: threshold.id, status: AlertStatus.TRIGGERED },
        });

        if (!existing) {
          await this.prisma.alert.create({
            data: { thresholdId: threshold.id, currentQty },
          });
        }
      }
    }
  }
}
