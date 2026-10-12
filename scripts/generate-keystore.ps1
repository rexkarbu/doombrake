# DoomBrake - Release Keystore Generator (PowerShell)
param(
    [string]$StorePass = "doombrake123",
    [string]$KeyPass = "doombrake123",
    [string]$OrgName = "DoomBrake Team"
)

$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   DoomBrake - Release Keystore Generator" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$KeystorePath = "android/app/doombrake-release.keystore"
$PropPath = "android/keystore.properties"

if (Test-Path $KeystorePath) {
    Write-Warning "Keystore already exists at $KeystorePath"
    $response = Read-Host "Do you want to overwrite it? (y/N)"
    if ($response.ToLower() -ne "y") {
        Write-Host "Operation cancelled. Keystore preserved." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`nGenerating 2048-bit RSA Keystore..." -ForegroundColor Green
$dname = "CN=$OrgName, OU=Mobile, O=DoomBrake, L=Jakarta, ST=DKI, C=ID"

$keytoolArgs = @(
    "-genkeypair", "-v",
    "-keystore", $KeystorePath,
    "-alias", "doombrake",
    "-keyalg", "RSA",
    "-keysize", "2048",
    "-validity", "10000",
    "-storepass", $StorePass,
    "-keypass", $KeyPass,
    "-dname", $dname
)

& keytool.exe @keytoolArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to generate keystore. Make sure 'keytool' is in your PATH (installed with JDK)."
    exit 1
}

Write-Host "Writing credentials to $PropPath..." -ForegroundColor Green
$propContent = @"
storeFile=doombrake-release.keystore
storePassword=$StorePass
keyAlias=doombrake
keyPassword=$KeyPass
"@

Set-Content -Path $PropPath -Value $propContent -Encoding UTF8

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host " SUCCESS! Keystore generated and configured:" -ForegroundColor Green
Write-Host "   - Keystore: $KeystorePath"
Write-Host "   - Properties: $PropPath"
Write-Host ""
Write-Host " You can now run:"
Write-Host "   npm run android:build-release"
Write-Host " or"
Write-Host "   npm run android:bundle-release"
Write-Host "===================================================" -ForegroundColor Green
