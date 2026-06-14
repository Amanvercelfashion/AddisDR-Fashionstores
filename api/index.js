require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// ── Database ──────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// ── Supabase ──────────────────────────────────────────────────────────────────
function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  }
  console.log('[getSupabase] SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('[getSupabase] SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY, '| length:', process.env.SUPABASE_SERVICE_KEY.length);
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

async function uploadToSupabase(buffer, fileName, contentType) {
  const sb = getSupabase();
  let error;
  try {
    ({ error } = await sb.storage
      .from('fashion-store-uploads')
      .upload(fileName, buffer, { contentType, upsert: true }));
  } catch (err) {
    console.log('[uploadToSupabase] upload threw:', JSON.stringify(err));
    throw err;
  }
  if (error) {
    console.log('[uploadToSupabase] upload error:', JSON.stringify(error));
    throw error;
  }
  const { data: { publicUrl } } = sb.storage
    .from('fashion-store-uploads')
    .getPublicUrl(fileName);
  return publicUrl;
}

function extractStoragePath(url) {
  if (!url) return null;
  const match = url.match(/\/object\/(public|authenticated)\/[^/]+\/(.+)/);
  return match ? match[2] : null;
}

// ── Multer (memory storage → Supabase) ────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://fashionstores-addisdr.vercel.app').split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    // Allow wildcard subdomains of your custom domain
    const vercelBase = 'fashionstores-addisdr.vercel.app';
    if (origin === `https://${vercelBase}` || new RegExp(`^https://[a-z0-9-]+\\.${vercelBase.replace(/\./g, '\\.')}$`).test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getBusinessId(req) {
  return req.headers['x-business-id'] || req.query.business_id || (req.body && req.body.business_id);
}

async function requireBusiness(req, res) {
  const id = getBusinessId(req);
  if (!id) { res.status(400).json({ error: 'business_id is required' }); return null; }
  const { rows } = await pool.query(
    'SELECT * FROM businesses WHERE id = $1 AND status = $2', [id, 'active']
  );
  if (rows.length === 0) { res.status(404).json({ error: 'Business not found or inactive' }); return null; }
  return rows[0];
}

async function generateNextCode(businessId) {
  await pool.query('INSERT INTO code_counter (business_id, last_index) VALUES ($1, 0) ON CONFLICT DO NOTHING', [businessId]);
  const { rows } = await pool.query(
    'UPDATE code_counter SET last_index = last_index + 1 WHERE business_id = $1 RETURNING last_index', [businessId]
  );
  const idx = rows[0].last_index;
  const letter = String.fromCharCode(65 + (Math.floor((idx - 1) / 99) % 26));
  return `${letter}${String(((idx - 1) % 99) + 1).padStart(2, '0')}`;
}

async function requireSuperAdmin(req, res, next) {
  const token = req.headers['x-super-admin'];
  if (!token) return res.status(401).json({ error: 'Super admin auth required' });
  const [username, password] = token.split(':');
  const { rows } = await pool.query(
    'SELECT * FROM super_admins WHERE username = $1 AND password_hash = $2', [username, password]
  );
  if (rows.length === 0) return res.status(403).json({ error: 'Invalid super admin credentials' });
  req.superAdmin = rows[0];
  next();
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ══════════════════════════════════════════════════════════════════════════════
//  SUPER ADMIN
// ══════════════════════════════════════════════════════════════════════════════

app.post('/api/superadmin/login', wrapAsync(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const { rows } = await pool.query(
    'SELECT id, username FROM super_admins WHERE username = $1 AND password_hash = $2', [username, password]
  );
  if (rows.length === 0) return res.status(403).json({ error: 'Invalid credentials' });
  res.json({ success: true, token: `${username}:${password}`, admin: rows[0] });
}));

app.post('/api/superadmin/admin-login', wrapAsync(async (req, res) => {
  const { business_id, password } = req.body;
  if (!business_id || !password) return res.status(400).json({ error: 'business_id and password required' });
  const { rows } = await pool.query(
    "SELECT id, name, subdomain, logo_url, tagline, phone, status, admin_password FROM businesses WHERE id = $1", [business_id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  const biz = rows[0];
  if (biz.status === 'disabled') return res.status(403).json({ error: 'Business is inactive' });
  if (!biz.admin_password) return res.status(403).json({ error: 'Admin access not configured' });
  if (biz.admin_password !== password.trim()) return res.status(403).json({ error: 'Incorrect password' });
  const { admin_password, ...safe } = biz;
  res.json({ success: true, business: safe });
}));

app.get('/api/superadmin/businesses', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT b.*,
      (SELECT COUNT(*) FROM products WHERE business_id = b.id)::int as product_count,
      (SELECT COUNT(*) FROM orders WHERE business_id = b.id)::int as order_count
    FROM businesses b ORDER BY b.created_at DESC
  `);
  res.json(rows.map(({ telegram_bot_token, ...rest }) => rest));
}));

app.get('/api/superadmin/businesses/:id', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM businesses WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  res.json(rows[0]);
}));

app.post('/api/superadmin/businesses', requireSuperAdmin, upload.single('logo'), wrapAsync(async (req, res) => {
  const { name, subdomain, industry, tagline, about, phone, address,
    telegram_bot_token, telegram_chat_id, status,
    color_primary, color_secondary, color_tertiary } = req.body;

  if (!name?.trim()) return res.status(400).json({ error: 'Business name is required' });
  if (!subdomain?.trim()) return res.status(400).json({ error: 'Subdomain is required' });
  if (!/^[a-z0-9-]+$/.test(subdomain.trim())) {
    return res.status(400).json({ error: 'Subdomain may only contain lowercase letters, numbers, and hyphens' });
  }
  const reserved = ['superadmin', 'adminmanager', 'checkout', 'store', 'api', 'www'];
  if (reserved.includes(subdomain.trim().toLowerCase())) {
    return res.status(400).json({ error: `"${subdomain.trim()}" is a reserved name and cannot be used as a subdomain` });
  }

  let logo_url = '';
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `logos/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    logo_url = await uploadToSupabase(req.file.buffer, fileName, req.file.mimetype);
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO businesses (name, subdomain, industry, logo_url, tagline, about, phone, address,
        telegram_bot_token, telegram_chat_id, status, color_primary, color_secondary, color_tertiary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
    `, [name.trim(), subdomain.trim().toLowerCase(), industry || 'general', logo_url, tagline || '', about || '',
        phone || '', address || '', telegram_bot_token || '', telegram_chat_id || '',
        status === 'disabled' ? 'disabled' : 'active',
        color_primary || '#2563eb', color_secondary || '#7c3aed', color_tertiary || '#0891b2']);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Subdomain already taken' });
    throw err;
  }
}));

app.put('/api/superadmin/businesses/:id', requireSuperAdmin, upload.single('logo'), wrapAsync(async (req, res) => {
  const { rows: bizRows } = await pool.query('SELECT * FROM businesses WHERE id = $1', [req.params.id]);
  if (bizRows.length === 0) return res.status(404).json({ error: 'Business not found' });
  const biz = bizRows[0];

  const { name, subdomain, industry, tagline, about, phone, address,
    telegram_bot_token, telegram_chat_id, status,
    color_primary, color_secondary, color_tertiary } = req.body;

  let logo_url = biz.logo_url;
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `logos/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    logo_url = await uploadToSupabase(req.file.buffer, fileName, req.file.mimetype);
  }

  if (subdomain && !/^[a-z0-9-]+$/.test(subdomain.trim())) {
    return res.status(400).json({ error: 'Invalid subdomain format' });
  }
  const reserved = ['superadmin', 'adminmanager', 'checkout', 'store', 'api', 'www'];
  if (subdomain && reserved.includes(subdomain.trim().toLowerCase())) {
    return res.status(400).json({ error: `"${subdomain.trim()}" is a reserved name and cannot be used as a subdomain` });
  }

  try {
    await pool.query(`
      UPDATE businesses SET name=$1, subdomain=$2, industry=$3, logo_url=$4, tagline=$5, about=$6,
        phone=$7, address=$8, telegram_bot_token=$9, telegram_chat_id=$10,
        status=$11, color_primary=$12, color_secondary=$13, color_tertiary=$14, updated_at=NOW()
      WHERE id=$15
    `, [
      name !== undefined ? name.trim() : biz.name,
      subdomain !== undefined ? subdomain.trim().toLowerCase() : biz.subdomain,
      industry !== undefined ? industry : biz.industry,
      logo_url,
      tagline !== undefined ? tagline : biz.tagline,
      about !== undefined ? about : biz.about,
      phone !== undefined ? phone : biz.phone,
      address !== undefined ? address : biz.address,
      telegram_bot_token !== undefined ? telegram_bot_token : biz.telegram_bot_token,
      telegram_chat_id !== undefined ? telegram_chat_id : biz.telegram_chat_id,
      status !== undefined ? status : biz.status,
      color_primary || biz.color_primary || '#2563eb',
      color_secondary || biz.color_secondary || '#7c3aed',
      color_tertiary || biz.color_tertiary || '#0891b2',
      req.params.id
    ]);
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Subdomain already taken' });
    throw err;
  }
}));

app.patch('/api/superadmin/businesses/:id/status', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) return res.status(400).json({ error: 'Status must be active or disabled' });
  const { rows } = await pool.query('SELECT id FROM businesses WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  await pool.query('UPDATE businesses SET status=$1, updated_at=NOW() WHERE id=$2', [status, req.params.id]);
  res.json({ success: true, status });
}));

