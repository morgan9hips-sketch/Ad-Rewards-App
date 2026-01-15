# Location-Based Ad Rewards System - Implementation Guide

## Overview

This document describes the implementation of a VPN-proof, location-based ad rewards system that ensures fair revenue distribution based on where ads are actually watched.

## Key Features

### 🔒 VPN-Proof Security
- **AdMob SDK Location**: Uses AdMob's server-side country detection (cannot be spoofed by VPNs)
- **Duplicate Prevention**: Unique impression ID validation
- **Rate Limiting**: 200 ads/day, 10 per 5 minutes
- **Fraud Detection**: Logs IP vs AdMob location mismatches
- **Suspicious Activity Flagging**: Automatic detection of unusual patterns

### 🌍 Location-Based Revenue Pools
Each country has its own revenue pool with separate conversion rates:
- **USA**: High CPM → Higher conversion rate
- **South Africa**: Lower CPM → Lower conversion rate
- **UK, Canada, Australia**: Medium-high CPM
- **India, Nigeria, Brazil, Mexico**: Lower CPM

### 💱 Universal Currency Display
All monetary amounts are displayed in user's local currency:
- Auto-detection from IP location (for display only)
- Manual currency selection in Settings
- Support for 10 major currencies
- Dual display option (local + USD)

## Architecture

### Database Schema

#### LocationRevenuePool
Tracks revenue and conversions per country per month:
```prisma
model LocationRevenuePool {
  id                  Int      @id @default(autoincrement())
  countryCode         String   // 'US', 'ZA', 'GB', etc.
  month               DateTime
  admobRevenueUsd     Decimal  // From AdMob dashboard
  totalCoinsIssued    BigInt
  userShareUsd        Decimal  // 85% of admobRevenueUsd
  conversionRate      Decimal  // userShareUsd / totalCoinsIssued
  status              String   // 'pending', 'completed'
  
  conversions         LocationConversion[]
  adViews             AdView[]
}
```

#### AdView (Updated)
Stores AdMob's real location data:
```prisma
model AdView {
  // AdMob's TRUSTED data (VPN-proof!)
  admobImpressionId     String?  @unique
  countryCode           String?  // From AdMob SDK
  estimatedEarningsUsd  Decimal?
  admobCurrency         String?
  
  // Audit trail (for fraud detection, NOT location)
  ipAddress             String?
  ipCountry             String?  // Detected from IP
  
  poolId                Int?
  pool                  LocationRevenuePool?
}
```

#### UserProfile (Updated)
Tracks user's revenue countries and fraud indicators:
```prisma
model UserProfile {
  // Revenue location (from AdMob - VPN-proof)
  revenueCountry         String?
  revenueCountries       String[]
  
  // Display preferences
  preferredCurrency      String   @default("USD")
  autoDetectCurrency     Boolean  @default(true)
  
  // Fraud detection
  vpnSuspicionScore      Int      @default(0)
  suspiciousActivity     Boolean  @default(false)
}
```

## API Endpoints

### User Endpoints

#### POST /api/ads/complete
Record ad completion with location data:
```typescript
{
  adUnitId: string
  watchedSeconds: number
  admobImpressionId: string      // Required for duplicate prevention
  countryCode: string             // From AdMob SDK (VPN-proof!)
  estimatedEarnings?: number
  currency?: string
}

Response:
{
  success: true,
  coinsEarned: 100,
  totalCoins: "10000",
  remaining: 199,                 // Ads remaining today
  vpnDetected: false
}
```

#### GET /api/user/balance
Get user balance with currency info:
```typescript
Response:
{
  coins: "10000",
  cashUsd: "85.00",
  cashLocal: "1530.00",
  cashLocalFormatted: "R1,530.00",
  displayCurrency: "ZAR",
  revenueCountry: "ZA",
  exchangeRate: "18.00"
}
```

