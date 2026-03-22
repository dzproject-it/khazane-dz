import { Controller, Get, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ImportExportService } from './import-export.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Response } from 'express';

@ApiTags('Import / Export')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class ImportExportController {
  constructor(private importExportService: ImportExportService) {}

  @Post('import/products')
  @Roles('ADMIN', 'MANAGER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Importer des produits via CSV' })
  importProducts(@UploadedFile() file: Express.Multer.File) {
    return this.importExportService.importProductsCsv(file.buffer);
  }

  @Get('export/products')
  @ApiOperation({ summary: 'Exporter les produits en XLSX' })
  exportProducts(@Res() res: Response) {
    return this.importExportService.exportProductsXlsx(res);
  }

  @Get('export/movements')
  @ApiOperation({ summary: 'Exporter les mouvements en CSV' })
  exportMovements(@Res() res: Response) {
    return this.importExportService.exportMovementsCsv(res);
  }

  @Get('export/suppliers')
  @ApiOperation({ summary: 'Exporter les fournisseurs en XLSX' })
  exportSuppliers(@Res() res: Response) {
    return this.importExportService.exportSuppliersXlsx(res);
  }

  @Get('export/clients')
  @ApiOperation({ summary: 'Exporter les clients en XLSX' })
  exportClients(@Res() res: Response) {
    return this.importExportService.exportClientsXlsx(res);
  }
}
