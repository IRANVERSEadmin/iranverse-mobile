// App.tsx - IRANVERSE Enterprise Mobile Platform
// Revolutionary Navigation Architecture with Tesla-inspired Transitions
// Built for 90M users - Enterprise Performance & Type Safety
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

// IRANVERSE Theme System
import { ThemeProvider } from './src/shared/theme/ThemeProvider';
// Startup verification
import { verifyStartup, StartupResult } from './src/core/utils/startupVerification';
// Global error handler
import { errorHandler } from './src/core/utils/errorHandler';

// ========================================================================================
// ENTERPRISE NAVIGATION TYPES - CENTRALIZED TYPE SAFETY
// ========================================================================================

/**
 * IRANVERSE Enterprise Navigation Stack
 * Complete type definitions for all navigation flows
 * Ensures type safety across the entire application
 */
export type RootStackParamList = {
  // ========================================================================================
  // ENTRY POINT SCREENS
  // ========================================================================================
  First: undefined;
  Test: undefined;
  Showcase: undefined;
  GrokShowcase: undefined;
  ButtonTest: undefined;
  
  // ========================================================================================
  // AUTHENTICATION FLOW - ENTERPRISE SECURITY
  // ========================================================================================
  AuthWelcome: undefined;
  
  Login: { 
    email?: string;
    redirectPath?: keyof RootStackParamList;
  };
  
  Signup: undefined;
  
  EmailSent: { 
    email: string; 
    tempUserId: string;
    verificationType: 'signup' | 'password_reset';
  };
  
  VerificationError: {
    error: string;
    email?: string;
    canRetry?: boolean;
    errorCode?: string;
    suggestedAction?: 'retry' | 'contact_support' | 'manual_verification';
  };
  
  ForgotPassword: undefined;
  
  AuthComplete: {
    userId: string;
    email: string;
    userName: string;
    accessToken: string;
    isNewUser: boolean;
    nextAction: 'avatar_creation' | 'home';
    hasAvatar?: boolean;
    avatarUrl?: string;
  };
  
  // ========================================================================================
  // ONBOARDING FLOW - IDENTITY FORMATION
  // ========================================================================================
  AvatarCreation: { 
    userId: string; 
    email: string;
    userName: string;
    accessToken: string;
    isRequired?: boolean;
    skipAllowed?: boolean;
  };
  
  OnboardingComplete: { 
    userId: string;
    email: string;
    userName: string;
    accessToken: string;
    avatarUrl: string;
    onboardingType: 'new_user' | 'avatar_update';
  };
  
  // ========================================================================================
  // LEGAL SCREENS
  // ========================================================================================
  Terms: undefined;
  Privacy: undefined;
  
  // ========================================================================================
  // MAIN APPLICATION SCREENS
  // ========================================================================================
  Home: { 
    userId: string;
    avatarUrl?: string;
    isNewUser?: boolean;
    accessToken?: string;
    userName?: string;
    welcomeMessage?: string;
  };
  
  ThreeDScene: {
    avatarUrl: string;
    userId?: string;
    sceneType?: 'exploration' | 'social' | 'gaming';
    roomId?: string;
  };
  
  // ========================================================================================
  // USER PROFILE & SETTINGS
  // ========================================================================================
  UserProfile: {
    userId: string;
    accessToken: string;
    editMode?: boolean;
  };
  
  // ========================================================================================
  // SOCIAL & COMMUNICATION
  // ========================================================================================
  Messages: {
    userId: string;
    accessToken: string;
    conversationId?: string;
  };
  
  SocialFeed: {
    userId: string;
    accessToken: string;
    feedType?: 'home' | 'trending' | 'following';
  };
  
  CreatePost: {
    userId: string;
    accessToken: string;
    postType?: 'text' | 'image' | 'video' | '3d_content';
    replyTo?: string;
  };
  
  Notifications: {
    userId: string;
    accessToken: string;
    notificationType?: 'all' | 'mentions' | 'system';
  };
};

// ========================================================================================
// SCREENS IMPORTS - ENTERPRISE MODULAR ARCHITECTURE
// ========================================================================================

// Entry Point Screens
import FirstScreen from './src/screens/FirstScreen';
// Test Screens
import TestScreen from './src/screens/test/TestScreen';
import ShowcaseScreen from './src/screens/test/ShowcaseScreen';
import GrokShowcase from './src/screens/test/GrokShowcase';
import ButtonTest from './src/screens/test/ButtonTest';
// Error Boundary
import ErrorBoundary from './src/shared/components/ErrorBoundary';
// Authentication Flow
import AuthWelcomeScreen from './src/features/auth/screens/AuthWelcomeScreen';
import EmailSentScreen from './src/features/auth/screens/EmailSentScreen';
import VerificationErrorScreen from './src/features/auth/screens/VerificationErrorScreen';
import ForgotPasswordScreen from './src/features/auth/screens/ForgotPasswordScreen';
import AuthCompleteScreen from './src/features/auth/screens/AuthCompleteScreen';
import SignupScreen from './src/features/auth/screens/SignUpScreen';
import LoginScreen from './src/features/auth/screens/LoginScreen';
// Onboarding Flow
import AvatarCreationScreen from './src/features/onboarding/screens/AvatarCreationScreen';
import OnboardingCompleteScreen from './src/features/onboarding/screens/OnboardingCompleteScreen';
// Main Application Screens
import HomeScreen from './src/screens/HomeScreen';
import ThreeDSceneScreen from './src/screens/ThreeDSceneScreen';
import TermsScreen from './src/screens/legal/TermsScreen';
import PrivacyScreen from './src/screens/legal/PrivacyScreen';


