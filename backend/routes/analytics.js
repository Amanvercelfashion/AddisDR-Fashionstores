const express = require('express');
const router = express.Router();
const { pool, requireBusiness } = require('../db');

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

router.get('/overview', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows: thisWeek } = await pool.query(`
    SELECT COUNT(*)::int as count FROM orders
    WHERE business_id = $1
      AND created_at >= date_trunc('week', CURRENT_DATE - INTERVAL '7 days')
      AND created_at < date_trunc('week', CURRENT_DATE)
  `, [biz.id]);

  const { rows: lastWeek } = await pool.query(`
    SELECT COUNT(*)::int as count FROM orders
    WHERE business_id = $1
      AND created_at >= date_trunc('week', CURRENT_DATE - INTERVAL '14 days')
      AND created_at < date_trunc('week', CURRENT_DATE - INTERVAL '7 days')
  `, [biz.id]);

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
    orders: {
      total: total[0].count,
      this_week: thisCount,
      last_week: lastCount,
      today: today[0].count,
      growth_percent: growth
    },
    products: {
      total: totalProducts[0].count,
      visible: visibleProducts[0].count
    }
  });
}));

router.get('/top-products', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query(`
    SELECT oi.product_id, oi.product_code, oi.product_name,
      SUM(oi.quantity)::int as total_ordered,
      COUNT(DISTINCT oi.order_id)::int as order_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.business_id = $1
    GROUP BY oi.product_code, oi.product_name, oi.product_id
    ORDER BY total_ordered DESC
    LIMIT 10
  `, [biz.id]);

  res.json(rows);
}));

router.get('/daily-chart', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query(`
    SELECT created_at::date as day, COUNT(*)::int as order_count
    FROM orders
    WHERE business_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day ASC
  `, [biz.id]);

  res.json(rows);
}));

module.exports = router;
