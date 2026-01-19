# Currency Compliance System - AdMob Policy Implementation

## 🚨 **CRITICAL BUSINESS REQUIREMENT**

This system implements strict location-based currency restrictions to ensure **100% compliance with AdMob policies**. Users in South Africa (RSA) are **completely blocked from using USD** under any circumstances.

## 🔒 **Implementation Overview**

### Core Principles

1. **Location-Based Currency**: Currency is automatically determined by user's geographic location using multiple detection methods
2. **No User Selection**: Users cannot choose their currency - it's locked to their location
3. **VPN Prevention**: Multiple layers of VPN/proxy detection prevent circumvention
4. **Audit Trail**: All location and currency decisions are logged for compliance auditing

### Geographic Currency Mapping

| Country | Currency | USD Allowed |
|---------|----------|-------------|
| 🇿🇦 South Africa | ZAR (Rand) | ❌ **PROHIBITED** |
| 🇺🇸 United States | USD | ✅ |
| 🇬🇧 United Kingdom | GBP | ✅ |
| 🇨🇦 Canada | CAD | ✅ |
| 🇦🇺 Australia | AUD | ✅ |
| 🇩🇪 Germany | EUR | ✅ |
| 🇫🇷 France | EUR | ✅ |

## 🛡️ **Security Layers**

### 1. IP Geolocation
- Uses `geoip-lite` for primary location detection
- Falls back to external geolocation APIs
- Handles proxy headers (Cloudflare, nginx)

### 2. VPN/Proxy Detection
- ASN-based detection (hosting providers)
- External VPN detection API integration
- Suspicious user-agent analysis
- IP range analysis for common VPN services

### 3. Location Locking
- Currency is locked to location on first login
- Cannot be changed by user
- Requires admin intervention for legitimate changes

### 4. Request Blocking
- South African users get HTTP 403 for any USD requests
- VPN users blocked from monetary actions
- Suspicious activity triggers security logging

## 📊 **Database Schema**

### Enhanced UserProfile
```sql
locationLocked: Boolean -- Prevents currency changes
verificationData: JSON  -- Stores location verification details
```

### SecurityLog Table
```sql
ipAddress: String       -- User's IP address
country: String         -- Detected country
isVPN: Boolean         -- VPN detection result
confidence: Float      -- Detection confidence score
suspicious: Boolean    -- Overall suspicion flag
details: JSON          -- Additional verification data
```

## 🔍 **Compliance Monitoring**

### Automated Logging
- All location verifications logged
- VPN attempts recorded
- Currency violations tracked
- Confidence scores stored

### Audit Reports
- User compliance status
- Location verification history
- VPN detection statistics
- Currency enforcement events

## 🚫 **Blocked Scenarios**

### For South African Users
1. ❌ Any request with USD currency parameter
2. ❌ Accessing USD-based endpoints
3. ❌ Setting currency to USD in profile
4. ❌ Withdrawing in USD

### For VPN Users (Any Country)
1. ❌ Watching ads while on VPN
2. ❌ Processing withdrawals
3. ❌ Converting coins to cash
4. ❌ Accessing monetary endpoints

### For Suspicious Activity
1. ❌ Low confidence location detection
2. ❌ Inconsistent location data
3. ❌ Bot-like user agents
4. ❌ Multiple location changes

## 🎯 **User Experience**

### South African Users
- See ZAR currency everywhere (R150.00 format)
- Compliance notice on dashboard
- Clear explanation of currency restrictions
- No currency selection options

### Other Users
- Location-appropriate currency display
- Automatic currency detection
- Compliance messaging where relevant

## 🔧 **Technical Implementation**

### Backend Middleware Stack
```javascript
1. Authentication
2. Location Verification (VPN detection)
3. Currency Enforcement (RSA/USD blocking)
4. Specific USD Blocking for South Africa
```

### Frontend Updates
- Removed currency selection dropdowns
- Added location-locked currency displays
- Currency-specific formatting utilities
- Compliance messaging components

## ⚠️ **Critical Error Handling**

### Service Failures
- Location service failure → Deny monetary actions
- VPN detection API down → Use conservative approach
- Geolocation unavailable → Default to South Africa (ZAR)

### Edge Cases
- Multiple IP addresses → Use first valid IP
- Conflicting location data → Use most restrictive
- Unknown country → Default to ZAR for safety

## 📈 **AdMob Policy Benefits**

1. **Zero USD Access in RSA**: Completely eliminates policy violations
2. **VPN Prevention**: Stops users from faking location
3. **Audit Trail**: Complete compliance logging for reviews
4. **Automatic Enforcement**: No manual checks required
5. **Conservative Defaults**: When in doubt, apply strictest rules

## 🔮 **Future Enhancements**

1. **Machine Learning**: AI-based VPN detection
2. **Real-time Monitoring**: Live dashboard for compliance team
3. **Advanced Geofencing**: GPS-based verification
4. **Regulatory Updates**: Automatic policy adaptation

---

## ⚡ **Quick Reference for Developers**

### Check User Currency
```javascript
const currencyInfo = getCurrencyInfo(userCurrency)
const isUSDAllowed = locationService.canUseUSD(userCountry)
```

### Validate Withdrawal
```javascript
const validation = validateWithdrawalAmount(amount, currency)
if (!validation.isValid) {
  alert(validation.error)
}
```

### Format Currency Display
```javascript
const formatted = formatCurrency(amountInCents, currencyCode)
// South Africa: R150.00
// USA: $10.00
```

This system ensures **100% AdMob compliance** while maintaining a seamless user experience for legitimate users.