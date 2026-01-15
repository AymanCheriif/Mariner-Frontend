# Create a ZIP package of the Mariner APP for distribution
$version = "1.0.0"
$sourcePath = "dist\win-unpacked"
$outputPath = "release\$version"
$zipName = "Mariner-APP-Windows-$version-Portable.zip"

# Create release directory if it doesn't exist
if (!(Test-Path -Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
}

# Remove old ZIP if it exists
$zipPath = Join-Path $outputPath $zipName
if (Test-Path -Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

Write-Host "Creating portable ZIP package..." -ForegroundColor Green
Write-Host "Source: $sourcePath" -ForegroundColor Cyan
Write-Host "Output: $zipPath" -ForegroundColor Cyan

# Create ZIP file
Compress-Archive -Path "$sourcePath\*" -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host ""
Write-Host "SUCCESS! Portable package created:" -ForegroundColor Green
Write-Host $zipPath -ForegroundColor Yellow
Write-Host ""
Write-Host "File size: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "To install:" -ForegroundColor White
Write-Host "1. Extract the ZIP file to a folder" -ForegroundColor Gray
Write-Host "2. Run Mariner.exe" -ForegroundColor Gray
