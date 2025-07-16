@echo off
echo Clearing React Native and Metro cache...
echo.

echo Stopping Metro bundler...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro*" 2>nul

echo Clearing Metro cache...
rmdir /s /q %TEMP%\metro-cache 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo Clearing React Native cache...
npx react-native start --reset-cache 2>nul

echo.
echo Cache cleared! You can now restart your app with 'npx expo start'
pause