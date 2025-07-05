// App.tsx - IRANVERSE Enterprise Authentication System
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/hooks/useLanguage';

// Screens
import FirstScreen from './src/screens/FirstScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import PasswordResetScreen from './src/screens/PasswordResetScreen';
import HomeScreen from './src/screens/HomeScreen';
import AvatarCreationScreen from './src/screens/AvatarCreationScreen';

// Navigation Types
export type RootStackParamList = {
  First: undefined;
  SignUp: undefined;
  Login: undefined;
  EmailVerification: {
    email: string;
    token?: string;
  };
  PasswordReset: {
    token?: string;
    email?: string;
  };
  AvatarCreation: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="First"
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              animation: 'slide_from_right',
            }}
          >
            {/* Authentication Flow */}
            <Stack.Screen 
              name="First" 
              component={FirstScreen}
              options={{
                gestureEnabled: false, // Prevent back gesture on entry screen
              }}
            />
            
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            
            <Stack.Screen 
              name="EmailVerification" 
              component={EmailVerificationScreen}
              options={{
                gestureEnabled: false, // Prevent back during verification
              }}
            />
            
            <Stack.Screen 
              name="PasswordReset" 
              component={PasswordResetScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            
            <Stack.Screen 
              name="AvatarCreation" 
              component={AvatarCreationScreen}
              options={{
                gestureEnabled: false, // Avatar creation is mandatory
              }}
            />
            
            {/* Main App Flow */}
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                gestureEnabled: false, // Prevent back gesture from main app
                animation: 'fade',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>
  );
}