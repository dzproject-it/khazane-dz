-- Enable pg_trgm extension for fuzzy / similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── Products: GIN index for full-text search on name + sku ───
CREATE INDEX IF NOT EXISTS "products_fts_idx"
  ON "products"
  USING GIN (
    (to_tsvector('french', coalesce("name", '') || ' ' || coalesce("sku", '') || ' ' || coalesce("barcode", '')))
  );

-- Trigram index for fuzzy search on product name
CREATE INDEX IF NOT EXISTS "products_name_trgm_idx"
  ON "products"
  USING GIN ("name" gin_trgm_ops);

-- Trigram index for fuzzy search on product sku
CREATE INDEX IF NOT EXISTS "products_sku_trgm_idx"
  ON "products"
  USING GIN ("sku" gin_trgm_ops);

-- ─── Categories: trigram index on name ───
CREATE INDEX IF NOT EXISTS "categories_name_trgm_idx"
  ON "categories"
  USING GIN ("name" gin_trgm_ops);

-- ─── Stock Movements: GIN index for FTS on reference ───
CREATE INDEX IF NOT EXISTS "movements_reference_trgm_idx"
  ON "stock_movements"
  USING GIN ("reference" gin_trgm_ops);

-- ─── Locations: trigram indexes ───
CREATE INDEX IF NOT EXISTS "locations_label_trgm_idx"
  ON "locations"
  USING GIN ("label" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "locations_code_trgm_idx"
  ON "locations"
  USING GIN ("code" gin_trgm_ops);
