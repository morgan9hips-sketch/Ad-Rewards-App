# 🔴 CRITICAL: Manual OAuth Configuration Required

The code is deployed, but OAuth **will not work** until you complete these manual configurations:

---

## 1. Supabase Dashboard - Redirect URLs (CRITICAL)

Go to: https://supabase.com/dashboard/project/yvgdzwzyaxzwwunnmlhc/auth/url-configuration

### Add These Redirect URLs:

```
adify://oauth/callback
https://adify.adrevtechnologies.com/auth/callback
http://localhost:5173/auth/callback
```

**Why**: Supabase will reject OAuth callbacks unless these URLs are whitelisted.

**Steps**:

1. Log into Supabase Dashboard
2. Select your project: `yvgdzwzyaxzwwunnmlhc`
3. Go to **Authentication** → **URL Configuration**
4. In **Redirect URLs** section, add all 3 URLs above

---

## 2. Google Cloud Console - OAuth Configuration (CRITICAL)

Go to: https://console.cloud.google.com/apis/credentials

### Get Your Supabase Google OAuth Credentials:

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Check if Google OAuth is enabled
3. Note your Google OAuth **Client ID** and **Client Secret** (if configured)

### Configure Google Cloud Console:

#### A. OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Set **User Type**: External (for public use) or Internal (for testing)
3. Fill in:
   - **App name**: Adify
   - **Support email**: Your email
   - **Authorized domains**:
     - `supabase.co`
     - `adrevtechnologies.com`
   - **Developer contact**: Your email
4. Click **Save and Continue**

#### B. Add Authorized Redirect URIs

1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://yvgdzwzyaxzwwunnmlhc.supabase.co/auth/v1/callback
   ```
4. Click **Save**

#### C. Android App Configuration (for native OAuth)

1. Still in **Credentials**, create or edit **OAuth 2.0 Client ID**
2. Application type: **Android**
3. **Package name**: `com.adrevtechnologies.adify`
4. **SHA-1 certificate fingerprint**:
   - For debug builds, run:
     ```bash
     cd Android-App
     ./gradlew signingReport
     ```
   - Copy the SHA-1 from the output
   - For release builds, get SHA-1 from your keystore:
     ```bash
     keytool -list -v -keystore path/to/your/keystore.jks
     ```
5. Click **Create** or **Save**

---

## 3. Verify Current Configuration Status

### Check Supabase Google OAuth:

1. Go to: https://supabase.com/dashboard/project/yvgdzwzyaxzwwunnmlhc/auth/providers
2. Click **Google** provider
3. Verify:
   - ✅ **Enabled** is ON
   - ✅ **Client ID** is filled (from Google Cloud Console)
   - ✅ **Client Secret** is filled (from Google Cloud Console)

### If Google OAuth is NOT configured in Supabase:

1. Get your Google Client ID and Secret from Google Cloud Console
2. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
3. Toggle **Enabled** to ON
4. Enter your **Client ID** and **Client Secret**
5. Click **Save**

---

## 4. Android App - No Manual Config Needed ✅

Your Android app is already configured correctly:

- ✅ Deep link: `adify://oauth/callback` in AndroidManifest.xml
- ✅ Chrome Custom Tabs implementation
- ✅ Native bridge: `window.HybridBridge.requestAuth()`
- ✅ Production URL: `https://adify.adrevtechnologies.com`

---

## 5. Testing Steps After Configuration

### A. Check Supabase Redirect URLs

1. Open Terminal
2. Run:
   ```bash
   curl -X GET "https://yvgdzwzyaxzwwunnmlhc.supabase.co/auth/v1/settings" | jq '.external.redirect_url'
   ```
3. Should return your redirect URLs

### B. Test OAuth Flow on Android

