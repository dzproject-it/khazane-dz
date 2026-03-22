import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockLevelsService } from './stock-levels.service';

@ApiTags('Stock Levels')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('stock-levels')
export class StockLevelsController {
  constructor(private stockLevelsService: StockLevelsService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Stock par emplacement pour un produit' })
  findByProduct(@Param('productId') productId: string) {
    return this.stockLevelsService.findByProduct(productId);
  }

  @Get('site/:siteId')
  @ApiOperation({ summary: 'Tous les niveaux de stock d\'un site' })
  findBySite(@Param('siteId') siteId: string) {
    return this.stockLevelsService.findBySite(siteId);
  }
}
