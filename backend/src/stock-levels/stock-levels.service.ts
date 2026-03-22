import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockLevelsService {
  constructor(private prisma: PrismaService) {}

  findByProduct(productId: string) {
    return this.prisma.stockLevel.findMany({
      where: { productId },
      include: { location: { include: { zone: { include: { site: true } } } } },
    });
  }

  findBySite(siteId: string) {
    return this.prisma.stockLevel.findMany({
      where: { location: { zone: { siteId } } },
      include: { product: true, location: { include: { zone: true } } },
      orderBy: { product: { name: 'asc' } },
    });
  }

  findLowStock(siteId?: string) {
    return this.prisma.$queryRaw`
      SELECT sl.*, p.sku, p.name as product_name, st.min_quantity, st.safety_quantity
      FROM stock_levels sl
      JOIN products p ON p.id = sl.product_id
      JOIN stock_thresholds st ON st.product_id = sl.product_id AND st.is_active = true
      JOIN locations l ON l.id = sl.location_id
      JOIN zones z ON z.id = l.zone_id
      WHERE sl.quantity <= st.min_quantity
      ${siteId ? this.prisma.$queryRaw`AND z.site_id = ${siteId}` : this.prisma.$queryRaw``}
      ORDER BY (sl.quantity / NULLIF(st.min_quantity, 0)) ASC
    `;
  }
}