app.delete('/api/superadmin/businesses/:id', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM businesses WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  const biz = rows[0];
  try {
    const sb = getSupabase();
    const paths = [];
    const { rows: products } = await pool.query(
      "SELECT image_url FROM products WHERE business_id = $1 AND image_url != ''",
      [req.params.id]
    );
    products.forEach(p => {
      const fp = extractStoragePath(p.image_url);
      if (fp) paths.push(fp);
    });
    if (biz.logo_url) {
      const logoPath = extractStoragePath(biz.logo_url);
      if (logoPath) paths.push(logoPath);
    }
    if (paths.length > 0) {
      await sb.storage.from('fashion-store-uploads').remove(paths);
    }
  } catch (err) {
    console.error('Failed to delete business images from storage:', err);
  }
  await pool.query('DELETE FROM businesses WHERE id = $1', [req.params.id]);
  res.json({ success: true });
}));

app.patch('/api/superadmin/businesses/:id/admin-password', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { password } = req.body;
  if (!password?.trim()) return res.status(400).json({ error: 'Password is required' });
  if (password.trim().length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
  const { rows } = await pool.query('SELECT id FROM businesses WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  await pool.query('UPDATE businesses SET admin_password=$1, updated_at=NOW() WHERE id=$2', [password.trim(), req.params.id]);
  res.json({ success: true });
}));

