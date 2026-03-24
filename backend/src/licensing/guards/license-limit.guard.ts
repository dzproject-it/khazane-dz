import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicensingService } from '../licensing.service';

export const LICENSE_LIMIT_KEY = 'license_limit';
export const LicenseLimit = (resource: 'users' | 'products' | 'sites') =>
  SetMetadata(LICENSE_LIMIT_KEY, resource);

@Injectable()
export class LicenseLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private licensingService: LicensingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<'users' | 'products' | 'sites'>(LICENSE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!resource) return true;

    const { allowed, current, max } = await this.licensingService.checkLimit(resource);
    if (!allowed) {
      throw new ForbiddenException(
        `Limite de licence atteinte : ${current}/${max} ${resource}. Mettez à niveau votre licence.`,
      );
    }
    return true;
  }
}
