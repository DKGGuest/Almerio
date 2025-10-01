# 🚀 Aiven Database Quick Start Guide

This guide will get you up and running with Aiven MySQL database in 5 minutes.

## 📦 What You Need from Aiven Dashboard

Get these from your Aiven dashboard:
- **Host:** Your MySQL host (e.g., `mysql-xxx.aivencloud.com`)
- **Port:** Your port number (e.g., `16780`)
- **User:** Usually `avnadmin`
- **Password:** Your database password (from Aiven dashboard)
- **Database:** Usually `defaultdb`
- **SSL Mode:** `REQUIRED`
- **CA Certificate:** `ca.pem` file (download from Aiven)

## 🎯 Quick Setup (Choose One Method)

### Method 1: Automated Setup (Recommended)

1. **Download your CA certificate** from Aiven dashboard (click "Show" next to CA certificate, then download)

2. **Run the setup script:**
   ```bash
   cd server
   node setup_aiven.js
   ```

3. **Follow the prompts** - the script will:
   - Create your `.env` file with Aiven credentials
   - Set up the certificate path
   - Test the database connection

### Method 2: Manual Setup

1. **Download CA Certificate** from Aiven and save it as `server/certs/ca.pem`

2. **Create the certs directory:**
   ```bash
   mkdir server/certs
   ```

3. **Move your ca.pem file:**
   ```bash
   # Windows
   move ca.pem server\certs\ca.pem
   
   # macOS/Linux
   mv ca.pem server/certs/ca.pem
   ```

4. **Create `server/.env` file:**
   ```env
   # Aiven MySQL Configuration
   DB_HOST=your-aiven-host.aivencloud.com
   DB_USER=avnadmin
   DB_PASSWORD=your-database-password
   DB_NAME=defaultdb
   DB_PORT=your-port
   DB_SSL=true
   DB_CA_CERT_PATH=server/certs/ca.pem

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Security (change these!)
   JWT_SECRET=your_secure_jwt_secret_here
   SESSION_SECRET=your_secure_session_secret_here

   # CORS
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

5. **Test the connection:**
   ```bash
   cd server
   node -e "require('./database_config_serverless').testConnection()"
   ```

## 🧪 Initialize Database

Once connected, initialize your database schema:

```bash
cd server
node test_database.js
```

This will create all tables and insert default data.

## 🚀 Start Development Server

```bash
cd server
npm install  # if you haven't already
npm start
```

You should see:
```
✅ SSL certificate loaded from file
✅ Database connection successful
🚀 Shooting Range Dashboard Server running on port 3001
```

## 🌐 Deploy to Vercel

### Step 1: Convert Certificate to Base64

```bash
cd server
node convert_cert_to_base64.js certs/ca.pem
```

This will output a base64 string - **copy it!**

### Step 2: Add Environment Variables to Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

| Name | Value |
|------|-------|
| `DB_HOST` | `your-aiven-host.aivencloud.com` |
| `DB_PORT` | `your-port` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | `your-database-password` |
| `DB_NAME` | `defaultdb` |
| `DB_SSL` | `true` |
| `DB_CA_CERT` | `<paste the base64 string here>` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `<your secure secret>` |
| `SESSION_SECRET` | `<your secure secret>` |

**Important:** Select all environments (Production, Preview, Development) for each variable.

### Step 3: Deploy

```bash
vercel --prod
```

Or push to your Git repository if you have automatic deployments enabled.

## 📁 File Structure

After setup, your structure should look like:

```
shooting/
├── server/
│   ├── certs/
│   │   ├── ca.pem              # Your CA certificate (local only)
│   │   └── ca_base64.txt       # Base64 version (for reference)
│   ├── .env                    # Your local config (not committed)
│   ├── .env.example            # Template with Aiven config
│   ├── database_config.js      # Updated with SSL support
│   ├── database_config_serverless.js  # Updated with SSL support
│   ├── setup_aiven.js          # Setup helper script
│   ├── convert_cert_to_base64.js  # Certificate converter
│   └── AIVEN_SETUP_GUIDE.md    # Detailed guide
├── .gitignore                  # Updated to exclude certs
└── vercel.json                 # Updated for API routes
```

## ✅ Verification Checklist

- [ ] CA certificate downloaded and saved to `server/certs/ca.pem`
- [ ] `server/.env` file created with Aiven credentials
- [ ] Database connection tested successfully
- [ ] Database schema initialized
- [ ] Local server starts without errors
- [ ] (For Vercel) Certificate converted to base64
- [ ] (For Vercel) All environment variables added to Vercel
- [ ] (For Vercel) Deployment successful

## 🐛 Common Issues

### "Certificate file not found"
- Make sure `ca.pem` is in `server/certs/` directory
- Check the path in your `.env` file: `DB_CA_CERT_PATH=server/certs/ca.pem`

### "Connection timeout"
- Check your internet connection
- Verify the host and port are correct
- Ensure your IP is allowed in Aiven's firewall (check Aiven dashboard)

### "SSL connection error"
- Make sure `DB_SSL=true` in your `.env`
- Verify the CA certificate is valid and not corrupted
- Try downloading the certificate again from Aiven

### "Access denied"
- Double-check the username and password
- Ensure you're using the correct database name (`defaultdb`)

## 📚 Additional Resources

- **Detailed Setup Guide:** `server/AIVEN_SETUP_GUIDE.md`
- **Database Schema:** `server/DATABASE_SCHEMA.md`
- **Server Setup:** `server/SETUP_GUIDE.md`
- **Aiven Docs:** https://docs.aiven.io/docs/products/mysql

## 🆘 Need Help?

1. Check the logs for specific error messages
2. Verify all credentials match your Aiven dashboard
3. Ensure the CA certificate is properly downloaded
4. See `server/AIVEN_SETUP_GUIDE.md` for troubleshooting

---

**Security Note:** Never commit your `.env` file or `ca.pem` certificate to Git! They are already in `.gitignore`.

