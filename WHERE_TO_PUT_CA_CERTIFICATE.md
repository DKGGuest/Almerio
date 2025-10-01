# 📜 Where to Put Your CA Certificate (ca.pem)

## Quick Answer

### For Local Development:
```
server/certs/ca.pem
```

### For Vercel Deployment:
Convert to base64 and add as environment variable `DB_CA_CERT`

---

## 📁 Detailed Instructions

### Step 1: Download the Certificate from Aiven

1. Go to your Aiven dashboard
2. Select your MySQL database
3. Find the "CA certificate" section
4. Click "Show" or "Download"
5. Save the file as `ca.pem`

### Step 2: For Local Development

#### Create the Directory
```bash
# Windows (PowerShell)
mkdir server\certs

# macOS/Linux
mkdir -p server/certs
```

#### Move the Certificate
```bash
# Windows
move ca.pem server\certs\ca.pem

# macOS/Linux
mv ca.pem server/certs/ca.pem
```

#### Verify the File
```bash
# Windows
dir server\certs\ca.pem

# macOS/Linux
ls -la server/certs/ca.pem
```

You should see the file listed.

### Step 3: For Vercel Deployment

#### Option A: Using PowerShell (Windows)
```powershell
cd server
.\convert_cert_to_base64.ps1 certs\ca.pem
```

The script will:
- ✅ Convert the certificate to base64
- ✅ Copy it to your clipboard
- ✅ Save it to `ca_base64.txt`
- ✅ Show you the next steps

#### Option B: Using Node.js (All Platforms)
```bash
cd server
node convert_cert_to_base64.js certs/ca.pem
```

#### Option C: Manual Conversion

**Windows (PowerShell):**
```powershell
$cert = Get-Content -Path "server\certs\ca.pem" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($cert)
$base64 = [Convert]::ToBase64String($bytes)
$base64 | Set-Clipboard
Write-Host "Certificate copied to clipboard!"
```

**macOS:**
```bash
base64 -i server/certs/ca.pem | pbcopy
echo "Certificate copied to clipboard!"
```

**Linux:**
```bash
base64 -i server/certs/ca.pem | xclip -selection clipboard
echo "Certificate copied to clipboard!"
```

---

## 🔧 Configuration

### Local Development (.env file)

Create or edit `server/.env`:

```env
# Aiven MySQL Configuration
DB_HOST=your-aiven-host.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your-database-password
DB_NAME=defaultdb
DB_PORT=your-port
DB_SSL=true
DB_CA_CERT_PATH=server/certs/ca.pem
```

### Vercel Deployment (Environment Variables)

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

2. Add these variables:

| Variable Name | Value |
|--------------|-------|
| `DB_HOST` | `your-aiven-host.aivencloud.com` |
| `DB_PORT` | `your-port` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | `your-database-password` |
| `DB_NAME` | `defaultdb` |
| `DB_SSL` | `true` |
| `DB_CA_CERT` | `<paste base64 string here>` |
| `NODE_ENV` | `production` |

3. Select environments: **Production**, **Preview**, and **Development**

4. Click **Save**

---

## ✅ Verification

### Test Local Connection
```bash
cd server
node test_aiven_connection.js
```

Expected output:
```
✅ SSL certificate loaded from file
✅ Connection established successfully!
✅ Ping successful!
🎉 SUCCESS! Your Aiven database is ready to use!
```

### Test Vercel Deployment

After deploying to Vercel, check the deployment logs for:
```
✅ SSL certificate loaded from environment variable
✅ Database connection successful
```

---

## 📂 File Structure

After setup, your structure should look like:

```
shooting/
├── server/
│   ├── certs/
│   │   ├── ca.pem              ← Your certificate (local only)
│   │   └── ca_base64.txt       ← Base64 version (for reference)
│   ├── .env                    ← Your local config
│   ├── database_config.js      ← Updated with SSL support
│   └── database_config_serverless.js
├── .gitignore                  ← Excludes certs/ and .env
└── vercel.json                 ← Configured for API routes
```

---

## 🔒 Security Checklist

- [ ] ✅ Certificate file is in `server/certs/ca.pem`
- [ ] ✅ `server/certs/` is in `.gitignore`
- [ ] ✅ `server/.env` is in `.gitignore`
- [ ] ✅ Never committed certificate to Git
- [ ] ✅ Never committed `.env` file to Git
- [ ] ✅ Base64 certificate added to Vercel (not in code)

---

## 🐛 Common Issues

### "Certificate file not found"

**Problem:** The application can't find your certificate file.

**Solution:**
```bash
# Check if file exists
ls server/certs/ca.pem

# If not, download from Aiven and save it there
```

### "SSL connection error"

**Problem:** SSL/TLS handshake failed.

**Solutions:**
1. Ensure `DB_SSL=true` in your `.env`
2. Verify the certificate is valid (re-download from Aiven)
3. Check that the certificate file is not corrupted

### "Access denied"

**Problem:** Can't connect to database.

**Solutions:**
1. Verify username and password are correct
2. Check that database name is `defaultdb`
3. Ensure your IP is allowed in Aiven firewall

### Vercel: "Certificate not loaded"

**Problem:** Certificate not loading in Vercel deployment.

**Solutions:**
1. Verify `DB_CA_CERT` environment variable is set in Vercel
2. Check that base64 string is complete (no line breaks)
3. Re-convert and re-upload the certificate

---

## 🆘 Need Help?

### Quick Diagnostics

Run this command to check your setup:
```bash
cd server
node test_aiven_connection.js
```

This will show:
- ✅ Configuration details
- ✅ Certificate status
- ✅ Connection test results
- ✅ Troubleshooting tips

### Documentation

- **Quick Start:** [AIVEN_QUICK_START.md](AIVEN_QUICK_START.md)
- **Detailed Guide:** [server/AIVEN_SETUP_GUIDE.md](server/AIVEN_SETUP_GUIDE.md)
- **Setup Summary:** [AIVEN_SETUP_SUMMARY.md](AIVEN_SETUP_SUMMARY.md)

### Helper Scripts

```bash
# Interactive setup
node server/setup_aiven.js

# Test connection
node server/test_aiven_connection.js

# Convert certificate for Vercel
node server/convert_cert_to_base64.js server/certs/ca.pem

# Or use PowerShell (Windows)
.\server\convert_cert_to_base64.ps1 server\certs\ca.pem
```

---

## 📝 Summary

| Environment | Certificate Location | Configuration |
|-------------|---------------------|---------------|
| **Local Development** | `server/certs/ca.pem` | `DB_CA_CERT_PATH=server/certs/ca.pem` in `.env` |
| **Vercel Production** | Base64 in env var | `DB_CA_CERT=<base64>` in Vercel settings |

**Remember:** 
- 🔒 Never commit certificates to Git
- 🔒 Never commit `.env` files to Git
- ✅ Use environment variables for sensitive data
- ✅ Test locally before deploying to Vercel

---

**Ready to start?** Download your `ca.pem` from Aiven and run:
```bash
cd server
node setup_aiven.js
```

