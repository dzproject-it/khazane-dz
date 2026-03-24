import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { StorageModule } from './storage/storage.module';
import { MovementsModule } from './movements/movements.module';
import { StockLevelsModule } from './stock-levels/stock-levels.module';
import { ThresholdsModule } from './thresholds/thresholds.module';
import { AlertsModule } from './alerts/alerts.module';
import { AuditModule } from './audit/audit.module';
import { ImportExportModule } from './import-export/import-export.module';
import { SearchModule } from './search/search.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ClientsModule } from './clients/clients.module';
import { LicensingModule } from './licensing/licensing.module';

const staticModules = process.env.SERVE_STATIC === 'true'
  ? [
      ServeStaticModule.forRoot({
        rootPath: process.env.STATIC_PATH || join(__dirname, '..', '..', 'frontend-dist'),
        exclude: ['/api/(.*)'],
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...staticModules,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CustomFieldsModule,
    StorageModule,
    MovementsModule,
    StockLevelsModule,
    ThresholdsModule,
    AlertsModule,
    AuditModule,
    ImportExportModule,
    SearchModule,
    SuppliersModule,
    ClientsModule,
    LicensingModule,
  ],
})
export class AppModule {}
