# Authentication Setup Guide

This application uses Supabase Authentication with support for:
- ✅ Email/Password authentication (READY TO USE)
- ⚙️ Google OAuth integration (REQUIRES CONFIGURATION)

## Email/Password Authentication

Email/password authentication is **ready to use out of the box**. Users can:
1. Sign up with their email and password
2. Sign in with their credentials
3. Sign out from the user menu

**No additional configuration needed!**

## Google OAuth Setup (REQUIRED)

Google OAuth requires configuration before it will work. Follow these steps:

### Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API" for your project
4. Navigate to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "OAuth 2.0 Client ID"
6. Configure the OAuth consent screen if you haven't already:
   - Choose "External" user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

7. Create OAuth 2.0 Client ID:
   - Application Type: **Web application**
   - Name: "Kashi Sojourn Web Client" (or any name you prefer)
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for local development)
     - Your production domain (e.g., `https://yourapp.com`)
   - **Authorized redirect URIs**:
     - `https://ricpulfhigaoncggwhmz.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (for local development)

8. Click "Create" and copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/ricpulfhigaoncggwhmz)
2. Click on "Authentication" in the left sidebar
3. Click on "Providers" tab
4. Scroll down and find "Google" in the list
5. **Enable** the Google provider toggle
6. Enter your Google **Client ID** from Step 1
7. Enter your Google **Client Secret** from Step 1
8. The "Redirect URL" should be pre-filled: `https://ricpulfhigaoncggwhmz.supabase.co/auth/v1/callback`
9. Click "Save"

### Step 3: Test the Integration

1. Open your application
2. Go to the login page (`/login`)
3. Click "Sign in with Google"
4. You should be redirected to Google's authentication page
5. After successful authentication, you'll be redirected back to the app

### Troubleshooting

**Error: "Google sign-in is not yet configured"**
- This means Google OAuth is not enabled in your Supabase dashboard
- Complete Steps 1 and 2 above

**Error: "redirect_uri_mismatch"**
- The redirect URI in Google Cloud Console doesn't match the Supabase callback URL
- Make sure you added: `https://ricpulfhigaoncggwhmz.supabase.co/auth/v1/callback`

**Error: "Access blocked: This app's request is invalid"**
- OAuth consent screen is not properly configured
- Go back to Google Cloud Console and complete the OAuth consent screen setup

**Button doesn't do anything**
- Check browser console for errors (F12)
- Verify you saved the configuration in Supabase dashboard

## Current Features

- ✅ Email/Password authentication (working now)
- ⚙️ Google OAuth integration (needs dashboard configuration)
- ✅ User session management
- ✅ Persistent authentication state
- ✅ Sign out functionality
- ✅ User menu in header
- ✅ Automatic redirect after login

## Security Notes

- Passwords must be at least 6 characters
- Email confirmation is disabled by default
- Sessions are automatically managed by Supabase
- All authentication state is handled securely through Supabase Auth
- OAuth tokens are never exposed to the client

## Quick Start

**For immediate use:** Use email/password authentication - it works right away!

**For Google OAuth:** Complete the configuration steps above (takes about 10 minutes).
