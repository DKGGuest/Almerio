# 📋 Aiven MySQL - Quick Reference Card

## 🔑 Your Credentials

```
Host:     your-aiven-host.aivencloud.com
Port:     your-port
User:     avnadmin
Password: your-database-password
Database: defaultdb
SSL:      REQUIRED (ca.pem)
```

---

## 📁 Certificate Locations

| Environment | Location | Format |
|------------|----------|--------|
| **Local Dev** | `server/certs/ca.pem` | File |
| **Vercel** | `DB_CA_CERT` env var | Base64 |

---

## ⚡ Quick Commands

### Setup (First Time)
```bash
cd server
node setup_aiven.js
```

### Test Connection
```bash
node test_aiven_connection.js
```

### Initialize Database
```bash
node test_database.js
```

### Start Server
```bash
npm start
```

### Convert Certificate for Vercel
```bash
# Node.js
node convert_cert_to_base64.js certs/ca.pem

# PowerShell (Windows)
.\convert_cert_to_base64.ps1 certs\ca.pem
```

---

## 🔧 Environment Variables

### Local (.env file)
```env
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=your-port
DB_USER=avnadmin
DB_PASSWORD=your-database-password
DB_NAME=defaultdb
DB_SSL=true
DB_CA_CERT_PATH=server/certs/ca.pem
NODE_ENV=development
```

### Vercel (Environment Variables)
```
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=your-port
DB_USER=avnadmin
DB_PASSWORD=your-database-password
DB_NAME=defaultdb
DB_SSL=true
DB_CA_CERT=<base64_string>
NODE_ENV=production
```

---

## 🚀 Deployment Steps

### Local Development
1. Download `ca.pem` from Aiven
2. Save to `server/certs/ca.pem`
3. Run `node setup_aiven.js`
4. Run `node test_database.js`
5. Run `npm start`

### Vercel Production
1. Convert cert: `node convert_cert_to_base64.js certs/ca.pem`
2. Add env vars to Vercel dashboard
3. Deploy: `vercel --prod`

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| Certificate not found | Check `server/certs/ca.pem` exists |
| Connection timeout | Verify host, port, internet connection |
| SSL error | Re-download certificate from Aiven |
| Access denied | Check username/password |

### Diagnostic Command
```bash
node test_aiven_connection.js
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `START_HERE.md` | Quick start guide |
| `AIVEN_QUICK_START.md` | Step-by-step setup |
| `WHERE_TO_PUT_CA_CERTIFICATE.md` | Certificate guide |
| `AIVEN_SETUP_SUMMARY.md` | What was changed |
| `AIVEN_ARCHITECTURE.md` | How it works |
| `server/AIVEN_SETUP_GUIDE.md` | Detailed guide |

---

## 🔒 Security Checklist

- [ ] ✅ `server/certs/` in `.gitignore`
- [ ] ✅ `server/.env` in `.gitignore`
- [ ] ✅ Never commit certificates
- [ ] ✅ Never commit `.env` files
- [ ] ✅ Use env vars in Vercel

---

## 📞 Helper Scripts

| Script | Purpose |
|--------|---------|
| `setup_aiven.js` | Interactive setup wizard |
| `test_aiven_connection.js` | Test database connection |
| `convert_cert_to_base64.js` | Convert cert for Vercel (Node) |
| `convert_cert_to_base64.ps1` | Convert cert for Vercel (PowerShell) |
| `test_database.js` | Initialize database schema |

---

## ✅ Verification

### Local Setup Working?
```bash
node test_aiven_connection.js
```
Should show: `✅ SUCCESS! Your Aiven database is ready to use!`

### Server Running?
```bash
npm start
```
Should show: `✅ Database connection successful`

### Vercel Deployed?
Check deployment logs for: `✅ SSL certificate loaded from environment variable`

---

## 🎯 File Structure

```
server/
├── certs/
│   └── ca.pem              ← Your certificate (local)
├── .env                    ← Your config (local)
├── setup_aiven.js          ← Setup wizard
├── test_aiven_connection.js ← Connection tester
├── convert_cert_to_base64.js ← Cert converter
└── test_database.js        ← DB initializer
```

---

## 💡 Pro Tips

1. **Always test locally first** before deploying to Vercel
2. **Use the setup script** - it's faster than manual setup
3. **Keep ca_base64.txt** for reference (it's in `.gitignore`)
4. **Run diagnostics** if anything fails: `node test_aiven_connection.js`
5. **Check Vercel logs** for deployment issues

---

## 🆘 Emergency Commands

### Reset Everything
```bash
rm server/.env
rm -rf server/certs
node setup_aiven.js
```

### Test Without Setup
```bash
node -e "require('./server/database_config_serverless').testConnection()"
```

### Check Certificate
```bash
# Windows
type server\certs\ca.pem

# macOS/Linux
cat server/certs/ca.pem
```

---

## 📱 Quick Links

- **Aiven Dashboard:** https://console.aiven.io/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MySQL Docs:** https://dev.mysql.com/doc/

---

**Need help?** Run `node server/test_aiven_connection.js` for diagnostics!

