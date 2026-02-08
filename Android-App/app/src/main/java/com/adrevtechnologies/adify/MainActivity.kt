package com.adrevtechnologies.adify

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import android.view.ViewGroup
import android.widget.FrameLayout

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
        
        // Initialize hybrid auth bridge
        authBridge = HybridAuthBridge(webView, sessionStorage)
        
        // Configure WebView settings
        configureWebView()
        
        // Inject JavaScript bridge BEFORE loading URL
        webView.addJavascriptInterface(authBridge, HybridAuthBridge.BRIDGE_NAME)
        
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
                
                // After page loads, check if we have a stored session
                // If yes, inject it into the web app
                if (sessionStorage.hasValidSession()) {
                    authBridge.injectSessionIntoWebView()
                }
            }
            
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                // Allow navigation to production domain and auth providers
                return if (url != null && (
                    url.startsWith("https://adify.adrevtechnologies.com") ||
                    url.startsWith("https://api.adrevtechnologies.com") ||
                    url.contains("supabase.co") ||
                    url.contains("accounts.google.com") ||
                    url.contains("facebook.com")
                )) {
                    false // Allow navigation
                } else {
                    true // Block navigation
                }
            }
        }
        
        // Set WebChromeClient for console messages and alerts
        webView.webChromeClient = WebChromeClient()
        
        // Clear cache on first launch for testing
        // webView.clearCache(true)
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Clean up WebView
        webView.destroy()
    }
}
