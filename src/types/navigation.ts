// src/types/navigation.ts
// IRANVERSE Enterprise Navigation Types
// Complete type safety for React Navigation with enterprise routing
// Built for 90M users - Deep Links + Complex Navigation Flows
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// ========================================================================================
// ROOT NAVIGATION STRUCTURE - ENTERPRISE ARCHITECTURE
// ========================================================================================

/**
 * Complete application navigation structure
 * Defines all possible navigation states and parameters
 */
export type RootStackParamList = {
  // ========================================================================================
  // ENTRY POINT SCREENS - FIRST EXPERIENCE
  // ========================================================================================
  
  /**
   * Initial splash screen with 3D experience
   * Entry point for all users - revolutionary first impression
   */
  First: undefined;
  
  /**
   * Component showcase and testing screen
   * Development tool for UI component validation
   */
  UITest: undefined;
  
  // ========================================================================================
  // AUTHENTICATION STACK - COMPLETE FLOW
  // ========================================================================================
  
  /**
   * Authentication welcome screen
   * Primary entry point for signup/login flows
   */
  AuthWelcome: undefined;
  
  /**
   * User login screen
   * Email/password authentication with optional pre-filled email
   */
  Login: {
    email?: string;
    returnUrl?: string;
    errorMessage?: string;
  };
  
  /**
   * User registration screen
   * Complete signup flow with validation
   */
  Signup: {
    email?: string;
    inviteCode?: string;
    referralSource?: string;
  };
  
  /**
   * Email verification waiting screen
   * Displays after signup, waits for email verification deep link
   */
  EmailSent: {
    email: string;
    tempUserId: string;
    canResend?: boolean;
    expiresAt?: string; // ISO 8601
  };
  
  /**
   * Email verification error screen
   * Handles failed verification attempts with recovery options
   */
  VerificationError: {
    error: string;
    errorCode?: string;
    email?: string;
    canRetry?: boolean;
    suggestedAction?: string;
  };
  
  /**
   * Password reset request screen
   * Initiates password reset flow
   */
  ForgotPassword: {
    email?: string;
    returnUrl?: string;
  };
  
  /**
   * Authentication completion screen
   * Success confirmation and next steps guidance
   */
  AuthComplete: {
    userId: string;
    email: string;
    userName: string;
    accessToken: string;
    isNewUser: boolean;
    nextAction: 'avatar_creation' | 'onboarding' | 'home';
  };
  
  // ========================================================================================
  // ONBOARDING STACK - USER JOURNEY
  // ========================================================================================
  
  /**
   * Avatar creation screen with Ready Player Me integration
   * Mandatory avatar creation for new users
   */
  AvatarCreation: {
    userId: string;
    email: string;
    userName: string;
    accessToken: string;
    skipAvatar?: boolean;
    editMode?: boolean;
    returnUrl?: string;
  };
  
  /**
   * Onboarding completion screen
   * Celebrates successful avatar creation and prepares for main app
   */
  OnboardingComplete: {
    avatarUrl: string;
    avatarId: string;
    userName: string;
    userId: string;
    accessToken: string;
    isFirstTime: boolean;
  };
  
  // ========================================================================================
  // MAIN APPLICATION STACK - CORE FEATURES
  // ========================================================================================
  
  /**
   * Home screen with TalkingHead integration
   * Primary app interface with avatar display
   */
  Home: {
    avatarUrl?: string;
    isNewUser?: boolean;
    userId: string;
    accessToken: string;
    welcomeMessage?: string;
    deepLinkAction?: string;
  };
  
  /**
   * 3D Scene screen with Three.js metaverse
   * Immersive 3D environment with avatar interaction
   */
  ThreeDScene: {
    avatarUrl: string;
    sceneId?: string;
    userId: string;
    accessToken: string;
    enterMode?: 'normal' | 'ar' | 'vr';
    sharedSession?: string;
  };
  
  // ========================================================================================
  // PROFILE & SETTINGS STACK - USER MANAGEMENT
  // ========================================================================================
  
  /**
   * User profile screen
   * Display and edit user information
   */
  Profile: {
    userId?: string; // If viewing another user's profile
    editMode?: boolean;
    tabIndex?: number;
  };
  
  /**
   * Settings and preferences screen
   * App configuration and user preferences
   */
  Settings: {
    category?: 'account' | 'privacy' | 'notifications' | 'appearance' | 'advanced';
    settingKey?: string;
  };
  
  /**
   * Avatar management screen
   * Edit, update, or recreate avatar
   */
  AvatarManagement: {
    avatarId: string;
    mode: 'view' | 'edit' | 'recreate';
    returnUrl?: string;
  };
  
  // ========================================================================================
  // SOCIAL FEATURES STACK - FUTURE READY
  // ========================================================================================
  
  /**
   * Friends and connections screen
   * Social network features (future implementation)
   */
  Social: {
    tab?: 'friends' | 'discover' | 'activity';
    userId?: string;
  };
  
  /**
   * Chat and messaging screen
   * Direct messaging with avatar integration (future implementation)
   */
  Chat: {
    conversationId?: string;
    userId?: string;
    isGroup?: boolean;
  };
  
  // ========================================================================================
  // UTILITY SCREENS - SUPPORTING FEATURES
  // ========================================================================================
  
  /**
   * Error screen for unrecoverable errors
   * Graceful error handling with recovery options
   */
  ErrorScreen: {
    error: string;
    errorCode?: string;
    canRetry?: boolean;
    returnUrl?: string;
    supportContactInfo?: boolean;
  };
  
  /**
   * Loading screen for long operations
   * Progress indication for time-consuming tasks
   */
  LoadingScreen: {
    message?: string;
    progress?: number;
    cancellable?: boolean;
    estimatedTime?: number;
  };
  
  /**
   * Web view screen for external content
   * In-app browser for terms, privacy policy, etc.
   */
  WebView: {
    url: string;
    title?: string;
    showHeader?: boolean;
    allowGoBack?: boolean;
    injectedJavaScript?: string;
  };
  
  /**
   * Deep link handler screen
   * Processes incoming deep links and routes appropriately
   */
  DeepLinkHandler: {
    url: string;
    action: string;
    parameters: Record<string, string>;
  };
};

