# Environment Variable Setup Guide

This document provides comprehensive information about all environment variables used in the Ad-Rewards-App project.

## Table of Contents

- [Quick Start](#quick-start)
- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Required vs Optional](#required-vs-optional)
- [Getting API Keys & Credentials](#getting-api-keys--credentials)
- [Security Best Practices](#security-best-practices)
- [Development vs Production](#development-vs-production)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Development Setup

1. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env.development
   # Edit .env.development with your values
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd frontend && npm install
   ```

4. **Run Prisma Migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

---

## Backend Environment Variables

### Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string. Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `DIRECT_URL` | ⚠️ Optional | - | Direct database URL (bypass connection pooling) for migrations |

**Example:**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/adrewards?sslmode=require"
```

**Where to get it:**
- Local PostgreSQL: Use your local database credentials
- Supabase: Dashboard → Settings → Database → Connection string
- Heroku Postgres: Automatically provided
- AWS RDS: Use RDS endpoint from AWS Console

---

### Supabase Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | ✅ Yes | - | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ Yes | - | Service role key (SECRET!) |
| `SUPABASE_ANON_KEY` | ⚠️ Optional | - | Anonymous key (used by backend if needed) |

**Example:**
```bash
SUPABASE_URL="https://abcdefgh.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Where to get it:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy "Project URL" and "service_role" key

**⚠️ SECURITY WARNING:**
- `SUPABASE_SERVICE_KEY` bypasses Row Level Security
- NEVER commit this to version control
- NEVER expose this in frontend code
- Rotate immediately if compromised

---

### Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | ⚠️ Optional | `4000` | Port for backend server |
| `FRONTEND_URL` | ✅ Yes | - | Frontend URL for CORS configuration |
| `NODE_ENV` | ⚠️ Optional | `development` | Environment (`development`, `production`, `test`) |
| `TENANT_ID` | ⚠️ Optional | - | Multi-tenancy identifier |
| `API_KEY` | ⚠️ Optional | - | API authentication key |

**Example:**
```bash
PORT=4000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

---

### AdMob Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMOB_APP_ID` | ✅ Yes | - | AdMob application ID |
| `ADMOB_REWARDED_AD_UNIT_ID` | ✅ Yes | - | Rewarded video ad unit ID |
| `ADMOB_INTERSTITIAL_AD_UNIT_ID` | ✅ Yes | - | Interstitial ad unit ID |
| `ADMOB_BANNER_AD_UNIT_ID` | ✅ Yes | - | Banner ad unit ID |

**Development Test IDs (Google's official test IDs):**
```bash
ADMOB_APP_ID="ca-app-pub-3940256099942544~3347511713"
ADMOB_REWARDED_AD_UNIT_ID="ca-app-pub-3940256099942544/5224354917"
ADMOB_INTERSTITIAL_AD_UNIT_ID="ca-app-pub-3940256099942544/1033173712"
ADMOB_BANNER_AD_UNIT_ID="ca-app-pub-3940256099942544/6300978111"
```

**Where to get PRODUCTION IDs:**
1. Go to https://apps.admob.com/
2. Sign in with Google account
3. Create an app or select existing app
4. Create ad units for each type (Rewarded, Interstitial, Banner)
5. Copy the generated ad unit IDs

**Ad Unit Types:**
- **Rewarded**: User watches voluntarily for rewards (coins)
- **Interstitial**: Full-screen ads shown between content
- **Banner**: Small ads displayed at top/bottom of screen

---

### PayPal Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PAYPAL_CLIENT_ID` | ✅ Yes | - | PayPal REST API client ID |
| `PAYPAL_SECRET` | ✅ Yes | - | PayPal REST API secret key (SECRET!) |
| `PAYPAL_MODE` | ✅ Yes | `sandbox` | Mode: `sandbox` or `live` |
| `PAYPAL_WEBHOOK_ID` | ⚠️ Optional | - | Webhook ID for payment notifications |
| `PAYPAL_PRODUCT_ID` | ⚠️ Optional | - | Product ID for subscriptions |
| `PAYPAL_ELITE_PLAN_ID` | ⚠️ Optional | - | Elite subscription plan ID |
| `PAYPAL_SILVER_PLAN_ID` | ⚠️ Optional | - | Legacy silver plan ID |
| `PAYPAL_GOLD_PLAN_ID` | ⚠️ Optional | - | Legacy gold plan ID |

**Example:**
```bash
PAYPAL_CLIENT_ID="YOUR_CLIENT_ID"
PAYPAL_SECRET="YOUR_SECRET"
PAYPAL_MODE="sandbox"
```

**Where to get it:**
1. Go to https://developer.paypal.com/dashboard/
2. Create an app or select existing
3. Copy Client ID and Secret from app details
4. For webhooks: Dashboard → Webhooks → Create webhook
5. For subscriptions: Dashboard → Products & Plans

**Sandbox vs Live:**
- **Sandbox**: Use for testing with fake money
- **Live**: Production mode with real payments
- Create separate apps for each mode

---

### Business Rules

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `USER_REVENUE_SHARE` | ⚠️ Optional | `0.85` | User revenue share (85% to users) |
| `COINS_PER_AD` | ⚠️ Optional | `100` | Coins awarded per ad view |
| `MINIMUM_WITHDRAWAL_USD` | ⚠️ Optional | `10.00` | Minimum withdrawal threshold in USD |
| `MAX_ADS_PER_DAY` | ⚠️ Optional | `200` | Maximum ads per user per day |
| `MAX_ADS_PER_5_MINUTES` | ⚠️ Optional | `10` | Rate limit for ad views |
| `VPN_SUSPICION_THRESHOLD` | ⚠️ Optional | `10` | Threshold for VPN detection flags |
| `ACTIONS_PER_INTERSTITIAL` | ⚠️ Optional | `5` | Actions before showing forced interstitial |

**Example:**
```bash
USER_REVENUE_SHARE=0.85
COINS_PER_AD=100
MINIMUM_WITHDRAWAL_USD=10.00
MAX_ADS_PER_DAY=200
```

**Important Notes:**
- `USER_REVENUE_SHARE`: Valid range 0.0-1.0 (0.85 = 85%)
- Changing these affects user trust - do so carefully
- Higher coin values = faster earning but lower revenue per coin
- Rate limits prevent abuse and server overload

---

### Exchange Rate API

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXCHANGE_RATE_API_URL` | ⚠️ Optional | `https://api.exchangerate-api.com/v4/latest/USD` | API endpoint for currency rates |
| `EXCHANGE_RATE_API_KEY` | ⚠️ Optional | - | API key if using paid tier |

**Example:**
```bash
EXCHANGE_RATE_API_URL="https://api.exchangerate-api.com/v4/latest/USD"
```

**Free vs Paid:**
- Free tier: Limited requests per day
- Paid tier: Higher rate limits + API key
- Consider caching rates (updated daily is sufficient)

**Alternative APIs:**
- https://exchangeratesapi.io/
- https://openexchangerates.org/
- https://currencyapi.com/

---

### Admin Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_EMAIL` | ⚠️ Optional | - | Primary admin email for notifications |
| `ADMIN_EMAILS` | ⚠️ Optional | - | Comma-separated list of admin emails |

**Example:**
```bash
ADMIN_EMAIL="admin@adrevtech.co.za"
ADMIN_EMAILS="admin1@example.com,admin2@example.com"
```

---

## Frontend Environment Variables

### Supabase Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | - | Supabase project URL (same as backend) |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | - | Anonymous key (PUBLIC - safe to expose) |

**Example:**
```bash
VITE_SUPABASE_URL="https://abcdefgh.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**⚠️ Note:**
- Use the ANON key here, NOT the service key
- This key is public and embedded in frontend bundle
- Row Level Security policies protect your data

---

### API Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ Yes | - | Backend API base URL |
| `VITE_BACKEND_URL` | ⚠️ Optional | - | Alternative backend URL |

**Example:**
```bash
# Development
VITE_API_URL="http://localhost:4000"

# Production
VITE_API_URL="https://api.yourdomain.com"
```

---

### AdMob Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_ADMOB_APP_ID` | ✅ Yes | - | AdMob app ID |
| `VITE_ADMOB_REWARDED_ID` | ✅ Yes | - | Rewarded ad unit ID |
| `VITE_ADMOB_INTERSTITIAL_ID` | ✅ Yes | - | Interstitial ad unit ID |
| `VITE_ADMOB_BANNER_ID` | ✅ Yes | - | Banner ad unit ID |

**Example:**
```bash
VITE_ADMOB_APP_ID="ca-app-pub-3940256099942544~3347511713"
VITE_ADMOB_REWARDED_ID="ca-app-pub-3940256099942544/5224354917"
```

**⚠️ Important:**
- Must match backend AdMob configuration
- Use test IDs for development
- These are embedded in frontend build (public)

---

## Required vs Optional

### Absolutely Required (App won't work without these)

**Backend:**
- ✅ `DATABASE_URL`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `FRONTEND_URL`
- ✅ `ADMOB_APP_ID`
- ✅ `ADMOB_REWARDED_AD_UNIT_ID`
- ✅ `PAYPAL_CLIENT_ID`
- ✅ `PAYPAL_SECRET`
- ✅ `PAYPAL_MODE`

**Frontend:**
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_API_URL`
- ✅ `VITE_ADMOB_APP_ID`

### Optional (Have sensible defaults)

- `PORT` (default: 4000)
- `NODE_ENV` (default: development)
- `USER_REVENUE_SHARE` (default: 0.85)
- `COINS_PER_AD` (default: 100)
- `MINIMUM_WITHDRAWAL_USD` (default: 10.00)
- `MAX_ADS_PER_DAY` (default: 200)
- All other business rule variables have fallbacks in code

---

## Getting API Keys & Credentials

### Supabase

1. Visit https://app.supabase.com
2. Create new project or select existing
3. Project Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon public → `SUPABASE_ANON_KEY` (frontend)
   - service_role → `SUPABASE_SERVICE_KEY` (backend)
5. Project Settings → Database
6. Copy Connection String → `DATABASE_URL`

### AdMob

1. Visit https://apps.admob.com/
2. Sign in with Google account
3. Create new app or select existing
4. App Overview → Copy App ID
5. Create Ad Units:
   - Rewarded Video
   - Interstitial
   - Banner
6. Copy each ad unit ID

**Testing:**
- Use Google's test IDs during development
- Real ads shown only on production with real IDs
- Test IDs provided in `.env.example`

### PayPal

1. Visit https://developer.paypal.com/
2. Create developer account
3. Dashboard → My Apps & Credentials
4. Create App (separate for Sandbox and Live)
5. Copy Client ID and Secret
6. For subscriptions:
   - Dashboard → Products & Plans
   - Create Product
   - Create Subscription Plan
   - Copy Plan ID

---

## Security Best Practices

### Secrets Management

**DO:**
- ✅ Use `.env` files (git-ignored)
- ✅ Use different credentials for dev/prod
- ✅ Rotate secrets regularly
- ✅ Use environment variable management services (Vercel, Heroku, AWS Secrets Manager)
- ✅ Restrict API key permissions to minimum required
- ✅ Enable IP whitelisting where possible

**DON'T:**
- ❌ Commit secrets to git
- ❌ Share secrets in Slack/email
- ❌ Use production secrets in development
- ❌ Expose service keys in frontend
- ❌ Use same credentials across multiple apps

### Key Sensitivity Levels

**🔴 Highly Sensitive (NEVER expose):**
- `SUPABASE_SERVICE_KEY`
- `PAYPAL_SECRET`
- `DATABASE_URL` (contains password)
- `JWT_SECRET`
- `SESSION_SECRET`

**🟡 Moderately Sensitive:**
- `PAYPAL_CLIENT_ID`
- `ADMOB_APP_ID`
- `API_KEY`

**🟢 Public (safe to expose):**
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMOB_*` (all frontend AdMob IDs)
- `VITE_API_URL`

### Emergency Response

**If a secret is compromised:**
1. Immediately rotate the secret
2. Update all deployments
3. Review access logs for suspicious activity
4. Notify affected users if data breach occurred
5. Document incident for future prevention

---

## Development vs Production

### Development Setup

```bash
# Backend (.env.development)
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://localhost:5432/adrewards_dev

# Use AdMob test IDs
ADMOB_APP_ID=ca-app-pub-3940256099942544~3347511713
ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-3940256099942544/5224354917

# Use PayPal sandbox
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=<sandbox_client_id>
```

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:4000
VITE_ADMOB_APP_ID=ca-app-pub-3940256099942544~3347511713
```

### Production Setup

```bash
# Backend (.env.production)
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=<production_postgres_url>

# Use REAL AdMob IDs
ADMOB_APP_ID=ca-app-pub-XXXXXXXX~XXXXXXXXXX
ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-XXXXXXXX/XXXXXXXXXX

# Use PayPal live mode
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=<live_client_id>
```

```bash
# Frontend (.env.production)
VITE_API_URL=https://api.yourdomain.com
VITE_ADMOB_APP_ID=ca-app-pub-XXXXXXXX~XXXXXXXXXX
```

### Deployment Platforms

**Vercel:**
- Set environment variables in dashboard
- Project Settings → Environment Variables
- Configure per environment (Production/Preview/Development)

**Heroku:**
- Use Heroku Config Vars
- `heroku config:set KEY=value`
- Or via Heroku dashboard

**AWS:**
- Use AWS Secrets Manager
- Or Parameter Store
- Or ECS task definitions

---

## Troubleshooting

### Common Issues

#### "Database connection failed"
- Check `DATABASE_URL` format
- Verify database is running
- Check firewall/security groups
- Verify SSL mode if required

#### "Supabase authentication failed"
- Check `SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_KEY` is the service_role key
- Check if project is paused (free tier)

#### "AdMob ads not showing"
- Verify ad unit IDs are correct
- Check if using test IDs (only work in development)
- Ensure app is approved by AdMob (production)
- Check ad formats are correctly implemented

#### "PayPal payments failing"
- Check `PAYPAL_MODE` matches credentials
- Verify sandbox vs live credentials
- Check webhook configuration
- Review PayPal dashboard for errors

#### "CORS errors in browser"
- Verify `FRONTEND_URL` matches your frontend origin
- Check backend CORS configuration
- Ensure protocol (http/https) matches

#### "Environment variables not loading"
- Restart development server after changes
- Rebuild frontend after .env changes
- Check .env file is in correct directory
- Verify variable names (typos)

### Debug Mode

Enable debug logging:
```bash
# Backend
LOG_LEVEL=debug
NODE_ENV=development

# Frontend
VITE_DEBUG=true
```

### Testing Environment Setup

Create a test file to verify environment variables:

```typescript
// backend/src/test-env.ts
console.log('Environment Variables Check:');
console.log('✓ DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : '❌ Missing');
console.log('✓ SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : '❌ Missing');
// ... check others
```

---

## Additional Resources

- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Documentation](https://supabase.com/docs)
- [AdMob Setup Guide](https://support.google.com/admob/answer/7356219)
- [PayPal Developer Docs](https://developer.paypal.com/docs/api/overview/)

---

## Support

If you encounter issues not covered in this guide:

1. Check existing GitHub issues
2. Review application logs
3. Verify all required variables are set
4. Test with minimal configuration first
5. Create a GitHub issue with details

---

**Last Updated:** January 25, 2026
**Version:** 1.0.0
