// src/services/DeepLinkHandler.tsx
// IRANVERSE Enterprise Deep Link Handler - Email Verification System
// Tesla-inspired deep link processing with Enterprise Security
// Built for 90M users - Secure Token Verification & Navigation
import { useEffect, useCallback, useRef } from 'react';
import { Platform, Linking, AppState, AppStateStatus } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { NavigationProp } from '@react-navigation/native';

// ========================================================================================
// NAVIGATION TYPES - ENTERPRISE STACK DEFINITION
// ========================================================================================

// Extended RootStackParamList with proper parameter typing
export type RootStackParamList = {
  AuthWelcome: undefined;
  Login: undefined;
  Signup: undefined;
  EmailSent: { email: string };
  AuthComplete: { userId: string; email: string; userName: string };
  VerificationError: { 
    error: string; 
    email?: string; 
    canRetry: boolean 
  };
  ForgotPassword: { 
    token?: string; 
    email?: string 
  };
  AvatarCreation: { 
    userId: string; 
    email: string; 
    userName: string; 
    accessToken: string 
  };
  OnboardingComplete: { userId: string };
  Home: { 
    userId: string; 
    isNewUser?: boolean 
  };
};

// ========================================================================================
// DEEP LINK TYPES & INTERFACES - ENTERPRISE SECURITY
// ========================================================================================

export interface DeepLinkHandlerProps {
  navigation: NavigationProp<RootStackParamList>;
}

export interface VerificationToken {
  token: string;
  type: 'email-verification' | 'password-reset' | 'magic-link';
  userId?: string;
  email?: string;
  expiresAt?: string;
}

export interface VerificationResponse {
  success: boolean;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  email?: string;
  userName?: string;
  error?: string;
  errorCode?: string;
}

// ========================================================================================
// DEEP LINK CONFIGURATION - ENTERPRISE PATTERNS
// ========================================================================================

const DEEP_LINK_CONFIG = {
  scheme: 'iranverse',
  paths: {
    emailVerification: 'verify-email',
    passwordReset: 'reset-password',
    magicLink: 'magic-login',
  },
  timeouts: {
    verification: 30000, // 30 seconds timeout
    retry: 3000, // 3 seconds between retries
  },
} as const;

// ========================================================================================
// DEEP LINK HANDLER IMPLEMENTATION - REVOLUTIONARY VERIFICATION
// ========================================================================================

