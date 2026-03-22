import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, perPage = 50, search?: string, categoryId?: string) {
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          category: true,
          customFieldValues: { include: { fieldDef: true, option: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, perPage };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        customFieldValues: { include: { fieldDef: true, option: true } },
        stockLevels: { include: { location: { include: { zone: { include: { site: true } } } } } },
        thresholds: true,
      },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async create(dto: CreateProductDto) {
    const { customFields, ...productData } = dto;
    return this.prisma.product.create({
      data: {
        ...productData,
        customFieldValues: customFields
          ? {
              create: customFields.map((cf) => ({
                fieldDefId: cf.fieldDefId,
                ...(typeof cf.value === 'string' ? { valueText: cf.value } : {}),
                ...(typeof cf.value === 'number' ? { valueNumber: cf.value } : {}),
                ...(cf.value instanceof Date ? { valueDate: cf.value } : {}),
              })),
            }
          : undefined,
      },
      include: { category: true, customFieldValues: { include: { fieldDef: true } } },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const { customFields, ...productData } = dto;
    await this.findById(id);

    if (customFields) {
      for (const cf of customFields) {
        await this.prisma.productCustomFieldValue.upsert({
          where: { productId_fieldDefId: { productId: id, fieldDefId: cf.fieldDefId } },
          update: {
            valueText: typeof cf.value === 'string' ? cf.value : null,
            valueNumber: typeof cf.value === 'number' ? cf.value : null,
            valueDate: cf.value instanceof Date ? cf.value : null,
          },
          create: {
            productId: id,
            fieldDefId: cf.fieldDefId,
            valueText: typeof cf.value === 'string' ? cf.value : null,
            valueNumber: typeof cf.value === 'number' ? cf.value : null,
            valueDate: cf.value instanceof Date ? cf.value : null,
          },
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: productData,
      include: { category: true, customFieldValues: { include: { fieldDef: true } } },
    });
  }
}
