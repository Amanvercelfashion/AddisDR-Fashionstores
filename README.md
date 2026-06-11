# 👗 White-Label Fashion Store Platform

A lightweight, reusable fashion store catalog + order request system.  
Orders go to Telegram. No payments, no accounts — just browse → select → request.

---

## 🎨 Sample Fashion Stores

The project includes a seed script that creates **3 sample fashion stores**, each with **5 categories** and **15 products** (3 per category):

| Store | Theme | Categories | 
|-------|-------|-----------|
| **Chic Boutique** | Women's fashion (pink/rose) | Tops, Bottoms, Dresses, Outerwear, Accessories |
| **Urban Threads** | Streetwear (teal/navy) | T-Shirts, Hoodies, Jeans, Jackets, Sneakers |
| **Elegance & Co.** | Formal wear (gold/navy) | Suits, Shirts & Blouses, Neckwear, Formal Shoes, Accessories |

### Seed the database

```bash
cd backend
node seed-fashion-stores.js
```

Admin password for all sample stores: `fashion2024`

---

## 🏗 Project Structure

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

## 🚀 Quick Start

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

### 4. Seed sample fashion stores (optional)

```bash
cd backend
node seed-fashion-stores.js
```

### 5. Open the app

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Fashion store directory |
| `http://localhost:5173/store?business=5` | Chic Boutique storefront |
| `http://localhost:5173/store?business=6` | Urban Threads storefront |
| `http://localhost:5173/store?business=7` | Elegance & Co. storefront |
| `http://localhost:5173/adminmanager?business=5` | Chic Boutique admin (pw: `fashion2024`) |

---

## ⚙️ Admin Panel Features

### Company Settings (`/adminmanager/settings`)
- Store name, tagline, logo upload
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

## 📱 Telegram Setup

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

## 🌐 Production Deployment

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

## 🔁 White-Label Reuse

To deploy for a new fashion brand:

1. Copy the entire project folder
2. Set up a Supabase project and run the schema from `SUPABASE_SETUP.md`
3. Configure `DATABASE_URL` in `backend/.env`
4. Start the servers
4. Go to Super Admin → Businesses → Create Business
5. Configure store name, colors, logo, Telegram bot
6. Add categories and products via admin panel
7. Done — live in minutes

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | TailwindCSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) via `pg` |
| File uploads | Multer |
| Notifications | Telegram Bot API |
| Security | Helmet + rate-limiting |

---

## 📝 Notes

- Admin password for sample stores: `fashion2024`
- Product codes are never reused, even after deletion
- All prices shown in ETB (can be changed in frontend components)
- Images stored locally in `backend/uploads/` for development; use Supabase Storage for production
- Each store has 3 configurable theme colors set in the database
"# AddisDR-Fashionstores" 
