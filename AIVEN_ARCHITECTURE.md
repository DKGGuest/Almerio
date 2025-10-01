# 🏗️ Aiven Database Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Your Application                             │
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Frontend (Vite) │              │  Backend (Node)  │        │
│  │  React App       │◄────────────►│  Express Server  │        │
│  │  Port: 5173      │   API Calls  │  Port: 3001      │        │
│  └──────────────────┘              └──────────────────┘        │
│                                              │                   │
│                                              │ MySQL Connection  │
│                                              │ with SSL/TLS      │
└──────────────────────────────────────────────┼──────────────────┘
                                               │
                                               │ Encrypted
                                               │ Connection
                                               ▼
                    ┌─────────────────────────────────────┐
                    │      Aiven MySQL Database           │
                    │  (Cloud-hosted, SSL Required)       │
                    │                                     │
                    │  Host: mysql-26a01f7a-...          │
                    │  Port: 16780                        │
                    │  Database: defaultdb                │
                    │  SSL: Required (CA Certificate)     │
                    └─────────────────────────────────────┘
```

## SSL/TLS Certificate Flow

### Local Development

```
┌──────────────────────────────────────────────────────────────┐
│  1. Download ca.pem from Aiven Dashboard                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Save to: server/certs/ca.pem                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Configure in .env:                                       │
│     DB_CA_CERT_PATH=server/certs/ca.pem                      │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Application reads certificate file                       │
│     fs.readFileSync('server/certs/ca.pem')                   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  5. MySQL connection with SSL:                               │
│     ssl: { ca: <certificate content>, rejectUnauthorized: true }│
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  6. Secure connection to Aiven MySQL ✅                      │
└──────────────────────────────────────────────────────────────┘
```

### Vercel Deployment

```
┌──────────────────────────────────────────────────────────────┐
│  1. Download ca.pem from Aiven Dashboard                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Convert to Base64:                                       │
│     node convert_cert_to_base64.js certs/ca.pem              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Add to Vercel Environment Variables:                     │
│     DB_CA_CERT=<base64 encoded certificate>                  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Vercel serverless function reads env var                 │
│     Buffer.from(process.env.DB_CA_CERT, 'base64')            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  5. MySQL connection with SSL:                               │
│     ssl: { ca: <decoded certificate>, rejectUnauthorized: true }│
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  6. Secure connection to Aiven MySQL ✅                      │
└──────────────────────────────────────────────────────────────┘
```

## Database Configuration Logic

```javascript
// Simplified flow from database_config_serverless.js

function getSSLConfig() {
    if (DB_SSL === 'false') {
        return false;  // No SSL
    }
    
    if (DB_SSL === 'true') {
        let sslConfig = { rejectUnauthorized: true };
        
        // Local development: Read from file
        if (DB_CA_CERT_PATH && fileExists(DB_CA_CERT_PATH)) {
            sslConfig.ca = readFile(DB_CA_CERT_PATH);
            return sslConfig;
        }
        
        // Vercel: Decode from base64 env var
        if (DB_CA_CERT) {
            sslConfig.ca = base64Decode(DB_CA_CERT);
            return sslConfig;
        }
    }
    
    return false;  // Default: no SSL
}
```

## File Structure

```
shooting/
│
├── 📄 AIVEN_QUICK_START.md          ← Start here!
├── 📄 AIVEN_SETUP_SUMMARY.md        ← Overview of changes
├── 📄 WHERE_TO_PUT_CA_CERTIFICATE.md ← Certificate guide
├── 📄 AIVEN_ARCHITECTURE.md         ← This file
│
├── 📁 server/
│   ├── 📄 .env                      ← Your config (not in Git)
│   ├── 📄 .env.example              ← Template with Aiven settings
│   │
│   ├── 📁 certs/                    ← Certificate directory
│   │   ├── 📄 ca.pem                ← CA certificate (not in Git)
│   │   └── 📄 ca_base64.txt         ← Base64 version (not in Git)
│   │
│   ├── 📄 database_config.js        ← Updated with SSL support
│   ├── 📄 database_config_serverless.js ← Serverless SSL support
│   │
│   ├── 📄 setup_aiven.js            ← Interactive setup wizard
│   ├── 📄 test_aiven_connection.js  ← Connection tester
│   ├── 📄 convert_cert_to_base64.js ← Certificate converter (Node)
│   ├── 📄 convert_cert_to_base64.ps1 ← Certificate converter (PowerShell)
│   │
│   └── 📄 AIVEN_SETUP_GUIDE.md      ← Detailed documentation
│
├── 📁 api/
│   └── 📄 index.js                  ← Vercel serverless function
│
├── 📄 vercel.json                   ← Updated for API routes
└── 📄 .gitignore                    ← Excludes certs and .env
```

## Environment Variables

### Local Development (.env)

```env
# Database Connection
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=your-port
DB_USER=avnadmin
DB_PASSWORD=your-database-password
DB_NAME=defaultdb

