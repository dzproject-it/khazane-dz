import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/movement.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';

@ApiTags('Movements')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('movements')
export class MovementsController {
  constructor(private movementsService: MovementsService) {}

  @Get()
  @ApiOperation({ summary: 'Historique des mouvements' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'product_id', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'] })
  findAll(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('product_id') productId?: string,
    @Query('type') type?: string,
  ) {
    return this.movementsService.findAll(page || 1, perPage || 50, productId, undefined, type);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'OPERATOR')
  @ApiOperation({ summary: 'Enregistrer un mouvement de stock' })
  create(@Body() dto: CreateMovementDto, @Req() req: Request) {
    const user = req.user as any;
    return this.movementsService.create(dto, user.id);
  }
}
