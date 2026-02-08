package com.adrevtechnologies.adify

import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

/**
 * JavaScript bridge for Native ↔ Web authentication communication.
 * 
 * This bridge is injected into the WebView and provides methods for:
 * - Web app to request stored session data
 * - Web app to store new session data
 * - Web app to clear session on logout
 * 
 * The bridge enforces the hybrid architecture contract.
 */
class HybridAuthBridge(
    private val webView: WebView,
    private val sessionStorage: SecureSessionStorage
) {
    
    companion object {
        const val BRIDGE_NAME = "HybridBridge"
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
