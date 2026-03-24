import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LicensePlan } from '@prisma/client';

export class GenerateLicenseDto {
  @ApiProperty({ enum: ['TRIAL', 'PRO', 'ENTERPRISE'], default: 'PRO' })
  @IsEnum(LicensePlan)
  @IsOptional()
  plan?: LicensePlan;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  licensee?: string;

  @ApiPropertyOptional({ default: 365 })
  @IsInt()
  @Min(1)
  @Max(3650)
  @IsOptional()
  durationDays?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  maxUsers?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  maxProducts?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  maxSites?: number;
}
