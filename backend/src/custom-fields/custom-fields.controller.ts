import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CustomFieldsService } from './custom-fields.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FieldType } from '@prisma/client';

@ApiTags('Custom Fields')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private customFieldsService: CustomFieldsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les champs personnalisés' })
  findAll(@Query('category_id') categoryId?: string) {
    return this.customFieldsService.findAll(categoryId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Créer un champ personnalisé' })
  create(
    @Body() body: { name: string; fieldType: FieldType; isRequired?: boolean; appliesToCategoryId?: string; options?: string[] },
  ) {
    return this.customFieldsService.create(body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer un champ personnalisé' })
  remove(@Param('id') id: string) {
    return this.customFieldsService.delete(id);
  }
}
