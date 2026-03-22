import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, limit = 8) {
    const q = query.trim();
    if (!q) return { products: [], categories: [], movements: [], locations: [] };

    const safeLimit = Math.min(Math.max(1, limit), 50);

    // Build tsquery: split words, add prefix matching (:*)
    const tsQuery = q
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => `${w}:*`)
      .join(' & ');

    const [products, categories, movements, locations] = await Promise.all([
      // ── Products: FTS + trigram similarity, ranked ──
      this.prisma.$queryRaw`
        SELECT p.id, p.sku, p.name, p.barcode,
               json_build_object('name', c.name) AS category,
               GREATEST(
                 ts_rank(to_tsvector('french', coalesce(p.name,'') || ' ' || coalesce(p.sku,'') || ' ' || coalesce(p.barcode,'')),
                         to_tsquery('french', ${tsQuery})),
                 similarity(p.name, ${q}),
                 similarity(p.sku, ${q})
               ) AS rank
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.is_active = true
          AND (
            to_tsvector('french', coalesce(p.name,'') || ' ' || coalesce(p.sku,'') || ' ' || coalesce(p.barcode,''))
              @@ to_tsquery('french', ${tsQuery})
            OR similarity(p.name, ${q}) > 0.15
            OR similarity(p.sku, ${q}) > 0.15
            OR p.barcode = ${q}
          )
        ORDER BY rank DESC
        LIMIT ${safeLimit}
      `,

      // ── Categories: trigram similarity ──
      this.prisma.$queryRaw`
        SELECT c.id, c.name,
               (SELECT count(*)::int FROM products WHERE category_id = c.id) AS product_count,
               similarity(c.name, ${q}) AS rank
        FROM categories c
        WHERE similarity(c.name, ${q}) > 0.15
           OR c.name ILIKE ${'%' + q + '%'}
        ORDER BY rank DESC
        LIMIT ${safeLimit}
      `,

      // ── Movements: FTS on reference + product name ──
      this.prisma.$queryRaw`
        SELECT m.id, m.reference, m.type, m.quantity, m.created_at AS "createdAt",
               json_build_object('sku', p.sku, 'name', p.name) AS product,
               GREATEST(
                 similarity(m.reference, ${q}),
                 similarity(p.name, ${q}),
                 similarity(p.sku, ${q})
               ) AS rank
        FROM stock_movements m
        JOIN products p ON p.id = m.product_id
        WHERE similarity(m.reference, ${q}) > 0.15
           OR similarity(p.name, ${q}) > 0.15
           OR similarity(p.sku, ${q}) > 0.15
           OR m.reference ILIKE ${'%' + q + '%'}
        ORDER BY rank DESC, m.created_at DESC
        LIMIT ${safeLimit}
      `,

      // ── Locations: trigram on label/code + zone/site names ──
      this.prisma.$queryRaw`
        SELECT l.id, l.label, l.code,
               json_build_object(
                 'name', z.name,
                 'site', json_build_object('name', s.name)
               ) AS zone,
               GREATEST(
                 similarity(coalesce(l.label,''), ${q}),
                 similarity(l.code, ${q}),
                 similarity(z.name, ${q}),
                 similarity(s.name, ${q})
               ) AS rank
        FROM locations l
        JOIN zones z ON z.id = l.zone_id
        JOIN sites s ON s.id = z.site_id
        WHERE similarity(coalesce(l.label,''), ${q}) > 0.15
           OR similarity(l.code, ${q}) > 0.15
           OR similarity(z.name, ${q}) > 0.15
           OR similarity(s.name, ${q}) > 0.15
           OR l.label ILIKE ${'%' + q + '%'}
           OR l.code ILIKE ${'%' + q + '%'}
        ORDER BY rank DESC
        LIMIT ${safeLimit}
      `,
    ]);

    // Clean raw results: remove rank field, normalize category format
    const cleanProducts = (products as any[]).map(({ rank, ...p }) => p);
    const cleanCategories = (categories as any[]).map(({ rank, product_count, ...c }) => ({
      ...c,
      _count: { products: product_count },
    }));
    const cleanMovements = (movements as any[]).map(({ rank, ...m }) => m);
    const cleanLocations = (locations as any[]).map(({ rank, ...l }) => l);

    return {
      products: cleanProducts,
      categories: cleanCategories,
      movements: cleanMovements,
      locations: cleanLocations,
    };
  }
}
