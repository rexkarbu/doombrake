@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   DoomBrake - Release Keystore Generator
echo ===================================================
echo.

set KEYSTORE_PATH=android\app\doombrake-release.keystore
set PROP_PATH=android\keystore.properties

if exist "%KEYSTORE_PATH%" (
    echo [WARNING] Keystore already exists at %KEYSTORE_PATH%
    set /p OVERWRITE="Do you want to overwrite it? (y/N): "
    if /i not "!OVERWRITE!"=="y" (
        echo Operation cancelled. Keystore was preserved.
        exit /b 0
    )
)

set /p STORE_PASS="Enter Keystore Password (min 6 characters): "
if "%STORE_PASS%"=="" set STORE_PASS=doombrake123

set /p KEY_PASS="Enter Key Password [Enter to use same as keystore]: "
if "%KEY_PASS%"=="" set KEY_PASS=%STORE_PASS%

set /p DNAME_NAME="Enter Your Name or Organization [DoomBrake Team]: "
if "%DNAME_NAME%"=="" set DNAME_NAME=DoomBrake Team

echo.
echo Generating 2048-bit RSA Keystore...
keytool -genkeypair -v ^
  -keystore "%KEYSTORE_PATH%" ^
  -alias doombrake ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -storepass "%STORE_PASS%" ^
  -keypass "%KEY_PASS%" ^
  -dname "CN=%DNAME_NAME%, OU=Mobile, O=DoomBrake, L=Jakarta, ST=DKI, C=ID"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate keystore. Make sure 'keytool' is in your PATH (part of JDK).
    exit /b 1
)

echo.
echo Writing credentials to %PROP_PATH%...
(
    echo storeFile=doombrake-release.keystore
    echo storePassword=%STORE_PASS%
    echo keyAlias=doombrake
    echo keyPassword=%KEY_PASS%
) > "%PROP_PATH%"

echo.
echo ===================================================
echo  SUCCESS! Keystore generated and configured:
echo   - Keystore: %KEYSTORE_PATH%
echo   - Properties: %PROP_PATH%
echo.
echo  You can now run:
echo   npm run android:build-release
echo  or
echo   npm run android:bundle-release
echo ===================================================
