package com.adrevtechnologies.adify

import android.app.Activity
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.util.Log
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
     * CRITICAL: Request auth from native.
     * Web calls this when user needs to login.
     * Native performs OAuth via existing production URL.
     * 
     * Flow:
     * 1. Web calls requestAuth()
     * 2. Native navigates to /login (existing endpoint)
     * 3. User completes OAuth
     * 4. Supabase callback returns token
     * 5. Native intercepts token, stores in Keystore
     * 6. Native calls web callback with token
     */
    @JavascriptInterface
    fun requestAuth() {
        Log.d(TAG, "🔐 Web requested authentication - loading OAuth flow")
        
        // Navigate to production login URL - Supabase handles OAuth
        // Token will be captured via URL interception in WebViewClient
        activity.runOnUiThread {
            webView.loadUrl("https://adify.adrevtechnologies.com/login")
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
