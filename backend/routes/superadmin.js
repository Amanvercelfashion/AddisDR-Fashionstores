const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../db');
const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

function extractStoragePath(url) {
  if (!url) return null;
  const match = url.match(/\/object\/(public|authenticated)\/[^/]+\/(.+)/);
  return match ? match[2] : null;
}

async function requireSuperAdmin(req, res, next) {
  const token = req.headers['x-super-admin'];
  if (!token) return res.status(401).json({ error: 'Super admin auth required' });

  const [username, password] = token.split(':');
  const { rows } = await pool.query(
    'SELECT * FROM super_admins WHERE username = $1 AND password_hash = $2',
    [username, password]
  );

  if (rows.length === 0) return res.status(403).json({ error: 'Invalid super admin credentials' });
  req.superAdmin = rows[0];
  next();
}

router.post('/login', wrapAsync(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const { rows } = await pool.query(
    'SELECT id, username FROM super_admins WHERE username = $1 AND password_hash = $2',
    [username, password]
  );

  if (rows.length === 0) return res.status(403).json({ error: 'Invalid credentials' });
  res.json({ success: true, token: `${username}:${password}`, admin: rows[0] });
}));

router.get('/businesses', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT b.*,
      (SELECT COUNT(*) FROM products WHERE business_id = b.id)::int as product_count,
      (SELECT COUNT(*) FROM orders WHERE business_id = b.id)::int as order_count
    FROM businesses b
    ORDER BY b.created_at DESC
  `);

  const safe = rows.map(({ telegram_bot_token, ...rest }) => rest);
  res.json(safe);
}));

router.get('/businesses/:id', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM businesses WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  res.json(rows[0]);
}));

router.post('/businesses', requireSuperAdmin, upload.single('logo'), wrapAsync(async (req, res) => {
  const {
    name, subdomain, industry, tagline, about, phone, address,
    telegram_bot_token, telegram_chat_id, status,
    color_primary, color_secondary, color_tertiary
  } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ error: 'Business name is required' });
  if (!subdomain || !subdomain.trim()) return res.status(400).json({ error: 'Subdomain is required' });

  if (!/^[a-z0-9-]+$/.test(subdomain.trim())) {
    return res.status(400).json({ error: 'Subdomain may only contain lowercase letters, numbers, and hyphens' });
  }

  let logo_url = '';
  if (req.file) {
    const sb = getSupabase();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `logos/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const { error } = await sb.storage
      .from('store-uploads')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
    if (error) throw error;
    const { data: { publicUrl } } = sb.storage
      .from('store-uploads')
      .getPublicUrl(fileName);
    logo_url = publicUrl;
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO businesses (name, subdomain, industry, logo_url, tagline, about, phone, address,
        telegram_bot_token, telegram_chat_id, status,
        color_primary, color_secondary, color_tertiary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      name.trim(), subdomain.trim().toLowerCase(), industry || 'general', logo_url,
      tagline || '', about || '', phone || '', address || '',
      telegram_bot_token || '', telegram_chat_id || '',
      status === 'disabled' ? 'disabled' : 'active',
      color_primary || '#2563eb',
      color_secondary || '#7c3aed',
      color_tertiary || '#0891b2'
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Subdomain already taken' });
    }
    throw err;
  }
}));

