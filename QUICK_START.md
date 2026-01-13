# 🚀 Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Supabase account created
- [ ] PostgreSQL database (via Supabase or separate)

## Setup in 5 Minutes

### 1️⃣ Clone & Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/morgan9hips-sketch/Ad-Rewards-App.git
cd Ad-Rewards-App

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2️⃣ Setup Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings → API
3. Copy your credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key

### 3️⃣ Configure Environment (1 minute)

**Frontend (.env):**
```bash
cd frontend
cp ../.env.example .env
# Edit .env and add your Supabase credentials
```

**Backend (.env):**
```bash
cd backend
cp ../.env.example .env
# Edit .env and add your Supabase credentials + database URL
```

### 4️⃣ Setup Database

```bash
cd backend
npm run prisma:push
```

### 5️⃣ Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# 🚀 Server running on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# 🚀 Frontend running on http://localhost:5173
```

## 🎉 You're Ready!

Open http://localhost:5173 in your browser and start developing!

## 🔍 What You Get

### Frontend Features
- 🔐 Supabase OAuth authentication
- 📊 Dashboard with earnings tracking
- 📺 Ad viewing system
- 🏆 Leaderboard
- 🎖️ Badges & achievements
- ⚙️ User settings
- 📱 Responsive mobile design
- 🌙 Dark theme

### Backend Features
- 🔒 JWT authentication middleware
- 👤 User profile management
- 📺 Ad management API
- 💰 Withdrawal system
- 🏆 Leaderboard API
- 🎖️ Badges API
- 📊 Prisma ORM with PostgreSQL

## 📚 Documentation

- **[README.md](./README.md)** - Complete documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[FEATURES.md](./FEATURES.md)** - Feature roadmap
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview

## 🆘 Troubleshooting

### Frontend won't start?
- Check Node.js version: `node --version` (needs 18+)
- Delete `node_modules` and run `npm install` again
- Check `.env` file exists with valid credentials

### Backend won't start?
- Verify DATABASE_URL in `.env`
- Check Supabase credentials
- Run `npm run prisma:generate`

### TypeScript errors?
- Run `npx tsc --noEmit` to check for errors
- All type definitions are included

### Authentication not working?
- Verify Supabase OAuth providers are enabled
- Check callback URLs: `http://localhost:5173/auth/callback`
- Confirm credentials in `.env` files

## 💡 Pro Tips

1. **Use two terminals** - One for frontend, one for backend
2. **Check logs** - Both servers show helpful debug info
3. **Hot reload** - Code changes auto-refresh
4. **TypeScript** - Get type hints in VS Code
5. **Prisma Studio** - Run `npx prisma studio` to view database

## 🎯 Next Steps

1. [ ] Configure OAuth providers in Supabase
2. [ ] Customize branding (Logo, colors)
3. [ ] Add real ad videos
4. [ ] Setup PayPal integration
5. [ ] Deploy to production

## 🤝 Need Help?

- Check existing documentation
- Open an issue on GitHub
- Review code comments

---

Happy coding! 🚀
