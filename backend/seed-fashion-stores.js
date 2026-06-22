const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const SEED = {
  adminPassword: 'store2024',
};

const FASHION_PHOTOS = [
  '1576566588028-4147f3842f27','1556909114-f6e7ad7d3136','1595777457583-95e059d581b8',
  '1541099649105-f69ad21f3246','1583496661160-fb5886a0aaaa','1624378439575-d8705ad7ae80',
  '1539533113208-f6df8cc8b543','1520975954732-35dd22299614','1605518216938-7c31b7b14ad0',
  '1548036328-c9fa89d128fa','1601925260368-ae2f83cf8b7f','1635767798638-3e25273a8236',
  '1591195853828-11db59a44f6b','1617130673163-fc1b5efae7d1','1539008835657-9e8e9680c956',
  '1521572163474-6864f9cf17ab','1596755094514-f87e34085b2c','1594938298603-c8148c4dae35',
  '1583743814966-8936f5b7be1a','1576995853123-5a10305d93c0','1566174053879-31528523f8ae',
  '1515372039744-b8f02a3ae446','1553062407-98eeb64c6a62','1572635196237-14b3f281503f',
];
let fpIdx = 0;
const FIMG = () => `https://images.unsplash.com/photo-${FASHION_PHOTOS[fpIdx++ % FASHION_PHOTOS.length]}?w=600&q=80`;

