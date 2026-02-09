# ⚠️ MANUAL ACTIONS REQUIRED FOR PRODUCTION

**Date:** February 9, 2026  
**Status:** ✅ Code Complete | ⚠️ Manual Configuration Pending  
**Latest Commit:** `f109a94` - "fix: Use frontend URLs for legal documents in Settings for formatted display"

---

## ✅ WHAT'S BEEN COMPLETED

### **All Layers Deployed:**

- ✅ **Backend API:** Legal documents served at `https://api.adrevtechnologies.com/api/legal/*`
- ✅ **Frontend:** Deployed to `https://adify.adrevtechnologies.com`
- ✅ **Settings Buttons:** Now open formatted pages at `https://adify.adrevtechnologies.com/legal/*`
- ✅ **Android App:** Built successfully, ready to deploy from Android Studio
- ✅ **Git:** All changes committed and pushed (commit `f109a94`)

### **Legal URLs Fixed:**

```
✅ https://adify.adrevtechnologies.com/legal/terms
✅ https://adify.adrevtechnologies.com/legal/privacy
✅ https://adify.adrevtechnologies.com/legal/delete-account
```

---

## ⚠️ MANUAL ACTIONS YOU MUST COMPLETE

### **1. Supabase Dashboard - OAuth Redirect URLs** 🔴 CRITICAL

**Go to:** https://supabase.com/dashboard/project/yvgdzwzyaxzwwunnmlhc/auth/url-configuration

**Check if you already have wildcard domain configured:**
- If you see `https://*.adrevtechnologies.com/*` → You're already set for web OAuth ✅
- You ONLY need to add the Android deep link: `adify://oauth/callback`

**If you DON'T have wildcard, add this URL:**

```
adify://oauth/callback
```

**Steps:**

1. Log into Supabase Dashboard
2. Project: `yvgdzwzyaxzwwunnmlhc`
3. **Authentication** → **URL Configuration**
4. Check if `https://*.adrevtechnologies.com/*` exists
5. If NOT, add: `adify://oauth/callback`
6. Click **Save**

**Why:** Android OAuth needs `adify://oauth/callback` for Chrome Custom Tabs to redirect back to app.

---

### **2. Google Cloud Console - OAuth Configuration** 🔴 CRITICAL

**Go to:** https://console.cloud.google.com/apis/credentials

#### **2A. OAuth Consent Screen**

1. **APIs & Services** → **OAuth consent screen**
2. **User Type**: External
3. **Fill in:**
   - App name: `Adify`
   - Support email: Your email
   - **Authorized domains:**
     - `supabase.co`
     - `adrevtechnologies.com`
   - Developer contact: Your email
4. **Save and Continue**

#### **2B. Web OAuth Client - Authorized Redirect URI**

1. **APIs & Services** → **Credentials**
2. Click your **OAuth 2.0 Client ID** (Web application)
3. **Add to Authorized redirect URIs:**
   ```
   https://yvgdzwzyaxzwwunnmlhc.supabase.co/auth/v1/callback
   ```
4. **Save**

#### **2C. Android OAuth Client - SHA-1 Fingerprint**

1. Still in **Credentials**, create new **OAuth 2.0 Client ID**
2. **Application type:** Android
3. **Package name:** `com.adrevtechnologies.adify`
4. **SHA-1 certificate fingerprint:**

   **Get SHA-1 by running:**

   ```bash
   cd Android-App
   ./gradlew signingReport
   ```

   **Look for output like:**

   ```
   Variant: debug
   Config: debug
   Store: C:\Users\YourUser\.android\debug.keystore
   Alias: AndroidDebugKey
   MD5: XX:XX:XX:...
   SHA1: A1:B2:C3:D4:E5:F6:...  ← COPY THIS
   SHA-256: XX:XX:XX:...
   ```

   **Copy the SHA1 value** and paste into Google Cloud Console

5. **Create**

**Why:** Android OAuth will fail with "unauthorized_client" error without SHA-1.

---

### **3. Enable Google Provider in Supabase** 🔴 CRITICAL

**Go to:** https://supabase.com/dashboard/project/yvgdzwzyaxzwwunnmlhc/auth/providers

1. Click **Google** provider
2. Toggle **Enabled** to ON
3. **Enter credentials from Google Cloud Console:**
   - **Client ID:** (from Google Cloud Console OAuth 2.0 Client)
   - **Client Secret:** (from Google Cloud Console OAuth 2.0 Client)
