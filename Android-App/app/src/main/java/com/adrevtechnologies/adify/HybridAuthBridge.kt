package com.adrevtechnologies.adify

import android.app.Activity
import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.util.Log
import androidx.browser.customtabs.CustomTabsIntent
import org.json.JSONObject

/**
 * JavaScript bridge for Native ↔ Web authentication communication.
 * 
 * NATIVE-FIRST AUTH FLOW:
 * 1. Web calls requestAuth() → Native performs OAuth
 * 2. Native stores token in Keystore
 * 3. Native returns token to web
 * 4. On restart: Native injects stored token before web loads
 * 
 * NO backend changes required - uses existing Supabase endpoints.
 */
class HybridAuthBridge(
    private val activity: Activity,
    private val webView: WebView,
    private val sessionStorage: SecureSessionStorage
) {
    
    companion object {
        const val BRIDGE_NAME = "HybridBridge"
        private const val TAG = "HybridAuthBridge"
    }
    
    /**
     * Get stored session from Android Keystore.
     * Called by web app on boot to check for existing session.
     * 
     * @return JSON string with session data, or empty object if no session exists
     */
    @JavascriptInterface
    fun getStoredSession(): String {
        val session = sessionStorage.getStoredSession()
        
        return if (session != null) {
            JSONObject().apply {
                put("accessToken", session.accessToken)
                session.refreshToken?.let { put("refreshToken", it) }
                session.userId?.let { put("userId", it) }
                session.expiryTimestamp?.let { put("expiryTimestamp", it) }
                put("success", true)
            }.toString()
        } else {
            JSONObject().apply {
                put("success", false)
            }.toString()
        }
    }
    
    /**
     * Store session data received from web app.
     * Called after successful authentication in the web app.
     * 
     * @param accessToken The Supabase access token
     * @param refreshToken The Supabase refresh token (optional)
     * @param userId The user ID (optional)
     * @param expiryTimestamp Token expiry timestamp in milliseconds (optional)
     */
    @JavascriptInterface
    fun storeSession(
        accessToken: String,
        refreshToken: String?,
        userId: String?,
        expiryTimestamp: Long
    ) {
        sessionStorage.storeSession(
            accessToken = accessToken,
            refreshToken = refreshToken,
            userId = userId,
            expiryTimestamp = if (expiryTimestamp > 0) expiryTimestamp else null
        )
    }
    
    /**
     * Clear stored session.
     * Called when user signs out.
     */
    @JavascriptInterface
    fun clearSession() {
        sessionStorage.clearSession()
    }
    
    /**
     * Check if a valid session exists.
     * 
     * @return "true" if session exists, "false" otherwise
     */
    @JavascriptInterface
    fun hasValidSession(): String {
        return sessionStorage.hasValidSession().toString()
    }
    
    /**
     * CRITICAL: Request auth from native using Chrome Custom Tabs.
     * Web calls this when user needs to login.
     * 
     * Flow:
     * 1. Web calls requestAuth()
     * 2. Native opens Chrome Custom Tabs (real browser, NOT WebView)
     * 3. User completes OAuth in Chrome
     * 4. Supabase redirects to adify://oauth/callback with token
     * 5. Deep link reopens app → onNewIntent() in MainActivity
     * 6. Native extracts token, stores in Keystore
     * 7. Native injects into WebView
     * 
     * WHY Chrome Custom Tabs:
     * - Google blocks OAuth in WebView (Error 403: disallowed_useragent)
     * - Chrome Custom Tabs = actual browser = Google allows it
     * - Better security: user can verify URL in address bar
     */
    @JavascriptInterface
    fun requestAuth() {
        Log.d(TAG, "🔐 Web requested authentication - launching Chrome Custom Tabs")
        
        activity.runOnUiThread {
            // Build OAuth URL with custom redirect URI
            val authUrl = "https://adify.adrevtechnologies.com/login?redirect_uri=adify://oauth/callback"
            
            // Launch Chrome Custom Tabs
            val customTabsIntent = CustomTabsIntent.Builder()
                .setShowTitle(true)
                .build()
            
            customTabsIntent.launchUrl(activity, Uri.parse(authUrl))
            
            Log.d(TAG, "✅ Chrome Custom Tabs launched for OAuth")
        }
    }
    
    /**
     * Get current session (alias for getStoredSession for simpler web API).
     */
    @JavascriptInterface
    fun getSession(): String {
        return getStoredSession()
    }
    
    /**
     * Inject stored session into the WebView.
     * This is called by the native app to push session data to the web app.
     */
    fun injectSessionIntoWebView() {
        val session = sessionStorage.getStoredSession() ?: return
        
        val jsCode = """
            (function() {
                if (window.HybridAuthBridge && window.HybridAuthBridge.onSessionInjected) {
                    window.HybridAuthBridge.onSessionInjected(${
                        JSONObject().apply {
                            put("accessToken", session.accessToken)
                            session.refreshToken?.let { put("refreshToken", it) }
                            session.userId?.let { put("userId", it) }
                            session.expiryTimestamp?.let { put("expiryTimestamp", it) }
                        }.toString()
                    });
                }
            })();
        """.trimIndent()
        
        webView.post {
            webView.evaluateJavascript(jsCode, null)
        }
    }
}