app.get('/api/superadmin/stats', requireSuperAdmin, wrapAsync(async (req, res) => {
  const [{ rows: tb }] = await Promise.all([
    pool.query('SELECT COUNT(*)::int as c FROM businesses'),
    pool.query("SELECT COUNT(*)::int as c FROM businesses WHERE status = 'active'"),
    pool.query('SELECT COUNT(*)::int as c FROM orders'),
    pool.query('SELECT COUNT(*)::int as c FROM products'),
  ]);
  const { rows: ab } = await pool.query("SELECT COUNT(*)::int as c FROM businesses WHERE status = 'active'");
  const { rows: to } = await pool.query('SELECT COUNT(*)::int as c FROM orders');
  const { rows: tp } = await pool.query('SELECT COUNT(*)::int as c FROM products');
  const { rows: rb } = await pool.query(
    'SELECT id, name, subdomain, status, created_at FROM businesses ORDER BY created_at DESC LIMIT 5'
  );
  res.json({ total_businesses: tb[0].c, active_businesses: ab[0].c, total_orders: to[0].c, total_products: tp[0].c, recent_businesses: rb });
}));

// ══════════════════════════════════════════════════════════════════════════════
//  BUSINESS (public)
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/business', wrapAsync(async (req, res) => {
  const bizId = getBusinessId(req);
  if (!bizId) return res.status(400).json({ error: 'business_id required' });
  const { rows } = await pool.query('SELECT * FROM businesses WHERE id = $1', [bizId]);
  if (rows.length === 0 || rows[0].status === 'disabled') return res.status(404).json({ error: 'Business not found or inactive' });
  const { telegram_bot_token, telegram_chat_id, ...publicData } = rows[0];
  res.json(publicData);
}));

