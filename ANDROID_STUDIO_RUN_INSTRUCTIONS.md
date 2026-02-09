# 🚀 Run Android App from Android Studio

Your Android app is **100% ready** to run on a mobile phone from Android Studio!

---

## ✅ What's Already Configured

### PR #45 Changes Merged:

- ✅ **Legal links** open in system browser (not WebView)
- ✅ **Location prompt** only shows once (SharedPreferences)
- ✅ **Geolocation enabled** in WebView settings

### PR #43 OAuth Changes:

- ✅ **Chrome Custom Tabs** for Google OAuth (fixes 403 error)
- ✅ **Deep link** handler: `adify://oauth/callback`
- ✅ **Secure token storage** (Android Keystore AES256-GCM)
- ✅ **Hybrid bridge** for native ↔ web communication

### Production URLs Configured:

- ✅ Frontend: `https://adify.adrevtechnologies.com`
- ✅ Backend: API calls to production endpoints

---

## 📱 Steps to Run on Your Phone

### 1. Open Project in Android Studio

```bash
cd C:\Ad-Rewards-App\Android-App
```

Then in Android Studio:

- **File** → **Open**
- Select `C:\Ad-Rewards-App\Android-App` folder
- Wait for Gradle sync to complete (bottom right corner)

### 2. Connect Your Android Device

#### Enable USB Debugging on Phone:

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (unlocks Developer Options)
3. Go back to **Settings** → **Developer Options**
4. Toggle **ON**: "USB Debugging"
5. Connect phone via USB cable
6. Authorize the computer on phone prompt

#### Verify Connection:

Open terminal in Android Studio (bottom left) and run:

```bash
adb devices
```

Should show:

```
List of devices attached
ABC123XYZ    device
```

### 3. Select Device and Run

1. **Top toolbar**: Click device dropdown (next to green ▶️ play button)
2. Select your connected phone (e.g., "Samsung Galaxy S21")
3. Click **green ▶️ Run button** (or press `Shift + F10`)
4. Android Studio will:
   - Build the APK (1-2 minutes first time)
   - Install on your phone
   - Launch the app automatically

---

## 🧪 Test OAuth Login

Once app opens on your phone:

1. Click **"Continue with Google"** button
2. **✅ Expected**: Chrome Custom Tabs opens (NOT WebView)
3. Google sign-in screen appears
4. Sign in with your Google account
5. **✅ Expected**: App reopens automatically
6. You should now be logged in!

### If OAuth Fails:

Check **OAUTH_MANUAL_CONFIG_REQUIRED.md** - you need to configure:

- Supabase redirect URLs
- Google Cloud Console OAuth credentials
- Android SHA-1 fingerprint

---

## 🔍 Debugging Tips

### View Logs in Android Studio:

1. **Bottom toolbar**: Click **Logcat** tab
2. **Filter dropdown**: Select "Show only selected application"
3. **Search box**: Type `AdifyWebView` or `HybridAuthBridge`

Look for these logs during OAuth:

```
🔐 requestAuth() called from JavaScript
🔐 Chrome Custom Tabs launched for OAuth
🎯 Deep link received: adify://oauth/callback#access_token=...
✅ Token stored in Keystore
```

### Inspect WebView (Chrome DevTools):

1. On your computer, open **Chrome browser**
2. Go to: `chrome://inspect`
3. You should see your phone listed with "Adify" WebView
4. Click **"inspect"** to open DevTools
5. **Console tab**: See JavaScript logs from web app

---

## 🏗️ Build Configurations

### Debug Build (Current):

- **Package**: `com.adrevtechnologies.adify`
- **Version**: 1.0 (versionCode: 1)
- **Min SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 15 (API 36)
- **Signature**: Debug keystore (auto-generated)

### For Google Play Release Build:

You'll need to:

1. Create a **release keystore** (production signing key)
2. Update `build.gradle.kts` with signing config
3. Build **AAB** (Android App Bundle) not APK:
   ```bash
   ./gradlew bundleRelease
   ```
4. Upload to Google Play Console

---

## ⚠️ Important Pre-Deployment Checklist

Before uploading to Google Play, ensure:

- [ ] **OAuth configured**: Supabase + Google Cloud Console (see OAUTH_MANUAL_CONFIG_REQUIRED.md)
- [ ] **SHA-1 fingerprint** added to Google Console (for OAuth)
- [ ] **Privacy Policy URL** live at production domain
- [ ] **Legal documents** accessible without login
- [ ] **App icon** updated (currently default)
- [ ] **Version code** incremented for updates
- [ ] **Release keystore** created and secured

---

## 📦 Build Outputs

After successful build, find APK at:

```
Android-App/app/build/outputs/apk/debug/app-debug.apk
```

For AAB (Google Play):

```
Android-App/app/build/outputs/bundle/release/app-release.aab
```

---

## 🚨 Troubleshooting

### "BUILD FAILED" Errors:

**Gradle sync issues:**

```bash
./gradlew clean
./gradlew build --refresh-dependencies
```

**Java version mismatch:**

- Android Studio uses JDK 11
- Check: **File** → **Project Structure** → **SDK Location** → **JDK location**

### App Won't Install:

**"App not installed" error:**

- Uninstall old version first
- Enable "Install from unknown sources" in Developer Options

**Signature conflict:**

```bash
adb uninstall com.adrevtechnologies.adify
```

### OAuth Not Working:

1. Check Supabase redirect URLs configured
2. Verify Google Cloud Console OAuth setup
3. Get SHA-1: `./gradlew signingReport`
4. Add SHA-1 to Google Cloud Console Android app config

---

## ✅ You're Ready!

Your app is fully configured and deployable:

- ✅ All PR changes merged (OAuth + Google Play compliance)
- ✅ Production frontend deployed and live
- ✅ Native code ready with Chrome Custom Tabs
- ✅ Legal links open in system browser
- ✅ Location prompt only shows once

**Just plug in your phone, click Run in Android Studio, and test! 🚀**
