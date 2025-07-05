# IRANVERSE Authentication Dependencies Installation
# Run this in your project root directory

echo "Installing IRANVERSE Authentication Dependencies..."

# Core React Native dependencies
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-safe-area-context

# Authentication and Security
npm install expo-auth-session
npm install expo-crypto
npm install expo-secure-store
npm install expo-web-browser

# HTTP Client
npm install axios

# Internationalization
npm install expo-localization

# Navigation (if not already installed)
npm install @react-navigation/native
npm install @react-navigation/native-stack

# Icons (if not already installed)
npm install @expo/vector-icons

# Development Dependencies
npm install --save-dev @types/react
npm install --save-dev @types/react-native

echo "Dependencies installed! Now checking for compilation errors..."