const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const STORE_COLORS = {
  'Chic Boutique': { primary: '#e91e63', secondary: '#9c27b0', bg: '#fce4ec', text: '#880e4f' },
  'Urban Threads': { primary: '#0f766e', secondary: '#1e293b', bg: '#e0f2f1', text: '#004d40' },
  'Elegance & Co.': { primary: '#b8860b', secondary: '#1a1a2e', bg: '#fff8e1', text: '#5d4037' },
};

function createPNG(width, height, r, g, b) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const cx = width / 2, cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      const factor = 1 - (dist / maxDist) * 0.3;
      rawData[pixelOffset] = Math.min(255, Math.round(r * factor));
      rawData[pixelOffset + 1] = Math.min(255, Math.round(g * factor));
      rawData[pixelOffset + 2] = Math.min(255, Math.round(b * factor));
      rawData[pixelOffset + 3] = 255;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let cVal = n;
      for (let k = 0; k < 8; k++) {
        cVal = (cVal & 1) ? (0xedb88320 ^ (cVal >>> 1)) : (cVal >>> 1);
      }
      table[n] = cVal;
    }
    for (let i = 0; i < buf.length; i++) {
      c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeB, data]);
    const crcVal = Buffer.alloc(4);
    crcVal.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, typeB, data, crcVal]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', iend),
  ]);
}

function createPatternPNG(width, height, r1, g1, b1, r2, g2, b2) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const stripe = ((x + y) % 40 < 20) ? 0 : 1;
      const rr = stripe ? r1 : r2;
      const gg = stripe ? g1 : g2;
      const bb = stripe ? b1 : b2;
      rawData[pixelOffset] = Math.min(255, rr);
      rawData[pixelOffset + 1] = Math.min(255, gg);
      rawData[pixelOffset + 2] = Math.min(255, bb);
      rawData[pixelOffset + 3] = 255;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let cVal = n;
      for (let k = 0; k < 8; k++) {
        cVal = (cVal & 1) ? (0xedb88320 ^ (cVal >>> 1)) : (cVal >>> 1);
      }
      table[n] = cVal;
    }
    for (let i = 0; i < buf.length; i++) {
      c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeB, data]);
    const crcVal = Buffer.alloc(4);
    crcVal.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, typeB, data, crcVal]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', iend),
  ]);
}

function createLogoSvg(storeName) {
  const initials = storeName
    .split(/[&\s]+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const c = STORE_COLORS[storeName] || { primary: '#666', bg: '#f0f0f0', text: '#333' };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${c.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg)"/>
  <text x="100" y="110" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, serif" font-size="72" font-weight="bold"
        fill="white" filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.3))">
    ${initials}
  </text>
  <text x="100" y="165" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="16" font-weight="normal"
        fill="rgba(255,255,255,0.85)">
    ${storeName}
  </text>
</svg>`;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function getCategoryColor(categoryName) {
  const colors = [
    '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4',
    '#4caf50', '#8bc34a', '#ff9800', '#ff5722', '#795548',
    '#607d8b', '#37474f', '#880e4f', '#1565c0', '#455a64',
  ];
  const idx = [...categoryName].reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

console.log('Seeding images...\n');

async function main() {
  const { rows: businesses } = await pool.query('SELECT * FROM businesses ORDER BY id');
  console.log(`Found ${businesses.length} businesses`);

  let logoCount = 0;
  let productCount = 0;

  for (const biz of businesses) {
    const storeColors = STORE_COLORS[biz.name] || { primary: '#666', secondary: '#333', bg: '#f0f0f0', text: '#333' };

    const logoSvg = createLogoSvg(biz.name);
    const logoFilename = `logo_${Date.now()}_${biz.subdomain}.svg`;
    const logoPath = path.join(UPLOADS_DIR, logoFilename);
    fs.writeFileSync(logoPath, logoSvg);
    const logoUrl = `/uploads/${logoFilename}`;

    await pool.query('UPDATE businesses SET logo_url = $1 WHERE id = $2', [logoUrl, biz.id]);
    logoCount++;
    console.log(`  ${biz.name} -> ${logoUrl}`);

    const { rows: products } = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.business_id = $1',
      [biz.id]
    );

    for (const product of products) {
      const catColor = getCategoryColor(product.category_name);
      const rgb = hexToRgb(catColor);
      const rgb2 = hexToRgb(storeColors.primary);

      const pngBuffer = createPatternPNG(400, 400, rgb.r, rgb.g, rgb.b, rgb2.r, rgb2.g, rgb2.b);
      const productFilename = `product_${Date.now()}_${product.code.toLowerCase()}.png`;
      const productPath = path.join(UPLOADS_DIR, productFilename);
      fs.writeFileSync(productPath, pngBuffer);
      const productUrl = `/uploads/${productFilename}`;

      await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [productUrl, product.id]);
      productCount++;
      console.log(`    ${product.code} - ${product.name} -> ${productUrl}`);
    }
  }

  console.log(`\nDone! Generated ${logoCount} logos and ${productCount} product images.`);
  console.log(`   Images saved to: ${UPLOADS_DIR}`);

  await pool.end();
}

main().catch(err => {
  console.error('Image seed failed:', err);
  process.exit(1);
});
