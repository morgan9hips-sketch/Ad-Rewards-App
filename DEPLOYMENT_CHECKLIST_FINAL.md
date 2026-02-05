# Final Deployment Checklist

**DO NOT DEPLOY** until all items are checked off!

## Pre-Deployment Manual Tasks

### ⚠️ Task 1: Wise Platform API Setup
**Status**: ❌ NOT STARTED

**Actions Required**:
- [ ] Wise Business account created and verified
- [ ] Platform API access approved by Wise
- [ ] API Token obtained from Wise dashboard
- [ ] Profile ID obtained from Wise dashboard
- [ ] Added to Vercel environment variables:
  - `WISE_API_TOKEN=<actual_token>`
  - `WISE_PROFILE_ID=<actual_id>`
  - `WISE_MODE=sandbox` (or `live` for production)
- [ ] Wise balance funded with minimum $500
- [ ] Test withdrawal processed successfully in sandbox

**Reference**: See `WISE_SETUP_GUIDE.md`

---

### ⚠️ Task 2: Database Migration
**Status**: ❌ NOT STARTED

**Actions Required**:
- [ ] Logged into Supabase Dashboard
- [ ] Opened SQL Editor
- [ ] Executed migration from:
  `backend/prisma/migrations/20260205000000_remove_paypal_add_wise/migration.sql`
- [ ] Verified `signup_bonuses` table exists
- [ ] Verified `withdrawals` table has new columns:
  - `wise_transfer_id`
  - `wise_recipient_id`
  - `wise_quote_id`
  - `bank_details`
- [ ] Verified `paypal_email` is nullable

**Verification Query**:
```sql
-- Run this to verify migration
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'withdrawals' 
AND column_name IN ('wise_transfer_id', 'bank_details');

SELECT COUNT(*) FROM signup_bonuses; -- Should not error
```

---

### ⚠️ Task 3: Remove Legacy PayPal Configuration
**Status**: ❌ NOT STARTED

**Actions Required**:
- [ ] Logged into Vercel Dashboard
- [ ] Navigated to backend-api project → Settings → Environment Variables
- [ ] Deleted these variables:
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_SECRET`
  - `PAYPAL_MODE`
  - `PAYPAL_WEBHOOK_ID`
  - `PAYPAL_PRODUCT_ID`
  - `PAYPAL_ELITE_PLAN_ID`
- [ ] Backend redeployed after deletion

---

### ⚠️ Task 4: Update AdMob Publisher ID
**Status**: ❌ NOT STARTED

**Actions Required**:
- [ ] Retrieved actual Publisher ID from https://admob.google.com
- [ ] Updated `frontend/public/app-ads.txt`:
  - Replaced `pub-XXXXXXXXXXXXXXXX` with real ID
- [ ] Updated `frontend/public/.well-known/app-ads.txt` (if exists)
- [ ] Verified format: `pub-` followed by 16 digits

---

## Automated Validation Tests

### Backend Tests

**Run these commands**:
```bash
cd backend
npm install
npm run test:validation
```

**Expected**: All tests pass ✅

**If tests fail**: Read error messages - they specify exactly what's missing

---

### Frontend Tests

**Run these commands**:
```bash
cd frontend
npm install
npm run build
```

**Expected**: Build succeeds with no errors ✅

---

### Full Validation Script

**Run from project root**:
```bash
chmod +x scripts/pre-deploy-validation.sh
./scripts/pre-deploy-validation.sh
```

**Expected**: Exit code 0 (all checks passed) ✅

---

## Manual Testing (After Deploy)

### 1. Account Deletion Test
- [ ] Navigate to Settings page
- [ ] Scroll to "Danger Zone" section
- [ ] Click "Delete My Account Permanently" button
- [ ] Verify confirmation modal appears
- [ ] Type "DELETE" and click confirm
- [ ] Verify redirect to home page
- [ ] Verify cannot log back in with deleted account

### 2. Withdrawal Flow Test
- [ ] Navigate to Withdrawals page
- [ ] Click "Request Withdrawal" button
- [ ] Verify bank transfer form appears (NOT PayPal)
- [ ] Select currency (e.g., USD)
- [ ] Enter account holder name
- [ ] Enter bank details (account number, routing number for US)
- [ ] Submit withdrawal request
- [ ] Verify success message
- [ ] Check database for new withdrawal record
- [ ] Verify `wise_transfer_id` field populated (or pending)

### 3. Legal Pages Test
```bash
# Test these URLs return 200 status
curl -I https://your-domain.com/terms
curl -I https://your-domain.com/privacy
```
- [ ] Terms of Service loads without errors
- [ ] Privacy Policy loads without errors
- [ ] No PayPal references visible in legal docs

### 4. API Endpoints Test
```bash
# Should return 401 (unauthorized), NOT 404
curl -X DELETE https://your-domain.com/api/user/account

# Should return 400 or 401, NOT 404  
curl -X POST https://your-domain.com/api/withdrawals/request
```
- [ ] DELETE /api/user/account returns 401 (not 404)
- [ ] POST /api/withdrawals/request returns 400/401 (not 404)

### 5. AdMob Verification
```bash
curl https://your-domain.com/app-ads.txt
```
- [ ] Returns 200 status
- [ ] Shows actual Publisher ID (not placeholder)
- [ ] Format is correct: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`

---

## Critical Success Criteria

All of these MUST be true before marking deployment complete:

- ✅ Wise API credentials configured and tested
- ✅ Database migration applied successfully
- ✅ PayPal environment variables removed
- ✅ AdMob Publisher ID updated to real value
- ✅ Account deletion works end-to-end
- ✅ Withdrawal flow uses bank transfer (not PayPal)
- ✅ Legal documents updated (no PayPal references)
- ✅ All automated tests pass
- ✅ Manual testing completed successfully
- ✅ No console errors in browser
- ✅ No 404 errors for new endpoints

---

## Rollback Plan

If critical issues discovered after deployment:

1. **Immediate**: Revert to previous deployment in Vercel
2. **Database**: Keep migration (backward compatible)
3. **Fix**: Address issues in development
4. **Retry**: Re-run full checklist

---

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error logs for new issues
- [ ] Check withdrawal requests are processing
- [ ] Verify Wise transfers are created correctly
- [ ] Watch for user complaints about withdrawal flow

### First Week
- [ ] Review withdrawal success rate
- [ ] Check average processing time
- [ ] Analyze Wise fees vs projections
- [ ] Gather user feedback on new flow

---

## Sign-Off

**Deployment completed by**: _________________  
**Date**: _________________  
**All checklist items verified**: ☐ YES ☐ NO  

**Approver signature**: _________________  
**Date**: _________________  

---

## Support Contacts

**Technical Issues**:
- Backend: Check Vercel logs
- Database: Check Supabase logs  
- Wise API: platformpartners@wise.com

**Business Issues**:
- Wise Platform Support: platformpartners@wise.com
- Google Play: https://support.google.com/googleplay/android-developer

---

**Remember**: This is a production blocker. All items must be complete for Google Play Store approval!