#### GET /api/user/currency-info
Get user's currency preferences:
```typescript
Response:
{
  displayCurrency: "ZAR",
  revenueCountry: "ZA",
  displayCountry: "ZA",
  exchangeRate: 18.00,
  formatting: {
    symbol: "R",
    decimals: 2,
    position: "before"
  }
}
```

### Admin Endpoints

#### POST /api/admin/process-location-conversion
Process monthly conversion with location-based pools:
```typescript
{
  revenues: [
    { countryCode: "US", admobRevenueUsd: "5000.00" },
    { countryCode: "ZA", admobRevenueUsd: "150.00" },
    { countryCode: "GB", admobRevenueUsd: "800.00" }
  ],
  month: "2026-01",
  notes: "January 2026 conversion"
}

Response:
{
  success: true,
  results: [
    {
      countryCode: "US",
      poolId: 1,
      admobRevenue: 5000,
      totalCoins: "500000",
      conversionRate: "0.00850000",
      usersAffected: 1250,
      totalCashDistributed: 4250
    },
    // ... more locations
  ]
}
```

#### GET /api/admin/stats/by-location
Get per-location statistics:
```typescript
Response:
{
  global: {
    totalPendingCoins: "1000000",
    totalRevenue: "10000.00"
  },
  byLocation: [
    {
      country: "US",
      pendingCoins: "500000",
      convertedCoins: "2000000",
      totalRevenue: "7000.00",
      averageConversionRate: "0.01190000",
      usersActive: 1250
    },
    // ... more locations
  ]
}
```

#### GET /api/admin/fraud-stats
Get fraud detection statistics:
```typescript
Response:
{
  stats: {
    totalSuspiciousUsers: 12,
    highVpnSuspicionUsers: 8,
    multiCountryUsers: 25
  },
  suspiciousUsers: [
    {
      userId: "...",
      email: "user@example.com",
      revenueCountries: ["US", "GB", "CA", "ZA"],
      vpnSuspicionScore: 15,
      suspiciousActivity: true,
      adsWatched: 350
    }
  ]
}
```

## Fraud Prevention

### Rate Limiting
```typescript
// Daily limit
MAX_ADS_PER_DAY = 200

// Rapid viewing detection
MAX_ADS_PER_5_MINUTES = 10
```

### VPN Detection
When IP country ≠ AdMob country:
1. Log the mismatch
2. Increment user's VPN suspicion score
3. Use AdMob location (correct one)
4. Flag user if score ≥ 10

### Duplicate Prevention
```typescript
// Each impression ID can only be claimed once
const existing = await prisma.adView.findUnique({
  where: { admobImpressionId: impressionId }
})

if (existing) {
  throw new Error('Duplicate impression')
}
```

## Conversion Process

### Location-Based (New)

1. **Admin inputs revenue per country**
   - US: $5000
   - ZA: $150
   - GB: $800

2. **System processes each location separately**
   ```
   For US:
   - Total coins: 500,000
   - User share (85%): $4,250
   - Conversion rate: $4,250 / 500,000 = $0.0085/coin
   
   For ZA:
   - Total coins: 35,000
   - User share (85%): $127.50
   - Conversion rate: $127.50 / 35,000 = $0.00364/coin
   ```

3. **Users get their location's rate**
   - US user with 10,000 coins: 10,000 × $0.0085 = $85.00
   - ZA user with 10,000 coins: 10,000 × $0.00364 = $36.40

### Legacy Global (Deprecated)

Pools all users together:
- Total revenue: $5,950
- Total coins: 535,000
- Rate: $0.00943/coin
- Everyone gets same rate (unfair!)

## Frontend Integration

### Currency Context
```typescript
import { useCurrency } from './contexts/CurrencyContext'

function MyComponent() {
  const { formatAmount, currencyInfo } = useCurrency()
  
  return (
    <div>
      {formatAmount(42.50)} // Displays: R765.00 (if user in ZA)
    </div>
  )
}
```

### Currency Display Component
```typescript
<CurrencyDisplay 
  amountUsd={85.00}
  showBoth={true}  // Shows both local and USD
  size="lg"
/>
// Displays: R1,530.00 (≈ $85.00 USD)
```

