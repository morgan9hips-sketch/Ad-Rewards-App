package com.adrevtechnologies.adify

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Secure session storage using Android Keystore System.
 * Stores authentication tokens encrypted at rest.
 */
class SecureSessionStorage(context: Context) {
    
    companion object {
        private const val PREFS_FILENAME = "adify_secure_session"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_SESSION_EXPIRY = "session_expiry"
    }
    
    private val masterKey: MasterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    
    private val encryptedPrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        PREFS_FILENAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    /**
     * Store session data securely.
     */
    fun storeSession(
        accessToken: String,
        refreshToken: String?,
        userId: String?,
        expiryTimestamp: Long?
    ) {
        encryptedPrefs.edit().apply {
            putString(KEY_ACCESS_TOKEN, accessToken)
            refreshToken?.let { putString(KEY_REFRESH_TOKEN, it) }
            userId?.let { putString(KEY_USER_ID, it) }
            expiryTimestamp?.let { putLong(KEY_SESSION_EXPIRY, it) }
            apply()
        }
    }
    
    /**
     * Retrieve stored session data.
     * Returns null if no session exists or session is expired.
     */
    fun getStoredSession(): SessionData? {
        val accessToken = encryptedPrefs.getString(KEY_ACCESS_TOKEN, null)
            ?: return null
        
        val expiryTimestamp = encryptedPrefs.getLong(KEY_SESSION_EXPIRY, 0)
        
        // Check if session is expired
        if (expiryTimestamp > 0 && System.currentTimeMillis() > expiryTimestamp) {
            clearSession()
            return null
        }
        
        return SessionData(
            accessToken = accessToken,
            refreshToken = encryptedPrefs.getString(KEY_REFRESH_TOKEN, null),
            userId = encryptedPrefs.getString(KEY_USER_ID, null),
            expiryTimestamp = if (expiryTimestamp > 0) expiryTimestamp else null
        )
    }
    
    /**
     * Clear all stored session data.
     */
    fun clearSession() {
        encryptedPrefs.edit().clear().apply()
    }
    
    /**
     * Check if a valid session exists.
     */
    fun hasValidSession(): Boolean {
        return getStoredSession() != null
    }
}

/**
 * Data class representing stored session information.
 */
data class SessionData(
    val accessToken: String,
    val refreshToken: String?,
    val userId: String?,
    val expiryTimestamp: Long?
)