const stores = [
  {
    name: 'Chic Boutique',
    subdomain: 'chic',
    tagline: 'Trendy women\'s fashion for every occasion',
    about: 'Chic Boutique brings you the latest trends in women\'s fashion. From casual everyday wear to elegant evening outfits, we curate styles that make you feel confident and beautiful.',
    phone: '+251-911-111-111',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    color_primary: '#e91e63',
    color_secondary: '#9c27b0',
    color_tertiary: '#f06292',
    categories: [
      {
        name: 'Tops',
        products: [
          { name: 'Floral Printed Blouse', price: 1549, description: 'Lightweight chiffon blouse with all-over floral print. Perfect for office or casual outings.', image_url: FIMG() },
          { name: 'Cashmere Crew Neck Sweater', price: 2199, description: 'Luxuriously soft cashmere blend sweater in classic crew neck style.', image_url: FIMG() },
          { name: 'Silk Camisole Top', price: 1299, description: 'Elegant silk camisole with adjustable straps and delicate lace trim.', image_url: FIMG() },
        ],
      },
      {
        name: 'Bottoms',
        products: [
          { name: 'High-Waist Skinny Jeans', price: 1899, description: 'Stretchy high-waist skinny jeans in indigo wash. A wardrobe essential.' },
          { name: 'Pleated Midi Skirt', price: 1699, description: 'Flowing pleated midi skirt in navy blue with elegant drape.' },
          { name: 'Tailored Trouser Pants', price: 2399, description: 'Sharp tailored trousers with a modern wide-leg cut.' },
        ],
      },
      {
        name: 'Dresses',
        products: [
          { name: 'Little Black Dress', price: 3499, description: 'Timeless little black dress with a flattering A-line silhouette.' },
          { name: 'Floral Maxi Dress', price: 2799, description: 'Boho-chic floral maxi dress with ruffled sleeves and cinched waist.' },
          { name: 'Wrap Dress', price: 2599, description: 'Classic wrap dress in jewel tones. Flatters all body types.' },
        ],
      },
      {
        name: 'Outerwear',
        products: [
          { name: 'Classic Trench Coat', price: 5499, description: 'Iconic double-breasted trench coat in khaki. Water-resistant fabric.' },
          { name: 'Denim Jacket', price: 3299, description: 'Cropped denim jacket with distressed detailing and brass buttons.' },
          { name: 'Wool Blend Blazer', price: 4299, description: 'Sophisticated wool blend blazer in charcoal grey.' },
        ],
      },
      {
        name: 'Accessories',
        products: [
          { name: 'Leather Crossbody Bag', price: 3899, description: 'Genuine leather crossbody bag with gold-tone hardware.' },
          { name: 'Silk Scarf', price: 999, description: 'Hand-rolled silk scarf with abstract print. 90x90cm.' },
          { name: 'Gold Hoop Earrings', price: 799, description: '14k gold-plated hoop earrings in medium size.' },
        ],
      },
    ],
  },
  {
    name: 'Urban Threads',
    subdomain: 'urban',
    tagline: 'Streetwear & urban fashion for the modern edge',
    about: 'Urban Threads is your destination for authentic streetwear and urban fashion. We bring the latest drops in casual wear, from classic staples to bold statement pieces.',
    phone: '+251-922-222-222',
    address: 'Mexico Square, Addis Ababa, Ethiopia',
    color_primary: '#0f766e',
    color_secondary: '#1e293b',
    color_tertiary: '#06b6d4',
    categories: [
      {
        name: 'T-Shirts',
        products: [
          { name: 'Classic Crew Neck Tee', price: 899, description: 'Premium 100% cotton crew neck t-shirt. Available in multiple colors.' },
          { name: 'Graphic Print T-Shirt', price: 1099, description: 'Bold graphic print tee with urban-inspired artwork.' },
          { name: 'Oversized Fit Tee', price: 999, description: 'Trendy oversized fit t-shirt with dropped shoulders.' },
        ],
      },
      {
        name: 'Hoodies',
        products: [
          { name: 'Pullover Hoodie', price: 2199, description: 'Heavyweight fleece pullover hoodie with kangaroo pocket.' },
          { name: 'Zip-Up Hoodie', price: 2399, description: 'Full-zip hoodie with ribbed cuffs and adjustable drawstring hood.' },
          { name: 'Cropped Hoodie', price: 1999, description: 'Cropped streetwear hoodie with oversized fit and front pouch.' },
        ],
      },
      {
        name: 'Jeans',
        products: [
          { name: 'Slim Fit Jeans', price: 2599, description: 'Classic slim fit jeans in washed black denim.' },
          { name: 'Baggy Cargo Pants', price: 2799, description: 'Y2K-inspired baggy cargo pants with multiple pockets.' },
          { name: 'Distressed Denim', price: 2399, description: 'Ripped and distressed skinny jeans with a vintage wash.' },
        ],
      },
      {
        name: 'Jackets',
        products: [
          { name: 'Bomber Jacket', price: 3499, description: 'Classic MA-1 bomber jacket with nylon shell and quilted lining.' },
          { name: 'Leather Moto Jacket', price: 6499, description: 'Genuine leather motorcycle jacket with asymmetrical zip.' },
          { name: 'Puffer Vest', price: 2999, description: 'Lightweight quilted puffer vest with stand-up collar.' },
        ],
      },
      {
        name: 'Sneakers',
        products: [
          { name: 'Low-Top Canvas', price: 1999, description: 'Classic low-top canvas sneakers with vulcanized rubber sole.' },
          { name: 'Running Sneakers', price: 3899, description: 'Performance running sneakers with cushioned midsole.' },
          { name: 'High-Top Skate Shoes', price: 2999, description: 'Durable high-top skate shoes with padded collar.' },
        ],
      },
    ],
  },
  {
    name: 'Elegance & Co.',
    subdomain: 'elegance',
    tagline: 'Premium formal & luxury fashion',
    about: 'Elegance & Co. specializes in premium formal wear and luxury accessories. From boardroom to ballroom, we dress you for success with timeless sophistication.',
    phone: '+251-933-333-333',
    address: 'Bole Medhanealem, Addis Ababa, Ethiopia',
    color_primary: '#b8860b',
    color_secondary: '#1a1a2e',
    color_tertiary: '#e2b714',
    categories: [
      {
        name: 'Suits',
        products: [
          { name: 'Two-Piece Slim Suit', price: 12999, description: 'Tailored slim-fit two-piece suit in charcoal wool blend.' },
          { name: 'Velvet Dinner Jacket', price: 10999, description: 'Luxurious velvet dinner jacket in deep burgundy.' },
          { name: 'Three-Piece Business Suit', price: 16999, description: 'Classic three-piece suit in navy with subtle pinstripe.' },
        ],
      },
      {
        name: 'Shirts & Blouses',
        products: [
          { name: 'Cotton Dress Shirt', price: 2599, description: 'Crisp 100% cotton dress shirt with French cuffs.' },
          { name: 'Silk Blouse', price: 3499, description: 'Luxurious silk blouse with a relaxed fit and mother-of-pearl buttons.' },
          { name: 'Linen Button-Down', price: 2999, description: 'Breathable linen button-down shirt perfect for warm-weather formal events.' },
        ],
      },
      {
        name: 'Neckwear',
        products: [
          { name: 'Silk Tie', price: 1299, description: 'Hand-finished silk tie in classic repp stripe pattern.' },
          { name: 'Bow Tie', price: 1099, description: 'Pre-tied velvet bow tie with adjustable neckband.' },
          { name: 'Cashmere Scarf', price: 2199, description: 'Pure cashmere fringed scarf in solid charcoal.' },
        ],
      },
      {
        name: 'Formal Shoes',
        products: [
          { name: 'Oxford Leather Shoes', price: 6499, description: 'Handcrafted Oxford shoes in polished calf leather.' },
          { name: 'Patent Leather Loafers', price: 5499, description: 'Glossy patent leather loafers with gold horsebit detail.' },
          { name: 'Stiletto Heels', price: 4299, description: 'Classic pointed-toe stiletto pumps in nude patent leather.' },
        ],
      },
      {
        name: 'Accessories',
        products: [
          { name: 'Leather Belt', price: 2199, description: 'Italian full-grain leather belt with signed buckle.' },
          { name: 'Cufflinks Set', price: 1499, description: 'Silver-tone oval cufflinks with mother-of-pearl inlay.' },
          { name: 'Designer Watch', price: 8999, description: 'Swiss-quartz dress watch with sapphire crystal and leather strap.' },
        ],
      },
    ],
  },
];

