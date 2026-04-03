# 🔐 Looki Dashboard - Authentication Setup

This guide will help you set up Discord OAuth authentication for the Looki Dashboard.

## Prerequisites

- A Discord server
- Access to Discord Developer Portal (https://discord.com/developers/applications)

## Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Looki Dashboard")
4. Accept the ToS and create the application

## Step 2: Get OAuth Credentials

1. In your application, go to **OAuth2** > **General**
2. Copy your **Client ID** and **Client Secret**
3. ⚠️ **Keep Client Secret private!**

## Step 3: Configure OAuth Redirect URL

1. Still in **OAuth2** > **General**, scroll down to **Redirects**
2. Click "Add Redirect"
3. Add the following redirect URLs:
   - **Development**: `http://localhost:3000/api/auth/callback/discord`
   - **Production**: `https://yourdomain.com/api/auth/callback/discord`

## Step 4: Configure Environment Variables

1. Open `.env.local` in the dashboard directory
2. Fill in your credentials:

```env
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online tool: https://generate-secret.vercel.app

## Step 5: Start the Dashboard

```bash
npm run build
npm start
```

Visit `http://localhost:3000` and you should see the login page!

## Troubleshooting

### "Invalid Client ID" error
- Check that your Client ID is correct
- Make sure the environment variable is loaded

### "Redirect URI mismatch" error
- Verify the redirect URL in Discord Developer Portal matches exactly
- Don't forget the `/api/auth/callback/discord` part

### Session not persisting
- Check NEXTAUTH_SECRET is set correctly
- Ensure cookies are enabled in your browser

### Still getting redirected to login
- Clear browser cookies for localhost
- Check that environment variables are loaded (restart dev server)

## Need Help?

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Discord OAuth Documentation](https://discord.com/developers/docs/topics/oauth2)

---

**Made with ♡ by Looki Team** 🌸
