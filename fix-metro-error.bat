@echo off
echo Fixing Metro bundler module error...
echo.

echo Step 1: Clearing watchman cache...
watchman watch-del-all 2>nul

echo Step 2: Clearing Metro bundler cache...
rmdir /s /q %TEMP%\metro-cache 2>nul
rmdir /s /q %TEMP%\haste-map-* 2>nul

echo Step 3: Clearing node_modules cache...
rmdir /s /q node_modules\.cache 2>nul

echo Step 4: Clearing Expo cache...
rmdir /s /q .expo 2>nul
expo start --clear 2>nul

echo Step 5: Resetting React Native packager cache...
npx react-native start --reset-cache 2>nul

echo.
echo All caches cleared! Please:
echo 1. Close all terminal windows
echo 2. Restart your terminal
echo 3. Run 'npx expo start' again
echo.
pause