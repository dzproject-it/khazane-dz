import { IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiPropertyOptional({ example: 'CLI-001', description: 'Généré automatiquement si non fourni' })
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Entreprise XYZ' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: ['COMPANY', 'INDIVIDUAL', 'GOVERNMENT', 'OTHER'] })
  @IsOptional()
  @IsEnum(['COMPANY', 'INDIVIDUAL', 'GOVERNMENT', 'OTHER'])
  type?: string;

  @ApiPropertyOptional({ example: 'Ahmed Bensalem' })
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({ example: 'contact@entreprise.dz' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+213 555 789 012' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Boulevard du 1er Novembre, Oran' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '000 123 456 789 00', description: 'Numéro d\'Identification Fiscale' })
  @IsOptional()
  nif?: string;
}

export class UpdateClientDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(['COMPANY', 'INDIVIDUAL', 'GOVERNMENT', 'OTHER'])
  type?: string;

  @IsOptional()
  contact?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  nif?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
