# Multi-Store Platform

A lightweight, white-label multi-industry store catalog + order request system.
Orders go to Telegram. No payments, no accounts — just browse → select → request.

## Sample Stores

The project includes a seed script that creates **5 sample stores** across multiple industries:

| Store | Industry | Categories | Theme |
|-------|----------|-----------|-------|
| **TechZone** | Electronics | Smartphones, Laptops, Audio, Accessories, Smart Home | Blue/cyan |
| **Home & Comfort** | Furniture | Living Room, Bedroom, Dining, Home Office, Decor | Amber/brown |
| **GiftWorld** | Gifts & Souvenirs | Jewelry, Gift Hampers, Novelty Items, Home Decor Gifts, Accessories | Red/rose |
| **Chic Boutique** | Fashion | Tops, Bottoms, Dresses, Outerwear, Accessories | Pink/purple |
| **Urban Threads** | Fashion | T-Shirts, Hoodies, Jeans, Jackets, Sneakers | Teal/navy |

### Seed the database

```bash
cd backend
node seed-stores.js
```

Admin password for all sample stores: `store2024`

---

## Project Structure

```
/
├── backend/          Node.js + Express + Supabase (PostgreSQL) API
│   ├── routes/       API route handlers
│   ├── uploads/      Uploaded images
│   ├── db.js         Database setup + code generator
│   ├── telegram.js   Telegram notification sender
│   └── server.js     Express app entry point
│
└── frontend/         React + Vite + TailwindCSS
    └── src/
        ├── pages/    Store, Checkout, Admin pages
        ├── components/  Header, ProductCard, Basket, etc.
        ├── context/  BasketContext (cart state)
        ├── hooks/    useCompany hook
        └── api.js    All API calls
```

---

## Quick Start

### 1. Install dependencies

```bash
# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (default port is 4000)
```

### 3. Run development servers

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
# Running on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

### 4. Seed sample stores (optional)

```bash
cd backend
node seed-stores.js
```

### 5. Open the app

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Store directory (all industries) |
| `http://localhost:5173/techzone` | TechZone electronics storefront |
| `http://localhost:5173/home-comfort` | Home & Comfort furniture storefront |
| `http://localhost:5173/giftworld` | GiftWorld gift shop storefront |
| `http://localhost:5173/chic` | Chic Boutique fashion storefront |
| `http://localhost:5173/adminmanager?business=ID` | Store admin panel (pw: `store2024`) |

---

## Admin Panel Features

### Company Settings (`/adminmanager/settings`)
- Store name, tagline, logo upload
- Industry/store type
- About us text and contact phone
- Telegram bot token + chat ID
- Test Telegram connection button

### Products (`/adminmanager/products`)
- Add/edit/delete products with image upload
- Auto-generated product codes (A01 → A99 → B01...)
- Toggle visibility (show/hide from store)
- Custom questions per product (shown at checkout)

### Categories (`/adminmanager/categories`)
- Add, rename, delete categories
- Cannot delete if products use the category

### Orders (`/adminmanager/orders`)
- View all orders with customer details
- See order items + custom answers
- Telegram delivery status

### Dashboard (`/adminmanager`)
- Orders today / this week / last week
- Week-over-week growth %
- Top 7 most ordered products
- 30-day order bar chart

---

## Supported Industries

| Industry | Description |
|----------|-------------|
| Fashion & Apparel | Clothing, shoes, accessories |
| Electronics & Gadgets | Phones, laptops, audio, smart home |
| Furniture & Home | Living room, bedroom, dining, decor |
| Gifts & Souvenirs | Jewelry, hampers, novelty items |
| Groceries & Food | Food items, beverages, produce |
| Sports & Outdoors | Sports equipment, camping gear |
| Books & Stationery | Books, office supplies, art |
| General Store | Any other product type |

---

## Telegram Setup

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow instructions to create a bot
3. Copy the **bot token**
4. Create a group and add your bot as admin
5. Use `@username_to_id_bot` to get your group's **chat ID** (negative number for groups)
6. Paste both in Admin → Settings → Telegram Integration

### Order message format sent to Telegram:
```
🛒 NEW ORDER

👤 Customer: John Doe
📞 Phone: 0912345678

📦 Products:
  1. Samsung S24 (A01) - 25,000 ETB × 1

📝 Custom Fields:
  - Color: Black
  - Delivery: Bole

🔢 Total Items: 1
📅 Date: Jun 9, 2026, 10:30 AM
```

---

## Production Deployment

### Build frontend
```bash
cd frontend
npm run build
# Output goes to frontend/dist/
```

### Run backend in production mode
```bash
cd backend
NODE_ENV=production node server.js
```

In production mode, the backend serves the frontend `dist/` folder automatically — you only need to run one process.

---

## White-Label Reuse

To deploy for a new store:

1. Copy the entire project folder
2. Set up a Supabase project and run the schema from `SUPABASE_SETUP.md`
3. Configure `DATABASE_URL` in `backend/.env`
4. Start the servers
5. Go to Super Admin → Businesses → Create Business
6. Configure store name, industry, colors, logo, Telegram bot
7. Add categories and products via admin panel
8. Done — live in minutes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | TailwindCSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v7 |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) via `pg` |
| File uploads | Multer |
| Notifications | Telegram Bot API |
| Security | Helmet + rate-limiting |


## Notes

- Admin password for sample stores: `store2024`
- Product codes are never reused, even after deletion
- All prices shown in ETB (can be changed in frontend components)
- Images stored locally in `backend/uploads/` for development; use Supabase Storage for production
- Each store has 3 configurable theme colors set in the database
