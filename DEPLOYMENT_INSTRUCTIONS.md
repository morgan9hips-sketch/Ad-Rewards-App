# Deployment Instructions

## Architecture

- **Backend API**: Deployed to `backend-api` on Vercel
- **Frontend App**: Deployed to `ad-rewards-app` on Vercel

## Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- Logged into Vercel: `vercel login`

## Backend Deployment

### 1. Deploy Backend to `backend-api`

```bash
cd backend
vercel --prod
```

### 2. Configure Environment Variables on Vercel

Go to Vercel Dashboard → `backend-api` project → Settings → Environment Variables

Add all variables from `backend/.env.production`:

```
SUPABASE_URL=https://yvgdzwzyaxzwwunnmlhc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
ADMOB_APP_ID=ca-app-pub-4849029372688725~4106586687
ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-4849029372688725/3994906043
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://ad-rewards-app.vercel.app
TENANT_ID=ad-rewards-app
API_KEY=pk_adrewards_3b4700d6-72b3-479f-9471-b3812d167c90
PAYPAL_CLIENT_ID=YOUR_PAYPAL_LIVE_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_LIVE_CLIENT_SECRET
```

### 3. Backend Project Name

Ensure Vercel project is named `backend-api` or update the URL in frontend config

## Frontend Deployment

### 1. Update API URL (if needed)

If your backend is at a custom domain instead of `backend-api.vercel.app`, update:

```bash
# In frontend/.env.production
VITE_API_URL=https://your-backend-domain.com
```

### 2. Deploy Frontend to `ad-rewards-app`

```bash
cd frontend
vercel --prod
```

### 3. Configure Environment Variables on Vercel

Go to Vercel Dashboard → `ad-rewards-app` project → Settings → Environment Variables

Add all variables from `frontend/.env.production`:

```
VITE_ADMOB_APP_ID=ca-app-pub-4849029372688725~4106586687
VITE_ADMOB_REWARDED_ID=ca-app-pub-4849029372688725/3994906043
VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-4849029372688725/3994906043
VITE_ADMOB_BANNER_ID=ca-app-pub-4849029372688725/3994906043
VITE_API_URL=https://backend-api.vercel.app
VITE_SUPABASE_URL=https://yvgdzwzyaxzwwunnmlhc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Frontend Project Name

Ensure Vercel project is named `ad-rewards-app`

## Custom Domains (Optional)

### Backend Custom Domain

If using `api.adrevtechnologies.com`:

1. Go to Vercel → `backend-api` → Settings → Domains
2. Add `api.adrevtechnologies.com`
3. Update DNS records as instructed
4. Update `frontend/.env.production`:
   ```
   VITE_API_URL=https://api.adrevtechnologies.com
   ```
5. Redeploy frontend

### Frontend Custom Domain

If using `adify.adrevtechnologies.com`:

1. Go to Vercel → `ad-rewards-app` → Settings → Domains
2. Add `adify.adrevtechnologies.com`
3. Update DNS records as instructed
4. Update `backend/.env.production`:
   ```
   FRONTEND_URL=https://adify.adrevtechnologies.com
   ```
5. Redeploy backend

## Verification

### 1. Check Backend Health

```bash
curl https://backend-api.vercel.app/api/health
```

### 2. Check Frontend

Open browser: `https://ad-rewards-app.vercel.app`

### 3. Test Authentication Flow

1. Sign up new user
2. Complete profile setup
3. Check dashboard loads
4. Verify location banner (optional GPS)

### 4. Check CORS

- Frontend should connect to backend without CORS errors
- Check browser console for any errors

## Troubleshooting

### Backend Not Responding

- Check Vercel logs: `vercel logs backend-api`
- Verify environment variables are set
- Ensure `vercel.json` is correct

### Frontend Can't Connect to Backend

- Verify `VITE_API_URL` matches backend deployment URL
- Check CORS headers in backend `vercel.json`
- Check backend `/api/health` endpoint

### Database Connection Issues

- Verify `DATABASE_URL` and `DIRECT_URL` in backend env vars
- Check Supabase connection pooler is enabled
- Run migrations: `cd backend && npx prisma migrate deploy`

### Build Failures

- Backend: Check TypeScript errors with `npm run build`
- Frontend: Check Vite build with `npm run build`
- Verify all dependencies installed

## Quick Deploy Commands

### Deploy Both (Production)

```bash
# Backend
cd backend
vercel --prod

# Frontend (wait for backend to complete first)
cd ../frontend
vercel --prod
```

### Preview Deploy (Testing)

```bash
# Backend
cd backend
vercel

# Frontend
cd ../frontend
vercel
```

## Post-Deployment

1. ✅ Test user signup/login
2. ✅ Test profile creation
3. ✅ Verify location works (IP fallback + optional GPS)
4. ✅ Test watch ad flow
5. ✅ Test game flow
6. ✅ Check transactions history
7. ✅ Test leaderboard
8. ✅ Verify all images load (logos, AdCoins)
9. ✅ Test withdrawal request
10. ✅ Check admin panel (if admin user)

## Environment URLs

### Development

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### Production

- Frontend: `https://ad-rewards-app.vercel.app` (or custom domain)
- Backend: `https://backend-api.vercel.app` (or custom domain)
