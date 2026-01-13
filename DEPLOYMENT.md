# Deployment Guide

This guide covers deploying the Ad Rewards App to production.

## 🏗️ Architecture Overview

- **Frontend**: Static React app (Vercel, Netlify, or similar)
- **Backend**: Node.js Express API (Railway, Render, or similar)
- **Database**: PostgreSQL (Supabase, Railway, or similar)
- **Authentication**: Supabase

## 📦 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository connected

### Steps

1. **Prepare for deployment**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure settings:
     - Framework Preset: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Environment Variables**
   
   Add these in Vercel dashboard (Settings → Environment Variables):
   ```
   VITE_SUPABASE_URL=your_production_supabase_url
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   ```

4. **Custom Domain** (optional)
   - Go to Settings → Domains
   - Add your custom domain

## 🚀 Backend Deployment (Railway)

### Prerequisites
- Railway account
- GitHub repository connected

### Steps

1. **Create new project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure service**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm start`

3. **Add PostgreSQL database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Environment Variables**
   
   Add in Railway dashboard (Variables tab):
   ```
   NODE_ENV=production
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_SERVICE_KEY=your_production_service_key
   DATABASE_URL=[automatically set by Railway]
   PORT=4000
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   ```

5. **Deploy database schema**
   
   In Railway terminal:
   ```bash
   npm run prisma:push
   ```

6. **Get backend URL**
   - Railway will provide a public URL
   - Note this for frontend configuration

## 🔧 Alternative: Backend on Render

### Steps

1. **Create new Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure**
   - Name: `ad-rewards-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm start`

3. **Add PostgreSQL**
   - Create new PostgreSQL instance in Render
   - Link to your web service

4. **Environment Variables**
   
   Same as Railway configuration above

## 🗄️ Database Setup (Supabase)

### Production Database

1. **Use Supabase PostgreSQL**
   - Supabase provides a PostgreSQL database
   - Get connection string from Settings → Database
   - Use this as `DATABASE_URL` in backend

2. **Or use separate PostgreSQL**
   - Railway PostgreSQL
   - Render PostgreSQL
   - AWS RDS
   - Digital Ocean

### Run Migrations

```bash
# Set DATABASE_URL to production
export DATABASE_URL="your_production_database_url"

# Push schema
npm run prisma:push

# Or run migrations
npm run prisma:migrate deploy
```

## 🔐 Supabase Configuration

### Production Setup

1. **OAuth Providers**
   
   Update redirect URLs in Supabase dashboard:
   - Google: `https://your-domain.com/auth/callback`
   - Facebook: `https://your-domain.com/auth/callback`

2. **API Settings**
   
   - Get production credentials from Settings → API
   - Update environment variables in frontend and backend

3. **Security**
   
   - Enable RLS (Row Level Security) on tables
   - Configure auth policies
   - Set up email templates

## 🔄 Update Frontend API URL

After backend deployment, update frontend to point to production API:

**frontend/vite.config.ts**
```typescript
export default defineConfig({
  // ... other config
  server: {
    proxy: {
      '/api': {
        target: 'https://your-backend-url.railway.app',
        changeOrigin: true,
      },
    },
  },
})
```

Or use environment variable:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
```

## ✅ Deployment Checklist

- [ ] Supabase project created and configured
- [ ] OAuth providers enabled and configured
- [ ] Production database created
- [ ] Database schema deployed
- [ ] Backend deployed with environment variables
- [ ] Frontend deployed with environment variables
- [ ] Frontend API URL updated
- [ ] OAuth callback URLs updated
- [ ] Custom domains configured (optional)
- [ ] SSL/HTTPS enabled
- [ ] Test authentication flow
- [ ] Test ad viewing and earnings
- [ ] Test withdrawal system
- [ ] Monitor logs for errors

## 🔍 Monitoring & Logs

### Frontend (Vercel)
- View logs in Vercel dashboard
- Set up error tracking (Sentry, LogRocket)

### Backend (Railway/Render)
- View logs in platform dashboard
- Set up application monitoring
- Configure alerts for errors

## 🚨 Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` is set correctly in backend
- Check Supabase allowed origins

### OAuth Issues
- Verify callback URLs in OAuth providers
- Check Supabase auth configuration

### Database Connection
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure Prisma migrations are applied

### 502/503 Errors
- Check backend logs
- Verify environment variables
- Check database connectivity

## 📊 Performance Optimization

### Frontend
- Enable CDN caching
- Compress images
- Use code splitting
- Enable gzip compression

### Backend
- Use connection pooling
- Cache frequent queries
- Enable API rate limiting
- Use production database settings

## 🔒 Security Best Practices

- Never commit `.env` files
- Use environment variables for secrets
- Enable HTTPS everywhere
- Keep dependencies updated
- Regular security audits
- Implement rate limiting
- Use strong database passwords
- Enable database backups

---

For issues or questions about deployment, open an issue on GitHub.
