# OAuth Fix - Manual Actions Required

## ✅ COMPLETED (Automated)
1. ✅ Added Chrome Custom Tabs dependency (`androidx.browser:browser:1.7.0`)
2. ✅ Added deep link intent filter in AndroidManifest.xml (`adify://oauth/callback`)
3. ✅ Updated HybridAuthBridge.requestAuth() to launch Chrome Custom Tabs
4. ✅ Added onNewIntent() handler in MainActivity for deep link callback
5. ✅ Updated supabase.ts to use custom redirect URI in hybrid mode
6. ✅ Removed WebView OAuth interception (no longer needed)

## 🔴 REQUIRED: Supabase Dashboard Configuration

**YOU MUST DO THIS OR OAUTH WILL STILL FAIL:**

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (Ad-Rewards-App / adrevtechnologies)
3. Navigate to **Authentication → URL Configuration**
4. Under **Redirect URLs**, add:
   ```
   adify://oauth/callback
   ```
5. Click **Save**

## Why This Fix Works

### The Problem
- **Error 403: disallowed_useragent** - Google blocks OAuth in WebView
- WebView is considered insecure for OAuth (can't verify URL bar, phishing risk)
- Previous implementation tried to open OAuth in WebView → Google blocked it

### The Solution
- **Chrome Custom Tabs** = actual Chrome browser (not WebView)
- Google allows OAuth in real browsers
- Better UX: user sees address bar, can verify URL
- More secure: Chrome's security features active

### The Flow
```
1. User clicks "Login with Google" in WebView
2. Web calls HybridBridge.requestAuth()
3. Native opens Chrome Custom Tabs with direct Supabase OAuth URL
4. User authenticates with Google in Chrome (Google allows it - not WebView!)
5. Supabase redirects to: adify://oauth/callback#access_token=...
6. Android deep link reopens app
7. MainActivity.onNewIntent() extracts token
8. Token stored in Android Keystore (AES256-GCM)
9. Token injected into WebView
10. User logged in

Note: The native code directly constructs the Supabase OAuth URL, bypassing
the web login page for a cleaner, single-step authentication experience.
```

## Testing Instructions

1. **Add redirect URL in Supabase** (see above)
2. **Build fresh AAB**:
   ```bash
   cd Android-App
   # Open in Android Studio
   # Build → Generate Signed Bundle
   ```
3. **Install on device**
4. **Test OAuth flow**:
   - Click "Login with Google"
   - Chrome Custom Tabs should open (NOT WebView)
   - Sign in with Google
   - App should reopen with user logged in

## Expected Behavior

✅ **Success**: Chrome Custom Tabs opens, Google login works, app resumes logged in
❌ **Failure**: Still see Error 403 → Check Supabase redirect URL configuration

## Verification

Run this in terminal to verify deep link is registered:
```bash
adb shell dumpsys package com.adrevtechnologies.adify | grep -A 10 "android.intent.action.VIEW"
```

Should see:
```
scheme: "adify"
host: "oauth"
path: "/callback"
```

## Emergency Rollback

If this breaks something:
```bash
git revert HEAD
cd frontend
npm run build
cd ../Android-App
# Rebuild AAB
```

## Key Changes Made

| File | Change | Why |
|------|--------|-----|
| `build.gradle.kts` | Added `androidx.browser:browser:1.7.0` | Chrome Custom Tabs library |
| `AndroidManifest.xml` | Added deep link intent filter | Capture OAuth callback |
| `HybridAuthBridge.kt` | Use Chrome Custom Tabs instead of WebView | Fix Google's 403 error |
| `MainActivity.kt` | Added onNewIntent() handler | Process deep link token |
| `supabase.ts` | Detect hybrid, use custom redirect URI | Tell Supabase where to redirect |

## Notes

- **No backend changes** - uses existing Supabase endpoints
- **No breaking changes to web app** - still works standalone
- **Chrome Custom Tabs** is standard practice (used by Twitter, Facebook, GitHub apps)
- **Security improved** - user can verify URL, hardware-backed Keystore storage

---

**DEADLINE CRITICAL**: This fix addresses the exact error you're experiencing. The Supabase redirect URL configuration is the **only manual step** required.
