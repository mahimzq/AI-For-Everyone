# AI For Everybody — Yaoundé AI Career Acceleration Conference

> **Brand:** Mindset | **Founders:** Clement Tala & Arnold Chiy
> **Event:** Saturday 21 March 2026 | 10:00–16:00 | Djeuga Palace, Yaoundé, Cameroon

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + Framer Motion + GSAP + tsparticles + Recharts
- **Backend:** Node.js + Express.js + MySQL (Sequelize ORM)
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Email:** Nodemailer (Hostinger SMTP)
- **Deploy:** Hostinger VPS + Nginx + PM2

## Quick Start (Local Development)

```bash
# 1. Install dependencies
cd client && npm install
cd ../server && npm install

# 2. Set up MySQL database (if available)
mysql -u root -p < database/schema.sql

# 3. Configure environment
cp server/.env server/.env.local
# Edit server/.env with your database credentials

# 4. Seed admin user (requires MySQL)
cd server && node seedAdmin.js

# 5. Start development servers
# Terminal 1: Frontend
cd client && npm run dev

# Terminal 2: Backend
cd server && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin Dashboard: http://localhost:3000/admin

## Admin Credentials (default)

- **Email:** admin@mindsetai.co.uk
- **Password:** Mindset2026!
- ⚠️ Change after first login

## Deployment (Hostinger VPS)

See `nginx/ai-for-everybody.conf` for Nginx configuration.

```bash
# Build frontend
cd client && npm run build

# Start with PM2
cd server && pm2 start server.js --name "ai-for-everybody"
pm2 save && pm2 startup
```

## Project Structure

```
ai-for-everybody/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express)
├── database/        # MySQL schema
├── nginx/           # Nginx config
└── README.md
```
