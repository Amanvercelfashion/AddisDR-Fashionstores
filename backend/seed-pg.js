const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const SEED = {
  adminPassword: 'fashion2024',
};

const stores = [
  {
    name: 'Zemenawi',
    subdomain: 'zemenawi',
    tagline: 'Modern international fashion for the Ethiopian style',
    about: 'Zemenawi brings the latest international fashion trends to Ethiopia. From casual everyday wear to elegant evening outfits, we offer a curated selection of men\'s and women\'s fashion at competitive prices. Located in the heart of Addis Ababa, we are your destination for quality apparel and accessories.',
    phone: '+251-911-111-111',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    color_primary: '#1e40af',
    color_secondary: '#0891b2',
    color_tertiary: '#06b6d4',
    categories: [
      {
        name: "Women's Tops",
        products: [
          { name: 'Classic White Button-Down Blouse', price: 1899, description: 'Timeless white cotton blouse with a tailored fit. Perfect for office and casual wear.', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80' },
          { name: 'Floral Wrap Top', price: 1549, description: 'Lightweight chiffon wrap top with an all-over floral print and tie waist.', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
          { name: 'Cashmere Blend Sweater', price: 2499, description: 'Luxuriously soft cashmere-blend crew neck sweater in heather grey.', image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80' },
          { name: 'Off-Shoulder Knit Top', price: 1799, description: 'Stylish off-shoulder ribbed knit top with long sleeves.', image_url: 'https://images.unsplash.com/photo-1564257631407-4ffe1ad2e509?w=600&q=80' },
          { name: 'Silk Blend Camisole', price: 1299, description: 'Elegant silk-blend camisole with adjustable spaghetti straps.', image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a9f?w=600&q=80' },
        ],
      },
      {
        name: "Men's Shirts & Tees",
        products: [
          { name: 'Premium Cotton Dress Shirt', price: 2199, description: 'Crisp 100% cotton dress shirt with French cuffs and spread collar.', image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80' },
          { name: 'Casual Linen Shirt', price: 1899, description: 'Breathable linen short-sleeve shirt in light blue. Ideal for warm days.', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80' },
          { name: 'Graphic Print T-Shirt', price: 899, description: 'Urban-inspired graphic print tee in premium cotton jersey.', image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80' },
          { name: 'Oxford Cloth Button-Down', price: 2499, description: 'Classic oxford cloth button-down shirt in navy. A wardrobe staple.', image_url: 'https://images.unsplash.com/photo-1603252109307-2848d5988be9?w=600&q=80' },
          { name: 'Henley Neck Tee (3-Pack)', price: 1599, description: 'Pack of three premium henley neck t-shirts in assorted neutral tones.', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
        ],
      },
      {
        name: 'Bottoms & Jeans',
        products: [
          { name: 'High-Rise Skinny Jeans', price: 2299, description: 'Stretchy high-rise skinny jeans in premium indigo denim.', image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80' },
          { name: 'Straight-Leg Chinos', price: 2099, description: 'Versatile straight-leg chinos in khaki. Comfortable and smart-casual.', image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80' },
          { name: 'Pleated Wide-Leg Trousers', price: 2699, description: 'High-waisted pleated wide-leg trousers in charcoal crepe fabric.', image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80' },
          { name: 'Distressed Boyfriend Jeans', price: 2199, description: 'Relaxed-fit distressed boyfriend jeans with a faded vintage wash.', image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80' },
          { name: 'Tailored Cotton Shorts', price: 1299, description: 'Smart tailored cotton shorts in navy. Perfect for warm-weather styling.', image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80' },
        ],
      },
      {
        name: 'Dresses & Skirts',
        products: [
          { name: 'A-Line Midi Dress', price: 3299, description: 'Flattering A-line midi dress in deep burgundy with three-quarter sleeves.', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80' },
          { name: 'Bodycon Knit Dress', price: 2799, description: 'Figure-hugging ribbed knit bodycon dress in black with long sleeves.', image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80' },
          { name: 'Floral Maxi Dress', price: 3499, description: 'Boho-chic floral maxi dress with ruffled sleeves and elastic waist.', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
          { name: 'Classic Wrap Dress', price: 2999, description: 'Universal wrap dress in jewel-toned viscose. Flatters every body shape.', image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80' },
          { name: 'Pleated Mini Skirt', price: 1799, description: 'Flowing pleated mini skirt in camel with smooth waistband.', image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80' },
        ],
      },
      {
        name: 'Outerwear & Jackets',
        products: [
          { name: 'Classic Trench Coat', price: 5999, description: 'Iconic double-breasted trench coat in khaki with water-resistant finish.', image_url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80' },
          { name: 'Denim Jacket', price: 3499, description: 'Classic denim jacket in medium wash with button front and chest pockets.', image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80' },
          { name: 'Leather Moto Jacket', price: 8999, description: 'Genuine leather motorcycle jacket with asymmetrical zip and quilted lining.', image_url: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80' },
          { name: 'Puffer Vest', price: 2799, description: 'Lightweight quilted puffer vest with stand-up collar and zip pockets.', image_url: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&q=80' },
          { name: 'Wool Blend Blazer', price: 5499, description: 'Sophisticated wool blend blazer in charcoal grey with notch lapels.', image_url: 'https://images.unsplash.com/photo-1617130673163-fc1b5efae7d1?w=600&q=80' },
        ],
      },
      {
        name: 'Accessories',
        products: [
          { name: 'Leather Crossbody Bag', price: 3899, description: 'Genuine leather crossbody bag with adjustable strap and gold hardware.', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
          { name: 'Silk Scarf', price: 999, description: 'Hand-rolled 100% silk scarf with abstract geometric print. 90x90cm.', image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80' },
          { name: 'Gold Hoop Earrings', price: 799, description: '14k gold-plated hoop earrings in medium size. Hypoallergenic.', image_url: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80' },
          { name: 'Leather Belt', price: 1799, description: 'Full-grain leather belt with brushed silver buckle. 3cm width.', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
          { name: 'Aviator Sunglasses', price: 2499, description: 'Classic aviator sunglasses with UV400 protection and gold frame.', image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80' },
        ],
      },
    ],
  },
  {
    name: 'Bahlawi',
    subdomain: 'bahlawi',
    tagline: 'Timeless Ethiopian tradition, crafted with pride',
    about: 'Bahlawi is dedicated to preserving and celebrating Ethiopia\'s rich cultural heritage through authentic traditional clothing. From the elegant Habesha Kemis to intricate cultural accessories, our handcrafted garments showcase the finest Ethiopian craftsmanship. Each piece tells a story of our proud heritage.',
    phone: '+251-922-222-222',
    address: 'Piazza, Addis Ababa, Ethiopia',
    color_primary: '#8b4513',
    color_secondary: '#d4a574',
    color_tertiary: '#f5deb3',
    categories: [
      {
        name: 'Habesha Kemis',
        products: [
          { name: 'Traditional White Habesha Kemis', price: 4500, description: 'Handwoven white cotton Habesha Kemis with intricate traditional embroidery on the neckline and cuffs.', image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80' },
          { name: 'Ivory Shema Habesha Kemis', price: 4800, description: 'Elegant ivory-colored Habesha Kemis made from premium shema fabric with delicate cultural patterns.', image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80' },
          { name: 'Gold-Embroidered Habesha Kemis', price: 6500, description: 'Luxurious Habesha Kemis featuring gold-thread embroidery along the neckline, hem, and sleeves.', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80' },
          { name: 'Premium Shema Dress', price: 7200, description: 'High-end Habesha Kemis crafted from the finest shema fabric with elaborate hand-stitched patterns.', image_url: 'https://images.unsplash.com/photo-1564257631407-4ffe1ad2e509?w=600&q=80' },
          { name: 'Cotton Blend Habesha Kemis', price: 3500, description: 'Lightweight cotton-blend Habesha Kemis perfect for everyday wear with simple yet elegant embroidery.', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
          { name: 'Modern Fit Habesha Kemis', price: 5500, description: 'Contemporary tailored Habesha Kemis combining traditional design with a modern slim fit silhouette.', image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80' },
        ],
      },
      {
        name: 'Netela & Scarves',
        products: [
          { name: 'Traditional White Netela', price: 1200, description: 'Classic handwoven white cotton netela with thin decorative colored stripes at the ends.', image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80' },
          { name: 'Embroidered Netela', price: 2500, description: 'Beautifully embroidered netela with traditional Ethiopian patterns along the borders.', image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80' },
          { name: 'Silk Blend Netela', price: 3200, description: 'Luxurious silk-blend netela with a soft sheen and hand-embroidered edge detailing.', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
          { name: 'Cotton Fringed Netela', price: 1800, description: 'Traditional cotton netela with decorative fringing on both ends. Versatile and lightweight.', image_url: 'https://images.unsplash.com/photo-1602357280100-ec5e3ba42c27?w=600&q=80' },
          { name: 'Ceremonial Netela (Gold Trim)', price: 3800, description: 'Special occasion netela with intricate gold-thread embroidery at the borders and fringed ends.', image_url: 'https://images.unsplash.com/photo-1524386430036-1cbf5e5552c3?w=600&q=80' },
        ],
      },
      {
        name: 'Kaba & Traditional Outerwear',
        products: [
          { name: 'Classic White Kaba', price: 5500, description: 'Traditional white cotton kaba with elegant embroidery. Worn over Habesha Kemis for a complete look.', image_url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80' },
          { name: 'Embroidered Kaba', price: 7200, description: 'Exquisite kaba featuring full embroidery panels on the front and sleeves in traditional motifs.', image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80' },
          { name: 'Velvet Kaba (Special Occasion)', price: 9500, description: 'Sumptuous velvet kaba with gold embroidery and satin lining. Designed for weddings and celebrations.', image_url: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80' },
          { name: 'Cotton Blend Kaba', price: 4500, description: 'Comfortable cotton-blend kaba in a relaxed fit with subtle border embroidery details.', image_url: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&q=80' },
          { name: 'Lightweight Summer Kaba', price: 3800, description: 'Breathable lightweight kaba with short sleeves and minimal embroidery. Ideal for warmer months.', image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80' },
        ],
      },
      {
        name: "Traditional Men's Wear",
        products: [
          { name: 'Traditional White Kemis (Men\'s)', price: 3500, description: 'Classic men\'s traditional white kemis made from handwoven cotton shema fabric.', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80' },
          { name: 'Ethiopian Cotton Gabi', price: 4200, description: 'Traditional thick cotton gabi used as a shawl or wrap. Handwoven with decorative stripes.', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
          { name: 'Men\'s Shema Netela', price: 2800, description: 'Traditional men\'s netela in natural white with subtle border patterns. Versatile and essential.', image_url: 'https://images.unsplash.com/photo-1603252109307-2848d5988be9?w=600&q=80' },
          { name: 'Traditional Jodhpurs (Shint)', price: 2500, description: 'Traditional tapered trousers (shint) in white cotton with drawstring waist.', image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80' },
          { name: 'Ceremonial Man\'s Outfit', price: 8500, description: 'Complete ceremonial outfit including kemis, netela, and shint. Ideal for weddings and holidays.', image_url: 'https://images.unsplash.com/photo-1617130673163-fc1b5efae7d1?w=600&q=80' },
        ],
      },
      {
        name: 'Wedding Attire',
        products: [
          { name: 'Bridal Habesha Kemis (Gold)', price: 12000, description: 'Stunning gold-embroidered bridal Habesha Kemis with intricate beadwork and a matching netela.', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80' },
          { name: 'Bridal Habesha Kemis (White)', price: 15000, description: 'Exquisite white bridal Habesha Kemis with full hand-embroidered details, pearls, and crystal accents.', image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80' },
          { name: 'Groom\'s Traditional Suit', price: 9500, description: 'Elegant groom\'s ceremonial outfit featuring a tailored kaba with gold embroidery and matching accessories.', image_url: 'https://images.unsplash.com/photo-1617130673163-fc1b5efae7d1?w=600&q=80' },
          { name: 'Bridesmaid Habesha Kemis', price: 5500, description: 'Coordinating bridesmaid Habesha Kemis in complementary colors with elegant embroidered details.', image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80' },
          { name: 'Wedding Netela (Bridal)', price: 4500, description: 'Special bridal netela with gold-thread work and delicate pearl embellishments along the edges.', image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80' },
        ],
      },
      {
        name: 'Cultural Accessories',
        products: [
          { name: 'Ethiopian Cross Necklace', price: 2500, description: 'Handcrafted Ethiopian Orthodox cross pendant on a silver chain. Sterling silver with traditional engraving.', image_url: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80' },
          { name: 'Silver Anklet', price: 1200, description: 'Traditional Ethiopian silver anklet with delicate filigree work and secure clasp.', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
          { name: 'Traditional Bangle Set', price: 1800, description: 'Set of 6 assorted traditional bangles in mixed metals and colors. Handcrafted by Ethiopian artisans.', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
          { name: 'Handwoven Ethiopian Belt', price: 1500, description: 'Traditional handwoven cotton belt with leather ends and tassel details. Adjustable length.', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
          { name: 'Traditional Leather Sandals', price: 2200, description: 'Handmade genuine leather sandals with traditional Ethiopian design motifs and cushioned sole.', image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80' },
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
  let totalCategories = 0;
  let totalProducts = 0;
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM businesses');

    let productIndex = 0;

    for (const store of stores) {
      const { rows } = await client.query(`
        INSERT INTO businesses (name, subdomain, tagline, about, phone, address, color_primary, color_secondary, color_tertiary, admin_password, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
        RETURNING id
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
        totalCategories++;
        const { rows: catRows } = await client.query(
          'INSERT INTO categories (business_id, name) VALUES ($1, $2) RETURNING id',
          [businessId, category.name]
        );
        const categoryId = catRows[0].id;
        console.log(`    ${category.name}`);

        for (const product of category.products) {
          productIndex++;
          totalProducts++;
          const code = generateCode(productIndex);
          await client.query(
            `INSERT INTO products (business_id, code, name, price, description, image_url, category_id, visible)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 1)`,
            [businessId, code, product.name, product.price, product.description, product.image_url, categoryId]
          );
          console.log(`      ${code} - ${product.name} (ETB ${product.price})`);
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

  console.log(`\nSeeded ${stores.length} stores with ${totalCategories} categories and ${totalProducts} total products`);
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