### Settings Page
Users can:
- Toggle auto-detect currency
- Manually select display currency
- View revenue country (where they earn)

## Mobile App Integration

### AdMob SDK Callback
```typescript
// React Native / Mobile
import { RewardedAd } from '@react-native-google-mobile-ads'

rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async (reward) => {
  // AdMob provides REAL location data (VPN-proof!)
  const adData = {
    admobImpressionId: reward.impressionId,
    countryCode: reward.countryCode,      // SOURCE OF TRUTH
    estimatedEarnings: reward.value,
    currency: reward.currency,
    adUnitId: 'ca-app-pub-xxx',
    watchedSeconds: 30
  }
  
  // Send to backend
  await fetch('/api/ads/complete', {
    method: 'POST',
    body: JSON.stringify(adData)
  })
})
```

## Testing

### Test Location-Based Conversion
```bash
# 1. Create test ad views for different countries
curl -X POST http://localhost:4000/api/ads/complete \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "countryCode": "US",
    "admobImpressionId": "unique-id-1",
    "adUnitId": "test",
    "watchedSeconds": 30
  }'

# 2. Process conversion
curl -X POST http://localhost:4000/api/admin/process-location-conversion \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "revenues": [
      {"countryCode": "US", "admobRevenueUsd": "100.00"},
      {"countryCode": "ZA", "admobRevenueUsd": "10.00"}
    ],
    "month": "2026-01"
  }'

# 3. Verify different rates
curl http://localhost:4000/api/admin/stats/by-location \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test VPN Detection
```bash
# Simulate VPN (IP=US, AdMob=ZA)
# Backend will:
# 1. Use ZA location (correct)
# 2. Log mismatch
# 3. Increment suspicion score
# 4. Return vpnDetected: true
```

### Test Fraud Prevention
```bash
# Try to claim same impression twice
curl -X POST http://localhost:4000/api/ads/complete \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "admobImpressionId": "already-used-id",
    ...
  }'
# Should return 409 Conflict
```

## Deployment Checklist

### Database
- [ ] Run Prisma migration: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Backup existing data

### Environment Variables
```env
# Rate limiting
MAX_ADS_PER_DAY=200
MAX_ADS_PER_5_MINUTES=10
VPN_SUSPICION_THRESHOLD=10

# Revenue share
USER_REVENUE_SHARE=0.85

# Coins per ad
COINS_PER_AD=100

# Exchange rates API
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
```

### Frontend
- [ ] Update mobile app to pass AdMob country code
- [ ] Test currency display on all pages
- [ ] Verify settings page currency selector

### Admin Setup
- [ ] Train admins on location-based conversion
- [ ] Set up monthly revenue tracking per country
- [ ] Configure fraud monitoring alerts

## Monitoring

### Key Metrics
- Ads per country (daily)
- VPN detection rate
- Suspicious users flagged
- Conversion rates by location
- Revenue per location

### Alerts
- High VPN suspicion score (>= 10)
- User earning from 5+ countries
- Duplicate impression attempts
- Rate limit violations

## FAQ

**Q: What if a user uses a VPN?**
A: The system uses AdMob's location, not the user's IP. VPNs cannot spoof AdMob's server-side location detection. The mismatch is logged for monitoring but doesn't affect payment.

**Q: Can users change their earning location?**
A: No. Earning location is determined by AdMob SDK based on where the ad was served. Users can only change display currency.

**Q: What happens if no revenue for a country?**
A: Users in that country will have pending coins until revenue is added. Admins can process conversions for specific countries when revenue is available.

**Q: How often should conversions be run?**
A: Monthly, after receiving AdMob payments (typically around the 25th-28th).

**Q: What if AdMob doesn't provide country code?**
A: Fall back to IP-based detection with a warning. Update mobile app to ensure AdMob SDK returns country code.

## Support

For issues or questions:
- GitHub Issues: https://github.com/morgan9hips-sketch/Ad-Rewards-App/issues
- Documentation: See README.md and other docs/ files
