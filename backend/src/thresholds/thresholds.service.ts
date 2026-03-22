import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThresholdsService {
  constructor(private prisma: PrismaService) {}

  findAll(productId?: string) {
    const where: any = { isActive: true };
    if (productId) where.productId = productId;
    return this.prisma.stockThreshold.findMany({
      where,
      include: { product: { select: { sku: true, name: true } }, site: true },
    });
  }

  create(data: {
    productId: string;
    siteId?: string;
    minQuantity: number;
    safetyQuantity: number;
    maxQuantity?: number;
    reorderPoint: number;
  }) {
    return this.prisma.stockThreshold.create({
      data,
      include: { product: true, site: true },
    });
  }

  update(id: string, data: any) {
    return this.prisma.stockThreshold.update({ where: { id }, data });
  }
}
