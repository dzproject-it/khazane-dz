import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { LicensingService } from '../licensing.service';

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(private licensingService: LicensingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limits = await this.licensingService.getCurrent();

    if (!limits) {
      throw new ForbiddenException('Aucune licence active. Veuillez activer une clé de licence.');
    }

    if (!limits.isValid) {
      throw new ForbiddenException('Licence expirée. Veuillez renouveler votre licence.');
    }

    return true;
  }
}
