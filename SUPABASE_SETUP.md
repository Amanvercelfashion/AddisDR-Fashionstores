# Supabase Database Setup Guide

This guide walks through migrating from the local SQLite database to Supabase (PostgreSQL).

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Fill in:
   - **Name:** `multi-store-platform` (or your choice)
   - **Database Password:** Save this securely
   - **Region:** Choose the closest to your users
4. Wait for the database to provision (~2 minutes).

---

## 2. Get Your Connection Credentials

In your Supabase project dashboard:

1. Go to **Project Settings → Database**.
2. Find **Connection string** (URI format):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
3. Copy the string — you'll use it in your backend.

---

## 3. Run the Migration SQL

Go to **SQL Editor** in your Supabase dashboard and run:

```sql
-- ─────────────────────────────────────────────
--  SUPER ADMIN
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS super_admins (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  BUSINESSES  (one row per tenant)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  industry TEXT DEFAULT 'general',
  logo_url TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  about TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  telegram_bot_token TEXT DEFAULT '',
  telegram_chat_id TEXT DEFAULT '',
  admin_password TEXT DEFAULT '',
  color_primary TEXT DEFAULT '#2563eb',
  color_secondary TEXT DEFAULT '#7c3aed',
  color_tertiary TEXT DEFAULT '#0891b2',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  CATEGORIES  (per business)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, name)
);

-- ─────────────────────────────────────────────
--  CODE COUNTER  (per business)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS code_counter (
  business_id INTEGER PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  last_index INTEGER DEFAULT 0
);

-- ─────────────────────────────────────────────
--  PRODUCTS  (per business)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, code)
);

-- ─────────────────────────────────────────────
--  PRODUCT QUESTIONS  (per product)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_questions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ─────────────────────────────────────────────
--  ORDERS  (per business)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_items INTEGER DEFAULT 0,
  telegram_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  ORDER ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- ─────────────────────────────────────────────
--  ORDER ANSWERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_answers (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

-- ─────────────────────────────────────────────
--  SEED DEFAULT SUPER ADMIN
-- ─────────────────────────────────────────────
INSERT INTO super_admins (username, password_hash)
VALUES ('admin', 'Yo2906')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- ─────────────────────────────────────────────
--  HELPER: auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_businesses_updated_at ON businesses;
CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 4. Install the PostgreSQL Client

In your `backend/` directory:

```bash
npm install pg
```

---

## 5. Create the Database Connection Module

Replace `backend/db.js` with a PostgreSQL version.

**`backend/db.js`:**

```js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // example: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
  ssl: { rejectUnauthorized: false },
});

// ─────────────────────────────────────────────
//  CODE GENERATION  (per business)
//  A01 -> A99 -> B01 -> ... -> Z99
// ─────────────────────────────────────────────
async function generateNextCode(businessId) {
  await pool.query(
    'INSERT INTO code_counter (business_id, last_index) VALUES ($1, 0) ON CONFLICT DO NOTHING',
    [businessId]
  );

  const { rows } = await pool.query(
    'UPDATE code_counter SET last_index = last_index + 1 WHERE business_id = $1 RETURNING last_index',
    [businessId]
  );
  const nextIndex = rows[0].last_index;

  const letterIndex = Math.floor((nextIndex - 1) / 99);
  const number = ((nextIndex - 1) % 99) + 1;
  const letter = String.fromCharCode(65 + (letterIndex % 26));
  const paddedNum = String(number).padStart(2, '0');
  return `${letter}${paddedNum}`;
}

// ─────────────────────────────────────────────
//  BUSINESS LOOKUP HELPERS
// ─────────────────────────────────────────────

function getBusinessId(req) {
  const fromHeader = req.headers['x-business-id'];
  const fromQuery = req.query.business_id;
  const fromBody = req.body && req.body.business_id;
  return fromHeader || fromQuery || fromBody;
}

async function requireBusiness(req, res) {
  const id = getBusinessId(req);
  if (!id) {
    res.status(400).json({ error: 'business_id is required' });
    return null;
  }
  const { rows } = await pool.query(
    'SELECT * FROM businesses WHERE id = $1 AND status = $2',
    [id, 'active']
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'Business not found or inactive' });
    return null;
  }
  return rows[0];
}

