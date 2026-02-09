# 🚨 URGENT: OAuth Not Working - Debug Instructions

## Problem

You click "Continue with Google" → **NOTHING HAPPENS**

## Root Cause Analysis

Two possibilities:

1. **APK is old** - You're testing with an APK built before PR #43's changes
2. **Bridge not wired up** - JavaScript can't see the native bridge

## ✅ Solution: Rebuild APK with Debug Logging

### Step 1: Clean Build

```powershell
cd C:\Ad-Rewards-App\Android-App
.\gradlew clean
```

### Step 2: Build Fresh Debug APK (Faster than AAB)

```powershell
.\gradlew assembleDebug
```

**Output:** `Android-App\app\build\outputs\apk\debug\app-debug.apk`

### Step 3: Install on Device

```powershell
# If you have ADB
adb install -r app\build\outputs\apk\debug\app-debug.apk

# OR drag-and-drop APK to device
```

### Step 4: Enable Android Logging

```powershell
# Connect device via USB
# Enable USB Debugging on device
adb logcat -s AdifyWebView HybridAuthBridge
```

### Step 5: Test Login Flow

1. Open app
2. Tick "I agree to Terms"
3. Click "Continue with Google"
4. **Watch the logs**

## 🔍 What to Look For in Logs

### ✅ SUCCESS - Bridge Working:

```
AdifyWebView: 🔧 Initializing WebView and bridge
AdifyWebView: ✅ JavaScript interface added: HybridBridge
HybridAuthBridge: 🔐 requestAuth() called from JavaScript
HybridAuthBridge: 🔐 Inside runOnUiThread
HybridAuthBridge: 🔐 CustomTabsIntent created, about to launch...
HybridAuthBridge: ✅ Chrome Custom Tabs launched for OAuth
```

### ❌ FAILURE - Bridge Not Found:

```
(In Chrome DevTools Console)
🔍 LOGIN COMPONENT DEBUG:
  - isHybrid: false
  - window.HybridBridge exists: false
  - User-Agent: Mozilla/5.0 ...
```

**Means:** APK doesn't have bridge changes. Must rebuild.

### ❌ FAILURE - Bridge Found But requestAuth Not Called:

```
(In Chrome DevTools Console)
🔍 LOGIN COMPONENT DEBUG:
  - isHybrid: true
  - window.HybridBridge exists: true
🚀 handleGoogleLogin clicked
```

But NO native logs → JavaScript error or not reaching native call.

### ❌ FAILURE - Chrome Custom Tabs Error:

```
HybridAuthBridge: 🔐 requestAuth() called from JavaScript
HybridAuthBridge: ❌ Failed to launch Chrome Custom Tabs
HybridAuthBridge: ❌ Error: No Activity found to handle Intent
```

**Means:** Chrome not installed or intent issue.

## 🛠️ How to View JavaScript Console Logs

### Method 1: Chrome DevTools (Recommended)

1. Connect device via USB
2. Enable USB Debugging
3. Open Chrome on PC: `chrome://inspect`
4. Find your device → Click "inspect"
5. Go to Console tab
6. Open app, navigate to login
7. **See all console.log() output**

### Method 2: Android Studio Logcat

1. Open Android Studio
2. View → Tool Windows → Logcat
3. Filter: `package:com.adrevtechnologies.adify`
4. Look for WebView console logs

## 📝 What Debug Logs Were Added

### JavaScript Side (frontend/)

- **Login.tsx**: Logs hybrid detection, button clicks
- **hybridBridge.ts**: Logs bridge availability, method calls

### Native Side (Android-App/)

- **MainActivity.kt**: Logs bridge initialization
- **HybridAuthBridge.kt**: Logs requestAuth calls, Chrome Custom Tabs launch

## 🎯 Expected Flow (If Working)

```
1. User clicks button
   📱 JS: "🚀 handleGoogleLogin clicked"
   📱 JS: "🔐 Hybrid environment detected"

2. JavaScript calls native
   📱 JS: "🔐 Calling requestAuthFromNative()..."
   📱 JS: "🔐 About to call window.HybridBridge.requestAuth()"

3. Native receives call
   🤖 Native: "🔐 requestAuth() called from JavaScript"
   🤖 Native: "🔐 Inside runOnUiThread"

4. Chrome Custom Tabs launches
   🤖 Native: "🔐 CustomTabsIntent created, about to launch..."
   🤖 Native: "✅ Chrome Custom Tabs launched for OAuth"

5. Chrome browser opens
   [Google OAuth page visible]
```

## 🚨 If Still Nothing Happens

### Check 1: Is APK Fresh?

```powershell
# Check APK build time
ls Android-App\app\build\outputs\apk\debug\app-debug.apk

# Should be AFTER your git pull (today's date)
```

### Check 2: Is WebView Loading Production URL?

In Chrome DevTools, check URL bar:

- ✅ Should show: `https://adify.adrevtechnologies.com`
- ❌ If shows: `file:///` or `localhost` → Wrong URL

### Check 3: Is Chrome Installed?

```powershell
adb shell pm list packages | findstr chrome
```

Should show: `com.android.chrome`

### Check 4: Test Bridge Manually

In Chrome DevTools Console:

```javascript
// Test 1: Bridge exists?
window.HybridBridge

// Test 2: User-Agent check
navigator.userAgent

// Test 3: Call requestAuth directly
window.HybridBridge.requestAuth()
```

If bridge exists and direct call works → Problem is in React code.
If bridge doesn't exist → APK not built with changes.

## 🔄 Clean Rebuild Steps (If Above Fails)

```powershell
# 1. Clean everything
cd C:\Ad-Rewards-App\Android-App
.\gradlew clean
rm -r app\build

# 2. Rebuild frontend (in case WebView cache issue)
cd ..\frontend
npm run build

# 3. Rebuild Android
cd ..\Android-App
.\gradlew assembleDebug

# 4. Uninstall old app from device
adb uninstall com.adrevtechnologies.adify

# 5. Install fresh APK
adb install app\build\outputs\apk\debug\app-debug.apk

# 6. Clear app data
adb shell pm clear com.adrevtechnologies.adify

# 7. Test again
```

## 📞 Urgent Support Decision Tree

### Scenario A: Logs show bridge doesn't exist

→ **ACTION:** Rebuild APK (see Step 1-3 above)
→ **WHY:** Testing old APK without bridge code

### Scenario B: Logs show bridge exists, requestAuth called, CCT fails

→ **ACTION:** Check Chrome installed, check Intent filter
→ **WHY:** Chrome Custom Tabs can't launch

### Scenario C: Logs show everything but nothing happens

→ **ACTION:** Check OAuth URL, check Supabase redirect URL config
→ **WHY:** OAuth flow starting but failing redirect

### Scenario D: No logs at all

→ **ACTION:** Check logcat connection, check USB debugging
→ **WHY:** Can't see what's happening

## 🎯 Next Steps

1. **Build fresh debug APK** (5 minutes)
2. **Connect logcat** (2 minutes)
3. **Test login** (1 minute)
4. **Share logs** (copy-paste to chat)

Then we can **pinpoint exactly** where the flow breaks.

---

**Commit:** `684c7df` - Debug logging added
**Files changed:**

- `frontend/src/pages/Login.tsx` - JS console logs
- `frontend/src/utils/hybridBridge.ts` - Bridge call logs
- `Android-App/.../HybridAuthBridge.kt` - Native method logs
- `Android-App/.../MainActivity.kt` - Bridge init logs
