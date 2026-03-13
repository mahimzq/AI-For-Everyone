<align="center">
  <img src="client/public/favicon.ico" width="80" alt="Mindset AI Logo" />
  <h1><b>AI For Everybody</b></h1>
  <p><i>The Yaoundé AI Career Acceleration Conference 🚀</i></p>

  [![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
  [![Tailwind](https://img.shields.io/badge/Styling-Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
</p>

---

## 🌟 Mission
Empowering the next generation of AI leaders in Africa. This platform manages the registrations, resources, and community engagement for the **AI Career Acceleration Conference** at Djeuga Palace, Yaoundé.

## 🚀 Key Features
- **Smart Registration**: Seamless event registration with offline sync capabilities.
- **Resource Hub**: Dynamic PDF downloads for AI starters and experts.
- **Real-time Tracking**: Detailed logs of who downloads which resource for analytics.
- **WhatsApp Integration**: Live member count display synchronized with admin settings.
- **Admin Dashboard**: Comprehensive control over registrations, messages, and site configuration.
- **Biometric Security**: Face ID & Touch ID login for administrators.

## 🛠️ Technical Stack
- **Frontend**: `React` (Vite), `Tailwind CSS`, `Framer Motion`, `GSAP`, `Recharts`.
- **Backend**: `Node.js`, `Express.js`, `Sequelize ORM` (MySQL).
- **Automation**: `Redis` + `BullMQ` for reliable email and job processing.
- **Analytics**: Real-time event and resource engagement metrics.

## 🏗️ Project Structure
```text
ai-for-everybody/
├── client/          # React frontend (Vite) + Design System
├── server/          # Express API + Sequelize Models + Queue Workers
├── database/        # MySQL Schemas & Seed Scripts
└── nginx/           # Deployment configurations
```

---

## ⚙️ Quick Start (Local Development)

### 1. Installation
```bash
# Clone and install dependencies
git clone https://github.com/mahimzq/AI-For-Everyone.git
cd AI-For-Everyone/client && npm install
cd ../server && npm install
```

### 2. Configuration
- Create a `.env` in the `server` directory based on `.env.example`.
- Seed the initial admin user:
```bash
cd server && node seedAdmin.js
```

### 3. Launch
```bash
# Terminal 1: Frontend
cd client && npm run dev

# Terminal 2: Backend
cd server && npm run dev
```

---

## 🔐 Admin Access
Access the secure dashboard via `/admin`.
- **Credentials**: Refer to your internal documentation or use the `seedAdmin.js` script to generate a new administrative account.
- **Security**: Admins are encouraged to enable **Face ID / Touch ID** via the settings page for enhanced security.

## 📝 Deployment
Hosted on **Hostinger VPS** using **PM2** and **Nginx**.
- Build: `npm run build`
- Process Management: `pm2 start server.js --name "ai_for_everybody"`

---
<p align="center">Made with ❤️ for the African AI Community by <b>Mindset</b></p>
