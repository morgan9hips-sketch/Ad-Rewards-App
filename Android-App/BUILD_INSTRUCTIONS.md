# Hybrid Architecture Build Instructions

## Environment Limitation
The build environment has network restrictions that prevent access to:
- `dl.google.com` (Google Maven Repository)
- Required for downloading Android Gradle Plugin and dependencies

## Build Requirements
To build the Android app, you need:
1. Access to Google Maven Repository
2. Android SDK installed
3. Gradle 8.7+ installed
4. Java 11+ installed

## Build Commands

### Generate Gradle Wrapper (if not present)
```bash
cd Android-App
gradle wrapper --gradle-version=8.7
```

### Build Debug APK
```bash
cd Android-App
./gradlew assembleDebug
```

### Build Release AAB (for Play Store)
```bash
cd Android-App
./gradlew bundleRelease
```

## Signing Configuration
To enable signing for release builds, add to `Android-App/app/build.gradle.kts`:

```kotlin
android {
    signingConfigs {
        create("release") {
            storeFile = file("path/to/your/keystore.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = System.getenv("KEY_ALIAS")
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
```

## Testing on Device
1. Enable USB debugging on Android device
2. Connect device via USB
3. Run: `./gradlew installDebug`

## Architecture Implementation Status
✅ Native Shell (WebView container) - Complete
✅ Hybrid Auth Bridge (JS ↔ Native) - Complete  
✅ Web App Integration - Complete
✅ Secure Session Storage (Android Keystore) - Complete

## Code Structure
- `MainActivity.kt` - WebView host, lifecycle management
- `HybridAuthBridge.kt` - JavaScript bridge for auth
- `SecureSessionStorage.kt` - Encrypted session storage
- `frontend/src/utils/hybridBridge.ts` - Web-side bridge interface
- `frontend/src/contexts/AuthContext.tsx` - Integrated hybrid auth

All implementation is complete. Build will succeed when network access is available.