import { LogBox } from 'react-native';

// Global LogBox configuration - suppresses development warnings
LogBox.ignoreLogs([
  'Style property \'maxHeight\' is not supported by native animated module',
  'Attempting to run JS driven animation on animated node',
  'Animated: `useNativeDriver` was not specified',
  'THREE.WebGLProgram: Program Info Log:',
  '[expo-av]: Expo AV has been deprecated',
  'You attempted to set the key `_animation`',
  'object that is meant to be immutable and has been frozen',
]);

// ========================================================================================
// ENTERPRISE TRANSITION CONFIGURATIONS
// ========================================================================================

/**
 * Tesla-inspired animation configurations
 * Optimized for 90M users with 60fps performance
 */
const TransitionConfigs = {
  // Entry animations - Welcome experience
  entry: {
    gestureEnabled: false,
    animation: 'fade' as const,
    animationDuration: 600,
  },
  
  // Authentication flow - Security-focused smooth transitions
  auth: {
    gestureEnabled: true,
    animation: 'slide_from_right' as const,
    animationDuration: 300,
    animationTypeForReplace: 'push' as const,
  },
  
  // Critical flows - Disable gestures for required steps
  critical: {
    gestureEnabled: false,
    animation: 'slide_from_right' as const,
    animationDuration: 350,
  },
  
  // Modal presentations - Bottom sheet style
  modal: {
    gestureEnabled: true,
    animation: 'slide_from_bottom' as const,
    animationDuration: 300,
    presentation: 'modal' as const,
  },
  
  // Success celebrations - Fade for emphasis
  celebration: {
    gestureEnabled: false,
    animation: 'fade' as const,
    animationDuration: 500,
  },
  
  // Main app - Immersive full-screen transitions
  mainApp: {
    gestureEnabled: false,
    animation: 'fade' as const,
    animationDuration: 600,
  },
} as const;

// ========================================================================================
// NAVIGATION STACK CONFIGURATION - ENTERPRISE TYPE SAFETY
// ========================================================================================

const Stack = createNativeStackNavigator<RootStackParamList>();

// ========================================================================================
// NAVIGATION COMPONENT - ENTERPRISE NAVIGATION STRUCTURE
// ========================================================================================

const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="First" // Start with First screen
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
          animationDuration: 300,
          animationTypeForReplace: 'push',
          presentation: 'card',
          freezeOnBlur: true,
        }}
      >
        {/* CRITICAL FIX: Explicitly typed Stack.Screen components to prevent type inference conflicts */}
        <Stack.Screen 
          name="Test" 
          component={TestScreen}
          options={TransitionConfigs.entry}
        />
        
        <Stack.Screen 
          name="Showcase" 
          component={ShowcaseScreen}
          options={TransitionConfigs.entry}
        />
        
        <Stack.Screen 
          name="GrokShowcase" 
          component={GrokShowcase}
          options={TransitionConfigs.entry}
        />
        
        <Stack.Screen 
          name="ButtonTest" 
          component={ButtonTest}
          options={TransitionConfigs.entry}
        />
        
        <Stack.Screen 
          name="First" 
          component={FirstScreen}
          options={TransitionConfigs.entry}
        />

        <Stack.Screen 
          name="AuthWelcome" 
          component={AuthWelcomeScreen}
          options={{
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 1200, // Extended for smooth transition (Solution 1)
          }}
        />
        
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={TransitionConfigs.auth}
        />
        
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={TransitionConfigs.auth}
        />
        
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={TransitionConfigs.modal}
        />
        
        <Stack.Screen 
          name="EmailSent" 
          component={EmailSentScreen}
          options={TransitionConfigs.critical}
        />
        
        <Stack.Screen 
          name="VerificationError" 
          component={VerificationErrorScreen}
          options={TransitionConfigs.modal}
        />
        
        <Stack.Screen 
          name="AuthComplete" 
          component={AuthCompleteScreen}
          options={TransitionConfigs.celebration}
        />

        <Stack.Screen 
          name="AvatarCreation" 
          component={AvatarCreationScreen}
          options={{
            ...TransitionConfigs.critical,
            animationDuration: 400,
          }}
        />
        
        <Stack.Screen 
          name="OnboardingComplete" 
          component={OnboardingCompleteScreen}
          options={TransitionConfigs.celebration}
        />

        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={TransitionConfigs.mainApp}
        />
        
        <Stack.Screen 
          name="ThreeDScene" 
          component={ThreeDSceneScreen}
          options={{
            ...TransitionConfigs.mainApp,
            animationDuration: 800,
            statusBarStyle: 'light',
            statusBarHidden: false,
          }}
        />
        
        <Stack.Screen 
          name="Terms" 
          component={TermsScreen}
          options={TransitionConfigs.modal}
        />
        
        <Stack.Screen 
          name="Privacy" 
          component={PrivacyScreen}
          options={TransitionConfigs.modal}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ========================================================================================
