import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, perPage = 50, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { taxId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: { _count: { select: { movements: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, perPage };
  }

  async findById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { _count: { select: { movements: true } } },
    });
    if (!client) throw new NotFoundException('Client introuvable');
    return client;
  }

  private async generateCode(): Promise<string> {
    const last = await this.prisma.client.findFirst({
      where: { code: { startsWith: 'CLI-' } },
      orderBy: { code: 'desc' },
    });
    const num = last ? parseInt(last.code.replace('CLI-', ''), 10) + 1 : 1;
    return `CLI-${String(num).padStart(4, '0')}`;
  }

  async create(dto: CreateClientDto) {
    const code = dto.code || await this.generateCode();
    const existing = await this.prisma.client.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`Le code client "${code}" existe déjà`);

    return this.prisma.client.create({ data: { ...dto, code } as any });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findById(id);
    return this.prisma.client.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.client.delete({ where: { id } });
  }
}
