# Wise Platform API Setup Guide

This guide walks you through setting up Wise Platform API for global payouts in your Ad Rewards application.

## Why Wise?

- **Global Coverage**: Support 190+ countries with direct bank transfers
- **Lower Fees**: 0.5-2% vs PayPal's 3-5%
- **No Recipient Account Needed**: Users just need their bank details
- **Faster Transfers**: 1-3 business days vs 5-7 days
- **Better Rates**: Mid-market exchange rates

## Prerequisites

- Valid business registration documents
- Business bank account
- Expected monthly payout volume
- Business website/app URL

## Step 1: Create Wise Business Account

1. Visit https://wise.com/gb/business/
2. Click "Sign up" and select "Business account"
3. Fill in your business details:
   - Business name: AdRev Technologies (Pty) Ltd
   - Business type: Private Company
   - Industry: Technology/Software
4. Complete identity verification with:
   - Government-issued ID
   - Proof of address (utility bill, bank statement)
   - Business registration documents

**Timeline**: 1-2 business days for verification

## Step 2: Apply for Platform API Access

1. Once your business account is verified, go to Settings → API tokens
2. Look for "Platform Partner" option or contact support
3. Submit Platform Partner application:
   - Describe use case: "Mobile rewards app sending payouts to users globally"
   - Estimated monthly volume: $X,XXX
   - Target countries: List your primary markets
4. Provide technical documentation if requested

**Timeline**: 2-5 business days for approval

## Step 3: Get API Credentials

After Platform API approval:

1. Navigate to Settings → API tokens
2. Click "Add new token"
3. Select permissions:
   - ✅ Read accounts
   - ✅ Create quotes
   - ✅ Create transfers
   - ✅ Fund transfers
4. Copy and securely store:
   - API Token (starts with `Bearer ...`)
   - Profile ID (numeric ID)

## Step 4: Configure Environment Variables

### Development/Sandbox Mode

```bash
WISE_API_TOKEN=your_sandbox_token_here
WISE_PROFILE_ID=your_profile_id_here
WISE_MODE=sandbox
```

### Production Mode

```bash
WISE_API_TOKEN=your_live_token_here
WISE_PROFILE_ID=your_profile_id_here
WISE_MODE=live
```

Add these to:
- Vercel: Project Settings → Environment Variables
- Local: `.env` file (never commit!)

## Step 5: Fund Your Wise Balance

Before processing payouts:

1. Go to Wise dashboard → Balances
2. Add money to USD balance
3. Recommended starting amount: $500-$1,000
4. Set up auto-top-up to maintain minimum balance

**Important**: Transfers will fail if balance is insufficient!

## Step 6: Test in Sandbox Mode

1. Set `WISE_MODE=sandbox`
2. Use sandbox API credentials
3. Test withdrawal flow:
   ```bash
   # Submit test withdrawal
   curl -X POST https://your-api.com/api/withdrawals/request \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "accountHolderName": "Test User",
       "currency": "USD",
       "country": "US",
       "bankDetails": {
         "accountNumber": "12345678",
         "routingNumber": "123456789",
         "accountType": "checking"
       }
     }'
   ```
4. Verify no errors occur
5. Check Wise sandbox dashboard for test transfer

## Step 7: Go Live

When ready for production:

1. Switch to live API credentials
2. Update environment: `WISE_MODE=live`
3. Redeploy backend
4. Process real withdrawal with small amount ($10)
5. Verify funds arrive within 1-3 days
6. Monitor first 10-20 transfers closely

## Bank Field Requirements by Country

### United States
- Account number
- Routing number (ABA - 9 digits)
- Account type (checking/savings)

### United Kingdom
- Account number (8 digits)
- Sort code (6 digits, format: XX-XX-XX)

### South Africa & EU Countries
- IBAN (International Bank Account Number)

### Other Countries
- Contact Wise support for specific requirements

## Cost Structure

Wise fees vary by corridor:

- USD → USD: ~$0.50-$2.00 per transfer
- USD → ZAR: ~0.5-1% of transfer amount
- USD → GBP: ~0.4-0.8%
- USD → EUR: ~0.4-0.7%

Check current fees: https://wise.com/pricing

## Troubleshooting

### "Invalid API token"
- Verify token is correctly copied (no extra spaces)
- Check token hasn't expired
- Ensure using correct environment (sandbox vs live)

### "Insufficient balance"
- Top up your Wise balance
- Check specific currency balance (e.g., USD)

### "Invalid bank details"
- Verify format matches country requirements
- Use Wise API validation endpoint before submission
- Check for special characters or extra spaces

### "Profile not found"
- Confirm Profile ID matches your business account
- Ensure using correct API mode (sandbox/live)

## Security Best Practices

1. **Never commit API tokens** to version control
2. **Rotate tokens** every 90 days
3. **Use separate tokens** for dev/staging/production
4. **Monitor API usage** for unusual patterns
5. **Set up alerts** for failed transfers
6. **Log all transactions** for audit trail

## Support Resources

- Wise API Documentation: https://api-docs.wise.com/
- Platform Partner Support: platformpartners@wise.com
- General Support: https://wise.com/help/
- Status Page: https://status.wise.com/

## Compliance Notes

- Wise handles KYC/AML compliance for recipients
- Your business is responsible for user data protection
- Maintain records of all transfers for tax purposes
- Be aware of regulations in your operating jurisdictions

## Next Steps

After setup:
1. Update legal documents to reflect Wise integration
2. Train support team on new withdrawal process
3. Create user guide for bank details entry
4. Set up monitoring/alerting for transfer failures
5. Plan communication to existing users about change

---

**Need Help?**

If you encounter issues during setup, contact:
- Wise Platform Support: platformpartners@wise.com
- Include: Business name, application ID, detailed error description
