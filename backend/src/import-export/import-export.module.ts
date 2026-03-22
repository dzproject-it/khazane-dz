import { Module } from '@nestjs/common';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';

@Module({
  providers: [ImportExportService],
  controllers: [ImportExportController],
})
export class ImportExportModule {}
