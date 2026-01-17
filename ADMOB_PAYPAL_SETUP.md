# AdMob and PayPal Integration Guide

This guide walks through setting up AdMob for ad monetization and PayPal for subscriptions and payouts.

## Table of Contents
1. [AdMob Setup](#admob-setup)
2. [PayPal Setup](#paypal-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing](#testing)
5. [Production Deployment](#production-deployment)

---

## AdMob Setup

### 1. Create AdMob Account

1. Go to [admob.google.com](https://admob.google.com)
2. Sign in with your Google account
3. Accept Terms of Service
4. Create a new app or link existing app

### 2. Get Ad Unit IDs

The production Ad Unit IDs are already configured in the codebase:

```
AdMob App ID: ca-app-pub-4849029372688725~4106586687
Rewarded Video: ca-app-pub-4849029372688725/3994906043
Interstitial: ca-app-pub-4849029372688725/8067094568
Banner: ca-app-pub-4849029372688725/8450237948
```

### 3. Configure AdMob Settings

In your AdMob dashboard:

1. **Enable Mediation** (optional):
   - Go to Mediation → Create mediation group
   - Add ad networks for better fill rates

2. **Set Up Payment**:
   - Go to Payments → Add payment method
   - Set payment threshold (minimum $100)

3. **Enable Analytics**:
   - Link AdMob to Google Analytics
   - Track user behavior and ad performance

### 4. Test Ads

For testing, AdMob provides test ad unit IDs:

```javascript
// Test Ad Unit IDs (use in development only)
const TEST_IDS = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    banner: 'ca-app-pub-3940256099942544/6300978111',
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    banner: 'ca-app-pub-3940256099942544/2934735716',
  },
}
```

### 5. Mobile App Integration

For native mobile apps (React Native, Flutter, etc.):

**React Native:**
```bash
npm install react-native-google-mobile-ads
npx react-native-google-mobile-ads:install
```

**Flutter:**
```yaml
dependencies:
  google_mobile_ads: ^3.0.0
```

Then initialize in your app:

```typescript
import mobileAds from 'react-native-google-mobile-ads';

await mobileAds().initialize();
```

---

## PayPal Setup

### 1. Create PayPal Developer Account

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Log in with your PayPal account
3. Go to Dashboard

### 2. Create REST API App

1. Click **"My Apps & Credentials"**
2. Click **"Create App"**
3. Choose **"Merchant"** as app type
4. Note your:
   - **Client ID**
   - **Secret**

**Sandbox Credentials (for testing):**
```
Client ID: Ac2nPbvtfHJBhe8CAbRiy6DRUk-5f8Dg0kKDkPrDJ7K9LCOrnn4uyJLRxM-btEcL__3XksR8nag-ah38
Secret: EKPm4Jc95MIUVhl_368GSs70jyr6Ka4K5Tj3aPxwMaW2Sb-pr6Z3hteaDAfpmv0UxxhLHhtxJCL3xxYR
```

### 3. Create Subscription Plans

Use the PayPal API to create subscription plans:

```bash
# Create Product
curl -X POST https://api-m.sandbox.paypal.com/v1/catalogs/products \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Adify Premium Subscription",
    "description": "Premium ad rewards subscription",
    "type": "SERVICE",
    "category": "SOFTWARE"
  }'

# Create Silver Plan ($4.99/month)
curl -X POST https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "<PRODUCT_ID>",
    "name": "Silver - $4.99/month",
    "description": "30 videos per day, no forced ads",
    "billing_cycles": [{
      "frequency": {
        "interval_unit": "MONTH",
        "interval_count": 1
      },
      "tenure_type": "REGULAR",
      "sequence": 1,
      "total_cycles": 0,
      "pricing_scheme": {
        "fixed_price": {
          "value": "4.99",
          "currency_code": "USD"
        }
      }
    }],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "payment_failure_threshold": 3
    }
  }'

# Create Gold Plan ($9.99/month)
curl -X POST https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "<PRODUCT_ID>",
    "name": "Gold - $9.99/month",
    "description": "40 videos per day, no forced ads",
    "billing_cycles": [{
      "frequency": {
        "interval_unit": "MONTH",
        "interval_count": 1
      },
      "tenure_type": "REGULAR",
      "sequence": 1,
      "total_cycles": 0,
      "pricing_scheme": {
        "fixed_price": {
          "value": "9.99",
          "currency_code": "USD"
        }
      }
    }],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "payment_failure_threshold": 3
    }
  }'
```

### 4. Set Up Webhooks

1. Go to **My Apps & Credentials → <Your App> → Webhooks**
2. Click **"Add Webhook"**
3. Enter your webhook URL: `https://yourdomain.com/api/subscriptions/webhook`
4. Select events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
5. Copy the **Webhook ID**

### 5. Enable Payouts

1. Go to **Live** environment in PayPal Dashboard
2. Enable **Mass Pay** / **Payouts**
3. Complete business verification
4. Link bank account

---

## Environment Configuration

### Backend (.env)

Create `/backend/.env` from `.env.example`:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
PORT=4000
FRONTEND_URL=http://localhost:5173

# AdMob (Production)
ADMOB_APP_ID=ca-app-pub-4849029372688725~4106586687
ADMOB_AD_UNIT_ID=ca-app-pub-4849029372688725/3994906043
NEXT_PUBLIC_ADMOB_APP_ID=ca-app-pub-4849029372688725~4106586687
NEXT_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-4849029372688725/3994906043
NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-4849029372688725/8067094568
NEXT_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-4849029372688725/8450237948

# PayPal (Sandbox for testing, Live for production)
PAYPAL_CLIENT_ID=Ac2nPbvtfHJBhe8CAbRiy6DRUk-5f8Dg0kKDkPrDJ7K9LCOrnn4uyJLRxM-btEcL__3XksR8nag-ah38
PAYPAL_SECRET=EKPm4Jc95MIUVhl_368GSs70jyr6Ka4K5Tj3aPxwMaW2Sb-pr6Z3hteaDAfpmv0UxxhLHhtxJCL3xxYR
PAYPAL_MODE=sandbox
PAYPAL_WEBHOOK_ID=<your_webhook_id>
PAYPAL_PRODUCT_ID=<your_product_id>
PAYPAL_SILVER_PLAN_ID=<your_silver_plan_id>
PAYPAL_GOLD_PLAN_ID=<your_gold_plan_id>

# Ad Rewards Configuration
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
MINIMUM_WITHDRAWAL_USD=10.00
COINS_PER_AD=100
USER_REVENUE_SHARE=0.85

# Admin
ADMIN_EMAIL=admin@yourdomain.com
```

### Frontend (.env)

Create `/frontend/.env` from `.env.example`:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API
VITE_API_URL=http://localhost:4000

# AdMob (Production)
VITE_ADMOB_APP_ID=ca-app-pub-4849029372688725~4106586687
VITE_ADMOB_REWARDED_ID=ca-app-pub-4849029372688725/3994906043
VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-4849029372688725/8067094568
VITE_ADMOB_BANNER_ID=ca-app-pub-4849029372688725/8450237948
```

---

## Testing

### Test Video Cap System

1. Log in as a Bronze (Free) user
2. Go to **Watch Ads** page
3. Watch 20 rewarded videos
4. System should show interstitial prompt
5. Watch interstitial ad
6. 2 more rewarded videos should unlock
7. Repeat cycle until 30 total videos watched

### Test Subscriptions

1. Go to **Subscriptions** page
2. Click **"Upgrade to Silver"** or **"Upgrade to Gold"**
3. Complete PayPal checkout in sandbox
4. Verify tier upgrade in profile
5. Verify no forced interstitials appear

### Test Payouts

1. Watch ads to earn coins
2. Wait for admin to process monthly conversion
3. Request payout from **Withdrawals** page
4. Verify PayPal payout received in sandbox account

### Test Multi-Currency

1. Use VPN to change location
2. Verify currency displays correctly
3. Verify subscription prices in local currency
4. Verify withdrawal minimums in local currency

---

## Production Deployment

### 1. Switch to Production Credentials

**AdMob:**
- Already using production Ad Unit IDs (ca-app-pub-4849029372688725~...)
- No changes needed

**PayPal:**
```env
# Update backend .env
PAYPAL_CLIENT_ID=<your_live_client_id>
PAYPAL_SECRET=<your_live_secret>
PAYPAL_MODE=live
PAYPAL_WEBHOOK_ID=<your_live_webhook_id>
```

### 2. Database Migration

```bash
cd backend
npm run prisma:push
# or
npm run prisma:migrate
```

### 3. Verify Webhooks

1. Update PayPal webhook URL to production domain
2. Test webhook by creating/canceling test subscription
3. Monitor webhook logs in PayPal dashboard

### 4. Enable Production Features

- Enable fraud detection
- Set up monitoring/alerts
- Configure rate limiting
- Enable HTTPS only
- Set up backup system

### 5. Monitor Ad Revenue

1. Check AdMob dashboard daily
2. Process monthly conversions
3. Monitor user complaints
4. Adjust CPM rates if needed

---

## Troubleshooting

### AdMob Issues

**Problem:** Ads not loading
- Check Ad Unit IDs are correct
- Verify AdMob account is active
- Check for ad inventory issues
- Enable test ads for debugging

**Problem:** Low CPM rates
- Enable mediation
- Add more ad networks
- Check geographic targeting
- Optimize ad placements

### PayPal Issues

**Problem:** Webhook not received
- Check webhook URL is correct
- Verify SSL certificate is valid
- Check firewall settings
- Review PayPal webhook logs

**Problem:** Subscription creation fails
- Verify Plan IDs are correct
- Check PayPal account status
- Verify pricing configuration
- Review PayPal API logs

### Video Cap Issues

**Problem:** Videos not resetting daily
- Check server timezone configuration
- Verify cron job is running
- Check database timestamps
- Review reset logic in code

---

## Support

- AdMob Support: [support.google.com/admob](https://support.google.com/admob)
- PayPal Developer Support: [developer.paypal.com/support](https://developer.paypal.com/support)
- App Support: support@yourdomain.com

---

## Security Checklist

- [ ] Never expose AdMob/PayPal credentials in frontend code
- [ ] Verify webhook signatures
- [ ] Validate all user input
- [ ] Use HTTPS in production
- [ ] Enable rate limiting on API endpoints
- [ ] Monitor for fraudulent activity
- [ ] Implement proper error handling
- [ ] Log all financial transactions
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

**Last Updated:** 2026-01-17
