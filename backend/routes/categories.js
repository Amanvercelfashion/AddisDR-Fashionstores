const express = require('express');
const router = express.Router();
const { pool, requireBusiness } = require('../db');

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE business_id = $1 ORDER BY name ASC',
    [biz.id]
  );
  res.json(rows);
}));

router.post('/', wrapAsync(async (req, res) => {
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
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Category already exists.' });
    }
    throw err;
  }
}));

router.put('/:id', wrapAsync(async (req, res) => {
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
}));

router.delete('/:id', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE id = $1 AND business_id = $2',
    [req.params.id, biz.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Category not found.' });

  const { rows: inUse } = await pool.query(
    'SELECT COUNT(*)::int as cnt FROM products WHERE category_id = $1 AND business_id = $2',
    [req.params.id, biz.id]
  );
  if (inUse[0].cnt > 0) {
    return res.status(409).json({ error: 'Cannot delete: category is used by products.' });
  }

  await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
