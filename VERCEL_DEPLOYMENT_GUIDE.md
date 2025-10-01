# 🚀 Vercel Deployment Guide

This guide will help you deploy the Shooting Range Dashboard to Vercel.

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Aiven MySQL Database** - Already set up (see `AIVEN_SETUP_SUMMARY.md`)
3. **GitHub Repository** - Your code should be in a Git repository
4. **CA Certificate** - Your Aiven `ca.pem` file (in `server/certs/`)

---

## 🔧 Step 1: Prepare Environment Variables

### 1.1 Convert CA Certificate to Base64

You need to convert your `ca.pem` certificate to Base64 format for Vercel.

**On Windows PowerShell:**
```powershell
cd server/certs
[Convert]::ToBase64String([IO.File]::ReadAllBytes("ca.pem")) | Set-Clipboard
```
This copies the Base64 string to your clipboard.

**On Linux/Mac:**
```bash
cd server/certs
base64 -w 0 ca.pem | pbcopy  # macOS
# OR
base64 -w 0 ca.pem | xclip -selection clipboard  # Linux
```

### 1.2 Gather Your Database Credentials

From your Aiven dashboard, collect:
- **DB_HOST**: e.g., `mysql-shooting-range.aivencloud.com`
- **DB_PORT**: e.g., `12345`
- **DB_USER**: Usually `avnadmin`
- **DB_PASSWORD**: Your database password
- **DB_NAME**: `shooting_range_db`

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Connect Your Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Click **"Import"**

### 2.2 Configure Build Settings

Vercel should auto-detect the settings from `vercel.json`, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `DB_HOST` | Your Aiven host | Production, Preview, Development |
| `DB_PORT` | Your Aiven port | Production, Preview, Development |
| `DB_USER` | `avnadmin` | Production, Preview, Development |
| `DB_PASSWORD` | Your DB password | Production, Preview, Development |
| `DB_NAME` | `shooting_range_db` | Production, Preview, Development |
| `DB_SSL_CA_BASE64` | Your Base64 certificate | Production, Preview, Development |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Production |

**Important Notes:**
- Replace `your-app.vercel.app` with your actual Vercel domain
- Mark `DB_PASSWORD` and `DB_SSL_CA_BASE64` as **sensitive**
- Apply variables to all environments (Production, Preview, Development)

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like `https://your-app.vercel.app`

---

## ✅ Step 3: Verify Deployment

### 3.1 Test the Frontend

Visit your Vercel URL: `https://your-app.vercel.app`

You should see the Shooting Range Dashboard login/home page.

### 3.2 Test the Backend API

Open: `https://your-app.vercel.app/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "database": "connected"
}
```

### 3.3 Test Database Connection

Try creating a shooter or viewing the dashboard. If it works, your database is connected! 🎉

---

## 🔍 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Check that all environment variables are set correctly in Vercel
2. Verify your Aiven database is running
3. Check Vercel logs: **Deployments → [Your Deployment] → Function Logs**

### Issue: "CORS error"

**Solution:**
1. Update `ALLOWED_ORIGINS` in Vercel environment variables
2. Add your Vercel domain: `https://your-app.vercel.app`
3. Redeploy the application

### Issue: "API routes return 404"

**Solution:**
1. Check that `vercel.json` is correctly configured
2. Verify `api/index.js` exists
3. Check Vercel build logs for errors

### Issue: "Certificate error"

**Solution:**
1. Verify `DB_SSL_CA_BASE64` is correctly set
2. Re-convert your `ca.pem` to Base64 (no line breaks!)
3. Make sure there are no extra spaces or newlines

---

## 🔄 Updating Your Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your Git repository:

```bash
git add .
git commit -m "Update application"
git push origin main
```

Vercel will automatically build and deploy the changes.

### Manual Redeploy

1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"**
4. Click **"Redeploy"** on the latest deployment

---

## 📊 Monitoring

### View Logs

1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"**
4. Click on a deployment
5. Click **"Function Logs"** to see backend logs

### Analytics

Vercel provides built-in analytics:
- **Analytics** tab shows page views, performance
- **Speed Insights** shows Core Web Vitals

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use Vercel's environment variables** - They're encrypted
3. **Rotate database passwords** regularly
4. **Enable Vercel's security features**:
   - DDoS protection (automatic)
   - SSL/TLS (automatic)
   - Rate limiting (configured in code)

---

## 📝 Custom Domain (Optional)

### Add a Custom Domain

1. Go to **Settings → Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `shooting-dashboard.com`)
4. Follow DNS configuration instructions
5. Update `ALLOWED_ORIGINS` environment variable

---

## 🎯 Production Checklist

Before going live, ensure:

- [ ] All environment variables are set in Vercel
- [ ] Database connection is working
- [ ] Frontend loads correctly
- [ ] API endpoints respond correctly
- [ ] CORS is configured for your domain
- [ ] SSL certificate is valid
- [ ] Error logging is working
- [ ] Rate limiting is enabled
- [ ] Custom domain is configured (if applicable)

---

## 📞 Support

If you encounter issues:

1. Check Vercel logs
2. Review this guide
3. Check `AIVEN_SETUP_SUMMARY.md` for database issues
4. Contact Vercel support: [vercel.com/support](https://vercel.com/support)

---

## 🎉 Success!

Your Shooting Range Dashboard is now live on Vercel! 🚀

**Next Steps:**
- Share the URL with your team
- Set up monitoring and alerts
- Configure backups for your database
- Add custom branding (if needed)

