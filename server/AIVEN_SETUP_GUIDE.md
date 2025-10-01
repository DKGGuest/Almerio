# Aiven MySQL Database Setup Guide

This guide will help you configure your shooting range application to use Aiven's free MySQL database service.

## 📋 Prerequisites

- Aiven account with MySQL database created
- Database credentials (host, port, user, password, database name)
- CA certificate file (ca.pem)

## 🔧 Setup Instructions

### 1. Store CA Certificate

#### Option A: For Local Development (Recommended)

1. Create a `certs` directory in the `server` folder:
   ```bash
   mkdir server/certs
   ```

2. Save your `ca.pem` file to `server/certs/ca.pem`

3. Add to `.gitignore` to keep certificates secure:
   ```bash
   echo "server/certs/*.pem" >> .gitignore
   ```

#### Option B: For Vercel Deployment (Required)

You need to convert the CA certificate to base64 format for Vercel environment variables:

**On Windows (PowerShell):**
```powershell
$cert = Get-Content -Path "ca.pem" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($cert)
$base64 = [Convert]::ToBase64String($bytes)
$base64 | Set-Clipboard
Write-Host "Certificate copied to clipboard!"
```

**On macOS/Linux:**
```bash
base64 -i ca.pem | pbcopy  # macOS
base64 -i ca.pem | xclip -selection clipboard  # Linux
echo "Certificate copied to clipboard!"
```

**Manual method (any OS):**
```bash
base64 ca.pem > ca_base64.txt
# Then copy the contents of ca_base64.txt
```

### 2. Configure Environment Variables

#### For Local Development

Create or update `server/.env`:

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

# Security Configuration
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### For Vercel Deployment

Add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
DB_HOST=your-aiven-host.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your-database-password
DB_NAME=defaultdb
DB_PORT=your-port
DB_SSL=true
DB_CA_CERT=<paste_your_base64_encoded_certificate_here>
NODE_ENV=production
JWT_SECRET=<your_secure_jwt_secret>
SESSION_SECRET=<your_secure_session_secret>
```

**Important:** 
- For `DB_CA_CERT`, paste the base64-encoded certificate you created in step 1
- Make sure to set these for **Production**, **Preview**, and **Development** environments as needed

### 3. Update Vercel Configuration

Update your `vercel.json` to include API routes:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4. Test Database Connection

#### Local Testing

```bash
cd server
node -e "require('./database_config_serverless').testConnection()"
```

You should see:
```
✅ SSL certificate loaded from file
✅ Database connection established
✅ Database connection successful
```

#### Test with Full Server

```bash
cd server
npm start
```

Look for:
```
🔌 Testing database connection...
✅ SSL certificate loaded from file
✅ Database connection successful
```

### 5. Initialize Database Schema

Once connected, initialize your database:

```bash
cd server
node test_database.js
```

This will:
- Create all necessary tables
- Insert default data
- Run comprehensive tests

## 🔒 Security Best Practices

1. **Never commit certificates or credentials to Git**
   - Add `server/certs/` to `.gitignore`
   - Add `server/.env` to `.gitignore`

2. **Use environment variables for all sensitive data**
   - Database credentials
   - SSL certificates (base64 encoded for Vercel)
   - API keys and secrets

3. **Rotate credentials regularly**
   - Update Aiven password periodically
   - Update JWT and session secrets

4. **Use different credentials for different environments**
   - Development database
   - Production database
   - Testing database

## 🚀 Deployment Checklist

Before deploying to Vercel:

- [ ] CA certificate converted to base64
- [ ] All environment variables added to Vercel
- [ ] Database schema initialized on Aiven
- [ ] Connection tested locally
- [ ] `.gitignore` updated to exclude certificates
- [ ] `vercel.json` configured correctly

## 🐛 Troubleshooting

### Connection Timeout

If you get connection timeouts:
- Check that your IP is allowed in Aiven's firewall settings
- Verify the host and port are correct
- Ensure SSL is enabled (`DB_SSL=true`)

### SSL Certificate Error

If you get SSL/TLS errors:
- Verify the CA certificate is correctly formatted
- Check that base64 encoding is correct (no extra newlines)
- Ensure `rejectUnauthorized: true` in SSL config

### "Access Denied" Error

- Double-check username and password
- Verify the database name is correct (`defaultdb` for Aiven)
- Ensure user has proper permissions

### Vercel Deployment Issues

- Check Vercel logs for specific errors
- Verify all environment variables are set
- Ensure `NODE_ENV=production` is set
- Check that the base64 certificate doesn't have line breaks

## 📚 Additional Resources

- [Aiven MySQL Documentation](https://docs.aiven.io/docs/products/mysql)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MySQL SSL/TLS Configuration](https://dev.mysql.com/doc/refman/8.0/en/using-encrypted-connections.html)

## 🆘 Need Help?

If you encounter issues:
1. Check the Vercel deployment logs
2. Test the connection locally first
3. Verify all environment variables are set correctly
4. Ensure the CA certificate is properly encoded

