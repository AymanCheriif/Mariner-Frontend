# Create a distributable folder of the Mariner APP
$version = "1.0.0"
$sourcePath = "dist\win-unpacked"
$outputPath = "release\$version"
$folderName = "Mariner-APP-Windows-$version-Portable"
$destPath = Join-Path $outputPath $folderName

# Create release directory if it doesn't exist
if (!(Test-Path -Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
}

# Remove old folder if it exists
if (Test-Path -Path $destPath) {
    Remove-Item -Path $destPath -Recurse -Force
}

Write-Host "Creating portable folder..." -ForegroundColor Green
Write-Host "Source: $sourcePath" -ForegroundColor Cyan
Write-Host "Destination: $destPath" -ForegroundColor Cyan

# Copy all files
Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force

# Create a README file
$readmeContent = @"
Mariner APP - Portable Version
================================

Version: $version
Build Date: $(Get-Date -Format "yyyy-MM-dd")

INSTALLATION:
-------------
No installation required! This is a portable version.

HOW TO RUN:
-----------
Simply double-click on "Mariner.exe" to start the application.

SYSTEM REQUIREMENTS:
--------------------
- Windows 10 or later (64-bit)
- .NET Framework (usually pre-installed on Windows)

NOTES:
------
- This portable version can be run from any folder
- No registry modifications are made
- All settings are stored in the application folder

For support, contact: support@mariner-app.com
"@

$readmeContent | Out-File -FilePath (Join-Path $destPath "README.txt") -Encoding UTF8

Write-Host ""
Write-Host "SUCCESS! Portable folder created:" -ForegroundColor Green
Write-Host $destPath -ForegroundColor Yellow
Write-Host ""

# Calculate folder size
$size = (Get-ChildItem -Path $destPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Folder size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Distribution Instructions:" -ForegroundColor White
Write-Host "1. ZIP the folder: $folderName" -ForegroundColor Gray
Write-Host "2. Share the ZIP file with users" -ForegroundColor Gray
Write-Host "3. Users extract and run Mariner.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "Location: $destPath" -ForegroundColor Yellow
