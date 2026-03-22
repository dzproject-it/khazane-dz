import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FieldType } from '@prisma/client';

@Injectable()
export class CustomFieldsService {
  constructor(private prisma: PrismaService) {}

  findAll(categoryId?: string) {
    const where: any = {};
    if (categoryId) {
      where.OR = [{ appliesToCategoryId: categoryId }, { appliesToCategoryId: null }];
    }
    return this.prisma.customFieldDef.findMany({
      where,
      include: { options: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: {
    name: string;
    fieldType: FieldType;
    isRequired?: boolean;
    appliesToCategoryId?: string;
    options?: string[];
  }) {
    const { options, ...fieldData } = data;
    return this.prisma.customFieldDef.create({
      data: {
        ...fieldData,
        options: options
          ? { create: options.map((label, i) => ({ label, sortOrder: i })) }
          : undefined,
      },
      include: { options: true },
    });
  }

  async delete(id: string) {
    const field = await this.prisma.customFieldDef.findUnique({ where: { id } });
    if (!field) throw new NotFoundException('Champ personnalisé introuvable');
    await this.prisma.customFieldDef.delete({ where: { id } });
    return { deleted: true };
  }
}
