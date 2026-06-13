const axios = require('axios');

async function sendOrderToTelegram(botToken, chatId, order) {
  if (!botToken || !chatId) {
    console.warn('Telegram not configured, skipping notification.');
    return false;
  }

  const lines = [];
  lines.push('🛒 *NEW ORDER*');
  lines.push('');
  lines.push(`👤 *Customer:* ${escMd(order.customer_name)}`);
  lines.push(`📞 *Phone:* ${escMd(order.customer_phone)}`);
  lines.push('');
  lines.push('📦 *Products:*');

  order.items.forEach((item, i) => {
    const price = Number(item.product_price).toLocaleString();
    lines.push(`  ${i + 1}\\. ${escMd(item.product_name)} \\(${escMd(item.product_code)}\\) \\- ${escMd(price)} ETB × ${item.quantity}`);
  });

  const allAnswers = order.answers || [];
  if (allAnswers.length > 0) {
    lines.push('');
    lines.push('📝 *Custom Fields:*');
    allAnswers.forEach(a => {
      lines.push(`  \\- *${escMd(a.question)}:* ${escMd(a.answer)}`);
    });
  }

  lines.push('');
  lines.push(`🔢 *Total Items:* ${order.total_items}`);

  const date = new Date(order.created_at);
  const dateStr = date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  lines.push(`📅 *Date:* ${escMd(dateStr)}`);

  const message = lines.join('\n');

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2'
    }, { timeout: 10000 });
    return true;
  } catch (err) {
    const errMsg = err?.response?.data?.description || err.message;
    console.error('Telegram send failed:', errMsg);
    return false;
  }
}

function escMd(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

module.exports = { sendOrderToTelegram };
