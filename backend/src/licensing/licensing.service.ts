import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LicensePlan, LicenseStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ActivateLicenseDto } from './dto/activate-license.dto';

export interface LicenseLimits {
  plan: LicensePlan;
  maxUsers: number;
  maxProducts: number;
  maxSites: number;
  expiresAt: Date;
  isValid: boolean;
}

const PLAN_DEFAULTS: Record<LicensePlan, { maxUsers: number; maxProducts: number; maxSites: number }> = {
  TRIAL: { maxUsers: 2, maxProducts: 50, maxSites: 1 },
  PRO: { maxUsers: 10, maxProducts: 500, maxSites: 5 },
  ENTERPRISE: { maxUsers: 100, maxProducts: 10000, maxSites: 50 },
};

const PLAN_MAP: Record<string, LicensePlan> = { T: 'TRIAL', P: 'PRO', E: 'ENTERPRISE' };

@Injectable()
export class LicensingService {
  private readonly secret: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.secret = this.config.get<string>('LICENSE_SECRET', 'khazane-license-secret-key');
  }

  /**
   * Verify a license key HMAC signature offline.
   */
  verifyKeySignature(key: string): boolean {
    const parts = key.split('-');
    if (parts.length !== 4 || parts[0] !== 'KHZN') return false;
    const payload = `${parts[0]}-${parts[1]}-${parts[2]}`;
    const expected = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex')
      .slice(0, 4)
      .toUpperCase();
    return crypto.timingSafeEqual(Buffer.from(parts[3]), Buffer.from(expected));
  }

  /**
   * Decode plan and duration from a license key.
   * Key format: KHZN-PDDD-RRRR-HHHH
   *   P = plan code (T/P/E), DDD = duration in base36, RRRR = random, HHHH = HMAC
   */
  decodeKey(key: string): { plan: LicensePlan; durationDays: number } | null {
    const parts = key.split('-');
    if (parts.length !== 4 || parts[0] !== 'KHZN') return null;

    const planChar = parts[1].charAt(0);
    const plan = PLAN_MAP[planChar];
    if (!plan) return null;

    const durationB36 = parts[1].slice(1);
    const durationDays = parseInt(durationB36, 36);
    if (isNaN(durationDays) || durationDays < 1) return null;

    return { plan, durationDays };
  }

  /**
   * Activate a license key: verify signature, decode plan/duration,
   * then CREATE the license record in DB.
   * The key is generated externally via scripts/generate-license.js.
   */
  async activate(dto: ActivateLicenseDto) {
    if (!this.verifyKeySignature(dto.licenseKey)) {
      throw new BadRequestException('Clé de licence invalide');
    }

    // Check if this key was already used
    const existing = await this.prisma.license.findUnique({
      where: { licenseKey: dto.licenseKey },
    });
    if (existing) {
      throw new BadRequestException('Cette clé de licence a déjà été utilisée');
    }

    const decoded = this.decodeKey(dto.licenseKey);
    if (!decoded) {
      throw new BadRequestException('Format de clé invalide');
    }

    const defaults = PLAN_DEFAULTS[decoded.plan];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + decoded.durationDays);

    return this.prisma.license.create({
      data: {
        licenseKey: dto.licenseKey,
        plan: decoded.plan,
        status: LicenseStatus.ACTIVE,
        maxUsers: defaults.maxUsers,
        maxProducts: defaults.maxProducts,
        maxSites: defaults.maxSites,
        licensee: dto.licensee,
        activatedAt: new Date(),
        expiresAt,
      },
    });
  }

  /**
   * Public: check if an active license exists.
   */
  async getStatus(): Promise<{ active: boolean }> {
    const current = await this.getCurrent();
    return { active: current !== null && current.isValid };
  }

  /**
   * Get the current active license (most recently activated, non-expired).
   */
  async getCurrent(): Promise<LicenseLimits | null> {
    const license = await this.prisma.license.findFirst({
      where: {
        status: LicenseStatus.ACTIVE,
        activatedAt: { not: null },
      },
      orderBy: { activatedAt: 'desc' },
    });

    if (!license) return null;

    const now = new Date();
    const isValid = license.expiresAt > now;

    if (!isValid && license.status === LicenseStatus.ACTIVE) {
      await this.prisma.license.update({
        where: { id: license.id },
        data: { status: LicenseStatus.EXPIRED },
      });
    }

    return {
      plan: license.plan,
      maxUsers: license.maxUsers,
      maxProducts: license.maxProducts,
      maxSites: license.maxSites,
      expiresAt: license.expiresAt,
      isValid,
    };
  }

  /**
   * List all licenses (admin).
   */
  async findAll() {
    return this.prisma.license.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revoke a license by ID.
   */
  async revoke(id: string) {
    const license = await this.prisma.license.findUnique({ where: { id } });
    if (!license) throw new NotFoundException('Licence introuvable');

    return this.prisma.license.update({
      where: { id },
      data: { status: LicenseStatus.REVOKED },
    });
  }

  /**
   * Check if a resource creation is within license limits.
   */
  async checkLimit(resource: 'users' | 'products' | 'sites'): Promise<{ allowed: boolean; current: number; max: number }> {
    const limits = await this.getCurrent();
    if (!limits || !limits.isValid) {
      return { allowed: false, current: 0, max: 0 };
    }

    let current: number;
    let max: number;

    switch (resource) {
      case 'users':
        current = await this.prisma.user.count({ where: { isActive: true } });
        max = limits.maxUsers;
        break;
      case 'products':
        current = await this.prisma.product.count({ where: { isActive: true } });
        max = limits.maxProducts;
        break;
      case 'sites':
        current = await this.prisma.site.count({ where: { isActive: true } });
        max = limits.maxSites;
        break;
    }

    return { allowed: current < max, current, max };
  }
}
