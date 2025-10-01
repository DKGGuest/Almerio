# ✅ Vercel Deployment Checklist

Quick checklist for deploying to Vercel.

## 📦 Pre-Deployment

- [ ] Code is committed to Git repository
- [ ] `dist/` folder exists (run `npm run build` locally to test)
- [ ] `vercel.json` is configured
- [ ] `api/index.js` exists
- [ ] Backend dependencies are in root `package.json`
- [ ] Aiven MySQL database is running
- [ ] CA certificate (`ca.pem`) is available

## 🔐 Environment Variables

Convert CA certificate to Base64:
```powershell
# Windows PowerShell
cd server/certs
[Convert]::ToBase64String([IO.File]::ReadAllBytes("ca.pem")) | Set-Clipboard
```

Add these to Vercel (Settings → Environment Variables):

- [ ] `NODE_ENV` = `production`
- [ ] `DB_HOST` = Your Aiven host
- [ ] `DB_PORT` = Your Aiven port
- [ ] `DB_USER` = `avnadmin`
- [ ] `DB_PASSWORD` = Your database password
- [ ] `DB_NAME` = `shooting_range_db`
- [ ] `DB_SSL_CA_BASE64` = Base64 certificate (from above)
- [ ] `ALLOWED_ORIGINS` = `https://your-app.vercel.app`

## 🚀 Deployment Steps

1. [ ] Go to [vercel.com/new](https://vercel.com/new)
2. [ ] Import your Git repository
3. [ ] Verify build settings:
   - Framework: Vite
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
4. [ ] Add all environment variables (see above)
5. [ ] Click **Deploy**
6. [ ] Wait for build to complete

## ✅ Post-Deployment Verification

- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Health check works: `https://your-app.vercel.app/api/health`
- [ ] Can create a shooter
- [ ] Can start a session
- [ ] Can view shooter profile
- [ ] No CORS errors in browser console
- [ ] No database connection errors in Vercel logs

## 🔧 If Something Goes Wrong

### Database Connection Failed
1. Check environment variables in Vercel
2. Verify Aiven database is running
3. Check Vercel Function Logs

### CORS Errors
1. Update `ALLOWED_ORIGINS` with your Vercel URL
2. Redeploy

### API 404 Errors
1. Check `vercel.json` configuration
2. Verify `api/index.js` exists
3. Check build logs

## 📊 Monitoring

- [ ] Check Vercel Function Logs regularly
- [ ] Monitor database usage in Aiven dashboard
- [ ] Set up alerts for errors (optional)

## 🎯 Production Ready

- [ ] All tests pass
- [ ] No errors in logs
- [ ] Performance is acceptable
- [ ] Custom domain configured (optional)
- [ ] Team members have access

---

**Your Vercel URL:** `https://_____________________.vercel.app`

**Deployment Date:** `____________________`

**Deployed By:** `____________________`

