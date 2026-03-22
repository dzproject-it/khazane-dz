import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/movement.dto';
import { MovementType, Prisma } from '@prisma/client';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, perPage = 50, productId?: string, siteId?: string, type?: string) {
    const where: any = {};
    if (productId) where.productId = productId;
    if (type && ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].includes(type)) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          product: { select: { sku: true, name: true } },
          sourceLocation: { include: { zone: { include: { site: true } } } },
          destLocation: { include: { zone: { include: { site: true } } } },
          performer: { select: { name: true, email: true } },
          client: { select: { id: true, code: true, name: true } },
          supplier: { select: { id: true, code: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return { data, total, page, perPage };
  }

  async create(dto: CreateMovementDto, userId: string) {
    this.validateMovement(dto);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Créer le mouvement (immuable)
      const movement = await tx.stockMovement.create({
        data: { ...dto, performedBy: userId },
        include: { product: true, sourceLocation: true, destLocation: true },
      });

      // Mettre à jour les niveaux de stock
      if (dto.type === MovementType.IN && dto.destLocationId) {
        await this.upsertStockLevel(tx, dto.productId, dto.destLocationId, dto.quantity);
      } else if (dto.type === MovementType.OUT && dto.sourceLocationId) {
        await this.upsertStockLevel(tx, dto.productId, dto.sourceLocationId, -dto.quantity);
      } else if (dto.type === MovementType.TRANSFER && dto.sourceLocationId && dto.destLocationId) {
        await this.upsertStockLevel(tx, dto.productId, dto.sourceLocationId, -dto.quantity);
        await this.upsertStockLevel(tx, dto.productId, dto.destLocationId, dto.quantity);
      } else if (dto.type === MovementType.ADJUSTMENT && dto.destLocationId) {
        // L'ajustement fixe la quantité via le delta
        await this.upsertStockLevel(tx, dto.productId, dto.destLocationId, dto.quantity);
      }

      return movement;
    });
  }

  private validateMovement(dto: CreateMovementDto) {
    if (dto.type === MovementType.IN && !dto.destLocationId) {
      throw new BadRequestException('Une entrée nécessite un emplacement de destination');
    }
    if (dto.type === MovementType.OUT && !dto.sourceLocationId) {
      throw new BadRequestException('Une sortie nécessite un emplacement source');
    }
    if (dto.type === MovementType.TRANSFER && (!dto.sourceLocationId || !dto.destLocationId)) {
      throw new BadRequestException('Un transfert nécessite source et destination');
    }
    if (dto.quantity <= 0) {
      throw new BadRequestException('La quantité doit être positive');
    }
  }

  private async upsertStockLevel(tx: Prisma.TransactionClient, productId: string, locationId: string, delta: number) {
    const existing = await tx.stockLevel.findUnique({
      where: { productId_locationId: { productId, locationId } },
    });

    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty < 0) {
        throw new BadRequestException(`Stock insuffisant (disponible: ${existing.quantity})`);
      }
      await tx.stockLevel.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      if (delta < 0) {
        throw new BadRequestException('Impossible de retirer du stock inexistant');
      }
      await tx.stockLevel.create({
        data: { productId, locationId, quantity: delta },
      });
    }
  }
}
