# Create Mariner APP Installer Package
# This script creates a distributable installer package

$version = "1.0.0"
$sourcePath = Join-Path (Get-Location) "dist\win-unpacked"
$outputPath = "release\$version"
$packageName = "Mariner-APP-Installer-$version"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Mariner APP - Create Installer Package" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Create release directory with full path
$fullOutputPath = Join-Path (Get-Location) $outputPath
if (!(Test-Path -Path $fullOutputPath)) {
    New-Item -ItemType Directory -Path $fullOutputPath -Force | Out-Null
}

$zipPath = Join-Path $fullOutputPath "$packageName.zip"

# Remove old ZIP if exists
if (Test-Path -Path $zipPath) {
    Remove-Item -Path $zipPath -Force
    Write-Host "Removed old package" -ForegroundColor Yellow
}

Write-Host "Creating installer package..." -ForegroundColor Cyan
Write-Host "Source: $sourcePath" -ForegroundColor Gray
Write-Host "Output: $zipPath`n" -ForegroundColor Gray

# Create installer instructions
$readme = @"
==============================================
  MARINER APP - Installation Instructions
==============================================

Version: $version
Build Date: $(Get-Date -Format "MMMM dd, yyyy")

QUICK INSTALL (Recommended):
-----------------------------
1. Extract all files from this ZIP to a temporary folder
2. Right-click on "Install.ps1"
3. Select "Run with PowerShell"
4. Follow the installation wizard
5. Launch from Desktop or Start Menu shortcut

MANUAL INSTALL (Alternative):
------------------------------
1. Extract all files from this ZIP
2. Copy the entire folder to:
   C:\Program Files\Mariner APP
   OR
   %LOCALAPPDATA%\Programs\Mariner APP

3. Create shortcuts manually:
   - Right-click Mariner.exe
   - Select "Create shortcut"
   - Move shortcut to Desktop

PORTABLE USAGE (No Installation):
----------------------------------
1. Extract files anywhere
2. Double-click Mariner.exe to run
3. No installation needed!

SYSTEM REQUIREMENTS:
--------------------
- Windows 10 or later (64-bit)
- 200 MB free disk space
- 4 GB RAM (recommended)
- Internet connection for API access

BACKEND SETUP:
--------------
Make sure the Mariner backend is running:
- Default API: http://localhost:8080/api
- Contact your administrator for the correct API URL

FIRST RUN:
----------
1. Windows may show a security warning (app is not signed)
2. Click "More info" → "Run anyway"
3. Add to antivirus exclusions if blocked

UNINSTALL:
----------
If installed using Install.ps1:
- Delete the installation folder
- Delete shortcuts from Desktop and Start Menu

If using portable:
- Simply delete the folder

TROUBLESHOOTING:
----------------
- App won't start: Run as Administrator
- White screen: Check backend API is running
- Missing data: Verify API connection in settings

SUPPORT:
--------
For technical support, contact your system administrator.

==============================================
         Mariner APP - Version $version
==============================================
"@

$readme | Out-File -FilePath (Join-Path $sourcePath "INSTALL_INSTRUCTIONS.txt") -Encoding UTF8

# Create the ZIP package
try {
    # Use .NET compression for better compatibility
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($sourcePath, $zipPath)
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "`nInstaller package created:" -ForegroundColor Cyan
    Write-Host $zipPath -ForegroundColor Yellow
    
    $size = (Get-Item $zipPath).Length / 1MB
    Write-Host "`nPackage size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  HOW TO DISTRIBUTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`n1. Share the ZIP file with your client:" -ForegroundColor White
    Write-Host "   $packageName.zip" -ForegroundColor Yellow
    
    Write-Host "`n2. Client instructions:" -ForegroundColor White
    Write-Host "   a) Extract the ZIP file" -ForegroundColor Gray
    Write-Host "   b) Right-click 'Install.ps1'" -ForegroundColor Gray
    Write-Host "   c) Select 'Run with PowerShell'" -ForegroundColor Gray
    Write-Host "   d) Follow installation wizard" -ForegroundColor Gray
    
    Write-Host "`n3. Alternative (Portable):" -ForegroundColor White
    Write-Host "   Client can run Mariner.exe directly" -ForegroundColor Gray
    Write-Host "   without installing" -ForegroundColor Gray
    
    Write-Host "`n========================================`n" -ForegroundColor Cyan
    
    # Open folder
    Write-Host "Opening release folder..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    explorer.exe $fullOutputPath
    
} catch {
    Write-Host "❌ ERROR: Failed to create ZIP" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
