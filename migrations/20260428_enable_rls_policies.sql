-- 20260428_enable_rls_policies.sql
-- Enable Row Level Security and define policies

-- =========================
-- USERS
-- =========================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Opcional: permitir lectura (ajústalo según tu uso real)
DROP POLICY IF EXISTS "Allow read users" ON users;
CREATE POLICY "Allow read users"
ON users
FOR SELECT
USING (true);

-- Bloquear escritura directa desde cliente
DROP POLICY IF EXISTS "Block insert users" ON users;
CREATE POLICY "Block insert users"
ON users
FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS "Block update users" ON users;
CREATE POLICY "Block update users"
ON users
FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "Block delete users" ON users;
CREATE POLICY "Block delete users"
ON users
FOR DELETE
USING (false);


-- =========================
-- PRODUCTS
-- =========================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Lectura pública (mantiene comportamiento actual)
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products"
ON products
FOR SELECT
USING (true);

-- Bloquear modificaciones directas
DROP POLICY IF EXISTS "Block insert products" ON products;
CREATE POLICY "Block insert products"
ON products
FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS "Block update products" ON products;
CREATE POLICY "Block update products"
ON products
FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "Block delete products" ON products;
CREATE POLICY "Block delete products"
ON products
FOR DELETE
USING (false);


-- =========================
-- MESSAGES
-- =========================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Lectura básica (puedes refinar después)
DROP POLICY IF EXISTS "Allow read messages" ON messages;
CREATE POLICY "Allow read messages"
ON messages
FOR SELECT
USING (true);

-- Bloquear modificaciones directas
DROP POLICY IF EXISTS "Block insert messages" ON messages;
CREATE POLICY "Block insert messages"
ON messages
FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS "Block update messages" ON messages;
CREATE POLICY "Block update messages"
ON messages
FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "Block delete messages" ON messages;
CREATE POLICY "Block delete messages"
ON messages
FOR DELETE
USING (false);


-- =========================
-- REFRESH TOKENS (CRÍTICO)
-- =========================
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Bloquear completamente acceso desde cliente

DROP POLICY IF EXISTS "No read refresh tokens" ON refresh_tokens;
CREATE POLICY "No read refresh tokens"
ON refresh_tokens
FOR SELECT
USING (false);

DROP POLICY IF EXISTS "No insert refresh tokens" ON refresh_tokens;
CREATE POLICY "No insert refresh tokens"
ON refresh_tokens
FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS "No update refresh tokens" ON refresh_tokens;
CREATE POLICY "No update refresh tokens"
ON refresh_tokens
FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "No delete refresh tokens" ON refresh_tokens;
CREATE POLICY "No delete refresh tokens"
ON refresh_tokens
FOR DELETE
USING (false);