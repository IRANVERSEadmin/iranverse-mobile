Write-Host "Fixing Metro bundler module error..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Stopping all Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Step 2: Clearing all caches..." -ForegroundColor Yellow
Remove-Item -Path "$env:TEMP\metro-cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\haste-map-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Step 3: Reinstalling dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "All done! Now run 'npx expo start' to restart the app." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"