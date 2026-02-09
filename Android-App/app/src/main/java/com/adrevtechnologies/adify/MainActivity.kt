package com.adrevtechnologies.adify

import android.content.Intent
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.GeolocationPermissions
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import android.view.ViewGroup
import android.widget.FrameLayout
import android.content.Context

/**
 * Main Activity - Native Shell for Hybrid Architecture.
 * 
 * Responsibilities:
 * - WebView host
 * - Secure storage (Android Keystore via SecureSessionStorage)
 * - Lifecycle handling
 * - JS bridge exposure
 * 
 * NO business logic - all auth logic remains in web app.
 */
class MainActivity : ComponentActivity() {
    
    companion object {
        private const val PRODUCTION_URL = "https://adify.adrevtechnologies.com"
    }
    
    private lateinit var webView: WebView
    private lateinit var sessionStorage: SecureSessionStorage
    private lateinit var authBridge: HybridAuthBridge
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize secure session storage
        sessionStorage = SecureSessionStorage(this)
        
        // Create and configure WebView
        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        
        // Initialize hybrid auth bridge (pass activity for OAuth handling)
        authBridge = HybridAuthBridge(this, webView, sessionStorage)
        
        android.util.Log.d("AdifyWebView", "🔧 Initializing WebView and bridge")
        android.util.Log.d("AdifyWebView", "🔧 Bridge object: $authBridge")
        android.util.Log.d("AdifyWebView", "🔧 Bridge name: ${HybridAuthBridge.BRIDGE_NAME}")
        
        // Configure WebView settings
        configureWebView()
        
        // Inject JavaScript bridge BEFORE loading URL
        webView.addJavascriptInterface(authBridge, HybridAuthBridge.BRIDGE_NAME)
        android.util.Log.d("AdifyWebView", "✅ JavaScript interface added: ${HybridAuthBridge.BRIDGE_NAME}")
        
        // Set content view
        val container = FrameLayout(this)
        container.addView(webView)
        setContentView(container)
        
        // Handle back button press
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
        
        // Load production URL
        webView.loadUrl(PRODUCTION_URL)
    }
    
    private fun configureWebView() {
        webView.settings.apply {
            // Enable JavaScript (required for React app)
            javaScriptEnabled = true
            
            // Enable DOM storage (required for web app state)
            domStorageEnabled = true
            
            // Enable database storage
            databaseEnabled = true
            
            // Enable geolocation
            setGeolocationEnabled(true)
            
            // Enable caching for better performance
            cacheMode = WebSettings.LOAD_DEFAULT
            
            // Allow file access from file URLs (needed for local resources)
            allowFileAccess = true
            
            // Support multiple windows
            setSupportMultipleWindows(false)
            
            // Enable zoom controls
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            
            // Set user agent to identify as mobile
            userAgentString = "${userAgentString} AdifyHybrid/1.0"
        }
        
        // Set WebViewClient to handle URL loading
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)

                // FORCE-HIJACK a-href links and buttons
                // This ensures that native auth is ALWAYS used, bypassing web login.
                val jsToInject = """
                    javascript:(function() {
                        function hijackAuth(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            var provider = this.getAttribute('data-provider') || 'google';
                            if (window.HybridBridge && window.HybridBridge.requestAuth) {
                                window.HybridBridge.requestAuth(provider);
                            }
                        }

                        // Hijack Google button
                        var googleButton = document.querySelector('a[href*="provider=google"]');
                        if (googleButton) {
                            googleButton.setAttribute('data-provider', 'google');
                            googleButton.onclick = hijackAuth;
                        }

                        // Hijack Facebook button
                        var facebookButton = document.querySelector('a[href*="provider=facebook"]');
                        if (facebookButton) {
                            facebookButton.setAttribute('data-provider', 'facebook');
                            facebookButton.onclick = hijackAuth;
                        }
                    })();
                """.trimIndent()

                view?.evaluateJavascript(jsToInject, null)

                // After page loads, check if we have a stored session
                // If yes, inject it into the web app
                if (sessionStorage.hasValidSession()) {
                    authBridge.injectSessionIntoWebView()
                }
            }
            
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                // Open legal documents in system browser
                if (url != null && url.contains("/legal/")) {
                    val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
                    startActivity(intent)
                    return true // Prevent WebView from loading
                }
                
                // Allow navigation to production domain
                // OAuth now happens in Chrome Custom Tabs, not WebView
                return if (url != null && url.startsWith("https://adify.adrevtechnologies.com")) {
                    false // Allow navigation
                } else {
                    true // Block external navigation
                }
            }
        }
        
        // Set WebChromeClient for console messages, alerts, and geolocation
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                // Check if we've already prompted for location
                val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
                val hasPrompted = prefs.getBoolean("location_prompted", false)
                
                if (hasPrompted) {
                    // Already prompted once, grant permission without showing prompt again
                    callback?.invoke(origin, true, false)
                } else {
                    // First time - show prompt and remember that we prompted
                    callback?.invoke(origin, true, true)
                    prefs.edit().putBoolean("location_prompted", true).apply()
                    android.util.Log.d("AdifyWebView", "📍 Location permission prompted (first time)")
                }
            }
        }
        
        // Clear cache on first launch for testing
        // webView.clearCache(true)
    }
    
    /**
     * Handle deep link callback from Chrome Custom Tabs OAuth.
     * Called when Supabase redirects to adify://oauth/callback with token.
     */
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        
        intent?.data?.let { uri ->
            android.util.Log.d("AdifyWebView", "🎯 Deep link received: $uri")
            
            // Check if this is OAuth callback
            if (uri.scheme == "adify" && uri.host == "oauth" && uri.path == "/callback") {
                // Extract token from fragment (Supabase uses #access_token, not ?access_token)
                val fragment = uri.fragment
                if (fragment != null && fragment.contains("access_token=")) {
                    android.util.Log.d("AdifyWebView", "🔑 Extracting token from fragment")
                    
                    val token = extractTokenFromFragment(fragment)
                    val refreshToken = extractRefreshTokenFromFragment(fragment)
                    val expiresIn = extractExpiresInFromFragment(fragment)
                    
                    if (token != null) {
                        // Store in Keystore
                        val expiryTimestamp = if (expiresIn > 0) {
                            System.currentTimeMillis() + (expiresIn * 1000)
                        } else {
                            System.currentTimeMillis() + 3600000 // 1 hour default
                        }
                        
                        sessionStorage.storeSession(
                            accessToken = token,
                            refreshToken = refreshToken,
                            userId = null,
                            expiryTimestamp = expiryTimestamp
                        )
                        
                        android.util.Log.d("AdifyWebView", "✅ Token stored in Keystore")
                        
                        // Navigate to dashboard
                        webView.loadUrl("https://adify.adrevtechnologies.com/dashboard")
                    }
                }
            }
        }
    }
    
    private fun extractTokenFromFragment(fragment: String): String? {
        return try {
            val regex = "access_token=([^&]+)".toRegex()
            regex.find(fragment)?.groupValues?.get(1)
        } catch (e: Exception) {
            null
        }
    }
    
    private fun extractRefreshTokenFromFragment(fragment: String): String? {
        return try {
            val regex = "refresh_token=([^&]+)".toRegex()
            regex.find(fragment)?.groupValues?.get(1)
        } catch (e: Exception) {
            null
        }
    }
    
    private fun extractExpiresInFromFragment(fragment: String): Long {
        return try {
            val regex = "expires_in=([^&]+)".toRegex()
            regex.find(fragment)?.groupValues?.get(1)?.toLong() ?: 0
        } catch (e: Exception) {
            0
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Clean up WebView
        webView.destroy()
    }
}