1. Install/update app on Android device:

   ```bash
   cd Android-App
   ./gradlew assembleDebug
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

2. Enable USB debugging and connect device via USB

3. Monitor logs in real-time:

   ```bash
   adb logcat -s AdifyWebView HybridAuthBridge MainActivity
   ```

4. In Chrome on your PC, open: `chrome://inspect`

5. On Android device:
   - Open Adify app
   - Click **"Continue with Google"**

6. **Expected Behavior**:
   - Chrome Custom Tabs should open (not WebView)
   - Google OAuth login screen appears
   - After login, app reopens automatically
   - User is logged in

7. **Check Logs**:
   ```
   ✅ LOGIN COMPONENT DEBUG: isHybrid: true
   ✅ Calling requestAuthFromNative()
   ✅ requestAuth() called from JavaScript
   ✅ Chrome Custom Tabs launched with URL: https://yvgdzwzyaxzwwunnmlhc.supabase.co/auth/v1/authorize...
   ✅ Handling OAuth callback: adify://oauth/callback?access_token=...
   ✅ Token extracted and stored securely
   ```

### C. If Chrome Custom Tabs Opens But Login Fails:

- Check Supabase logs: https://supabase.com/dashboard/project/yvgdzwzyaxzwwunnmlhc/logs/edge-logs
- Common issues:
  - Redirect URL not whitelisted → 403 error
  - Google OAuth not configured → provider_not_found
  - SHA-1 fingerprint mismatch → unauthorized_client

---

## 6. Quick Verification Checklist

Before testing, verify:

- [ ] Supabase redirect URLs configured (step 1)
- [ ] Google Cloud OAuth consent screen configured (step 2A)
- [ ] Google Cloud authorized redirect URIs configured (step 2B)
- [ ] Google Cloud Android app configured with SHA-1 (step 2C)
- [ ] Supabase Google OAuth provider enabled (step 3)
- [ ] Android app installed on device
- [ ] USB debugging enabled

---

## 7. What's Already Done (No Action Needed)

✅ **Frontend Code**:

- Hybrid detection: `isHybridEnvironment()`
- Custom redirect: `adify://oauth/callback`
- Bridge calls: `requestAuthFromNative()`

✅ **Android Native Code**:

- Chrome Custom Tabs implementation
- Deep link intent filter
- OAuth callback handler
- Secure token storage (Android Keystore)

✅ **Production Deployment**:

- Frontend deployed to Vercel: https://adify.adrevtechnologies.com
- Android app loads production URL

---

## 8. Common Issues & Solutions

### Issue: "disallowed_useragent"

**Cause**: Google OAuth blocks WebView
**Solution**: Already fixed - using Chrome Custom Tabs

### Issue: "redirect_uri_mismatch"

**Cause**: `adify://oauth/callback` not whitelisted in Supabase
**Solution**: Add to Supabase redirect URLs (step 1)

### Issue: "unauthorized_client"

**Cause**: Android SHA-1 fingerprint not registered in Google Cloud Console
**Solution**: Add SHA-1 from `./gradlew signingReport` (step 2C)

### Issue: Chrome Custom Tabs opens but returns to app without login

**Cause**: Missing Google OAuth configuration in Supabase
**Solution**: Enable Google provider in Supabase with Client ID/Secret (step 3)

---

## Need Help?

If OAuth still doesn't work after completing all steps:

1. **Check Supabase Logs**:
   https://supabase.com/dashboard/project/yvgdzwzyaxzwwunnmlhc/logs/edge-logs

2. **Check Android Logs**:

   ```bash
   adb logcat -s AdifyWebView HybridAuthBridge | grep -E "OAuth|Error|chrome"
   ```

3. **Check WebView Console**:
   - Open `chrome://inspect` in Chrome
   - Inspect your WebView
   - Check Console tab for JavaScript errors

4. **Verify Redirect URL in Supabase**:
   ```bash
   curl "https://yvgdzwzyaxzwwunnmlhc.supabase.co/auth/v1/settings" | jq
   ```
