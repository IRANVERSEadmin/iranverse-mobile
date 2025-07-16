# OAuth Setup Guide for IRANVERSE Mobile

## Google OAuth Setup

### Prerequisites
- Google Cloud Console account
- Bundle ID (iOS) / Package name (Android) of your app

### Steps:

1. **Create a Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select an existing one

2. **Enable Google Sign-In API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - For iOS:
     - Select "iOS" as application type
     - Enter your bundle ID (e.g., `com.iranverse.mobile`)
   - For Android:
     - Select "Android" as application type
     - Enter your package name
     - Enter your SHA-1 certificate fingerprint

4. **Download Configuration Files**
   - For iOS: Download the `.plist` file
   - For Android: Download the `google-services.json` file

5. **Install Required Packages**
   ```bash
   npm install @react-native-google-signin/google-signin
   # or
   yarn add @react-native-google-signin/google-signin
   ```

6. **Configure in Your App**
   ```javascript
   import { GoogleSignin } from '@react-native-google-signin/google-signin';

   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
     offlineAccess: true,
   });
   ```

---

## Apple Sign In Setup

### Prerequisites
- Apple Developer account
- App ID with Sign In with Apple capability

### Steps:

1. **Enable Sign In with Apple Capability**
   - Go to [developer.apple.com](https://developer.apple.com)
   - Navigate to "Certificates, Identifiers & Profiles"
   - Select your App ID
   - Enable "Sign In with Apple" capability
   - Save changes

2. **Create Service ID (for Web/Android)**
   - Go to "Identifiers" > "+"
   - Select "Services IDs"
   - Enter description and identifier
   - Enable "Sign In with Apple"
   - Configure domains and redirect URLs

3. **Generate Private Key**
   - Go to "Keys" > "+"
   - Name your key
   - Enable "Sign In with Apple"
   - Download the private key file (.p8)

4. **Install Required Packages**
   ```bash
   npm install @invertase/react-native-apple-authentication
   # or
   yarn add @invertase/react-native-apple-authentication
   ```

5. **iOS Configuration**
   - Add capability in Xcode:
     - Open project in Xcode
     - Select your target
     - Go to "Signing & Capabilities"
     - Click "+" and add "Sign In with Apple"

6. **Implementation Example**
   ```javascript
   import { appleAuth } from '@invertase/react-native-apple-authentication';

   const onAppleButtonPress = async () => {
     const appleAuthRequestResponse = await appleAuth.performRequest({
       requestedOperation: appleAuth.Operation.LOGIN,
       requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
     });

     const credentialState = await appleAuth.getCredentialStateForUser(
       appleAuthRequestResponse.user
     );

     if (credentialState === appleAuth.State.AUTHORIZED) {
       // User is authenticated
     }
   };
   ```

---

## Environment Variables

Create a `.env` file in your project root:

```env
# Google OAuth
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id

# Apple Sign In
APPLE_SERVICE_ID=your_apple_service_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
```

---

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for sensitive data
3. **Implement proper token storage** using secure storage solutions
4. **Validate tokens** on your backend server
5. **Handle errors gracefully** and provide user feedback
6. **Test on real devices** as OAuth may not work properly in simulators

---

## Testing

1. **iOS Simulator**: Apple Sign In works, Google Sign In may have issues
2. **Android Emulator**: Both should work with proper configuration
3. **Physical Devices**: Recommended for production testing

---

## Common Issues

### Google Sign In
- **Error 10**: Wrong SHA-1 fingerprint
- **Error 12500**: Configuration issue
- **Error 12501**: User cancelled sign in

### Apple Sign In
- **1000**: Unknown error
- **1001**: User cancelled
- **1002**: Invalid response
- **1003**: Not authorized

---

## Support Links

- [Google Sign In Documentation](https://github.com/react-native-google-signin/google-signin)
- [Apple Sign In Documentation](https://github.com/invertase/react-native-apple-authentication)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)