// ========================================================================================
// STACK-SPECIFIC NAVIGATION TYPES
// ========================================================================================

/**
 * Authentication stack navigation parameters
 * Subset of main navigation focused on auth flow
 */
export type AuthStackParamList = Pick<RootStackParamList, 
  | 'AuthWelcome'
  | 'Login' 
  | 'Signup' 
  | 'EmailSent' 
  | 'VerificationError' 
  | 'ForgotPassword' 
  | 'AuthComplete'
>;

/**
 * Onboarding stack navigation parameters
 * Avatar creation and initial setup flow
 */
export type OnboardingStackParamList = Pick<RootStackParamList,
  | 'AvatarCreation'
  | 'OnboardingComplete'
>;

/**
 * Main app stack navigation parameters
 * Primary application features after authentication
 */
export type MainStackParamList = Pick<RootStackParamList,
  | 'Home'
  | 'ThreeDScene'
  | 'Profile'
  | 'Settings'
  | 'AvatarManagement'
  | 'Social'
  | 'Chat'
>;

/**
 * Utility stack navigation parameters
 * Supporting screens and error handling
 */
export type UtilityStackParamList = Pick<RootStackParamList,
  | 'ErrorScreen'
  | 'LoadingScreen'
  | 'WebView'
  | 'DeepLinkHandler'
>;

// ========================================================================================
// SCREEN COMPONENT PROPS - TYPE SAFETY
// ========================================================================================

/**
 * Generic screen props for all navigation screens
 * Provides type-safe navigation and route props
 */
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/**
 * Navigation prop type for use in components
 * Provides type-safe navigation methods
 */
export type NavigationProp<T extends keyof RootStackParamList = keyof RootStackParamList> = 
  ScreenProps<T>['navigation'];

/**
 * Route prop type for use in components
 * Provides type-safe route parameters
 */
export type RouteProp<T extends keyof RootStackParamList> = ScreenProps<T>['route'];

// ========================================================================================
// NAVIGATION STATE TYPES
// ========================================================================================

/**
 * Navigation state tracking for analytics and debugging
 */
export interface NavigationState {
  // Current Navigation
  currentScreen: keyof RootStackParamList;
  currentParams: any;
  
  // Navigation History
  history: NavigationHistoryItem[];
  
  // Stack Information
  stackDepth: number;
  canGoBack: boolean;
  
