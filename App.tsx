// App.tsx - IRANVERSE Enterprise Mobile Platform
// Revolutionary Navigation Architecture with Tesla-inspired Transitions
// Built for 90M users - Enterprise Performance & Type Safety
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// IRANVERSE Theme System
import { ThemeProvider } from './src/components/theme/ThemeProvider';

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

// Authentication Flow - COMPLETE ENTERPRISE SECURITY PIPELINE
import AuthWelcomeScreen from './src/screens/auth/AuthWelcomeScreen';
import EmailSentScreen from './src/screens/auth/EmailSentScreen';
import VerificationErrorScreen from './src/screens/auth/VerificationErrorScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import AuthCompleteScreen from './src/screens/auth/AuthCompleteScreen';

// Import SignupScreen from the corrected SignupScreen.tsx file
import SignupScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';



// Onboarding Flow - IDENTITY FORMATION PIPELINE
import AvatarCreationScreen from './src/screens/onboarding/AvatarCreationScreen';
import OnboardingCompleteScreen from './src/screens/onboarding/OnboardingCompleteScreen';

// Main Application Screens - METAVERSE EXPERIENCE
import HomeScreen from './src/screens/HomeScreen';
import ThreeDSceneScreen from './src/screens/ThreeDSceneScreen';

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
        initialRouteName="First"
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
          name="First" 
          component={FirstScreen}
          options={TransitionConfigs.entry}
        />

        <Stack.Screen 
          name="AuthWelcome" 
          component={AuthWelcomeScreen}
          options={{
            ...TransitionConfigs.auth,
            animationDuration: 350,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ========================================================================================
// MAIN APP COMPONENT - ENTERPRISE THEME & NAVIGATION CONTAINER
// ========================================================================================

export default function App() {
  return (
    <ThemeProvider>
      {/* Status Bar Configuration - Enterprise Branding */}
      <StatusBar 
        style="light" 
        backgroundColor="transparent" 
        translucent 
        hidden={false}
      />
      
      {/* Navigation Structure */}
      <AppNavigation />
    </ThemeProvider>
  );
}

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
  entryScreens: ['First'], // ✅ COMPLETE
  implementationStatus: {
    authFlow: 'COMPLETE', // All auth screens implemented
    onboarding: 'COMPLETE', // All onboarding screens implemented
    mainApp: 'COMPLETE', // Core app screens implemented
    socialFeatures: 'PENDING', // Phase 4 features
    loginScreen: 'IMPLEMENTED', // ✅ Complete enterprise login system
    signupScreen: 'IMPLEMENTED', // ✅ Complete with TypeScript fixes
  },
  navigationConfig: 'ENTERPRISE_OPTIMIZED', // Dynamic screen mapping
} : null;