app.get('/api/business/by-subdomain/:subdomain', wrapAsync(async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, subdomain, industry, logo_url, tagline, about, phone, address, status FROM businesses WHERE subdomain = $1",
    [req.params.subdomain]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  if (rows[0].status === 'disabled') return res.status(403).json({ error: 'Business is inactive' });
  res.json(rows[0]);
}));

app.get('/api/business/directory', wrapAsync(async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, subdomain, industry, logo_url, tagline, status FROM businesses WHERE status = 'active' ORDER BY name ASC"
  );
  res.json(rows);
}));

// ══════════════════════════════════════════════════════════════════════════════
//  CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/categories', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query('SELECT * FROM categories WHERE business_id = $1 ORDER BY name ASC', [biz.id]);
  res.json(rows);
}));

app.post('/api/categories', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Category name is required.' });
  try {
    const { rows } = await pool.query('INSERT INTO categories (business_id, name) VALUES ($1, $2) RETURNING *', [biz.id, name.trim()]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Category already exists.' });
    throw err;
  }
}));

app.put('/api/categories/:id', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Category name is required.' });
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Category not found.' });
  try {
    await pool.query('UPDATE categories SET name = $1 WHERE id = $2', [name.trim(), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Category name already exists.' });
    throw err;
  }
}));

app.delete('/api/categories/:id', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Category not found.' });
  const { rows: inUse } = await pool.query('SELECT COUNT(*)::int as cnt FROM products WHERE category_id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (inUse[0].cnt > 0) return res.status(409).json({ error: 'Cannot delete: category is used by products.' });
  await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
  res.json({ success: true });
}));

// ══════════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/products', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { category, search } = req.query;
  let query = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.business_id = $1 AND p.visible = 1`;
  const params = [biz.id];
  if (category && category !== 'all') { params.push(category); query += ' AND c.name = $' + params.length; }
  if (search?.trim()) { params.push(`%${search.trim()}%`, `%${search.trim()}%`); query += ' AND (p.name ILIKE $' + (params.length - 1) + ' OR p.code ILIKE $' + params.length + ')'; }
  query += ' ORDER BY p.created_at DESC';
  const { rows } = await pool.query(query, params);
  res.json(rows);
}));

app.get('/api/products/admin', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query(
    'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.business_id = $1 ORDER BY p.created_at DESC',
    [biz.id]
  );
  res.json(rows);
}));

app.post('/api/products', upload.single('image'), wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { name, price, description, category_id, visible } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Product name is required.' });
  if (price === undefined || isNaN(Number(price))) return res.status(400).json({ error: 'Valid price is required.' });
  const code = await generateNextCode(biz.id);
  let image_url = '';
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `products/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    image_url = await uploadToSupabase(req.file.buffer, fileName, req.file.mimetype);
  }
  const { rows } = await pool.query(
    'INSERT INTO products (business_id, code, name, price, description, image_url, category_id, visible) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [biz.id, code, name.trim(), Number(price), description || '', image_url, category_id ? Number(category_id) : null, visible === '0' || visible === false ? 0 : 1]
  );
  res.status(201).json(rows[0]);
}));

