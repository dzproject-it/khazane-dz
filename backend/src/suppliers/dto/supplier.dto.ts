import { IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiPropertyOptional({ example: 'FOUR-001', description: 'Généré automatiquement si non fourni' })
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Fournisseur ABC' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Mohamed Ali' })
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({ example: 'contact@fournisseur.dz' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+213 555 123 456' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Rue Didouche Mourad, Alger' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '000 123 456 789 00', description: 'Numéro d\'Identification Fiscale' })
  @IsOptional()
  nif?: string;
}

export class UpdateSupplierDto {
  @IsOptional()
  name?: string;

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

export class LinkProductsDto {
  @ApiProperty({ type: [String], description: 'IDs des produits à associer' })
  @IsArray()
  @IsNotEmpty()
  productIds: string[];
}