module.exports = { pool, generateNextCode, getBusinessId, requireBusiness };
```

---

## 6. Update Route Files

Every route currently uses `db.prepare(query).all(...)` or `.get(...)` — these are synchronous SQLite calls that must become async `pool.query()` calls in PostgreSQL.

### Pattern for replacing queries

| SQLite | PostgreSQL |
|--------|-----------|
| `db.prepare(sql).all(params)` | `(await pool.query(sql, params)).rows` |
| `db.prepare(sql).get(params)` | `(await pool.query(sql, params)).rows[0]` |
| `db.prepare(sql).run(params)` | `await pool.query(sql, params)` |
| `result.lastInsertRowid` | `result.rows[0].id` (use `RETURNING id`) |
| `datetime('now')` | `NOW()` |
| `date('now')` | `CURRENT_DATE` |
| `GROUP_CONCAT(col, ', ')` | `STRING_AGG(col, ', ')` |
| `datetime('now', '-7 days')` | `NOW() - INTERVAL '7 days'` |
| `datetime('now', 'weekday 0', '-7 days')` | `date_trunc('week', NOW())` |
| `LIKE` (case-insensitive by default in SQLite) | `ILIKE` (case-insensitive in PG) |

### Example: `routes/business.js`

```js
const express = require('express');
const router = express.Router();
const { pool, getBusinessId } = require('../db');

router.get('/', async (req, res) => {
  const bizId = getBusinessId(req);
  if (!bizId) return res.status(400).json({ error: 'business_id required' });

  const { rows } = await pool.query('SELECT * FROM businesses WHERE id = $1', [bizId]);
  if (rows.length === 0 || rows[0].status === 'disabled') {
    return res.status(404).json({ error: 'Business not found or inactive' });
  }

  const { telegram_bot_token, telegram_chat_id, ...publicData } = rows[0];
  res.json(publicData);
});

router.get('/by-subdomain/:subdomain', async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, subdomain, logo_url, tagline, about, phone, address, status FROM businesses WHERE subdomain = $1",
    [req.params.subdomain]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  if (rows[0].status === 'disabled') return res.status(403).json({ error: 'Business is inactive' });
  res.json(rows[0]);
});

router.get('/directory', async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, subdomain, logo_url, tagline, status FROM businesses WHERE status = 'active' ORDER BY name ASC"
  );
  res.json(rows);
});

module.exports = router;
```

### Example: `routes/categories.js`

```js
const express = require('express');
const router = express.Router();
const { pool, requireBusiness } = require('../db');

router.get('/', async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE business_id = $1 ORDER BY name ASC',
    [biz.id]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (business_id, name) VALUES ($1, $2) RETURNING *',
      [biz.id, name.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ error: 'Category already exists.' });
    }
    throw err;
  }
});

