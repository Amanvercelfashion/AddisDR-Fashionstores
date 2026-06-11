const express = require('express');
const router = express.Router();
const { pool, requireBusiness } = require('../db');
const { sendOrderToTelegram } = require('../telegram');

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

router.post('/', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { customer_name, customer_phone, items, answers } = req.body;

  if (!customer_name?.trim()) return res.status(400).json({ error: 'Customer name is required.' });
  if (!customer_phone?.trim()) return res.status(400).json({ error: 'Phone number is required.' });
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one product is required.' });
  }
  for (const item of items) {
    if (!item.product_id && !item.product_code) {
      return res.status(400).json({ error: 'Each item must have a product.' });
    }
    if (!item.quantity || item.quantity < 1) {
      return res.status(400).json({ error: 'Each item must have a valid quantity.' });
    }
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

      const { rows: itemRows } = await client.query(`
        INSERT INTO order_items (order_id, product_id, product_code, product_name, product_price, quantity)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [
        orderId,
        item.product_id || null,
        productData ? productData.code : (item.product_code || ''),
        productData ? productData.name : (item.product_name || ''),
        productData ? productData.price : (item.product_price || 0),
        Number(item.quantity)
      ]);

      createdItems.push({
        id: itemRows[0].id,
        product_id: item.product_id || null,
        product_code: productData ? productData.code : item.product_code,
        product_name: productData ? productData.name : item.product_name,
        product_price: productData ? productData.price : item.product_price,
        quantity: Number(item.quantity)
      });
    }

    const createdAnswers = [];
    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        if (!ans.question || !ans.answer) continue;
        let orderItemId = null;
        if (ans.item_index !== undefined && createdItems[ans.item_index]) {
          orderItemId = createdItems[ans.item_index].id;
        }
        await client.query(
          'INSERT INTO order_answers (order_id, order_item_id, question, answer) VALUES ($1, $2, $3, $4)',
          [orderId, orderItemId, ans.question, ans.answer]
        );

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
  const orderForTelegram = {
    business_name: fullBiz.name,
    customer_name: customer_name.trim(),
    customer_phone: customer_phone.trim(),
    items: orderData.createdItems,
    answers: orderData.createdAnswers,
    total_items: orderData.totalItems,
    created_at: new Date().toISOString()
  };

  sendOrderToTelegram(fullBiz.telegram_bot_token, fullBiz.telegram_chat_id, orderForTelegram)
    .then(sent => {
      if (sent) pool.query('UPDATE orders SET telegram_sent = 1 WHERE id = $1', [orderData.orderId]);
    })
    .catch(err => console.error('Telegram async error:', err));

  res.status(201).json({
    success: true,
    order_id: orderData.orderId,
    message: 'Order submitted successfully.',
    phone: fullBiz.phone
  });
}));

router.get('/', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows } = await pool.query(`
    SELECT o.*,
      STRING_AGG(oi.product_name, ', ') as product_names
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.business_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 500
  `, [biz.id]);
  res.json(rows);
}));

router.get('/:id', wrapAsync(async (req, res) => {
  const biz = await requireBusiness(req, res);
  if (!biz) return;

  const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1 AND business_id = $2', [req.params.id, biz.id]);
  if (orderRows.length === 0) return res.status(404).json({ error: 'Order not found.' });

  const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
  const { rows: answers } = await pool.query('SELECT * FROM order_answers WHERE order_id = $1', [req.params.id]);

  res.json({ ...orderRows[0], items, answers });
}));

module.exports = router;
