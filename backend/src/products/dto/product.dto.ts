import { IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-001' })
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Écran LCD 24"' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'unité', default: 'unité' })
  @IsOptional()
  unitOfMeasure?: string;

  @ApiPropertyOptional({ example: '3700123456789' })
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Valeurs des champs personnalisés', type: 'array' })
  @IsOptional()
  customFields?: { fieldDefId: string; value: string | number | Date }[];
}

export class UpdateProductDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  categoryId?: string;

  @IsOptional()
  unitOfMeasure?: string;

  @IsOptional()
  barcode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  customFields?: { fieldDefId: string; value: string | number | Date }[];
}
