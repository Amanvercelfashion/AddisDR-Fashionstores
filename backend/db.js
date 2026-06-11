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