// MAIN APP COMPONENT - ENTERPRISE THEME & NAVIGATION CONTAINER
// ========================================================================================

export default function App() {
  const [startupResult, setStartupResult] = useState<StartupResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runStartupVerification = async () => {
      try {
        // Initialize global error handler
        errorHandler.initialize({
          metadata: {
            appVersion: '1.0.0',
            platform: 'mobile',
          },
        });
        
        const result = await verifyStartup();
        setStartupResult(result);
        
        // Add a small delay to show the verification process
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Startup verification failed:', error);
        errorHandler.captureError(error as Error, {
          severity: 'critical',
          context: { phase: 'startup' },
        });
        setStartupResult({
          success: false,
          failedChecks: ['Startup verification system failed'],
          warnings: [],
          timestamp: Date.now(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    runStartupVerification();
  }, []);

  // Loading screen during startup verification
  if (isLoading) {
    return (
      <View style={startupStyles.loadingContainer}>
        <Text style={startupStyles.loadingTitle}>IRANVERSE</Text>
        <Text style={startupStyles.loadingSubtitle}>Initializing enterprise systems...</Text>
      </View>
    );
  }

  // Critical startup failure
  if (startupResult && !startupResult.success) {
    return (
      <View style={startupStyles.errorContainer}>
        <Text style={startupStyles.errorTitle}>Startup Failed</Text>
        <Text style={startupStyles.errorMessage}>
          Critical system components failed to initialize:
        </Text>
        {startupResult.failedChecks.map((check, index) => (
          <Text key={index} style={startupStyles.errorItem}>
            • {check}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        {/* Status Bar Configuration - Enterprise Branding */}
        <StatusBar 
          style="light" 
          backgroundColor="transparent" 
          translucent 
          hidden={false}
        />
        
        {/* Navigation Structure */}
        <ErrorBoundary>
          <AppNavigation />
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Startup styles
const startupStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 16,
    letterSpacing: 2,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorItem: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
});

// ========================================================================================
// ENTERPRISE EXPORTS - TYPE SAFETY ACROSS APPLICATION
// ========================================================================================

/**
 * Navigation helper types for screen components
 */
export type NavigationProp = import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList>;
export type RouteProp<T extends keyof RootStackParamList> = import('@react-navigation/native').RouteProp<RootStackParamList, T>;

/**
 * Screen component type helpers
 */
export type ScreenComponent<T extends keyof RootStackParamList> = React.ComponentType<{
  navigation: import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList, T>;
  route: import('@react-navigation/native').RouteProp<RootStackParamList, T>;
}>;

// ========================================================================================
// DEVELOPMENT & DEBUGGING EXPORTS
// ========================================================================================

/**
 * Development helper for navigation debugging
 * Remove in production builds
 */
export const NavigationDebugInfo = __DEV__ ? {
  totalScreens: Object.keys({} as RootStackParamList).length,
  authFlowScreens: ['AuthWelcome', 'Login', 'Signup', 'EmailSent', 'VerificationError', 'ForgotPassword', 'AuthComplete'], // ✅ COMPLETE
  onboardingFlowScreens: ['AvatarCreation', 'OnboardingComplete'], // ✅ COMPLETE  
  mainAppScreens: ['Home', 'ThreeDScene'], // ✅ COMPLETE
  entryScreens: ['First', 'Test', 'Showcase', 'GrokShowcase'], // ✅ COMPLETE
  showcaseScreens: ['Showcase', 'GrokShowcase'], // ✅ Component galleries
  implementationStatus: {
    authFlow: 'COMPLETE', // All auth screens implemented
    onboarding: 'COMPLETE', // All onboarding screens implemented
    mainApp: 'COMPLETE', // Core app screens implemented
    socialFeatures: 'PENDING', // Phase 4 features
    loginScreen: 'IMPLEMENTED', // ✅ Complete enterprise login system
    signupScreen: 'IMPLEMENTED', // ✅ Complete with TypeScript fixes
    showcaseScreen: 'IMPLEMENTED', // ✅ Complete UI component showcase
  },
  navigationConfig: 'ENTERPRISE_OPTIMIZED', // Dynamic screen mapping
} : null;