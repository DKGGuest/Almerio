# 🏗️ Deployment Architecture

## Overview

This document explains how your Shooting Range Dashboard is deployed on Vercel.

---

## 🌐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                    https://your-app.vercel.app                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL PLATFORM                          │
│                                                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │   STATIC FRONTEND    │         │  SERVERLESS BACKEND  │    │
│  │   (React/Vite)       │         │  (Express API)       │    │
│  │                      │         │                      │    │
│  │  • Built to dist/    │         │  • api/index.js      │    │
│  │  • Served as CDN     │         │  • Runs on-demand    │    │
│  │  • HTML/CSS/JS       │         │  • Auto-scales       │    │
│  └──────────────────────┘         └──────────┬───────────┘    │
│                                               │                 │
└───────────────────────────────────────────────┼─────────────────┘
                                                │
                                                │ SSL/TLS
                                                │ (Encrypted)
                                                ▼
                                    ┌───────────────────────┐
                                    │   AIVEN MYSQL DB      │
                                    │   (Cloud Database)    │
                                    │                       │
                                    │  • shooting_range_db  │
                                    │  • SSL Required       │
                                    │  • Auto-backups       │
                                    └───────────────────────┘
```

---

## 📦 Component Breakdown

### 1. **Frontend (Static Files)**

**Location:** `dist/` folder  
**Technology:** React + Vite  
**Deployment:** Vercel CDN (Content Delivery Network)

**What happens:**
1. Vite builds React app → `dist/` folder
2. Vercel serves these files globally via CDN
3. Users get fast loading from nearest server

**Files:**
- `dist/index.html` - Main HTML
- `dist/assets/*.js` - JavaScript bundles
- `dist/assets/*.css` - Stylesheets
- `dist/*.svg` - Images

---

### 2. **Backend (Serverless Functions)**

**Location:** `api/index.js`  
**Technology:** Express.js  
**Deployment:** Vercel Serverless Functions

**What happens:**
1. `api/index.js` wraps `server/server.js`
2. Runs only when API is called (on-demand)
3. Auto-scales based on traffic
4. Cold start: ~1-2 seconds (first request)
5. Warm: <100ms (subsequent requests)

**Endpoints:**
- `/api/health` - Health check
- `/api/shooters` - Shooter management
- `/api/sessions` - Session management
- `/api/shots` - Shot tracking
- And more...

---

### 3. **Database (Aiven MySQL)**

**Location:** Aiven Cloud (separate from Vercel)  
**Technology:** MySQL 8.x  
**Connection:** SSL/TLS encrypted

**What happens:**
1. Backend connects via SSL
2. Uses connection pooling
3. Credentials stored in Vercel env vars
4. Certificate (Base64) in environment

**Tables:**
- `shooters` - Shooter profiles
- `shooting_sessions` - Session data
- `shot_coordinates` - Shot positions
- `performance_analytics` - Analytics
- `final_reports` - Session reports
- And more...

---

## 🔄 Request Flow

### Frontend Request (Static Files)

```
User → Vercel CDN → dist/index.html → Browser
```

**Speed:** ~50-200ms (cached globally)

---

### API Request (Dynamic Data)

```
User → Vercel Edge → Serverless Function → Aiven DB → Response
```

**Speed:** ~200-500ms (first request), ~100-200ms (warm)

**Example:**
1. User clicks "View Shooters"
2. Frontend calls `/api/shooters`
3. Vercel routes to `api/index.js`
4. Express handler queries database
5. Database returns data
6. API sends JSON response
7. Frontend displays data

---

## 🔐 Security Layers

### 1. **HTTPS/SSL**
- All traffic encrypted (Vercel automatic)
- Certificate auto-renewed

### 2. **Database SSL**
- MySQL connection encrypted
- CA certificate required
- Stored as Base64 in env vars

### 3. **CORS Protection**
- Only allowed origins can access API
- Configured via `ALLOWED_ORIGINS`

### 4. **Rate Limiting**
- Prevents abuse
- Configured in `server.js`

### 5. **Environment Variables**
- Secrets encrypted by Vercel
- Never exposed to frontend

---

## 📊 Scaling

### Frontend (Static)
- **Automatic:** Served from global CDN
- **Capacity:** Unlimited (CDN handles it)
- **Cost:** Free tier: 100GB bandwidth/month

### Backend (Serverless)
- **Automatic:** Scales with requests
- **Capacity:** 1000+ concurrent functions
- **Cost:** Free tier: 100GB-hours/month

### Database (Aiven)
- **Manual:** Upgrade plan if needed
- **Capacity:** Depends on plan
- **Cost:** Varies by plan

---

## 💰 Cost Breakdown

### Vercel (Free Tier)
- ✅ Unlimited static hosting
- ✅ 100GB bandwidth/month
- ✅ 100GB-hours serverless/month
- ✅ SSL certificates
- ✅ DDoS protection

**Typical usage:** Well within free tier for small-medium apps

### Aiven MySQL
- 💵 Starts at ~$10-20/month
- 💵 Scales based on storage/performance
- ✅ Automatic backups
- ✅ SSL/TLS included

---

## 🔍 Monitoring

### Vercel Dashboard
- **Deployments:** Build status, logs
- **Analytics:** Page views, performance
- **Function Logs:** Backend errors, requests
- **Speed Insights:** Core Web Vitals

### Aiven Dashboard
- **Database Metrics:** CPU, memory, disk
- **Query Performance:** Slow queries
- **Backups:** Automatic daily backups
- **Logs:** Database activity

---

## 🚀 Deployment Process

### 1. **Build Phase** (Vercel)
```bash
npm install          # Install dependencies
npm run vercel-build # Build frontend (vite build)
```

**Output:** `dist/` folder with static files

### 2. **Deploy Phase** (Vercel)
```
- Upload dist/ to CDN
- Deploy api/index.js as serverless function
- Configure routing (vercel.json)
- Set environment variables
```

### 3. **Runtime** (Production)
```
- Frontend: Served from CDN (instant)
- Backend: Runs on-demand (serverless)
- Database: Always running (Aiven)
```

---

## 🔄 Update Process

### Automatic (Git Push)
```bash
git add .
git commit -m "Update"
git push origin main
```

Vercel automatically:
1. Detects push
2. Runs build
3. Deploys new version
4. Updates live site

**Time:** 2-5 minutes

### Manual (Vercel Dashboard)
1. Go to Deployments
2. Click "Redeploy"
3. Wait for completion

---

## 📈 Performance Optimization

### Frontend
- ✅ Code splitting (React vendor chunk)
- ✅ Minification (Vite)
- ✅ Compression (Gzip)
- ✅ CDN caching

### Backend
- ✅ Connection pooling (MySQL)
- ✅ Compression middleware
- ✅ Rate limiting
- ✅ Efficient queries

### Database
- ✅ Indexed columns
- ✅ Optimized queries
- ✅ Connection reuse

---

## 🎯 Best Practices

### Development
1. Test locally before deploying
2. Use environment variables for secrets
3. Never commit `.env` files
4. Keep dependencies updated

### Deployment
1. Use preview deployments for testing
2. Monitor logs after deployment
3. Set up alerts for errors
4. Keep database backups

### Production
1. Monitor performance metrics
2. Review logs regularly
3. Update dependencies monthly
4. Test before major updates

---

## 📞 Support Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Aiven Docs:** [aiven.io/docs](https://aiven.io/docs)
- **Your Guides:**
  - `VERCEL_DEPLOYMENT_GUIDE.md`
  - `DEPLOYMENT_CHECKLIST.md`
  - `READY_FOR_DEPLOYMENT.md`

---

## ✅ Summary

Your application uses a modern, scalable architecture:

- **Frontend:** Static files on global CDN (fast, cheap)
- **Backend:** Serverless functions (auto-scaling, pay-per-use)
- **Database:** Managed MySQL (reliable, backed up)

This architecture provides:
- ⚡ Fast performance
- 📈 Automatic scaling
- 💰 Cost-effective
- 🔐 Secure by default
- 🛠️ Easy to maintain

**You're ready to deploy!** 🚀