export const useDeepLinkHandler = ({ navigation }: DeepLinkHandlerProps) => {
  const processingRef = useRef<Set<string>>(new Set());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  
  // ========================================================================================
  // TOKEN VERIFICATION API - ENTERPRISE SECURITY
  // ========================================================================================
  
  const verifyEmailToken = useCallback(async (token: string): Promise<VerificationResponse> => {
    try {
      // Prevent duplicate processing
      if (processingRef.current.has(token)) {
        return { success: false, error: 'Token already being processed' };
      }
      
      processingRef.current.add(token);
      
      // Enterprise timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, DEEP_LINK_CONFIG.timeouts.verification);
      
      // Call backend verification endpoint
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'https://api.iranverse.com'}/auth/verify-email?token=${encodeURIComponent(token)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `IRANVERSE-Mobile/${Platform.OS}`,
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || 'Verification failed',
          errorCode: errorData.code || 'VERIFICATION_FAILED',
        };
      }
      
      const data = await response.json();
      
      return {
        success: true,
        userId: data.userId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        email: data.email,
        userName: data.userName || data.name,
      };
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Verification timeout', errorCode: 'TIMEOUT' };
      }
      
      return {
        success: false,
        error: 'Network error during verification',
        errorCode: 'NETWORK_ERROR',
      };
    } finally {
      processingRef.current.delete(token);
    }
  }, []);
  
  // ========================================================================================
  // DEEP LINK PROCESSING - ENTERPRISE FLOW CONTROL
  // ========================================================================================
  
  const processDeepLink = useCallback(async (url: string) => {
    try {
      // Parse the deep link URL
      const parsed = ExpoLinking.parse(url);
      
      // Validate scheme
      if (parsed.scheme !== DEEP_LINK_CONFIG.scheme) {
        console.warn('Invalid deep link scheme:', parsed.scheme);
        return;
      }
      
      // Extract path and query parameters
      const path = parsed.path;
      const queryParams = parsed.queryParams || {};
      
      // Handle email verification deep links
      if (path === DEEP_LINK_CONFIG.paths.emailVerification) {
        const token = queryParams.token as string;
        
        if (!token) {
          navigation.navigate('VerificationError', {
            error: 'Invalid verification link',
            canRetry: false,
          });
          return;
        }
        
        // Verify the token
        const result = await verifyEmailToken(token);
        
        if (result.success && result.userId && result.accessToken) {
          // Store tokens securely (implement your secure storage here)
          // await SecureStore.setItemAsync('accessToken', result.accessToken);
          // await SecureStore.setItemAsync('refreshToken', result.refreshToken);
          
          // Navigate to avatar creation
          navigation.navigate('AvatarCreation', {
            userId: result.userId,
            email: result.email || '',
            userName: result.userName || '',
            accessToken: result.accessToken,
          });
        } else {
          // Handle verification failure
          navigation.navigate('VerificationError', {
            error: result.error || 'Email verification failed',
            email: result.email,
            canRetry: result.errorCode !== 'TOKEN_EXPIRED',
          });
        }
      }
      
      // Handle password reset deep links
      else if (path === DEEP_LINK_CONFIG.paths.passwordReset) {
        const token = queryParams.token as string;
        const email = queryParams.email as string;
        
        if (!token) {
          navigation.navigate('VerificationError', {
            error: 'Invalid password reset link',
            canRetry: false,
          });
          return;
        }
        
        // Navigate to password reset screen with token - FIXED TYPING
        navigation.navigate('ForgotPassword', { 
          token, 
          email: email || undefined 
        });
      }
      
      // Handle magic link login
      else if (path === DEEP_LINK_CONFIG.paths.magicLink) {
        const token = queryParams.token as string;
        
        if (!token) {
          navigation.navigate('VerificationError', {
            error: 'Invalid magic link',
            canRetry: false,
          });
          return;
        }
        
        // Process magic link login
        const result = await verifyEmailToken(token);
        
        if (result.success && result.userId) {
          // Navigate directly to home for existing users
          navigation.navigate('Home', {
            userId: result.userId,
            isNewUser: false,
          });
        } else {
          navigation.navigate('VerificationError', {
            error: result.error || 'Magic link login failed',
            canRetry: true,
          });
        }
      }
      
      else {
        console.warn('Unknown deep link path:', path);
      }
      
    } catch (error) {
      console.error('Error processing deep link:', error);
      navigation.navigate('VerificationError', {
        error: 'Failed to process verification link',
        canRetry: true,
      });
    }
  }, [navigation, verifyEmailToken]);
  
  // ========================================================================================
  // DEEP LINK LISTENERS - ENTERPRISE EVENT HANDLING
  // ========================================================================================
  
  const handleInitialURL = useCallback(async () => {
    try {
      const initialURL = await ExpoLinking.getInitialURL();
      if (initialURL) {
        processDeepLink(initialURL);
      }
    } catch (error) {
      console.error('Error getting initial URL:', error);
    }
  }, [processDeepLink]);
  
  const handleIncomingLink = useCallback((event: { url: string }) => {
    if (event.url) {
      processDeepLink(event.url);
    }
  }, [processDeepLink]);
  
  // ========================================================================================
  // APP STATE HANDLING - ENTERPRISE LIFECYCLE MANAGEMENT
  // ========================================================================================
  
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    // Only process deep links when app becomes active
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // Check for any pending deep links when app becomes active
      handleInitialURL();
    }
    appStateRef.current = nextAppState;
  }, [handleInitialURL]);
  
  // ========================================================================================
  // EFFECT HOOKS - ENTERPRISE LIFECYCLE
  // ========================================================================================
  
  useEffect(() => {
    // Handle initial URL when component mounts
    handleInitialURL();
    
    // Add URL change listener
    const subscription = ExpoLinking.addEventListener('url', handleIncomingLink);
    
    // Add app state change listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Cleanup listeners
    return () => {
      subscription?.remove();
      appStateSubscription?.remove();
      processingRef.current.clear();
    };
  }, [handleInitialURL, handleIncomingLink, handleAppStateChange]);
  
  // ========================================================================================
  // PUBLIC API - ENTERPRISE INTERFACE
  // ========================================================================================
  
  return {
    processDeepLink,
    verifyEmailToken,
    isProcessing: (token: string) => processingRef.current.has(token),
  };
};

// ========================================================================================
// DEEP LINK CONFIGURATION HELPER - EXPO SETUP
// ========================================================================================

export const getDeepLinkConfig = () => ({
  prefixes: [
    ExpoLinking.createURL('/'),
    `${DEEP_LINK_CONFIG.scheme}://`,
  ],
  config: {
    screens: {
      AuthWelcome: 'auth/welcome',
      Login: 'auth/login',
      Signup: 'auth/signup',
      EmailSent: 'auth/email-sent',
      VerificationError: 'auth/error',
      ForgotPassword: 'auth/forgot-password',
      AvatarCreation: 'onboarding/avatar',
      Home: 'home',
    },
  },
});

export default useDeepLinkHandler;