router.put('/:id', async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE id = $1 AND business_id = $2',
    [req.params.id, biz.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Category not found.' });

  try {
    await pool.query('UPDATE categories SET name = $1 WHERE id = $2', [name.trim(), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Category name already exists.' });
    }
    throw err;
  }
});

router.delete('/:id', async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE id = $1 AND business_id = $2',
    [req.params.id, biz.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Category not found.' });

  const { rows: inUse } = await pool.query(
    'SELECT COUNT(*) as cnt FROM products WHERE category_id = $1 AND business_id = $2',
    [req.params.id, biz.id]
  );
  if (Number(inUse[0].cnt) > 0) {
    return res.status(409).json({ error: 'Cannot delete: category is used by products.' });
  }

  await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
```

### Example: `routes/products.js` key changes

```js
// Replace:
//   db.prepare(sql).all(...params)
// With:
//   (await pool.query(sql, params)).rows

// Replace:
//   const code = generateNextCode(biz.id);
// With:
//   const code = await generateNextCode(biz.id);

// Replace INSERT returning lastInsertRowid:
//   const result = db.prepare(INSERT...).run(...);
//   const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
// With:
//   const { rows } = await pool.query(INSERT...RETURNING *, [...params]);
//   const product = rows[0];

// PostgreSQL uses ILIKE for case-insensitive search:
//   p.name LIKE ?  ->  p.name ILIKE $1
//   params.push(`%${search.trim()}%`)
```

### Example: `routes/orders.js` key changes

```js
// Replace GROUP_CONCAT:
//   GROUP_CONCAT(oi.product_name, ', ')
// With:
//   STRING_AGG(oi.product_name, ', ')

// All db.transaction(...) calls become async with pool.query
// You can use a PG transaction:
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     ... queries using client.query() ...
//     await client.query('COMMIT');
//   } catch (e) {
//     await client.query('ROLLBACK');
//     throw e;
//   } finally {
//     client.release();
//   }
```

### Example: `routes/analytics.js` key changes

```sql
-- SQLite:
--   created_at >= datetime('now', 'weekday 0', '-7 days')

-- PostgreSQL:
--   created_at >= date_trunc('week', NOW() - INTERVAL '7 days')

-- SQLite:
--   date(created_at) = date('now')

-- PostgreSQL:
--   created_at::date = CURRENT_DATE

-- SQLite:
--   created_at >= datetime('now', '-30 days')

-- PostgreSQL:
--   created_at >= NOW() - INTERVAL '30 days'

-- SQLite:
--   created_at >= datetime('now', 'weekday 0', '-14 days')
--   AND created_at < datetime('now', 'weekday 0', '-7 days')

-- PostgreSQL:
--   created_at >= date_trunc('week', NOW() - INTERVAL '14 days')
--   AND created_at < date_trunc('week', NOW() - INTERVAL '7 days')
```

### Example: `routes/superadmin.js` key changes

```js
// All queries become async with await pool.query()
// Check for unique constraint violations:
//   if (err.message.includes('UNIQUE'))   ->   if (err.code === '23505')

// stats endpoint example:
router.get('/stats', requireSuperAdmin, async (req, res) => {
  const { rows: tb } = await pool.query('SELECT COUNT(*) as c FROM businesses');
  const { rows: ab } = await pool.query("SELECT COUNT(*) as c FROM businesses WHERE status = 'active'");
  const { rows: to } = await pool.query('SELECT COUNT(*) as c FROM orders');
  const { rows: tp } = await pool.query('SELECT COUNT(*) as c FROM products');
  const { rows: rb } = await pool.query(
    'SELECT id, name, subdomain, status, created_at FROM businesses ORDER BY created_at DESC LIMIT 5'
  );
  res.json({
    total_businesses: Number(tb[0].c),
    active_businesses: Number(ab[0].c),
    total_orders: Number(to[0].c),
    total_products: Number(tp[0].c),
    recent_businesses: rb,
  });
});
```

---

## 7. Set Up Supabase Storage for Images

Instead of saving files to `backend/uploads/`, upload them to Supabase Storage.

1. In Supabase dashboard, go to **Storage**.
2. Create a new bucket called `store-uploads`.
3. Set the bucket to **public** so images are accessible via URL.
4. Go to **Policy** and add a policy to allow public read access:

```sql
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-uploads');
```

### Multer → Supabase Storage Upload

Replace the Multer upload logic with Supabase uploads.

**`backend/routes/superadmin.js` — logo upload:**

```js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Instead of multer:
const upload = multer({ storage: multer.memoryStorage() });

router.post('/businesses', requireSuperAdmin, upload.single('logo'), async (req, res) => {
  // ... validation ...

  let logo_url = '';
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `logos/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const { data, error } = await supabase.storage
      .from('store-uploads')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from('store-uploads')
      .getPublicUrl(fileName);
    logo_url = publicUrl;
  }

  const { rows } = await pool.query(
    `INSERT INTO businesses (...) VALUES ($1, $2, ..., $13) RETURNING *`,
    [name, subdomain, logo_url, ...]
  );
  res.status(201).json(rows[0]);
});
```

---

## 8. Environment Variables

Create a `backend/.env` file:

```
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:5173
NODE_ENV=production
```

Get `SUPABASE_SERVICE_KEY` from **Project Settings → API → service_role key**.

---

## 9. Package Dependencies

Add to `backend/package.json`:

```json
{
  "dependencies": {
    "pg": "^8.13.0",
    "@supabase/supabase-js": "^2.45.0"
  }
}
```

Then run:

```bash
npm install
```

---

## 10. Seed Data Script (PostgreSQL)

Create `backend/seed-pg.js`:

```js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const stores = [
  {
    name: 'Chic Boutique',
    subdomain: 'chic',
    tagline: "Trendy women's fashion for every occasion",
    about: 'Chic Boutique brings you the latest trends in women\'s fashion.',
    industry: 'fashion',
    phone: '+251-911-111-111',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    color_primary: '#e91e63',
    color_secondary: '#9c27b0',
    color_tertiary: '#f06292',
    categories: [
      {
        name: 'Tops',
        products: [
          { name: 'Floral Printed Blouse', price: 1549, description: 'Lightweight chiffon blouse with all-over floral print.' },
          { name: 'Cashmere Crew Neck Sweater', price: 2199, description: 'Luxuriously soft cashmere blend sweater.' },
          { name: 'Silk Camisole Top', price: 1299, description: 'Elegant silk camisole with adjustable straps.' },
        ],
      },
      // ... add remaining categories with products
    ],
  },
  // ... add Urban Threads and Elegance & Co.
];

function generateCode(index) {
  const letterIndex = Math.floor((index - 1) / 99);
  const number = ((index - 1) % 99) + 1;
  const letter = String.fromCharCode(65 + (letterIndex % 26));
  return `${letter}${String(number).padStart(2, '0')}`;
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM businesses');
    let productIndex = 0;
    for (const store of stores) {
      const { rows } = await client.query(
        `INSERT INTO businesses (name, subdomain, tagline, about, phone, address, color_primary, color_secondary, color_tertiary, admin_password, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active') RETURNING id`,
        [store.name, store.subdomain, store.tagline, store.about, store.phone, store.address,
         store.color_primary, store.color_secondary, store.color_tertiary, 'store2024']
      );
      const businessId = rows[0].id;
      const numProducts = store.categories.reduce((s, c) => s + c.products.length, 0);
      await client.query(
        'INSERT INTO code_counter (business_id, last_index) VALUES ($1, $2) ON CONFLICT (business_id) DO UPDATE SET last_index = $2',
        [businessId, productIndex + numProducts]
      );
      for (const category of store.categories) {
        const { rows: catRows } = await client.query(
          'INSERT INTO categories (business_id, name) VALUES ($1, $2) RETURNING id',
          [businessId, category.name]
        );
        const categoryId = catRows[0].id;
        for (const product of category.products) {
          productIndex++;
          const code = generateCode(productIndex);
          await client.query(
            `INSERT INTO products (business_id, code, name, price, description, category_id, visible)
             VALUES ($1, $2, $3, $4, $5, $6, 1)`,
            [businessId, code, product.name, product.price, product.description, categoryId]
          );
        }
      }
    }
    await client.query('COMMIT');
    console.log('Seeded successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
```

Run it:

```bash
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres" node backend/seed-pg.js
```

---

## 11. Deploy the Backend

1. Push your updated code to a hosting platform (Railway, Render, Fly.io, etc.).
2. Set the environment variables from **Step 8**.
3. Make sure the frontend is built and served by the backend, or deploy it separately on Vercel/Netlify with the API proxy pointing to your hosted backend.

---

## Quick Reference: SQLite → PostgreSQL Changes

| Area | SQLite | PostgreSQL |
|------|--------|------------|
| Auto-increment | `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| String concatenation | `\|\|` | `\|\|` (same) |
| Case-insensitive search | `LIKE` (default) | `ILIKE` |
| Current timestamp | `CURRENT_TIMESTAMP` | `NOW()` or `CURRENT_TIMESTAMP` |
| Date truncation | `datetime('now', '-7 days')` | `NOW() - INTERVAL '7 days'` |
| Week start | `datetime('now', 'weekday 0', '-7 days')` | `date_trunc('week', NOW() - INTERVAL '7 days')` |
| Date only | `date(created_at)` | `created_at::date` |
| Aggregate concat | `GROUP_CONCAT(col, ', ')` | `STRING_AGG(col, ', ')` |
| Unique violation | `err.message.includes('UNIQUE')` | `err.code === '23505'` |
| Insert return | `result.lastInsertRowid` | `INSERT ... RETURNING id` |
| Query style | Synchronous (`db.prepare().all()`) | Async (`await pool.query()`) |
| File storage | Local filesystem (`backend/uploads/`) | Supabase Storage bucket |
| Client library | `better-sqlite3` | `pg` + `@supabase/supabase-js` |
