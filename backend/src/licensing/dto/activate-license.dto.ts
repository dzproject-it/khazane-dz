import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivateLicenseDto {
  @ApiProperty({ example: 'KHZN-P1A2-B3C4-D5E6' })
  @IsString()
  @Matches(/^KHZN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, {
    message: 'Format de clé invalide (attendu : KHZN-XXXX-XXXX-XXXX)',
  })
  licenseKey: string;

  @ApiPropertyOptional({ example: 'Société ABC' })
  @IsString()
  @IsOptional()
  licensee?: string;
}
