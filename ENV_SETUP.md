# Environment Variables Setup Guide

## File Structure

```
Ad-Rewards-App/
├── backend/
│   ├── .env.development    # Local testing (TEST AdMob IDs)
│   └── .env.production     # Production deployment (REAL AdMob IDs)
└── frontend/
    ├── .env.development    # Browser testing (TEST AdMob IDs)
    └── .env.production     # Play Store build (REAL AdMob IDs)
```

## How They're Used

### Development (Local Testing)
```bash
# Backend
cd backend
npm run dev  # Uses .env.development

# Frontend
cd frontend
npm run dev  # Uses .env.development
```
- Shows Google's TEST AdMob ads (safe, no revenue)
- Connects to localhost:4000
- PayPal sandbox mode

### Production (Play Store Release)
```bash
# Build Android app
cd frontend
npm run build  # Uses .env.production
npx cap sync
npx cap open android
# Build APK/AAB in Android Studio
```
- Shows REAL AdMob ads (generates revenue)
- Connects to production API
- PayPal live mode

## Testing AdMob on Android

1. Build app: `npm run build && npx cap sync`
2. Open Android Studio: `npx cap open android`
3. Run on device or emulator
4. Real AdMob test ads will display!

## Important Notes

- Never commit `.env` files to git (they're gitignored)
- Use `.env.example` as template
- Test ads use: `ca-app-pub-3940256099942544~...`
- Real ads use: `ca-app-pub-4849029372688725~...`

## Environment Variables Reference

### Backend

#### Common Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_KEY` - Supabase service role key (private)
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection (bypasses pooler)

#### Development-Specific
- `NODE_ENV=development`
- `FRONTEND_URL=http://localhost:5173`
- `ADMOB_APP_ID` - Google's test app ID
- `ADMOB_REWARDED_AD_UNIT_ID` - Google's test rewarded ad ID
- `PAYPAL_MODE=sandbox`
- `PORT=4000`

#### Production-Specific
- `NODE_ENV=production`
- `FRONTEND_URL=https://adify.adrevtechnologies.com`
- `ADMOB_APP_ID` - Real production app ID
- `ADMOB_REWARDED_AD_UNIT_ID` - Real production ad unit ID
- `PAYPAL_MODE=live`
- `PORT=4000`

### Frontend

#### Common Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

#### Development-Specific
- `VITE_API_URL=http://localhost:4000`
- `VITE_ADMOB_APP_ID` - Google's test app ID
- `VITE_ADMOB_REWARDED_ID` - Google's test rewarded ad ID
- `VITE_ADMOB_INTERSTITIAL_ID` - Google's test interstitial ad ID
- `VITE_ADMOB_BANNER_ID` - Google's test banner ad ID

#### Production-Specific
- `VITE_API_URL=https://api.adrevtechnologies.com`
- `VITE_ADMOB_APP_ID` - Real production app ID
- `VITE_ADMOB_REWARDED_ID` - Real production rewarded ad ID
- `VITE_ADMOB_INTERSTITIAL_ID` - Real production interstitial ad ID
- `VITE_ADMOB_BANNER_ID` - Real production banner ad ID

## Capacitor Configuration

The app is configured with Capacitor for native mobile deployment:

- **App ID**: `com.adrevtechnologies.adify`
- **App Name**: Adify
- **Web Directory**: `dist` (Vite build output)
- **Android Scheme**: HTTPS (required for modern Android)

## Platform Detection

The `admobService.ts` automatically detects the runtime platform:

- **Web/Browser**: Uses mock ads for testing
- **Native (Android/iOS)**: Uses real AdMob SDK

This allows seamless development and testing across platforms without code changes.

## Setup Instructions

### First Time Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Copy environment files** (if not present):
   ```bash
   # Backend
   cd backend
   cp .env.example .env.development
   # Edit .env.development with your values

   # Frontend  
   cd ../frontend
   cp .env.example .env.development
   # Edit .env.development with your values
   ```

3. **Initialize Capacitor** (for mobile development):
   ```bash
   cd frontend
   npx cap add android
   npx cap sync
   ```

### Development Workflow

1. **Start backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access app**: http://localhost:5173

### Production Build Workflow

1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Sync with Capacitor**:
   ```bash
   npx cap sync
   ```

3. **Open Android Studio**:
   ```bash
   npx cap open android
   ```

4. **Build APK/AAB** in Android Studio

## Troubleshooting

### AdMob Not Working

- Ensure environment variables are set correctly
- Check that AdMob app is registered in Google AdMob console
- Verify ad unit IDs match those in AdMob console
- For test ads, use Google's official test IDs

### Capacitor Sync Issues

```bash
cd frontend
npx cap sync android
```

### Build Errors

```bash
# Clean and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Security Notes

- ✅ `.env` files are gitignored
- ✅ Never commit credentials to version control
- ✅ Use test credentials in development
- ✅ Only use production credentials in production builds
- ✅ Keep `SUPABASE_SERVICE_KEY` secret (backend only)
