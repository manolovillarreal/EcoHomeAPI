ALTER TABLE products
ADD COLUMN IF NOT EXISTS created_by UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_created_by_fkey'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
