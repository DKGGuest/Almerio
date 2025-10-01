# PowerShell Script to Convert CA Certificate to Base64 for Vercel
# Usage: .\convert_cert_to_base64.ps1 <path-to-ca.pem>
# Example: .\convert_cert_to_base64.ps1 certs\ca.pem

param(
    [Parameter(Mandatory=$false)]
    [string]$CertPath
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CA Certificate to Base64 Converter for Vercel           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# If no path provided, prompt for it
if (-not $CertPath) {
    $CertPath = Read-Host "Enter the path to your ca.pem file (e.g., certs\ca.pem)"
}

# Check if file exists
if (-not (Test-Path $CertPath)) {
    Write-Host "❌ Error: Certificate file not found at: $CertPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "1. You have downloaded the ca.pem file from Aiven" -ForegroundColor Yellow
    Write-Host "2. The file path is correct" -ForegroundColor Yellow
    Write-Host "3. You are in the correct directory" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

try {
    # Read the certificate file
    $certContent = Get-Content -Path $CertPath -Raw
    
    # Convert to base64
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($certContent)
    $base64 = [Convert]::ToBase64String($bytes)
    
    Write-Host "✅ Certificate successfully converted to base64!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Copy the following value and paste it as the DB_CA_CERT" -ForegroundColor Cyan
    Write-Host "   environment variable in Vercel:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "─" * 80 -ForegroundColor Gray
    Write-Host $base64 -ForegroundColor White
    Write-Host "─" * 80 -ForegroundColor Gray
    Write-Host ""
    
    # Copy to clipboard
    $base64 | Set-Clipboard
    Write-Host "✅ Base64 string has been copied to your clipboard!" -ForegroundColor Green
    Write-Host ""
    
    # Save to file
    $outputFile = Join-Path (Split-Path $CertPath) "ca_base64.txt"
    $base64 | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "💾 Base64 certificate also saved to: $outputFile" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📝 Next Steps for Vercel Deployment:" -ForegroundColor Cyan
    Write-Host "1. Go to your Vercel project dashboard" -ForegroundColor White
    Write-Host "2. Navigate to Settings → Environment Variables" -ForegroundColor White
    Write-Host "3. Add a new variable:" -ForegroundColor White
    Write-Host "   - Name: DB_CA_CERT" -ForegroundColor Yellow
    Write-Host "   - Value: Paste from clipboard (Ctrl+V)" -ForegroundColor Yellow
    Write-Host "   - Environment: Select Production, Preview, and Development" -ForegroundColor Yellow
    Write-Host "4. Click 'Save'" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Add other environment variables:" -ForegroundColor White
    Write-Host "   DB_HOST=your-aiven-host.aivencloud.com" -ForegroundColor Yellow
    Write-Host "   DB_PORT=your-port" -ForegroundColor Yellow
    Write-Host "   DB_USER=avnadmin" -ForegroundColor Yellow
    Write-Host "   DB_PASSWORD=your-database-password" -ForegroundColor Yellow
    Write-Host "   DB_NAME=defaultdb" -ForegroundColor Yellow
    Write-Host "   DB_SSL=true" -ForegroundColor Yellow
    Write-Host "   NODE_ENV=production" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "6. Deploy your application:" -ForegroundColor White
    Write-Host "   vercel --prod" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "❌ Error converting certificate: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Done! Your certificate is ready for Vercel deployment." -ForegroundColor Green
Write-Host ""

