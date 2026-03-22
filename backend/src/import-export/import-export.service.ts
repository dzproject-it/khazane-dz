import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ImportExportService {
  constructor(private prisma: PrismaService) {}

  // ─── IMPORT CSV ──────────────────
  async importProductsCsv(fileBuffer: Buffer) {
    const csvString = fileBuffer.toString('utf-8');
    const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });

    if (parsed.errors.length > 0) {
      throw new BadRequestException({ message: 'Erreurs CSV', errors: parsed.errors });
    }

    const results = { created: 0, updated: 0, errors: [] as any[] };

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i] as any;
      try {
        if (!row.sku || !row.name) {
          results.errors.push({ line: i + 2, reason: 'SKU et nom requis' });
          continue;
        }

        const product = await this.prisma.product.upsert({
          where: { sku: row.sku },
          update: {
            name: row.name,
            unitOfMeasure: row.unit_of_measure || 'unité',
            barcode: row.barcode || null,
          },
          create: {
            sku: row.sku,
            name: row.name,
            unitOfMeasure: row.unit_of_measure || 'unité',
            barcode: row.barcode || null,
          },
        });

        // Lier le fournisseur si supplier_code est fourni
        if (row.supplier_code) {
          const supplier = await this.prisma.supplier.findUnique({ where: { code: row.supplier_code } });
          if (supplier) {
            await this.prisma.productSupplier.upsert({
              where: { productId_supplierId: { productId: product.id, supplierId: supplier.id } },
              update: {},
              create: { productId: product.id, supplierId: supplier.id },
            });
          } else {
            results.errors.push({ line: i + 2, reason: `Fournisseur "${row.supplier_code}" introuvable` });
          }
        }

        const exists = await this.prisma.product.findUnique({ where: { sku: row.sku } });
        if (exists) results.updated++;
        else results.created++;
      } catch (err: any) {
        results.errors.push({ line: i + 2, reason: err.message });
      }
    }

    return results;
  }

  // ─── EXPORT PRODUITS ─────────────
  async exportProductsXlsx(res: Response) {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        suppliers: { include: { supplier: { select: { code: true, name: true } } } },
        customFieldValues: { include: { fieldDef: true, option: true } },
      },
      orderBy: { sku: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Produits');

    // Colonnes de base
    const columns: ExcelJS.Column[] = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Nom', key: 'name', width: 30 },
      { header: 'Catégorie', key: 'category', width: 20 },
      { header: 'Unité', key: 'unit', width: 10 },
      { header: 'Code-barres', key: 'barcode', width: 18 },
      { header: 'Fournisseur(s) Code', key: 'supplier_codes', width: 22 },
      { header: 'Fournisseur(s) Nom', key: 'supplier_names', width: 28 },
      { header: 'Actif', key: 'active', width: 8 },
    ] as any;

    // Ajouter les colonnes custom
    const allFieldDefs = await this.prisma.customFieldDef.findMany();
    for (const fd of allFieldDefs) {
      columns.push({ header: fd.name, key: `cf_${fd.id}`, width: 18 } as any);
    }
    sheet.columns = columns;

    for (const p of products) {
      const row: any = {
        sku: p.sku,
        name: p.name,
        category: p.category?.name || '',
        unit: p.unitOfMeasure,
        barcode: p.barcode || '',
        supplier_codes: (p as any).suppliers?.map((ps: any) => ps.supplier.code).join(', ') || '',
        supplier_names: (p as any).suppliers?.map((ps: any) => ps.supplier.name).join(', ') || '',
        active: p.isActive ? 'Oui' : 'Non',
      };
      for (const cfv of p.customFieldValues) {
        row[`cf_${cfv.fieldDefId}`] =
          cfv.valueText || cfv.valueNumber?.toString() || cfv.valueDate?.toISOString() || cfv.option?.label || '';
      }
      sheet.addRow(row);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=produits-khazane.xlsx');
    await workbook.xlsx.write(res);
  }

  // ─── EXPORT MOUVEMENTS CSV ──────
  async exportMovementsCsv(res: Response) {
    const movements = await this.prisma.stockMovement.findMany({
      include: {
        product: { select: { sku: true, name: true } },
        sourceLocation: { include: { zone: { include: { site: true } } } },
        destLocation: { include: { zone: { include: { site: true } } } },
        performer: { select: { name: true } },
        client: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    const data = movements.map((m: typeof movements[number]) => ({
      reference: m.reference,
      type: m.type,
      sku: m.product.sku,
      product: m.product.name,
      source: m.sourceLocation ? `${m.sourceLocation.zone.site.name} > ${m.sourceLocation.zone.name} > ${m.sourceLocation.code}` : '',
      destination: m.destLocation ? `${m.destLocation.zone.site.name} > ${m.destLocation.zone.name} > ${m.destLocation.code}` : '',
      quantity: m.quantity,
      client_code: m.client?.code || '',
      client_name: m.client?.name || '',
      reason: m.reason || '',
      performed_by: m.performer.name,
      date: m.createdAt.toISOString(),
    }));

    const csv = Papa.unparse(data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=mouvements-khazane.csv');
    res.send('\uFEFF' + csv); // BOM pour Excel
  }

  // ─── EXPORT FOURNISSEURS XLSX ───
  async exportSuppliersXlsx(res: Response) {
    const suppliers = await this.prisma.supplier.findMany({
      include: { products: { include: { product: { select: { sku: true, name: true } } } } },
      orderBy: { code: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Fournisseurs');
    sheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Nom', key: 'name', width: 30 },
      { header: 'NIF', key: 'nif', width: 20 },
      { header: 'Contact', key: 'contact', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Téléphone', key: 'phone', width: 18 },
      { header: 'Adresse', key: 'address', width: 30 },
      { header: 'Produits', key: 'products', width: 35 },
      { header: 'Actif', key: 'active', width: 8 },
    ] as any;

    for (const s of suppliers) {
      sheet.addRow({
        code: s.code,
        name: s.name,
        nif: s.nif || '',
        contact: s.contact || '',
        email: s.email || '',
        phone: s.phone || '',
        address: s.address || '',
        products: s.products.map((ps) => ps.product.sku).join(', '),
        active: s.isActive ? 'Oui' : 'Non',
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=fournisseurs-khazane.xlsx');
    await workbook.xlsx.write(res);
  }

  // ─── EXPORT CLIENTS XLSX ────────
  async exportClientsXlsx(res: Response) {
    const clients = await this.prisma.client.findMany({
      include: { _count: { select: { movements: true } } },
      orderBy: { code: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clients');
    sheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Nom', key: 'name', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'NIF', key: 'nif', width: 20 },
      { header: 'Contact', key: 'contact', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Téléphone', key: 'phone', width: 18 },
      { header: 'Adresse', key: 'address', width: 30 },
      { header: 'Mouvements', key: 'movements', width: 12 },
      { header: 'Actif', key: 'active', width: 8 },
    ] as any;

    for (const c of clients) {
      sheet.addRow({
        code: c.code,
        name: c.name,
        type: c.type,
        nif: c.nif || '',
        contact: c.contact || '',
        email: c.email || '',
        phone: c.phone || '',
        address: c.address || '',
        movements: c._count.movements,
        active: c.isActive ? 'Oui' : 'Non',
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=clients-khazane.xlsx');
    await workbook.xlsx.write(res);
  }
}