  // Deep Link Information
  lastDeepLink?: DeepLinkInfo;
  
  // Performance Metrics
  navigationStartTime?: number;
  screenLoadTime?: number;
}

/**
 * Navigation history item for tracking user journey
 */
export interface NavigationHistoryItem {
  screen: keyof RootStackParamList;
  params?: any;
  timestamp: Date;
  action: 'NAVIGATE' | 'REPLACE' | 'GO_BACK' | 'RESET';
  source: 'USER_ACTION' | 'DEEP_LINK' | 'PROGRAMMATIC';
}

/**
 * Deep link information structure
 */
export interface DeepLinkInfo {
  url: string;
  scheme: string;
  host: string;
  path: string;
  queryParams: Record<string, string>;
  action: string;
  timestamp: Date;
  processed: boolean;
}

// ========================================================================================
// NAVIGATION CONTEXT TYPES
// ========================================================================================

/**
 * Navigation context for global navigation state management
 */
export interface NavigationContextValue {
  // Current State
  currentScreen: keyof RootStackParamList | null;
  isNavigating: boolean;
  
  // Navigation Methods
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ) => void;
  replace: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ) => void;
  goBack: () => void;
  reset: (screen: keyof RootStackParamList, params?: any) => void;
  
  // Deep Link Handling
  handleDeepLink: (url: string) => Promise<boolean>;
  
  // Authentication Flow
  navigateToAuth: (screen?: keyof AuthStackParamList, params?: any) => void;
  navigateToMain: (screen?: keyof MainStackParamList, params?: any) => void;
  
  // Utility Methods
  canGoBack: () => boolean;
  getCurrentRoute: () => { name: string; params?: any } | null;
  getNavigationHistory: () => NavigationHistoryItem[];
  
  // Analytics
  trackNavigationEvent: (screen: string, params?: any) => void;
}

// ========================================================================================
// NAVIGATION OPTIONS TYPES
// ========================================================================================

/**
 * Enhanced navigation options for enterprise features
 */
export interface NavigationOptions {
  // Standard Options
  title?: string;
  headerShown?: boolean;
  gestureEnabled?: boolean;
  
  // Animation Options
  animation?: 'slide_from_right' | 'slide_from_left' | 'slide_from_bottom' | 'fade' | 'none';
  animationDuration?: number;
  
  // Enterprise Features
  requiresAuth?: boolean;
  requiredRole?: string[];
  analyticsName?: string;
  
  // Performance Options
  lazy?: boolean;
  preloadTimeout?: number;
  
  // Accessibility Options
  accessibilityLabel?: string;
  screenReaderAnnouncement?: string;
  
  // Persian/RTL Support
  rtlSupport?: boolean;
  persianTitle?: string;
}

// ========================================================================================
// NAVIGATION GUARDS TYPES
// ========================================================================================

/**
 * Navigation guard function type
 * Allows intercepting navigation for authentication, permissions, etc.
 */
export type NavigationGuard = (
  to: keyof RootStackParamList,
  from: keyof RootStackParamList | null,
  params?: any
) => boolean | Promise<boolean>;

/**
 * Authentication guard configuration
 */
export interface AuthGuardConfig {
  // Authentication Requirements
  requiresAuth: boolean;
  requiredRoles?: string[];
  
  // Redirect Configuration
  redirectTo?: keyof RootStackParamList;
  preserveParams?: boolean;
  
  // Error Handling
  onUnauthorized?: (screen: keyof RootStackParamList) => void;
  onForbidden?: (screen: keyof RootStackParamList, requiredRoles: string[]) => void;
}

// ========================================================================================
// ROUTING HELPER TYPES
// ========================================================================================

/**
 * Route configuration for navigation setup
 */
export interface RouteConfig {
  name: keyof RootStackParamList;
  component: React.ComponentType<any>;
  options?: NavigationOptions;
  guards?: NavigationGuard[];
  initialParams?: any;
}

/**
 * Stack configuration for nested navigators
 */
export interface StackConfig {
  name: string;
  routes: RouteConfig[];
  initialRouteName?: string;
  screenOptions?: NavigationOptions;
  guards?: NavigationGuard[];
}

// ========================================================================================
// EXPORT TYPES FOR EXTERNAL USE
// ========================================================================================

export default RootStackParamList;