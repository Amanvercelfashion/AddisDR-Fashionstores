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

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=400&h=300&fit=crop`;

const stores = [
  // ── Electronics 1 ──────────────────────────────────────────────────────────
  {
    name: 'TechZone',
    subdomain: 'techzone',
    industry: 'electronics',
    tagline: 'Latest gadgets & electronics at the best prices',
    about: 'TechZone brings you the latest in electronics and gadgets. From smartphones to laptops, audio gear to smart home devices, we have everything tech.',
    phone: '+251-911-111-111',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    color_primary: '#2563eb',
    color_secondary: '#1e40af',
    color_tertiary: '#06b6d4',
    categories: [
      {
        name: 'Smartphones',
        products: [
          { name: 'Samsung Galaxy S24', price: 54999, description: 'Latest Samsung flagship with AI features and 200MP camera.', image_url: IMG('1715869927498-c77f4bfc3e1b') },
          { name: 'iPhone 15 Pro', price: 69999, description: 'Apple iPhone 15 Pro with A17 Pro chip and titanium design.', image_url: IMG('1696426488104-99f6f5d8e3c2') },
          { name: 'Xiaomi 14 Pro', price: 39999, description: 'Flagship Xiaomi with Leica optics and 120W fast charging.', image_url: IMG('1596723929333-8c2e6c7a3b2f') },
        ],
      },
      {
        name: 'Laptops',
        products: [
          { name: 'MacBook Air M3', price: 89999, description: 'Apple MacBook Air with M3 chip, 13.6" Liquid Retina display.', image_url: IMG('1611186877085-2f7a1f2b5c3d') },
          { name: 'Dell XPS 15', price: 79999, description: 'Premium Dell XPS 15 with Intel Core i7 and OLED display.', image_url: IMG('1593642632823-8f5b4e6a7d9f') },
          { name: 'Lenovo ThinkPad X1', price: 74999, description: 'Business-class ThinkPad with Intel i7 and 16GB RAM.', image_url: IMG('1496181132907-3c7b3a4e5f6d') },
        ],
      },
      {
        name: 'Audio',
        products: [
          { name: 'Sony WH-1000XM5', price: 14999, description: 'Industry-leading noise cancelling wireless headphones.', image_url: IMG('1505740422158-2f1a7b3c4d5e') },
          { name: 'AirPods Pro 2', price: 12999, description: 'Apple AirPods Pro with adaptive audio and USB-C.', image_url: IMG('1606844763816-0c8a6f1b3e5d') },
          { name: 'JBL Flip 6', price: 5499, description: 'Portable Bluetooth speaker with deep bass and IP67 rating.', image_url: IMG('1608043152269-423dbba4e7a1') },
        ],
      },
      {
        name: 'Accessories',
        products: [
          { name: 'Anker Power Bank 20000mAh', price: 2999, description: 'High-capacity portable charger with fast charging support.', image_url: IMG('1598270648682-5b4c8f7a1e3d') },
          { name: 'Logitech MX Master 3S', price: 4999, description: 'Premium wireless mouse with quiet clicks and ergonomic design.', image_url: IMG('1626314961109-8c7d1f3b5e2a') },
          { name: 'Screen Protector 3-Pack', price: 599, description: 'Tempered glass screen protector, compatible with most phones.', image_url: IMG('1585792182967-6a4b0f5e3c2d') },
        ],
      },
      {
        name: 'Smart Home',
        products: [
          { name: 'Amazon Echo Dot 5th Gen', price: 3499, description: 'Smart speaker with Alexa and improved audio quality.', image_url: IMG('1558082069-4c7b3a2f5e1d') },
          { name: 'Philips Hue Starter Kit', price: 8999, description: 'Smart lighting kit with 4 bulbs and bridge hub.', image_url: IMG('1550988267-2c3d4e5f6a7b') },
          { name: 'Ring Video Doorbell', price: 6499, description: 'Smart video doorbell with 1080p HD and two-way audio.', image_url: IMG('1558002037-6b4a7c3d2e5f') },
        ],
      },
    ],
  },
  // ── Electronics 2 ──────────────────────────────────────────────────────────
  {
    name: 'GadgetPro',
    subdomain: 'gadgetpro',
    industry: 'electronics',
    tagline: 'Professional gadgets & computer hardware',
    about: 'GadgetPro specializes in professional-grade electronics, computer hardware, and business equipment. From powerful workstations to networking gear, we equip professionals with the tools they need.',
    phone: '+251-966-666-666',
    address: 'Kazanchis, Addis Ababa, Ethiopia',
    color_primary: '#059669',
    color_secondary: '#065f46',
    color_tertiary: '#34d399',
    categories: [
      {
        name: 'Desktops & Workstations',
        products: [
          { name: 'Pro Workstation i9', price: 129999, description: 'Intel Core i9, 64GB RAM, RTX 4090, 2TB NVMe for demanding workflows.', image_url: IMG('1593642632823-8f5b4e6a7d9f') },
          { name: 'Mini PC Intel NUC', price: 45999, description: 'Compact Intel NUC with Core i7, 32GB RAM, Thunderbolt 4.', image_url: IMG('1596723929333-8c2e6c7a3b2f') },
          { name: 'All-in-One iMac 24"', price: 109999, description: 'Apple iMac with M3 chip, 24" 4.5K display, 16GB RAM.', image_url: IMG('1611186877085-2f7a1f2b5c3d') },
        ],
      },
      {
        name: 'Tablets & E-Readers',
        products: [
          { name: 'iPad Pro 12.9"', price: 74999, description: 'Apple iPad Pro with M4 chip, 12.9" Liquid Retina XDR display.', image_url: IMG('1544244748-7a3d5f6e2c1b') },
          { name: 'Samsung Galaxy Tab S9', price: 54999, description: 'Samsung Galaxy Tab S9 with Dynamic AMOLED 2X and S Pen.', image_url: IMG('1589736569218-3b4c7a2d5e6f') },
          { name: 'Kindle Paperwhite', price: 9999, description: 'Amazon Kindle Paperwhite with 6.8" display and warm light.', image_url: IMG('1594726967372-5a4c3b2d1e6f') },
        ],
      },
      {
        name: 'Networking',
        products: [
          { name: 'TP-Link WiFi 7 Router', price: 12999, description: 'Tri-band WiFi 7 router with 10Gbps speeds and AI mesh technology.', image_url: IMG('1558002037-6b4a7c3d2e5f') },
          { name: 'Mesh WiFi System 3-Pack', price: 18999, description: 'Whole-home mesh WiFi system covering up to 5500 sq ft.', image_url: IMG('1585792182967-6a4b0f5e3c2d') },
          { name: 'Network Switch 24-Port', price: 15999, description: 'Gigabit managed switch with 24 PoE+ ports and VLAN support.', image_url: IMG('1598270648682-5b4c8f7a1e3d') },
        ],
      },
      {
        name: 'Cameras',
        products: [
          { name: 'Sony Alpha A7 IV', price: 159999, description: 'Full-frame mirrorless camera with 33MP sensor and 4K video.', image_url: IMG('1516035060131-4f5b2c3a7e9d') },
          { name: 'GoPro Hero 12 Black', price: 35999, description: 'Action camera with 5.3K video, HyperSmooth 6.0, and waterproof to 33ft.', image_url: IMG('1502920911546-5d6e4f3a2b1c') },
          { name: 'Canon EOS R50', price: 69999, description: 'Compact mirrorless camera with 24.2MP and RF mount compatibility.', image_url: IMG('1510121962140-2c5b6a3d4e7f') },
        ],
      },
      {
        name: 'Printers & Scanners',
        products: [
          { name: 'HP LaserJet Pro', price: 24999, description: 'Wireless monochrome laser printer with 40ppm and auto-duplex.', image_url: IMG('1585792182967-6a4b0f5e3c2d') },
          { name: 'Epson EcoTank', price: 18999, description: 'Supertank color printer with up to 2 years of ink included.', image_url: IMG('1598270648682-5b4c8f7a1e3d') },
          { name: 'Document Scanner Fujitsu', price: 32999, description: 'High-speed duplex scanner with 60ppm and USB-C connectivity.', image_url: IMG('1626314961109-8c7d1f3b5e2a') },
        ],
      },
    ],
  },
  // ── Furniture 1 ────────────────────────────────────────────────────────────
  {
    name: 'Home & Comfort',
    subdomain: 'home-comfort',
    industry: 'furniture',
    tagline: 'Beautiful furniture for every home',
    about: 'Home & Comfort offers a curated selection of furniture and home decor. From modern minimalism to classic elegance, find pieces that make your house a home.',
    phone: '+251-922-222-222',
    address: 'Mexico Square, Addis Ababa, Ethiopia',
    color_primary: '#92400e',
    color_secondary: '#78350f',
    color_tertiary: '#d97706',
    categories: [
      {
        name: 'Living Room',
        products: [
          { name: 'Sectional Sofa Set', price: 29999, description: 'Spacious 3-piece sectional sofa with plush cushioning and linen upholstery.', image_url: IMG('1555041469-a600c8c4b8e3') },
          { name: 'Coffee Table with Storage', price: 8999, description: 'Modern coffee table with hidden storage compartment and tempered glass top.', image_url: IMG('1533090482320-927caf7b4b6d') },
          { name: 'Floor Lamp Tripod', price: 3999, description: 'Elegant tripod floor lamp with linen shade and adjustable height.', image_url: IMG('1513502907812-8d5b5b6e4c3d') },
        ],
      },
      {
        name: 'Bedroom',
        products: [
          { name: 'Queen Platform Bed', price: 18999, description: 'Solid wood platform bed with upholstered headboard and built-in storage drawers.', image_url: IMG('1505693416388-4f6c4f5e3a2b') },
          { name: 'Wardrobe 3-Door', price: 24999, description: 'Spacious 3-door wardrobe with hanging rods, shelves, and mirror.', image_url: IMG('1597008527210-6c3b4a2d5e8f') },
          { name: 'Nightstand Set of 2', price: 6999, description: 'Pair of nightstands with USB charging ports and smooth-gliding drawers.', image_url: IMG('1533090482320-927caf7b4b6d') },
        ],
      },
      {
        name: 'Dining',
        products: [
          { name: 'Dining Table 6-Seater', price: 15999, description: 'Extendable dining table in solid oak with seating for up to 8 guests.', image_url: IMG('1555041469-a600c8c4b8e3') },
          { name: 'Dining Chair Set of 4', price: 11999, description: 'Set of 4 upholstered dining chairs with ergonomic curved backs.', image_url: IMG('1505693416388-4f6c4f5e3a2b') },
          { name: 'Buffet Sideboard', price: 13999, description: 'Elegant sideboard with 4 doors and adjustable shelving for storage.', image_url: IMG('1597008527210-6c3b4a2d5e8f') },
        ],
      },
      {
        name: 'Home Office',
        products: [
          { name: 'Standing Desk Electric', price: 21999, description: 'Height-adjustable electric standing desk with memory presets.', image_url: IMG('1518455022359-2c7b3d5f6e1a') },
          { name: 'Ergonomic Office Chair', price: 14999, description: 'Ergonomic mesh office chair with lumbar support and adjustable armrests.', image_url: IMG('1505693416388-4f6c4f5e3a2b') },
          { name: 'Bookshelf 5-Tier', price: 7999, description: 'Modern 5-tier bookshelf in engineered wood with open and closed storage.', image_url: IMG('1533090482320-927caf7b4b6d') },
        ],
      },
      {
        name: 'Decor',
        products: [
          { name: 'Area Rug 5x7', price: 4999, description: 'Hand-woven wool area rug with geometric pattern in neutral tones.', image_url: IMG('1513502907812-8d5b5b6e4c3d') },
          { name: 'Wall Art Canvas Set', price: 2999, description: 'Set of 3 abstract canvas prints with minimalist black frames.', image_url: IMG('1533090482320-927caf7b4b6d') },
          { name: 'Decorative Cushion Set', price: 1499, description: 'Set of 4 decorative cushions with removable covers and various textures.', image_url: IMG('1555041469-a600c8c4b8e3') },
        ],
      },
    ],
  },
  // ── Furniture 2 ────────────────────────────────────────────────────────────
  {
    name: 'Modern Nest',
    subdomain: 'modern-nest',
    industry: 'furniture',
    tagline: 'Contemporary furniture for modern living',
    about: 'Modern Nest brings you sleek, contemporary furniture designed for todays lifestyle. Minimalist aesthetics meet practical functionality in every piece we offer.',
    phone: '+251-977-777-777',
    address: 'Bole, Addis Ababa, Ethiopia',
    color_primary: '#1e3a5f',
    color_secondary: '#0f2b45',
    color_tertiary: '#4895ef',
    categories: [
      {
        name: 'Sofas & Seating',
        products: [
          { name: 'Velvet Chesterfield Sofa', price: 34999, description: 'Luxurious velvet chesterfield sofa with tufted back and gold legs.', image_url: IMG('1555041469-a600c8c4b8e3') },
          { name: 'Mid-Century Armchair', price: 12999, description: 'Iconic mid-century armchair with walnut legs and wool upholstery.', image_url: IMG('1518455022359-2c7b3d5f6e1a') },
          { name: 'Ottoman Storage Bench', price: 6999, description: 'Multi-purpose storage ottoman with cushioned top and linen cover.', image_url: IMG('1505693416388-4f6c4f5e3a2b') },
        ],
      },
      {
        name: 'Tables',
        products: [
          { name: 'Marble Coffee Table', price: 18999, description: 'Italian marble coffee table with brass base and waterfall edge.', image_url: IMG('1533090482320-927caf7b4b6d') },
          { name: 'Glass Desk 140cm', price: 14999, description: 'Tempered glass desk with chrome legs and cable management tray.', image_url: IMG('1518455022359-2c7b3d5f6e1a') },
          { name: 'Nesting Side Tables', price: 7999, description: 'Set of 3 nesting side tables in matte black with oak tops.', image_url: IMG('1513502907812-8d5b5b6e4c3d') },
        ],
      },
      {
        name: 'Storage',
        products: [
          { name: 'TV Unit Media Console', price: 21999, description: 'Wall-mounted media console with sliding doors and LED backlighting.', image_url: IMG('1597008527210-6c3b4a2d5e8f') },
          { name: 'Modular Shelving System', price: 17999, description: 'Customizable modular shelving with mix-and-match cubicles.', image_url: IMG('1533090482320-927caf7b4b6d') },
          { name: 'Shoe Cabinet 24-Pair', price: 8999, description: 'Slim shoe storage cabinet with flip-down doors holding 24 pairs.', image_url: IMG('1555041469-a600c8c4b8e3') },
        ],
      },
      {
        name: 'Lighting',
        products: [
          { name: 'Pendant Light Cluster', price: 12999, description: 'Three-light geometric pendant cluster in brushed brass finish.', image_url: IMG('1513502907812-8d5b5b6e4c3d') },
          { name: 'LED Floor Lamp Arc', price: 8999, description: 'Curved arc floor lamp with marble base and linen shade.', image_url: IMG('1505693416388-4f6c4f5e3a2b') },
          { name: 'Wall Sconce Set of 2', price: 4999, description: 'Modern wall sconces with opal glass globes and gold accents.', image_url: IMG('1518455022359-2c7b3d5f6e1a') },
        ],
      },
      {
        name: 'Outdoor',
        products: [
          { name: 'Rattan Patio Set', price: 25999, description: '4-piece rattan patio set with sofa, 2 chairs, and coffee table.', image_url: IMG('1555041469-a600c8c4b8e3') },
          { name: 'Hanging Egg Chair', price: 14999, description: 'Wicker hanging egg chair with weather-resistant cushion and stand.', image_url: IMG('1518455022359-2c7b3d5f6e1a') },
          { name: 'Outdoor Dining Set', price: 32999, description: '6-seater aluminum dining set with tempered glass top and swivel chairs.', image_url: IMG('1505693416388-4f6c4f5e3a2b') },
        ],
      },
    ],
  },
  // ── Gifts 1 ────────────────────────────────────────────────────────────────
  {
    name: 'GiftWorld',
    subdomain: 'giftworld',
    industry: 'gifts',
    tagline: 'Perfect gifts for every occasion',
    about: 'GiftWorld is your one-stop shop for thoughtful gifts and souvenirs. Whether it is a birthday, anniversary, or just because, find something special here.',
    phone: '+251-933-333-333',
    address: 'Bole Medhanealem, Addis Ababa, Ethiopia',
    color_primary: '#e11d48',
    color_secondary: '#9f1239',
    color_tertiary: '#f43f5e',
    categories: [
      {
        name: 'Jewelry',
        products: [
          { name: 'Personalized Name Necklace', price: 2499, description: '14k gold-plated name necklace with your choice of name in elegant script.', image_url: IMG('1515562141209-7a8e5b6c3d2f') },
          { name: 'Birthstone Bracelet', price: 1799, description: 'Adjustable bracelet with genuine birthstone charm. Available for all months.', image_url: IMG('1605106155943-6b4c7a2d5e3f') },
          { name: 'Couple Ring Set', price: 3499, description: 'Matching stainless steel couple rings with engraved message option.', image_url: IMG('1518133911624-6b4c7a3d5e2f') },
        ],
      },
      {
        name: 'Gift Hampers',
        products: [
          { name: 'Luxury Chocolate Box', price: 2199, description: 'Assorted premium Belgian chocolates in an elegant gift box.', image_url: IMG('1606317371994-3b5c4a7d2e6f') },
          { name: 'Spa Gift Basket', price: 3999, description: 'Lavender-scented spa set with candle, bath salts, lotion, and massage oil.', image_url: IMG('1544161510-6b4c7a3d2e5f') },
          { name: 'Coffee Lovers Hamper', price: 2999, description: 'Specialty coffee beans, French press, and artisan biscotti gift set.', image_url: IMG('1495477890710-3b5c4a7d2e6f') },
        ],
      },
      {
        name: 'Novelty Items',
        products: [
          { name: 'Custom Photo Mug', price: 599, description: '11oz ceramic mug with your uploaded photo. Microwave and dishwasher safe.', image_url: IMG('1514228225180-6b4c7a3d5e2f') },
          { name: 'LED Message Board', price: 1499, description: 'Acrylic LED message board with colorful markers for messages and drawings.', image_url: IMG('1576506290227-4c3b5a6d2e7f') },
          { name: 'Mini Drone', price: 4499, description: 'Compact foldable drone with HD camera, one-key takeoff, and altitude hold.', image_url: IMG('1502920911546-5d6e4f3a2b1c') },
        ],
      },
      {
        name: 'Home Decor Gifts',
        products: [
          { name: 'Scented Candle Set', price: 1299, description: 'Set of 3 soy wax candles in vanilla, lavender, and sandalwood.', image_url: IMG('1606317371994-3b5c4a7d2e6f') },
          { name: 'Photo Frame Collage', price: 999, description: 'Rustic wooden photo frame collage holding 6 photos in various sizes.', image_url: IMG('1513502907812-8d5b5b6e4c3d') },
          { name: 'Indoor Plant Kit', price: 1799, description: 'Self-watering planter with succulent, soil, and care guide.', image_url: IMG('1505693416388-4f6c4f5e3a2b') },
        ],
      },
      {
        name: 'Accessories',
        products: [
          { name: 'Leather Wallet', price: 3499, description: 'Genuine leather bifold wallet with RFID blocking and 12 card slots.', image_url: IMG('1627123474573-7b3c4a5d6e2f') },
          { name: 'Silk Tie Set', price: 1999, description: 'Hand-finished silk tie with matching pocket square in gift box.', image_url: IMG('1589362792062-6b4c7a3d5e2f') },
          { name: 'Fashion Watch', price: 5999, description: 'Elegant analog watch with stainless steel band and date display.', image_url: IMG('1524592094713-0f3a4b5c6d7e') },
        ],
      },
    ],
  },
  // ── Gifts 2 ────────────────────────────────────────────────────────────────
  {
    name: 'TreasureBox',
    subdomain: 'treasurebox',
    industry: 'gifts',
    tagline: 'Unique gifts & personalized treasures',
    about: 'TreasureBox specializes in personalized gifts and unique finds. Every item is handpicked to bring joy, with customization options that make each gift truly one-of-a-kind.',
    phone: '+251-988-888-888',
    address: 'Piassa, Addis Ababa, Ethiopia',
    color_primary: '#d946ef',
    color_secondary: '#a21caf',
    color_tertiary: '#f0abfc',
    categories: [
      {
        name: 'Personalized Gifts',
        products: [
          { name: 'Custom Family Portrait', price: 4999, description: 'Hand-drawn digital family portrait printed on premium canvas, 16x20".', image_url: IMG('1515562141209-7a8e5b6c3d2f') },
          { name: 'Engraved Wooden Plaque', price: 2499, description: 'Laser-engraved walnut plaque with custom text and design of your choice.', image_url: IMG('1514228225180-6b4c7a3d5e2f') },
          { name: 'Initial Keychain Set', price: 999, description: 'Set of 2 monogrammed leather keychains in gift box with personalized initials.', image_url: IMG('1627123474573-7b3c4a5d6e2f') },
        ],
      },
      {
        name: 'Party Supplies',
        products: [
          { name: 'Birthday Banner Kit', price: 1499, description: 'Complete birthday banner kit with letters, balloons, and confetti for 20 guests.', image_url: IMG('1514228225180-6b4c7a3d5e2f') },
          { name: 'Custom Party Hats', price: 799, description: 'Set of 8 personalized party hats with name and age printed on each.', image_url: IMG('1576506290227-4c3b5a6d2e7f') },
          { name: 'Photo Booth Props', price: 1299, description: 'Set of 20 fun photo booth props on sticks, includes mustaches, lips, and frames.', image_url: IMG('1606317371994-3b5c4a7d2e6f') },
        ],
      },
      {
        name: 'Keepsakes',
        products: [
          { name: 'Memory Shadow Box', price: 3999, description: 'Deep-shadow box frame with 12 compartments for storing ticket stubs and photos.', image_url: IMG('1513502907812-8d5b5b6e4c3d') },
          { name: 'Baby Footprint Kit', price: 1799, description: 'Non-toxic clay impression kit for capturing babys hand or footprint forever.', image_url: IMG('1518133911624-6b4c7a3d5e2f') },
          { name: 'Wedding Guest Book', price: 2999, description: 'Leather-bound wedding guest book with polaroid slots and prompt pages.', image_url: IMG('1495477890710-3b5c4a7d2e6f') },
        ],
      },
      {
        name: 'Tech Gifts',
        products: [
          { name: 'LED Strip Lights', price: 2499, description: 'Smartphone-controlled RGB LED strip lights with 16 million colors and music sync.', image_url: IMG('1502920911546-5d6e4f3a2b1c') },
          { name: 'Wireless Charging Pad', price: 1999, description: '15W fast wireless charger with LED indicator and anti-slip silicone ring.', image_url: IMG('1598270648682-5b4c8f7a1e3d') },
          { name: 'Portable Projector', price: 8999, description: 'Mini LED projector with 1080p support, WiFi, and built-in speaker.', image_url: IMG('1558002037-6b4a7c3d2e5f') },
        ],
      },
      {
        name: 'Stationery',
        products: [
          { name: 'Journal Set', price: 1499, description: 'Hardcover dotted journal with pen set, sticky notes, and bookmark in gift box.', image_url: IMG('1514228225180-6b4c7a3d5e2f') },
          { name: 'Custom Stamp Collection', price: 999, description: 'Set of 4 custom rubber stamps with your monogram and favorite motifs.', image_url: IMG('1627123474573-7b3c4a5d6e2f') },
          { name: 'Calligraphy Pen Set', price: 2499, description: 'Professional calligraphy set with 6 nibs, ink cartridges, and practice booklet.', image_url: IMG('1576506290227-4c3b5a6d2e7f') },
        ],
      },
    ],
  },
  {
    name: 'Chic Boutique',
    subdomain: 'chic',
    industry: 'fashion',
    tagline: 'Trendy womens fashion for every occasion',
    about: 'Chic Boutique brings you the latest trends in womens fashion. From casual everyday wear to elegant evening outfits, we curate styles that make you feel confident and beautiful.',
    phone: '+251-944-444-444',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    color_primary: '#e91e63',
    color_secondary: '#9c27b0',
    color_tertiary: '#f06292',
    categories: [
      {
        name: 'Tops',
        products: [
          { name: 'Floral Printed Blouse', price: 1549, description: 'Lightweight chiffon blouse with all-over floral print.', image_url: IMG('1539004499972-5f4b6c7a3d2e') },
          { name: 'Cashmere Crew Neck Sweater', price: 2199, description: 'Luxuriously soft cashmere blend sweater in classic crew neck.', image_url: IMG('1576839297392-5f4b6c7a3d2e') },
          { name: 'Silk Camisole Top', price: 1299, description: 'Elegant silk camisole with adjustable straps and delicate lace trim.', image_url: IMG('1523381210438-5f4b6c7a3d2e') },
        ],
      },
      {
        name: 'Bottoms',
        products: [
          { name: 'High-Waist Skinny Jeans', price: 1899, description: 'Stretchy high-waist skinny jeans in indigo wash.', image_url: IMG('1541091761957-5f4b6c7a3d2e') },
          { name: 'Pleated Midi Skirt', price: 1699, description: 'Flowing pleated midi skirt in navy blue with elegant drape.', image_url: IMG('1583491546150-6b4c7a3d5e2f') },
          { name: 'Tailored Trouser Pants', price: 2399, description: 'Sharp tailored trousers with a modern wide-leg cut.', image_url: IMG('1593032467806-5f4b6c7a3d2e') },
        ],
      },
      {
        name: 'Dresses',
        products: [
          { name: 'Little Black Dress', price: 3499, description: 'Timeless little black dress with a flattering A-line silhouette.', image_url: IMG('1595777457583-5f4b6c7a3d2e') },
          { name: 'Floral Maxi Dress', price: 2799, description: 'Boho-chic floral maxi dress with ruffled sleeves.', image_url: IMG('1551042111668-6b4c7a3d5e2f') },
          { name: 'Wrap Dress', price: 2599, description: 'Classic wrap dress in jewel tones. Flatters all body types.', image_url: IMG('1581046175432-5f4b6c7a3d2e') },
        ],
      },
      {
        name: 'Outerwear',
        products: [
          { name: 'Classic Trench Coat', price: 5499, description: 'Iconic double-breasted trench coat in khaki, water-resistant.', image_url: IMG('1539530808080-6b4c7a3d5e2f') },
          { name: 'Denim Jacket', price: 3299, description: 'Cropped denim jacket with distressed detailing and brass buttons.', image_url: IMG('1525457684802-5f4b6c7a3d2e') },
          { name: 'Wool Blend Blazer', price: 4299, description: 'Sophisticated wool blend blazer in charcoal grey.', image_url: IMG('1593032467806-5f4b6c7a3d2e') },
        ],
      },
      {
        name: 'Accessories',
        products: [
          { name: 'Leather Crossbody Bag', price: 3899, description: 'Genuine leather crossbody bag with gold-tone hardware.', image_url: IMG('1566152187047-5f4b6c7a3d2e') },
          { name: 'Silk Scarf', price: 999, description: 'Hand-rolled silk scarf with abstract print. 90x90cm.', image_url: IMG('1584036564723-6b4c7a3d5e2f') },
          { name: 'Gold Hoop Earrings', price: 799, description: '14k gold-plated hoop earrings in medium size.', image_url: IMG('1515562141209-7a8e5b6c3d2f') },
        ],
      },
    ],
  },
  {
    name: 'Urban Threads',
    subdomain: 'urban',
    industry: 'fashion',
    tagline: 'Streetwear & urban fashion for the modern edge',
    about: 'Urban Threads is your destination for authentic streetwear and urban fashion. We bring the latest drops in casual wear from classic staples to bold statement pieces.',
    phone: '+251-955-555-555',
    address: 'Mexico Square, Addis Ababa, Ethiopia',
    color_primary: '#0f766e',
    color_secondary: '#1e293b',
    color_tertiary: '#06b6d4',
    categories: [
      {
        name: 'T-Shirts',
        products: [
          { name: 'Classic Crew Neck Tee', price: 899, description: 'Premium 100% cotton crew neck t-shirt in multiple colors.', image_url: IMG('1521572163474-6b4c7a3d5e2f') },
          { name: 'Graphic Print T-Shirt', price: 1099, description: 'Bold graphic print tee with urban-inspired artwork.', image_url: IMG('1583744333427-5f4b6c7a3d2e') },
          { name: 'Oversized Fit Tee', price: 999, description: 'Trendy oversized fit t-shirt with dropped shoulders.', image_url: IMG('1576566588028-6b4c7a3d5e2f') },
        ],
      },
      {
        name: 'Hoodies',
        products: [
          { name: 'Pullover Hoodie', price: 2199, description: 'Heavyweight fleece pullover hoodie with kangaroo pocket.', image_url: IMG('1551028710019-6b4c7a3d5e2f') },
          { name: 'Zip-Up Hoodie', price: 2399, description: 'Full-zip hoodie with ribbed cuffs and adjustable drawstring hood.', image_url: IMG('1576566588028-6b4c7a3d5e2f') },
          { name: 'Cropped Hoodie', price: 1999, description: 'Cropped streetwear hoodie with oversized fit.', image_url: IMG('1583744333427-5f4b6c7a3d2e') },
        ],
      },
      {
        name: 'Jeans',
        products: [
          { name: 'Slim Fit Jeans', price: 2599, description: 'Classic slim fit jeans in washed black denim.', image_url: IMG('1541091761957-5f4b6c7a3d2e') },
          { name: 'Baggy Cargo Pants', price: 2799, description: 'Y2K-inspired baggy cargo pants with multiple pockets.', image_url: IMG('1593032467806-5f4b6c7a3d2e') },
          { name: 'Distressed Denim', price: 2399, description: 'Ripped and distressed skinny jeans with vintage wash.', image_url: IMG('1541091761957-5f4b6c7a3d2e') },
        ],
      },
      {
        name: 'Jackets',
        products: [
          { name: 'Bomber Jacket', price: 3499, description: 'Classic MA-1 bomber jacket with nylon shell and quilted lining.', image_url: IMG('1539530808080-6b4c7a3d5e2f') },
          { name: 'Leather Moto Jacket', price: 6499, description: 'Genuine leather motorcycle jacket with asymmetrical zip.', image_url: IMG('1525457684802-5f4b6c7a3d2e') },
          { name: 'Puffer Vest', price: 2999, description: 'Lightweight quilted puffer vest with stand-up collar.', image_url: IMG('1551028710019-6b4c7a3d5e2f') },
        ],
      },
      {
        name: 'Sneakers',
        products: [
          { name: 'Low-Top Canvas', price: 1999, description: 'Classic low-top canvas sneakers with vulcanized rubber sole.', image_url: IMG('1549298916-6b4c7a3d5e2f') },
          { name: 'Running Sneakers', price: 3899, description: 'Performance running sneakers with cushioned midsole.', image_url: IMG('1595953619882-6b4c7a3d5e2f') },
          { name: 'High-Top Skate Shoes', price: 2999, description: 'Durable high-top skate shoes with padded collar.', image_url: IMG('1549298916-6b4c7a3d5e2f') },
        ],
      },
    ],
  },
];

console.log('Seeding multi-industry stores...\n');

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
        INSERT INTO businesses (name, subdomain, industry, tagline, about, phone, address, color_primary, color_secondary, color_tertiary, admin_password, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active') RETURNING id
      `, [
        store.name, store.subdomain, store.industry, store.tagline, store.about, store.phone, store.address,
        store.color_primary, store.color_secondary, store.color_tertiary, SEED.adminPassword,
      ]);
      const businessId = rows[0].id;

      const numProducts = store.categories.reduce((s, c) => s + c.products.length, 0);
      await client.query(
        'INSERT INTO code_counter (business_id, last_index) VALUES ($1, $2) ON CONFLICT (business_id) DO UPDATE SET last_index = $2',
        [businessId, productIndex + numProducts]
      );
      storeIds.push(businessId);

      console.log(`  ${store.name} (industry: ${store.industry}, subdomain: ${store.subdomain}, id: ${businessId})`);

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
            [businessId, code, product.name, product.price, product.description, product.image_url || '', categoryId]
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

  console.log(`\nSeeded ${stores.length} stores across multiple industries:`);
  const industryCounts = {};
  stores.forEach(s => { industryCounts[s.industry] = (industryCounts[s.industry] || 0) + 1; });
  Object.entries(industryCounts).forEach(([ind, count]) => {
    console.log(`   ${count}x ${ind}`);
  });
  console.log(`\n   Admin password for all stores: ${SEED.adminPassword}`);
  console.log(`   Access stores at:`);
  storeIds.forEach((id, i) => {
    console.log(`   http://localhost:5173/${stores[i].subdomain}  (${stores[i].name})`);
  });

  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
