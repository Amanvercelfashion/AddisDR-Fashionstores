const express = require('express');
const router = express.Router();
const { pool, getBusinessId } = require('../db');

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', wrapAsync(async (req, res) => {
  const bizId = getBusinessId(req);
  if (!bizId) return res.status(400).json({ error: 'business_id required' });

  const { rows } = await pool.query('SELECT * FROM businesses WHERE id = $1', [bizId]);
  if (rows.length === 0 || rows[0].status === 'disabled') {
    return res.status(404).json({ error: 'Business not found or inactive' });
  }

  const { telegram_bot_token, telegram_chat_id, ...publicData } = rows[0];
  res.json(publicData);
}));

router.get('/by-subdomain/:subdomain', wrapAsync(async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, subdomain, logo_url, tagline, about, phone, address, status FROM businesses WHERE subdomain = $1",
    [req.params.subdomain]
  );

  if (rows.length === 0) return res.status(404).json({ error: 'Business not found' });
  if (rows[0].status === 'disabled') return res.status(403).json({ error: 'Business is inactive' });
  res.json(rows[0]);
}));

router.get('/directory', wrapAsync(async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, subdomain, logo_url, tagline, status FROM businesses WHERE status = 'active' ORDER BY name ASC"
  );
  res.json(rows);
}));

module.exports = router;
