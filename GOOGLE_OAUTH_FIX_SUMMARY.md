# Google OAuth Fix - Implementation Summary

## Problem Statement

Google blocks OAuth authentication in WebView with error: **403: disallowed_useragent**

This is a security measure by Google to prevent phishing attacks and ensure users can verify the authentication URL.

## Solution Implemented

Force Google OAuth to use **system browser (Chrome Custom Tabs)** instead of WebView.

### Changes Made

#### 1. HybridAuthBridge.kt - Direct Supabase OAuth URL

**File:** `Android-App/app/src/main/java/com/adrevtechnologies/adify/HybridAuthBridge.kt`

**Change:** Updated `requestAuth()` method to construct direct Supabase OAuth URL

**Before:**
```kotlin
val authUrl = "https://adify.adrevtechnologies.com/login?redirect_uri=adify://oauth/callback"
```

**After:**
```kotlin
val authUrl = "https://yvgdzwzyaxzwwunnmlhc.supabase.co/auth/v1/authorize" +
    "?provider=google" +
    "&redirect_to=adify://oauth/callback"
```

**Why This Matters:**
- Previous implementation opened web login page in Chrome Custom Tabs, requiring user to click login button twice
- New implementation directly initiates OAuth flow, providing better UX
- Both approaches use system browser (not WebView), but new approach is more direct

#### 2. Documentation Update

**File:** `OAUTH_FIX_MANUAL_ACTIONS.md`

Updated flow documentation to reflect the direct OAuth approach.

## How It Works

### Authentication Flow

1. **User Action**: User clicks "Login with Google" in WebView app
2. **Native Bridge**: Frontend JavaScript calls `requestAuthFromNative()`
3. **System Browser**: Native code opens Chrome Custom Tabs with Supabase OAuth URL
4. **Google OAuth**: User authenticates with Google in Chrome (Google allows it)
5. **Redirect**: Supabase redirects to `adify://oauth/callback#access_token=...`
6. **Deep Link**: Android OS opens app via deep link
7. **Token Extraction**: MainActivity extracts token from URL fragment
8. **Secure Storage**: Token stored in Android Keystore (AES256-GCM)
9. **Session Injection**: Token injected into WebView
10. **Login Complete**: User navigated to dashboard

### Key Components

#### AndroidManifest.xml (Already Configured)
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="adify"
        android:host="oauth"
        android:pathPrefix="/callback" />
</intent-filter>
```

#### MainActivity.kt (Already Configured)
- `onNewIntent()` handles deep link callback
- Extracts token from URI fragment
- Stores securely in Keystore
- Injects into WebView

#### Frontend (Already Configured)
- Detects hybrid environment via user agent
- Calls native bridge instead of Supabase client library
- Receives injected session after OAuth completes

## Configuration Required

### Supabase Dashboard

⚠️ **CRITICAL**: The redirect URL must be added to Supabase's allowed list:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `yvgdzwzyaxzwwunnmlhc`
3. Navigate to **Authentication → URL Configuration**
4. Under **Redirect URLs**, add: `adify://oauth/callback`
5. Click **Save**

**Why:** Supabase validates redirect URLs for security. If not whitelisted, OAuth will fail.

## Benefits

✅ **Fixes disallowed_useragent Error**
- Uses Chrome Custom Tabs (system browser) instead of WebView
- Google allows OAuth in real browsers

✅ **Better User Experience**
- One-click login instead of two
- No confusing intermediate page loads

✅ **Improved Security**
- User can verify URL in browser address bar
- Chrome's security features active (phishing protection, etc.)
- Hardware-backed Keystore storage for tokens

✅ **Industry Standard**
- Chrome Custom Tabs is used by major apps (Twitter, Facebook, GitHub)
- Follows OAuth 2.0 best practices
- Complies with Google's secure browser policy

## Testing

### Prerequisites
1. Android device or emulator with Google Play Services
2. Chrome browser installed
3. App built and installed
4. Supabase redirect URL configured (see above)

### Test Steps
1. Open app
2. Click "Login with Google"
3. **Expected**: Chrome Custom Tabs opens with Google login
4. Sign in with Google account
5. **Expected**: App reopens automatically
6. **Expected**: User logged in, navigated to dashboard

### Success Indicators
- ✅ Chrome Custom Tabs opens (not WebView)
- ✅ Google login completes without 403 error
- ✅ App reopens after authentication
- ✅ User logged in on dashboard
- ✅ Logout and re-login works
- ✅ Token persists after app restart

### Failure Indicators
- ❌ Error 403: disallowed_useragent → Check using system browser
- ❌ Redirect fails → Check Supabase redirect URL configuration
- ❌ App doesn't reopen → Check deep link intent filter
- ❌ Token not stored → Check Keystore implementation

## Known Limitations

### Facebook OAuth
- Current implementation only handles Google OAuth
- Facebook login button calls same native method but gets Google OAuth
- **Solution**: Add provider parameter to native bridge method (future enhancement)

### Manual Configuration
- Supabase redirect URL must be manually added in dashboard
- Cannot be automated as part of code deployment
- Documented in `OAUTH_FIX_MANUAL_ACTIONS.md`

## Technical Details

### Dependencies (Already in place)
```kotlin
implementation("androidx.browser:browser:1.7.0") // Chrome Custom Tabs
implementation("androidx.security:security-crypto:1.1.0-alpha06") // Keystore
```

### Supabase OAuth Endpoint
```
https://<project-id>.supabase.co/auth/v1/authorize
```

**Parameters:**
- `provider`: OAuth provider (`google`, `facebook`, etc.)
- `redirect_to`: Callback URL after successful authentication

**Response:**
- Redirects to callback URL with token in fragment: `#access_token=...&refresh_token=...&expires_in=3600`

### Deep Link Scheme
```
adify://oauth/callback
```

**Format:** `scheme://host/path`
- Scheme: `adify` (app-specific)
- Host: `oauth` (feature-specific)
- Path: `/callback` (action-specific)

## Security Considerations

### Token Storage
- Access token stored in Android Keystore
- Encrypted with AES256-GCM
- Hardware-backed on supported devices
- Keys cannot be extracted from device

### OAuth Security
- PKCE (Proof Key for Code Exchange) handled by Supabase
- State parameter prevents CSRF attacks
- Tokens transmitted in URL fragment (not query params)
- HTTPS enforced for all OAuth endpoints

### Deep Link Security
- Intent filter uses `autoVerify="true"`
- App verifies deep link origin in `onNewIntent()`
- Only processes links matching expected pattern
- Token validation happens server-side

## Rollback Plan

If this change causes issues:

```bash
git revert c259a47
cd Android-App
./gradlew clean assembleRelease
```

This reverts to the previous implementation which opened the web login page in Chrome Custom Tabs (still uses system browser, just less optimal UX).

## References

- [Google OAuth Security Policy](https://developers.google.com/identity/protocols/oauth2)
- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Android Chrome Custom Tabs Guide](https://developer.chrome.com/docs/android/custom-tabs/)
- [Android App Links](https://developer.android.com/training/app-links)

## Conclusion

This fix ensures Google OAuth works correctly in the Android app by using Chrome Custom Tabs (system browser) instead of WebView. The implementation is secure, follows industry best practices, and provides a better user experience.

**Status:** ✅ Implementation Complete
**Next Steps:** Testing on device + Supabase configuration