4. **Save**

**Where to get Client ID + Secret:**

- Go to Google Cloud Console → APIs & Services → Credentials
- Find your **Web application** OAuth 2.0 Client
- Click to view Client ID and Client Secret

**Why:** OAuth will fail with "provider_not_found" error without this.

---

### **4. Google Play Console - Submit Legal URLs** 📋 REQUIRED FOR APPROVAL

**When submitting app to Google Play, use these URLs:**

**Privacy Policy:**

```
https://adify.adrevtechnologies.com/legal/privacy
```

**Terms of Service (optional but recommended):**

```
https://adify.adrevtechnologies.com/legal/terms
```

**Where to add:**

1. Google Play Console → Your App
2. **App content** section
3. Click **Privacy Policy**
4. Paste the URL above
5. **Save**

**Why:** Google Play requires publicly accessible privacy policy URL.

---

## 🧪 TESTING AFTER MANUAL CONFIGURATION

### **Test OAuth on Android Device:**

1. **Install app:**

   ```bash
   cd Android-App
   ./gradlew assembleDebug
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Monitor logs:**

   ```bash
   adb logcat -s AdifyWebView HybridAuthBridge MainActivity
   ```

3. **On device:**
   - Open Adify app
   - Click "Continue with Google"
   - Should open Chrome Custom Tabs (not WebView)
   - After Google login, app reopens
   - You should be logged in

**Expected logs:**

```
✅ LOGIN COMPONENT DEBUG: isHybrid: true
✅ requestAuth() called from JavaScript
✅ Chrome Custom Tabs launched
✅ Handling OAuth callback: adify://oauth/callback#access_token=...
✅ Token stored in Keystore
```

### **Test Legal Documents:**

**In Web App:**

1. Open https://adify.adrevtechnologies.com/settings
2. Click "Terms of Service" button
3. Should open formatted page in new tab (not raw text)

**In Android App:**

1. Run app from Android Studio
2. Go to Settings
3. Click "Terms of Service" button
4. Should open in **system browser** (Chrome/Samsung Internet)
5. Should show formatted HTML page

---

## 📋 CHECKLIST

**Complete these in order:**

- [ ] **Step 1:** Add Android deep link in Supabase (`adify://oauth/callback` only)
- [ ] **Step 2A:** Configure OAuth consent screen in Google Cloud
- [ ] **Step 2B:** Add authorized redirect URI in Google Cloud (Web)
- [ ] **Step 2C:** Create Android OAuth client with SHA-1 in Google Cloud
- [ ] **Step 3:** Enable Google provider in Supabase with Client ID + Secret
- [ ] **Step 4 (later):** Add legal URLs to Google Play Console when submitting app

**After completing steps 1-3:**

- [ ] Test OAuth on Android device
- [ ] Test legal document links (web + Android)
- [ ] Verify logs show successful OAuth flow

---

## ❓ COMMON ISSUES

### "redirect_uri_mismatch" error

**Fix:** Complete Step 1 (add `adify://oauth/callback` to Supabase)

### "unauthorized_client" error

**Fix:** Complete Step 2C (add SHA-1 fingerprint to Google Cloud)

### "provider_not_found" error

**Fix:** Complete Step 3 (enable Google provider in Supabase)

### OAuth button does nothing

**Fix:** Check all 3 steps above are complete

---

## 🎯 WHAT HAPPENS NEXT

**After you complete manual actions 1-3:**

1. OAuth will work on Android app ✅
2. Users can sign up with Google ✅
3. Legal documents accessible to everyone ✅
4. App ready for internal/beta testing ✅

**For Google Play submission (later):** 5. Complete Step 4 (add legal URLs to Play Console) 6. Submit app for review 7. Google reviews and approves

---

## 📞 NEED HELP?

**Supabase Dashboard:**
https://supabase.com/dashboard/project/yvgdzwzyaxzwwunnmlhc

**Google Cloud Console:**
https://console.cloud.google.com/apis/credentials

**Check Supabase OAuth Settings:**

```bash
curl "https://yvgdzwzyaxzwwunnmlhc.supabase.co/auth/v1/settings" | jq
```

**Get Android SHA-1:**

```bash
cd Android-App
./gradlew signingReport
```

---

**Last Updated:** February 9, 2026, 6:45 PM  
**All Code Complete ✅** | **Manual Config Pending ⚠️**
