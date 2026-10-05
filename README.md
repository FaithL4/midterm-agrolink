# AgroLink – Smart Farmer Marketplace & Crop Intelligence System

AgroLink is a full-stack agricultural marketplace connecting Kenyan farmers, buyers, and transporters with AI-powered crop price prediction, weather advisory, delivery coordination, chat, and role-based dashboards.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Django 5 + Django REST Framework |
| Auth | JWT (Simple JWT) |
| Database | SQLite (dev) — models designed for MySQL migration |
| AI Module | Rule-based predictions using historical patterns + weather simulation |

## Folder Structure

```
AgroLink/
├── backend/                 # Django REST API
│   ├── agrolink/            # Project settings
│   ├── api/                 # Models, views, serializers, AI modules
│   │   ├── ai/              # Price prediction & weather simulation
│   │   └── management/commands/seed_data.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # React app (see note below)
└── README.md
```

> **Note:** The React frontend lives in the `project/` folder (from the initial Vite scaffold). You can rename it to `frontend/` if preferred.

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

API runs at: **http://127.0.0.1:8000/api/**

Django Admin: **http://127.0.0.1:8000/admin/**

### Frontend

```bash
cd project
npm install
npm run dev
```

App runs at: **http://localhost:5173**

## Default Login Credentials

All seeded users share the password: **`agrolink123`**

| Role | Username | Email |
|------|----------|-------|
| Admin | `admin` | admin@agrolink.co.ke |
| Farmer | `farmer1` | james.kamau@agrolink.co.ke |
| Farmer | `farmer2` | mary.wanjiku@agrolink.co.ke |
| Buyer | `buyer1` | buyer@agrolink.co.ke |
| Transporter | `transporter1` | driver@agrolink.co.ke |

## Features

### Public Site
- Home (hero, stats, featured products, testimonials, CTA)
- Marketplace (search, filters, product cards)
- Features, How It Works, About, Contact
- Login & Register (role selection: Farmer/Buyer/Transporter)

### Farmer Dashboard
- Weather advisory & local demand intelligence
- Product CRUD, order management (accept/reject)
- AI price predictions & farming advisory
- Chat with buyers, delivery tracking
- Reliability score based on reviews

### Buyer Dashboard
- Marketplace browse, cart & checkout
- M-Pesa (simulated) & Cash on Delivery payments
- Order tracking, chat with farmers

### Transporter Dashboard
- Available delivery jobs, accept & update status
- Delivery tracking workflow

### Admin Dashboard
- User management, product overview
- Reports: price predictions & demand intelligence

### API Highlights
- `POST /api/auth/register/` — Register with role
- `POST /api/auth/login/` — JWT login
- `GET /api/products/` — Search/filter marketplace
- `POST /api/orders/` — Place order
- `POST /api/orders/{id}/pay/` — Simulated M-Pesa payment (returns `AGR######` txn ID)
- `GET /api/ai/predict/` — AI price prediction
- `GET /api/ai/weather/` — Weather advisory
- `GET /api/ai/advisory/` — Farming recommendations
- `GET /api/demand/` — Local demand intelligence

## Known Limitations (MVP)

- AI predictions are rule-based simulations, not ML models
- Weather data is simulated (no external API)
- M-Pesa payment is simulated (no real STK push)
- Chat is REST-based (no WebSocket real-time)
- Cart checkout supports single-farmer orders only
- Product images use Unsplash URLs (no file upload)
- Email notifications not implemented

## License

MIT — Built for demonstration purposes.
