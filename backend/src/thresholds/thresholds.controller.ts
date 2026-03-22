import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ThresholdsService } from './thresholds.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Thresholds')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('thresholds')
export class ThresholdsController {
  constructor(private thresholdsService: ThresholdsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les seuils' })
  findAll(@Query('product_id') productId?: string) {
    return this.thresholdsService.findAll(productId);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Créer un seuil' })
  create(@Body() body: any) {
    return this.thresholdsService.create(body);
  }

  @Put(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Modifier un seuil' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.thresholdsService.update(id, body);
  }
}
