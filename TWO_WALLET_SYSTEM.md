# Two-Wallet System Implementation Guide

## Overview

The Ad Rewards App now features a complete two-wallet system that separates **pending coins** from **available cash**, providing full transparency and a fair 85% revenue share model.

## How It Works

### For Users

#### 1. **Coins Wallet (Pending)**
- Users earn **100 coins** for every ad they watch
- Coins are awarded instantly and tracked in real-time
- Coins are "pending" because they need to be converted to cash

#### 2. **Cash Wallet (Available)**
- Cash is created through monthly conversions
- Users always receive **85% of AdMob revenue**
- Cash can be withdrawn immediately (minimum $10 USD)
- Displayed in user's local currency

#### 3. **Monthly Conversion Process**
- Admin inputs monthly AdMob revenue
- System calculates 85% user share
- All pending coins across all users are converted to cash
- Conversion rate = Total User Payout / Total Pending Coins
- Process is atomic (all-or-nothing transaction)

#### 4. **Multi-Currency Support**
- Automatic currency detection based on IP address
- Supported currencies: USD, ZAR, EUR, GBP, CAD, AUD, INR, NGN
- Exchange rates update daily
- All amounts stored in USD, displayed in local currency

## Architecture

### Database Schema

#### New Tables
- `transactions` - Complete audit trail of all balance changes
- `coin_conversions` - Monthly conversion records
- `conversion_details` - Per-user conversion breakdown
- `exchange_rates` - Currency conversion rates
- `admin_actions` - Admin activity logging

#### Updated Tables
- `user_profiles` - Added coins_balance, cash_balance_usd, currency fields
- `ad_views` - Added IP tracking, country detection, conversion tracking
- `withdrawals` - Added multi-currency support

### Backend Services

#### Currency Service (`currencyService.ts`)
- Fetches exchange rates from exchangerate-api.com
- Stores rates in database with daily updates
- Provides conversion functions
- Maps countries to currencies

#### Geolocation Service (`geoService.ts`)
- Detects user country from IP address
- Uses geoip-lite library for offline lookups
- Extracts IP from proxy headers

#### Transaction Service (`transactionService.ts`)
- Creates atomic balance updates
- Records all monetary operations
- Maintains balance snapshots
- Provides transaction history

### API Endpoints

#### User Endpoints
```
POST   /api/ads/complete              - Award coins for completed ad
GET    /api/user/balance              - Get balances in local currency
GET    /api/user/transactions         - Get transaction history
POST   /api/withdrawals/request       - Request withdrawal via PayPal
GET    /api/withdrawals/history       - Get withdrawal history
```

#### Admin Endpoints
```
POST   /api/admin/process-conversion  - Process monthly conversion
GET    /api/admin/conversions         - Get conversion history
GET    /api/admin/stats               - Get platform statistics
POST   /api/admin/update-exchange-rates - Update exchange rates
GET    /api/admin/exchange-rates/:currency - Get specific rate
```

## Configuration

### Environment Variables

```bash
# Ad Rewards Configuration
ADMOB_APP_ID=ca-app-pub-4849029372688725~4106586687
ADMOB_AD_UNIT_ID=ca-app-pub-4849029372688725/3994906043
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
MINIMUM_WITHDRAWAL_USD=10.00
COINS_PER_AD=100
USER_REVENUE_SHARE=0.85
```

## Usage Examples

### Processing Monthly Conversion

1. Navigate to `/admin/conversions`
2. Enter AdMob revenue (e.g., $1,000)
3. Select month
4. Click "Process Conversion"
5. System automatically:
   - Calculates $850 user share (85%)
   - Gets total pending coins
   - Calculates conversion rate
   - Converts all users' coins to cash
   - Creates audit records

**Example:**
- AdMob Revenue: $1,000
- User Share (85%): $850
- Total Coins: 100,000
- Conversion Rate: $0.0085 per coin
- User with 10,000 coins receives: $85 cash

### User Withdrawal Flow

1. User watches ads and earns coins
2. After monthly conversion, coins become cash
3. User navigates to `/withdrawals`
4. Enters PayPal email
5. Sees amount in local currency and USD
6. Submits request
7. Admin processes via PayPal
8. Status updates automatically

## Transaction Types

| Type | Description | Coins | Cash |
|------|-------------|-------|------|
| `coin_earned` | User completed ad view | +100 | - |
| `coin_conversion` | Monthly conversion | -X | +Y |
| `withdrawal` | User withdrew funds | - | -Z |
| `admin_adjustment` | Manual adjustment | ±X | ±Y |
| `badge_reward` | Achievement unlocked | +X | - |

## Security Features

### Transactional Operations
- All balance updates use database transactions
- Rollback on any failure
- No partial updates possible

### Validation
- Negative values prevented
- Minimum withdrawal enforced
- Balance checks before operations
- PayPal email validation

### Audit Trail
- Every balance change recorded
- Balance snapshots included
- Admin actions logged
- Complete transaction history

### Access Control
- Authentication required for all endpoints
- Admin endpoints require authentication
- TODO: Implement role-based access control

## Testing

### Manual Testing Checklist

1. **Coin Earning**
   - [ ] Watch ad awards 100 coins
   - [ ] Transaction created
   - [ ] Balance updated
   - [ ] Country detected

2. **Conversion**
   - [ ] Admin can process conversion
   - [ ] All users' coins converted
   - [ ] Conversion rate calculated correctly
   - [ ] Atomic operation (all or nothing)

3. **Currency**
   - [ ] Balance shows in local currency
   - [ ] Exchange rates update
   - [ ] Conversion accurate

4. **Withdrawals**
   - [ ] Minimum balance enforced
   - [ ] PayPal email validated
   - [ ] Status tracking works
   - [ ] Balance deducted correctly

## Future Enhancements

### Planned Features
- [ ] Automated daily exchange rate updates (cron job)
- [ ] Email notifications for conversions
- [ ] SMS notifications for withdrawals
- [ ] Partial withdrawals
- [ ] Gift card withdrawal option
- [ ] Cryptocurrency payout option

### Admin Panel Improvements
- [ ] Role-based access control
- [ ] Audit log viewer
- [ ] Conversion scheduling
- [ ] Automated PayPal integration
- [ ] User analytics dashboard

## Troubleshooting

### Common Issues

**Issue:** Exchange rates not updating
- **Solution:** Call `POST /api/admin/update-exchange-rates` manually

**Issue:** Conversion fails
- **Solution:** Check database transaction logs, ensure no users with negative balances

**Issue:** Wrong currency displayed
- **Solution:** User's IP not detected correctly, allow manual currency selection

**Issue:** Withdrawal minimum not met
- **Solution:** User needs $10 USD equivalent, show clear message

## API Rate Limits

- Exchange rate API: 1,500 requests/month (free tier)
- Update once daily to stay within limits
- Cache rates in database

## Data Retention

- Transactions: Keep forever (audit trail)
- Ad views: Keep for 12 months
- Exchange rates: Keep for 12 months
- Admin actions: Keep forever

## Support

For issues or questions:
- Check transaction history in database
- Review admin action logs
- Contact support with transaction ID

## Version History

### v2.0.0 (January 2026)
- Implemented two-wallet system
- Added multi-currency support
- Created admin conversion interface
- Enhanced audit trail
- Added transaction history

### v1.0.0 (December 2025)
- Initial release
- Single wallet system
- Basic PayPal withdrawals

---

Built with ❤️ by the Ad Rewards Team
