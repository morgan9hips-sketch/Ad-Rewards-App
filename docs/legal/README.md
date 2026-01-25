# Legal Documents for Adify

This directory contains all legal documentation required for Google Play Store submission, AdMob compliance, and GDPR/POPIA regulations.

## Documents

1. **TERMS_OF_SERVICE.md** - Comprehensive Terms of Service (20 sections)
2. **PRIVACY_POLICY.md** - Complete Privacy Policy (13 sections, GDPR/POPIA compliant)
3. **COOKIE_POLICY.md** - Cookie Policy (GDPR compliant)
4. **ADMOB_DISCLOSURE.md** - AdMob Data Usage Disclosure (Play Store required)
5. **SUBSCRIPTION_TERMS.md** - Elite Subscription Terms
6. **WITHDRAWAL_POLICY.md** - Withdrawal Policy and Terms

## Compliance Coverage

✅ **GDPR** (European Union) - General Data Protection Regulation  
✅ **POPIA** (South Africa) - Protection of Personal Information Act  
✅ **COPPA** (United States) - Children's Online Privacy Protection Act  
✅ **CCPA** (California) - California Consumer Privacy Act  
✅ **Google Play Store** - All required policies and disclosures  
✅ **AdMob** - Complete data usage disclosure

## Before Production Deployment

### ⚠️ Required Updates

These placeholders must be updated before production deployment:

#### 1. AdMob Publisher ID
**Files:**
- `frontend/public/app-ads.txt`
- `frontend/public/.well-known/app-ads.txt`

**Action:** Replace `pub-XXXXXXXXXXXXXXXX` with actual AdMob Publisher ID

**How to find:**
1. Go to AdMob Console
2. Navigate to: Account → Settings → Account Information
3. Copy your Publisher ID (format: `pub-1234567890123456`)

#### 2. Physical Business Address
**Files:**
- `docs/legal/TERMS_OF_SERVICE.md` (line ~1060)
- `docs/legal/PRIVACY_POLICY.md` (line ~1105)

**Action:** Replace `[Physical Address to be Added]` with actual registered business address

**Required format:**
```
AdRev Technologies (Pty) Ltd
[Street Address]
[City, Province, Postal Code]
South Africa
```

#### 3. Subscription Pricing
**File:**
- `docs/legal/SUBSCRIPTION_TERMS.md` (lines ~94, 100)

**Action:** Replace placeholder pricing with actual Elite subscription prices

**Example:**
- Monthly: R49.99 / $2.99
- Annual: R499.99 / $29.99

## Legal Review

⚠️ **Important:** While these documents are comprehensive and compliant with major regulations, they should be reviewed by a qualified legal professional before production use, especially for:

- South African POPIA compliance
- European Union GDPR compliance
- United States COPPA compliance
- Regional-specific requirements

## Accessibility

All legal documents are:
- Publicly accessible (no authentication required)
- Available at `/api/legal/{endpoint}` backend routes
- Rendered on frontend at `/legal/{page}` routes
- Mobile-responsive with dark theme styling
- Properly formatted with markdown

## Contact Information

**Support:** support@adrevtechnologies.co.za  
**Privacy:** privacy@adrevtechnologies.co.za

## Last Updated

Effective Date: January 26, 2026

## Version History

- **v1.0** (2026-01-26) - Initial release
  - Complete legal documentation for Play Store submission
  - GDPR/POPIA/COPPA compliance
  - AdMob disclosure and cookie policy
