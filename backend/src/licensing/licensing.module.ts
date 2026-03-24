import { Module } from '@nestjs/common';
import { LicensingService } from './licensing.service';
import { LicensingController } from './licensing.controller';
import { LicenseGuard } from './guards/license.guard';
import { LicenseLimitGuard } from './guards/license-limit.guard';

@Module({
  controllers: [LicensingController],
  providers: [LicensingService, LicenseGuard, LicenseLimitGuard],
  exports: [LicensingService, LicenseGuard, LicenseLimitGuard],
})
export class LicensingModule {}
