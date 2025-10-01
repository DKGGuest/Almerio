# 🚀 START HERE - Aiven Database Setup

## ⚡ Quick Start (5 Minutes)

You have Aiven MySQL credentials and want to connect your app. Here's what to do:

### Step 1: Download CA Certificate (1 minute)

1. Go to your Aiven dashboard
2. Click on your MySQL database
3. Find "CA certificate" section
4. Click "Show" or "Download"
5. Save the file (it will be named `ca.pem`)

### Step 2: Run Setup Script (2 minutes)

```bash
cd server
node setup_aiven.js
```

Follow the prompts:
- Enter your database credentials (or press Enter to use defaults)
- Choose to store the certificate locally
- The script will test the connection

### Step 3: Initialize Database (2 minutes)

```bash
node test_database.js
```

This creates all tables and inserts default data.

### Step 4: Start Development Server

```bash
npm start
```

**Done!** Your app is now connected to Aiven MySQL! 🎉

---

## 📚 Documentation Guide

Depending on what you need, read these documents:

| Document | When to Read |
|----------|-------------|
| **[AIVEN_QUICK_START.md](AIVEN_QUICK_START.md)** | First time setup, step-by-step guide |
| **[WHERE_TO_PUT_CA_CERTIFICATE.md](WHERE_TO_PUT_CA_CERTIFICATE.md)** | Confused about certificate location |
| **[AIVEN_SETUP_SUMMARY.md](AIVEN_SETUP_SUMMARY.md)** | Want to see what was changed |
| **[AIVEN_ARCHITECTURE.md](AIVEN_ARCHITECTURE.md)** | Want to understand how it works |
| **[server/AIVEN_SETUP_GUIDE.md](server/AIVEN_SETUP_GUIDE.md)** | Detailed setup and deployment guide |

---

## 🎯 Your Aiven Credentials

Get these from your Aiven dashboard:

```
Host:     your-aiven-host.aivencloud.com
Port:     your-port
User:     avnadmin
Password: your-database-password
Database: defaultdb
SSL:      REQUIRED
```

Update `server/.env.example` with your actual credentials!

---

## 📁 Where to Put the Certificate

### For Local Development:
```
server/certs/ca.pem
```

The setup script will help you with this!

### For Vercel Deployment:
Convert to base64 and add as environment variable. See [Vercel Deployment](#vercel-deployment) below.

---

## 🛠️ Available Helper Scripts

All scripts are in the `server/` directory:

### Interactive Setup
```bash
node setup_aiven.js
```
Creates your `.env` file and tests the connection.

### Test Connection
```bash
node test_aiven_connection.js
```
Comprehensive connection test with diagnostics.

### Initialize Database
```bash
node test_database.js
```
Creates tables and runs tests.

### Convert Certificate for Vercel
```bash
# Node.js (all platforms)
node convert_cert_to_base64.js certs/ca.pem

# PowerShell (Windows)
.\convert_cert_to_base64.ps1 certs\ca.pem
```

---

## 🌐 Vercel Deployment

### Quick Steps:

1. **Convert certificate:**
   ```bash
   cd server
   node convert_cert_to_base64.js certs/ca.pem
   ```
   This copies the base64 string to your clipboard.

2. **Add to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add these variables (select all environments):

   ```
   DB_HOST=your-aiven-host.aivencloud.com
   DB_PORT=your-port
   DB_USER=avnadmin
   DB_PASSWORD=your-database-password
   DB_NAME=defaultdb
   DB_SSL=true
   DB_CA_CERT=<paste from clipboard>
   NODE_ENV=production
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

**Detailed guide:** [server/AIVEN_SETUP_GUIDE.md](server/AIVEN_SETUP_GUIDE.md)

---

## ✅ Verification Checklist

### Local Development
- [ ] Downloaded `ca.pem` from Aiven
- [ ] Saved to `server/certs/ca.pem`
- [ ] Ran `node setup_aiven.js`
- [ ] Connection test passed
- [ ] Ran `node test_database.js`
- [ ] Server starts with `npm start`

### Vercel Deployment
- [ ] Converted certificate to base64
- [ ] Added all environment variables to Vercel
- [ ] Deployed successfully
- [ ] Checked deployment logs (no errors)

---

## 🐛 Common Issues & Quick Fixes

### "Certificate file not found"
```bash
# Check if file exists
ls server/certs/ca.pem

# If not, download from Aiven and save it there
```

### "Connection timeout"
- Check your internet connection
- Verify host and port in `.env`
- Check Aiven firewall settings

### "SSL connection error"
- Ensure `DB_SSL=true` in `.env`
- Re-download certificate from Aiven
- Run `node test_aiven_connection.js` for diagnostics

### "Access denied"
- Double-check username and password
- Verify database name is `defaultdb`

---

## 📊 What Was Changed

Your application has been updated to support Aiven MySQL:

✅ **Database configs** - Added SSL/TLS support  
✅ **Environment files** - Updated with Aiven settings  
✅ **Vercel config** - Added API route support  
✅ **Security** - Added `.gitignore` for certificates  
✅ **Helper scripts** - Created setup and testing tools  
✅ **Documentation** - Comprehensive guides created  

**See full details:** [AIVEN_SETUP_SUMMARY.md](AIVEN_SETUP_SUMMARY.md)

---

## 🎓 Understanding the Setup

### How SSL Works

```
Your App → Reads ca.pem → Establishes SSL connection → Aiven MySQL
```

**Local:** Certificate read from file (`server/certs/ca.pem`)  
**Vercel:** Certificate decoded from environment variable (base64)

**Learn more:** [AIVEN_ARCHITECTURE.md](AIVEN_ARCHITECTURE.md)

---

## 🆘 Need Help?

### Run Diagnostics
```bash
cd server
node test_aiven_connection.js
```

This will show:
- Your configuration
- Certificate status
- Connection test results
- Specific troubleshooting tips

### Check Documentation
- **Quick issues:** [WHERE_TO_PUT_CA_CERTIFICATE.md](WHERE_TO_PUT_CA_CERTIFICATE.md)
- **Detailed help:** [server/AIVEN_SETUP_GUIDE.md](server/AIVEN_SETUP_GUIDE.md)
- **Architecture:** [AIVEN_ARCHITECTURE.md](AIVEN_ARCHITECTURE.md)

---

## 🎯 Next Steps

### Right Now:
1. Download `ca.pem` from Aiven
2. Run `cd server && node setup_aiven.js`
3. Follow the prompts

### After Setup:
1. Initialize database: `node test_database.js`
2. Start server: `npm start`
3. Test your application

### For Production:
1. Convert certificate: `node convert_cert_to_base64.js certs/ca.pem`
2. Add environment variables to Vercel
3. Deploy: `vercel --prod`

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| **Setup** | `node server/setup_aiven.js` |
| **Test Connection** | `node server/test_aiven_connection.js` |
| **Initialize DB** | `node server/test_database.js` |
| **Start Server** | `cd server && npm start` |
| **Convert Cert** | `node server/convert_cert_to_base64.js server/certs/ca.pem` |
| **Deploy** | `vercel --prod` |

---

## 🔒 Security Reminder

**Never commit these files:**
- ❌ `server/certs/ca.pem`
- ❌ `server/.env`
- ❌ Any file with credentials

**They're already in `.gitignore`** ✅

---

## 🎉 Ready to Start?

Run this command now:

```bash
cd server
node setup_aiven.js
```

The script will guide you through the rest! 🚀

---

**Questions?** Check [AIVEN_QUICK_START.md](AIVEN_QUICK_START.md) for detailed instructions.

