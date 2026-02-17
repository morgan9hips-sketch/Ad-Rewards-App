# Facebook OAuth Setup Guide

This guide walks you through setting up Facebook Login for the Ad Rewards App.

## Prerequisites

- Facebook Developer Account
- Supabase Project (already configured)
- Your app's production URL

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Consumer"** as the app type
4. Fill in the app details:
   - **App Name**: Ad Rewards App (or your preferred name)
   - **App Contact Email**: Your email address
5. Click **"Create App"**

## Step 2: Add Facebook Login Product

1. In your Facebook App dashboard, find **"Products"** in the left sidebar
2. Locate **"Facebook Login"** and click **"Set Up"**
3. Select **"Web"** as the platform
4. Enter your site URL: `https://your-domain.com`
5. Click **"Save"** and **"Continue"**

## Step 3: Configure OAuth Settings

1. Go to **"Facebook Login"** → **"Settings"** in the left sidebar
2. Configure the following settings:

### Valid OAuth Redirect URIs

Add both of these URLs (replace `YOUR_PROJECT_REF` with your actual Supabase project reference):

```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
https://your-domain.com/auth/callback
```

Example:
```
https://abcdefghijklmn.supabase.co/auth/v1/callback
https://adrewards.com/auth/callback
```

### Other Settings

- **Client OAuth Login**: ✅ Yes
- **Web OAuth Login**: ✅ Yes
- **Enforce HTTPS**: ✅ Yes
- **Use Strict Mode for Redirect URIs**: ✅ Yes

3. Click **"Save Changes"**

## Step 4: Get Your Facebook App Credentials

1. Go to **"Settings"** → **"Basic"** in the left sidebar
2. Copy the following credentials:
   - **App ID**
   - **App Secret** (click "Show" to reveal)

## Step 5: Configure Supabase

### Via Supabase Dashboard:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **"Authentication"** → **"Providers"**
4. Find **"Facebook"** and toggle it **ON**
5. Enter your Facebook credentials:
   - **Facebook Client ID**: Your App ID from Step 4
   - **Facebook Secret**: Your App Secret from Step 4
6. Click **"Save"**

### Via Environment Variables:

Alternatively, you can configure via environment variables in your Supabase project:

```bash
# In your Supabase project settings
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_SECRET=your_app_secret_here
```

## Step 6: Configure App Domains

1. Back in Facebook Developer Dashboard
2. Go to **"Settings"** → **"Basic"**
3. Scroll to **"App Domains"**
4. Add your domain(s):
   ```
   your-domain.com
   YOUR_PROJECT_REF.supabase.co
   ```
5. Scroll to **"Privacy Policy URL"**
   - Enter: `https://your-domain.com/privacy`
6. Scroll to **"Terms of Service URL"**
   - Enter: `https://your-domain.com/terms`
7. Click **"Save Changes"**

## Step 7: Make Your App Live

### Important: App Review

For production use, you need to make your app publicly available:

1. In Facebook App dashboard, toggle the app from **"Development"** to **"Live"** mode
2. For full public access, you may need to submit for App Review:
   - Go to **"App Review"** → **"Permissions and Features"**
   - Request **"public_profile"** and **"email"** permissions
   - Provide required documentation

### For Testing Only

If you're still in development:
1. Add test users in **"Roles"** → **"Test Users"**
2. These users can log in while your app is in Development mode

## Step 8: Test Facebook Login

1. Deploy your application with the updated configuration
2. Navigate to the login page
3. Click **"Continue with Facebook"**
4. You should be redirected to Facebook for authentication
5. After accepting permissions, you should be redirected back to your app

## Troubleshooting

### "URL Blocked: This redirect failed because the redirect URI is not whitelisted"

**Solution**: Double-check that you've added both redirect URIs in Step 3:
- Supabase callback URL
- Your app's callback URL

### "App Not Set Up: This app is still in development mode"

**Solution**: Either:
- Add yourself as a test user (for testing)
- Switch app to Live mode (for production)

### "Given URL is not allowed by the Application configuration"

**Solution**: Verify:
1. App Domains are correctly set in Facebook settings
2. Valid OAuth Redirect URIs are correctly configured
3. Privacy Policy and Terms of Service URLs are set

### Users see "This app is in development mode"

**Solution**: Make your app live in Facebook settings or add users as testers.

## Security Best Practices

1. **Never commit secrets**: Keep your Facebook App Secret secure and never commit it to version control
2. **Use environment variables**: Store credentials in environment variables
3. **Enable HTTPS**: Always use HTTPS in production
4. **Regular rotation**: Periodically rotate your App Secret
5. **Monitor usage**: Check Facebook Analytics for suspicious activity

## Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Supabase Facebook OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Facebook App Dashboard](https://developers.facebook.com/apps/)

## Support

If you encounter issues:
1. Check the Facebook Developer Console for error messages
2. Review Supabase authentication logs
3. Verify all URLs are correctly configured
4. Contact support if needed

---

**Last Updated**: February 2024
