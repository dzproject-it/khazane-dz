import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, perPage = 50, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: { products: { include: { product: { select: { id: true, sku: true, name: true } } } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return { data, total, page, perPage };
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { products: { include: { product: { select: { id: true, sku: true, name: true } } } } },
    });
    if (!supplier) throw new NotFoundException('Fournisseur introuvable');
    return supplier;
  }

  private async generateCode(): Promise<string> {
    const last = await this.prisma.supplier.findFirst({
      where: { code: { startsWith: 'FOUR-' } },
      orderBy: { code: 'desc' },
    });
    const num = last ? parseInt(last.code.replace('FOUR-', ''), 10) + 1 : 1;
    return `FOUR-${String(num).padStart(4, '0')}`;
  }

  async create(dto: CreateSupplierDto) {
    const code = dto.code || await this.generateCode();
    const existing = await this.prisma.supplier.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`Le code fournisseur "${code}" existe déjà`);

    return this.prisma.supplier.create({
      data: { ...dto, code },
      include: { products: { include: { product: { select: { id: true, sku: true, name: true } } } } },
    });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findById(id);
    return this.prisma.supplier.update({
      where: { id },
      data: dto,
      include: { products: { include: { product: { select: { id: true, sku: true, name: true } } } } },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.supplier.delete({ where: { id } });
  }

  async linkProducts(supplierId: string, productIds: string[]) {
    await this.findById(supplierId);
    // Remove existing links, then re-create
    await this.prisma.productSupplier.deleteMany({ where: { supplierId } });
    if (productIds.length > 0) {
      await this.prisma.productSupplier.createMany({
        data: productIds.map((productId) => ({ productId, supplierId })),
        skipDuplicates: true,
      });
    }
    return this.findById(supplierId);
  }
}