app.put('/api/products/:id', upload.single('image'), wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows: productRows } = await pool.query('SELECT * FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (productRows.length === 0) return res.status(404).json({ error: 'Product not found.' });
  const product = productRows[0];
  const { name, price, description, category_id, visible } = req.body;
  let image_url = product.image_url;
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `products/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    image_url = await uploadToSupabase(req.file.buffer, fileName, req.file.mimetype);
  }
  await pool.query(
    'UPDATE products SET name=$1, price=$2, description=$3, image_url=$4, category_id=$5, visible=$6 WHERE id=$7',
    [name !== undefined ? name.trim() : product.name, price !== undefined ? Number(price) : product.price,
     description !== undefined ? description : product.description, image_url,
     category_id !== undefined ? (category_id ? Number(category_id) : null) : product.category_id,
     visible !== undefined ? (visible === '0' || visible === false || visible === 0 ? 0 : 1) : product.visible,
     req.params.id]
  );
  res.json({ success: true });
}));

app.patch('/api/products/:id/visibility', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
  const newVisible = rows[0].visible === 1 ? 0 : 1;
  await pool.query('UPDATE products SET visible = $1 WHERE id = $2', [newVisible, req.params.id]);
  res.json({ success: true, visible: newVisible });
}));

app.delete('/api/products/:id', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
  const product = rows[0];
  if (product.image_url) {
    try {
      const sb = getSupabase();
      const filePath = extractStoragePath(product.image_url);
      if (filePath) {
        await sb.storage.from('fashion-store-uploads').remove([filePath]);
      }
    } catch (err) {
      console.error('Failed to delete product image from storage:', err);
    }
  }
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ success: true });
}));

// ── Product Questions ─────────────────────────────────────────────────────────
app.get('/api/products/:id/questions', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query('SELECT id FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
  const { rows: questions } = await pool.query('SELECT * FROM product_questions WHERE product_id = $1 ORDER BY sort_order ASC, id ASC', [req.params.id]);
  res.json(questions);
}));

app.post('/api/products/:id/questions', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { question, sort_order } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: 'Question text is required.' });
  const { rows } = await pool.query('SELECT id FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
  const { rows: qRows } = await pool.query('INSERT INTO product_questions (product_id, question, sort_order) VALUES ($1, $2, $3) RETURNING *', [req.params.id, question.trim(), sort_order || 0]);
  res.status(201).json(qRows[0]);
}));

app.delete('/api/products/questions/:qid', wrapAsync(async (req, res) => {
  await pool.query('DELETE FROM product_questions WHERE id = $1', [req.params.qid]);
  res.json({ success: true });
}));

// ══════════════════════════════════════════════════════════════════════════════
//  ORDERS
// ══════════════════════════════════════════════════════════════════════════════

const { sendOrderToTelegram } = require('./_telegram');

app.post('/api/orders', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { customer_name, customer_phone, items, answers } = req.body;
  if (!customer_name?.trim()) return res.status(400).json({ error: 'Customer name is required.' });
  if (!customer_phone?.trim()) return res.status(400).json({ error: 'Phone number is required.' });
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'At least one product is required.' });
  for (const item of items) {
    if (!item.product_id && !item.product_code) return res.status(400).json({ error: 'Each item must have a product.' });
    if (!item.quantity || item.quantity < 1) return res.status(400).json({ error: 'Each item must have a valid quantity.' });
  }

  const client = await pool.connect();
  let orderData;
  try {
    await client.query('BEGIN');
    const totalItems = items.reduce((sum, i) => sum + Number(i.quantity), 0);
    const { rows: orderRows } = await client.query(
      'INSERT INTO orders (business_id, customer_name, customer_phone, total_items) VALUES ($1, $2, $3, $4) RETURNING id',
      [biz.id, customer_name.trim(), customer_phone.trim(), totalItems]
    );
    const orderId = orderRows[0].id;
    const createdItems = [];
    for (const item of items) {
      let productData = null;
      if (item.product_id) {
        const { rows: pRows } = await client.query('SELECT * FROM products WHERE id = $1 AND business_id = $2', [item.product_id, biz.id]);
        productData = pRows[0] || null;
      }
      const { rows: itemRows } = await client.query(
        'INSERT INTO order_items (order_id, product_id, product_code, product_name, product_price, quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [orderId, item.product_id || null, productData ? productData.code : (item.product_code || ''),
         productData ? productData.name : (item.product_name || ''),
         productData ? productData.price : (item.product_price || 0), Number(item.quantity)]
      );
      createdItems.push({ id: itemRows[0].id, product_id: item.product_id || null, product_code: productData ? productData.code : item.product_code, product_name: productData ? productData.name : item.product_name, product_price: productData ? productData.price : item.product_price, quantity: Number(item.quantity) });
    }
    const createdAnswers = [];
    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        if (!ans.question || !ans.answer) continue;
        const orderItemId = ans.item_index !== undefined && createdItems[ans.item_index] ? createdItems[ans.item_index].id : null;
        await client.query('INSERT INTO order_answers (order_id, order_item_id, question, answer) VALUES ($1, $2, $3, $4)', [orderId, orderItemId, ans.question, ans.answer]);
        createdAnswers.push({ order_id: orderId, order_item_id: orderItemId, question: ans.question, answer: ans.answer });
      }
    }
    await client.query('COMMIT');
    orderData = { orderId, createdItems, createdAnswers, totalItems };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order insert error:', err);
    return res.status(500).json({ error: 'Failed to save order. Please try again.' });
  } finally {
    client.release();
  }

  const { rows: fullBizRows } = await pool.query('SELECT telegram_bot_token, telegram_chat_id, phone, name FROM businesses WHERE id = $1', [biz.id]);
  const fullBiz = fullBizRows[0];
  sendOrderToTelegram(fullBiz.telegram_bot_token, fullBiz.telegram_chat_id, {
    business_name: fullBiz.name, customer_name: customer_name.trim(), customer_phone: customer_phone.trim(),
    items: orderData.createdItems, answers: orderData.createdAnswers, total_items: orderData.totalItems, created_at: new Date().toISOString()
  }).then(sent => { if (sent) pool.query('UPDATE orders SET telegram_sent = 1 WHERE id = $1', [orderData.orderId]); }).catch(err => console.error('Telegram async error:', err));

  res.status(201).json({ success: true, order_id: orderData.orderId, message: 'Order submitted successfully.', phone: fullBiz.phone });
}));

app.get('/api/orders', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query(
    'SELECT o.*, STRING_AGG(oi.product_name, \', \') as product_names FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE o.business_id = $1 GROUP BY o.id ORDER BY o.created_at DESC LIMIT 500',
    [biz.id]
  );
  res.json(rows);
}));

app.get('/api/orders/:id', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (orderRows.length === 0) return res.status(404).json({ error: 'Order not found.' });
  const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
  const { rows: answers } = await pool.query('SELECT * FROM order_answers WHERE order_id = $1', [req.params.id]);
  res.json({ ...orderRows[0], items, answers });
}));

// ══════════════════════════════════════════════════════════════════════════════
//  ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/analytics/overview', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows: thisWeek } = await pool.query(
    'SELECT COUNT(*)::int as count FROM orders WHERE business_id = $1 AND created_at >= date_trunc(\'week\', CURRENT_DATE - INTERVAL \'7 days\') AND created_at < date_trunc(\'week\', CURRENT_DATE)', [biz.id]
  );
  const { rows: lastWeek } = await pool.query(
    'SELECT COUNT(*)::int as count FROM orders WHERE business_id = $1 AND created_at >= date_trunc(\'week\', CURRENT_DATE - INTERVAL \'14 days\') AND created_at < date_trunc(\'week\', CURRENT_DATE - INTERVAL \'7 days\')', [biz.id]
  );
  const { rows: total } = await pool.query('SELECT COUNT(*)::int as count FROM orders WHERE business_id = $1', [biz.id]);
  const { rows: today } = await pool.query("SELECT COUNT(*)::int as count FROM orders WHERE business_id = $1 AND created_at::date = CURRENT_DATE", [biz.id]);
  const { rows: totalProducts } = await pool.query('SELECT COUNT(*)::int as count FROM products WHERE business_id = $1', [biz.id]);
  const { rows: visibleProducts } = await pool.query('SELECT COUNT(*)::int as count FROM products WHERE business_id = $1 AND visible = 1', [biz.id]);
  const thisCount = thisWeek[0].count || 0;
  const lastCount = lastWeek[0].count || 0;
  let growth = 0;
  if (lastCount > 0) growth = Math.round(((thisCount - lastCount) / lastCount) * 100);
  else if (thisCount > 0) growth = 100;
  res.json({
    orders: { total: total[0].count, this_week: thisCount, last_week: lastCount, today: today[0].count, growth_percent: growth },
    products: { total: totalProducts[0].count, visible: visibleProducts[0].count }
  });
}));

app.get('/api/analytics/top-products', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query(
    'SELECT oi.product_id, oi.product_code, oi.product_name, SUM(oi.quantity)::int as total_ordered, COUNT(DISTINCT oi.order_id)::int as order_count FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.business_id = $1 GROUP BY oi.product_code, oi.product_name, oi.product_id ORDER BY total_ordered DESC LIMIT 10',
    [biz.id]
  );
  res.json(rows);
}));

app.get('/api/analytics/daily-chart', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;
  const { rows } = await pool.query(
    "SELECT created_at::date as day, COUNT(*)::int as order_count FROM orders WHERE business_id = $1 AND created_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day ASC",
    [biz.id]
  );
  res.json(rows);
}));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 10MB).' });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Export for Vercel ─────────────────────────────────────────────────────────
module.exports = app;