router.put('/businesses/:id', requireSuperAdmin, upload.single('logo'), wrapAsync(async (req, res) => {
  const { rows: bizRows } = await pool.query('SELECT * FROM businesses WHERE id = $1', [req.params.id]);
  if (bizRows.length === 0) return res.status(404).json({ error: 'Business not found' });
  const biz = bizRows[0];

  const {
    name, subdomain, industry, tagline, about, phone, address,
    telegram_bot_token, telegram_chat_id, status,
    color_primary, color_secondary, color_tertiary
  } = req.body;

  let logo_url = biz.logo_url;
  if (req.file) {
    const sb = getSupabase();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `logos/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const { error } = await sb.storage
      .from('store-uploads')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
    if (error) throw error;
    const { data: { publicUrl } } = sb.storage
      .from('store-uploads')
      .getPublicUrl(fileName);
    logo_url = publicUrl;
  }

  if (subdomain && !/^[a-z0-9-]+$/.test(subdomain.trim())) {
    return res.status(400).json({ error: 'Invalid subdomain format' });
  }

  try {
    await pool.query(`
      UPDATE businesses SET
        name = $1, subdomain = $2, industry = $3, logo_url = $4, tagline = $5, about = $6,
        phone = $7, address = $8, telegram_bot_token = $9, telegram_chat_id = $10,
        status = $11, color_primary = $12, color_secondary = $13, color_tertiary = $14,
        updated_at = NOW()
      WHERE id = $15
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
      color_primary !== undefined ? color_primary : (biz.color_primary || '#2563eb'),
      color_secondary !== undefined ? color_secondary : (biz.color_secondary || '#7c3aed'),
      color_tertiary !== undefined ? color_tertiary : (biz.color_tertiary || '#0891b2'),
      req.params.id
    ]);
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Subdomain already taken' });
    }
    throw err;
  }
}));

router.patch('/businesses/:id/status', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or disabled' });
  }
  const { rows } = await pool.query('SELECT id FROM businesses WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });

  await pool.query('UPDATE businesses SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);
  res.json({ success: true, status });
}));

router.delete('/businesses/:id', requireSuperAdmin, wrapAsync(async (req, res) => {
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
      await sb.storage.from('store-uploads').remove(paths);
    }
  } catch (err) {
    console.error('Failed to delete business images from storage:', err);
  }

  await pool.query('DELETE FROM businesses WHERE id = $1', [req.params.id]);
  res.json({ success: true });
}));

router.patch('/businesses/:id/admin-password', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { password } = req.body;
  if (!password || !password.trim()) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (password.trim().length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }
  const { rows } = await pool.query('SELECT id FROM businesses WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });

  await pool.query('UPDATE businesses SET admin_password = $1, updated_at = NOW() WHERE id = $2', [password.trim(), req.params.id]);
  res.json({ success: true });
}));

router.post('/admin-login', wrapAsync(async (req, res) => {
  const { business_id, password } = req.body;
  if (!business_id || !password) {
    return res.status(400).json({ error: 'business_id and password required' });
  }
  const { rows } = await pool.query(
    "SELECT id, name, subdomain, logo_url, tagline, phone, status, admin_password FROM businesses WHERE id = $1",
    [business_id]
  );

  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  const biz = rows[0];
  if (biz.status === 'disabled') return res.status(403).json({ error: 'Business is inactive' });
  if (!biz.admin_password) return res.status(403).json({ error: 'Admin access not configured. Contact your platform administrator.' });
  if (biz.admin_password !== password.trim()) return res.status(403).json({ error: 'Incorrect password' });

  const { admin_password, ...safe } = biz;
  res.json({ success: true, business: safe });
}));

router.get('/stats', requireSuperAdmin, wrapAsync(async (req, res) => {
  const { rows: tb } = await pool.query('SELECT COUNT(*)::int as c FROM businesses');
  const { rows: ab } = await pool.query("SELECT COUNT(*)::int as c FROM businesses WHERE status = 'active'");
  const { rows: to } = await pool.query('SELECT COUNT(*)::int as c FROM orders');
  const { rows: tp } = await pool.query('SELECT COUNT(*)::int as c FROM products');
  const { rows: rb } = await pool.query(
    'SELECT id, name, subdomain, status, created_at FROM businesses ORDER BY created_at DESC LIMIT 5'
  );
  res.json({
    total_businesses: tb[0].c,
    active_businesses: ab[0].c,
    total_orders: to[0].c,
    total_products: tp[0].c,
    recent_businesses: rb,
  });
}));

module.exports = router;
