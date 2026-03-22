import { IsNotEmpty, IsEnum, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @ApiProperty({ enum: MovementType })
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sourceLocationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  destLocationId?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'ID de lot pour grouper les transferts' })
  @IsOptional()
  batchId?: string;

  @ApiPropertyOptional({ description: 'ID du client associé au mouvement' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'ID du fournisseur associé au mouvement' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}
