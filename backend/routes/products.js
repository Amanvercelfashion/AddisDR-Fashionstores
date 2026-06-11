const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool, generateNextCode, requireBusiness } = require('../db');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { category, search } = req.query;
  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.business_id = $1 AND p.visible = 1
  `;
  const params = [biz.id];

  if (category && category !== 'all') {
    query += ' AND c.name = $' + (params.length + 1);
    params.push(category);
  }
  if (search && search.trim()) {
    query += ' AND (p.name ILIKE $' + (params.length + 1) + ' OR p.code ILIKE $' + (params.length + 2) + ')';
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }
  query += ' ORDER BY p.created_at DESC';

  const { rows } = await pool.query(query, params);
  res.json(rows);
}));

router.get('/admin', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.business_id = $1
    ORDER BY p.created_at DESC
  `, [biz.id]);
  res.json(rows);
}));

router.get('/:id/questions', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query('SELECT id FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });

  const { rows: questions } = await pool.query(
    'SELECT * FROM product_questions WHERE product_id = $1 ORDER BY sort_order ASC, id ASC',
    [req.params.id]
  );
  res.json(questions);
}));

router.post('/', upload.single('image'), wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { name, price, description, category_id, visible } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ error: 'Product name is required.' });
  if (price === undefined || isNaN(Number(price))) return res.status(400).json({ error: 'Valid price is required.' });

  const code = await generateNextCode(biz.id);
  const image_url = req.file ? `/uploads/${req.file.filename}` : '';

  const { rows } = await pool.query(`
    INSERT INTO products (business_id, code, name, price, description, image_url, category_id, visible)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
  `, [
    biz.id, code, name.trim(), Number(price),
    description || '', image_url,
    category_id ? Number(category_id) : null,
    visible === '0' || visible === false ? 0 : 1
  ]);

  res.status(201).json(rows[0]);
}));

router.put('/:id', upload.single('image'), wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows: productRows } = await pool.query('SELECT * FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (productRows.length === 0) return res.status(404).json({ error: 'Product not found.' });
  const product = productRows[0];

  const { name, price, description, category_id, visible } = req.body;

  let image_url = product.image_url;
  if (req.file) {
    if (product.image_url && product.image_url.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', product.image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    image_url = `/uploads/${req.file.filename}`;
  }

  await pool.query(`
    UPDATE products SET name = $1, price = $2, description = $3, image_url = $4,
      category_id = $5, visible = $6
    WHERE id = $7
  `, [
    name !== undefined ? name.trim() : product.name,
    price !== undefined ? Number(price) : product.price,
    description !== undefined ? description : product.description,
    image_url,
    category_id !== undefined ? (category_id ? Number(category_id) : null) : product.category_id,
    visible !== undefined ? (visible === '0' || visible === false || visible === 0 ? 0 : 1) : product.visible,
    req.params.id
  ]);

  res.json({ success: true });
}));

router.patch('/:id/visibility', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
  const product = rows[0];

  const newVisible = product.visible === 1 ? 0 : 1;
  await pool.query('UPDATE products SET visible = $1 WHERE id = $2', [newVisible, req.params.id]);
  res.json({ success: true, visible: newVisible });
}));

router.delete('/:id', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
  const product = rows[0];

  if (product.image_url && product.image_url.startsWith('/uploads/')) {
    const imgPath = path.join(__dirname, '..', product.image_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ success: true });
}));

router.post('/:id/questions', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { question, sort_order } = req.body;
  if (!question || !question.trim()) return res.status(400).json({ error: 'Question text is required.' });

  const { rows } = await pool.query('SELECT id FROM products WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });

  const { rows: qRows } = await pool.query(
    'INSERT INTO product_questions (product_id, question, sort_order) VALUES ($1, $2, $3) RETURNING *',
    [req.params.id, question.trim(), sort_order || 0]
  );

  res.status(201).json(qRows[0]);
}));

router.delete('/questions/:qid', wrapAsync(async (req, res) => {
  await pool.query('DELETE FROM product_questions WHERE id = $1', [req.params.qid]);
  res.json({ success: true });
}));

module.exports = router;
