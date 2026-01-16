# Ad Rewards App

> A clean, production-ready ad monetization platform built with React, TypeScript, Express, and Supabase.

Watch video ads, earn real money. Simple, transparent, and rewarding.

## 🚀 Features

- **Supabase Authentication** - OAuth integration with Google and Facebook
- **Ad Viewing System** - Watch ads, earn rewards in real-time
- **User Dashboard** - Track earnings, stats, and progress
- **Tier System** - Progress through Bronze, Silver, Gold, Platinum, and Diamond tiers
- **Badges & Achievements** - Unlock badges for milestones
- **Leaderboard** - Compete with other users
- **Withdrawal System** - Cash out via PayPal
- **Admin Panel** - Manage ads, users, and withdrawals

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Supabase account ([supabase.com](https://supabase.com))
- PayPal Developer account (optional, for withdrawals)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/morgan9hips-sketch/Ad-Rewards-App.git
cd Ad-Rewards-App
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your:
   - Project URL
   - Anon/Public key
   - Service Role key (keep this secret!)
3. Enable Authentication providers:
   - Go to Authentication → Providers
   - Enable Google and Facebook OAuth
   - Configure callback URLs: `http://localhost:5173/auth/callback`

### 3. Configure environment variables

**Frontend:**
```bash
cd frontend
cp ../.env.example .env
# Edit .env with your Supabase credentials
```

**Backend:**
```bash
cd backend
cp ../.env.example .env
# Edit .env with your Supabase credentials and database URL
```

### 4. Install dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 5. Set up the database

```bash
cd backend
npm run prisma:push
# or for migrations: npm run prisma:migrate
```

### 6. Run the application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 📁 Project Structure

```
Ad-Rewards-App/
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── lib/           # Supabase client
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── backend/               # Express + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth middleware
│   │   └── server.ts      # Express server
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

## 🔑 Environment Variables

### Frontend (.env)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Backend (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 4000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## 🏗️ Building for Production

**Frontend:**
```bash
cd frontend
npm run build
# Output will be in frontend/dist/
```

**Backend:**
```bash
cd backend
npm run build
npm start
# Compiled output in backend/dist/
```

## 📊 Database Schema

The app uses Prisma ORM with PostgreSQL. Key models:
- `UserProfile` - User data and earnings
- `Ad` - Advertisement information
- `AdView` - Tracking ad views and completions
- `Withdrawal` - Withdrawal requests
- `Badge` - Achievement badges
- `UserBadge` - User-earned badges

## 🔒 Security

- All authentication handled by Supabase
- Backend uses JWT verification for API protection
- Environment variables for sensitive data
- CORS configured for frontend origin only

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@adrewards.com

## 🎯 Roadmap

See [FEATURES.md](./FEATURES.md) for current features and upcoming plans.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

## 🎨 Branding

### Logo Assets

The Adify logo features a neon arcade aesthetic with vibrant colors designed to convey fun, energy, and gaming rewards.

**Logo Files Location:** `frontend/public/images/branding/`

- **logo-full.png** (1200x400px) - Full logo with "Adify" text for headers and hero sections
- **logo-icon.png** (512x512px) - Play button icon for app icons and loading states
- **favicon.png** (192x192px) - Play button icon for browser favicons

### Brand Colors

The color palette is extracted from the neon arcade logo:

**Neon Green/Yellow Gradient** (Logo circles)
- `--neon-yellow: #D4E800`
- `--neon-lime: #B8E800`
- `--neon-green: #88E800`
- `--neon-green-light: #6FE89A`

**Play Button Gradient** (Pink/Purple)
- `--play-purple: #8B00FF`
- `--play-magenta: #E600FF`
- `--play-pink: #FF00B8`

**Backgrounds**
- `--bg-black: #000000`
- `--bg-dark: #0a0a0a`
- `--bg-card: #1a1a1a`

All brand colors are defined in `frontend/src/styles/brand-colors.css`.

### Usage Guidelines

- Use **logo-full.png** for desktop headers, hero sections, and marketing materials
- Use **logo-icon.png** for mobile headers (< 640px width), app icons, and loading states
- Always maintain aspect ratio when scaling
- Logo has transparent background and looks best on dark backgrounds
- Apply subtle neon glow effects using the `.hero-logo` and `.loading-logo` CSS classes

### Design Philosophy

The neon arcade aesthetic conveys:
- **Fun and engaging** - Not a boring finance app
- **Gaming/rewards** - Arcade = play to win
- **Modern retro** - Appeals to 18-35 demographic
- **Energy and action** - Bright colors, play button iconography

---

Built with ❤️ by morgan9hips-sketch