# SSL Configuration
DB_SSL=true
DB_CA_CERT_PATH=server/certs/ca.pem  ← File path

# Server
PORT=3001
NODE_ENV=development
```

### Vercel Production (Environment Variables)

```
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=your-port
DB_USER=avnadmin
DB_PASSWORD=your-database-password
DB_NAME=defaultdb
DB_SSL=true
DB_CA_CERT=<base64_encoded_certificate>  ← Base64 string
NODE_ENV=production
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                  │
│  - Aiven firewall rules                                     │
│  - IP whitelisting (optional)                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: SSL/TLS Encryption                                │
│  - Certificate-based authentication                         │
│  - Encrypted data in transit                                │
│  - rejectUnauthorized: true (strict verification)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Database Authentication                           │
│  - Username/password authentication                         │
│  - User permissions and roles                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Application Security                              │
│  - Environment variables (not in code)                      │
│  - .gitignore (no credentials in Git)                       │
│  - Separate dev/prod credentials                            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating a Shooting Session

```
User Action (Frontend)
    │
    ▼
API Request to Backend
    │
    ▼
Express Route Handler
    │
    ▼
Database Connection (with SSL)
    │
    ▼
Aiven MySQL Database
    │
    ▼
Query Execution
    │
    ▼
Response to Backend
    │
    ▼
JSON Response to Frontend
    │
    ▼
UI Update
```

## Deployment Workflow

### Local Development

```
1. Download ca.pem
2. Save to server/certs/ca.pem
3. Create server/.env with credentials
4. Run: node test_aiven_connection.js
5. Run: node test_database.js (initialize schema)
6. Run: npm start (start server)
7. Develop and test locally
```

### Vercel Deployment

```
1. Convert ca.pem to base64
2. Add environment variables to Vercel
3. Push code to Git (certs excluded)
4. Vercel builds and deploys
5. Serverless functions connect to Aiven
6. Application runs in production
```

## Helper Scripts Workflow

```
setup_aiven.js
    │
    ├─► Prompts for credentials
    ├─► Creates .env file
    ├─► Sets up certificate path
    └─► Tests connection
        │
        ▼
test_aiven_connection.js
    │
    ├─► Loads configuration
    ├─► Checks certificate
    ├─► Tests connection
    ├─► Shows server info
    └─► Verifies permissions
        │
        ▼
convert_cert_to_base64.js
    │
    ├─► Reads ca.pem file
    ├─► Converts to base64
    ├─► Copies to clipboard
    ├─► Saves to ca_base64.txt
    └─► Shows Vercel instructions
```

## Troubleshooting Flow

```
Connection Issue
    │
    ▼
Run: node test_aiven_connection.js
    │
    ├─► Certificate not found?
    │   └─► Check server/certs/ca.pem exists
    │
    ├─► Connection timeout?
    │   └─► Check host, port, firewall
    │
    ├─► SSL error?
    │   └─► Re-download certificate
    │
    └─► Access denied?
        └─► Verify username/password
```

## Summary

| Aspect | Local Development | Vercel Production |
|--------|------------------|-------------------|
| **Certificate Storage** | File: `server/certs/ca.pem` | Env var: `DB_CA_CERT` (base64) |
| **Configuration** | `.env` file | Vercel environment variables |
| **SSL Loading** | `fs.readFileSync()` | `Buffer.from(base64)` |
| **Testing** | `test_aiven_connection.js` | Vercel deployment logs |
| **Security** | `.gitignore` excludes certs | Env vars not in code |

---

**Next Steps:**
1. Read [AIVEN_QUICK_START.md](AIVEN_QUICK_START.md)
2. Run `node server/setup_aiven.js`
3. Test with `node server/test_aiven_connection.js`
4. Deploy to Vercel following [server/AIVEN_SETUP_GUIDE.md](server/AIVEN_SETUP_GUIDE.md)