console.log('Seeding fashion stores...\n');

function generateCode(index) {
  const letterIndex = Math.floor((index - 1) / 99);
  const number = ((index - 1) % 99) + 1;
  const letter = String.fromCharCode(65 + (letterIndex % 26));
  const paddedNum = String(number).padStart(2, '0');
  return `${letter}${paddedNum}`;
}

async function seed() {
  const client = await pool.connect();
  const storeIds = [];
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM businesses');

    let productIndex = 0;

    for (const store of stores) {
      const { rows } = await client.query(`
        INSERT INTO businesses (name, subdomain, tagline, about, phone, address, color_primary, color_secondary, color_tertiary, admin_password, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active') RETURNING id
      `, [
        store.name, store.subdomain, store.tagline, store.about, store.phone, store.address,
        store.color_primary, store.color_secondary, store.color_tertiary, SEED.adminPassword,
      ]);
      const businessId = rows[0].id;

      const numProducts = store.categories.reduce((s, c) => s + c.products.length, 0);
      await client.query(
        'INSERT INTO code_counter (business_id, last_index) VALUES ($1, $2) ON CONFLICT (business_id) DO UPDATE SET last_index = $2',
        [businessId, productIndex + numProducts]
      );
      storeIds.push(businessId);

      console.log(`  ${store.name} (subdomain: ${store.subdomain}, id: ${businessId})`);

      for (const category of store.categories) {
        const { rows: catRows } = await client.query(
          'INSERT INTO categories (business_id, name) VALUES ($1, $2) RETURNING id',
          [businessId, category.name]
        );
        const categoryId = catRows[0].id;
        console.log(`    ${category.name}`);

        for (const product of category.products) {
          productIndex++;
          const code = generateCode(productIndex);
          await client.query(
            'INSERT INTO products (business_id, code, name, price, description, image_url, category_id, visible) VALUES ($1, $2, $3, $4, $5, $6, $7, 1)',
            [businessId, code, product.name, product.price, product.description, FIMG(), categoryId]
          );
          console.log(`      ${code} - ${product.name} ($${product.price})`);
        }
      }
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  console.log(`\nSeeded ${stores.length} stores with ${stores.reduce((s, st) => s + st.categories.length, 0)} categories and 45 total products`);
  console.log(`   Admin password for all stores: ${SEED.adminPassword}`);
  console.log(`   Access stores at:`);
  storeIds.forEach((id, i) => {
    console.log(`   http://localhost:5173/store?business=${id}  (${stores[i].name})`);
  });
  console.log(`   Admin panels:`);
  storeIds.forEach((id, i) => {
    console.log(`   http://localhost:5173/adminmanager?business=${id}`);
  });

  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
