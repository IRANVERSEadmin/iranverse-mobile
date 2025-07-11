// src/constants/routes.ts
// IRANVERSE Enterprise Navigation Routes
// Centralized route management with type safety and navigation guards
// Built for 90M users - Deep Links + Analytics + Permissions
import { RootStackParamList } from '../types/navigation';

// ========================================================================================
// ROUTE CONSTANTS - TYPE-SAFE NAVIGATION
// ========================================================================================

/**
 * Application route constants for type-safe navigation
 * Centralized route management with consistent naming
 */
export const ROUTES = {
  // Entry Point Routes
  FIRST: 'First' as keyof RootStackParamList,
  UI_TEST: 'UITest' as keyof RootStackParamList,
  
  // Authentication Routes
  AUTH_WELCOME: 'AuthWelcome' as keyof RootStackParamList,
  LOGIN: 'Login' as keyof RootStackParamList,
  SIGNUP: 'Signup' as keyof RootStackParamList,
  EMAIL_SENT: 'EmailSent' as keyof RootStackParamList,
  VERIFICATION_ERROR: 'VerificationError' as keyof RootStackParamList,
  FORGOT_PASSWORD: 'ForgotPassword' as keyof RootStackParamList,
  AUTH_COMPLETE: 'AuthComplete' as keyof RootStackParamList,
  
  // Onboarding Routes
  AVATAR_CREATION: 'AvatarCreation' as keyof RootStackParamList,
  ONBOARDING_COMPLETE: 'OnboardingComplete' as keyof RootStackParamList,
  
  // Main Application Routes
  HOME: 'Home' as keyof RootStackParamList,
  THREE_D_SCENE: 'ThreeDScene' as keyof RootStackParamList,
  PROFILE: 'Profile' as keyof RootStackParamList,
  SETTINGS: 'Settings' as keyof RootStackParamList,
  AVATAR_MANAGEMENT: 'AvatarManagement' as keyof RootStackParamList,
  SOCIAL: 'Social' as keyof RootStackParamList,
  CHAT: 'Chat' as keyof RootStackParamList,
  
  // Utility Routes
  ERROR_SCREEN: 'ErrorScreen' as keyof RootStackParamList,
  LOADING_SCREEN: 'LoadingScreen' as keyof RootStackParamList,
  WEB_VIEW: 'WebView' as keyof RootStackParamList,
  DEEP_LINK_HANDLER: 'DeepLinkHandler' as keyof RootStackParamList,
} as const;

// ========================================================================================
// ROUTE GROUPS - LOGICAL ORGANIZATION
// ========================================================================================

/**
 * Authentication flow routes
 */
export const AUTH_ROUTES = [
  ROUTES.AUTH_WELCOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.EMAIL_SENT,
  ROUTES.VERIFICATION_ERROR,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.AUTH_COMPLETE,
] as const;

/**
 * Onboarding flow routes
 */
export const ONBOARDING_ROUTES = [
  ROUTES.AVATAR_CREATION,
  ROUTES.ONBOARDING_COMPLETE,
] as const;

/**
 * Main application routes (require authentication)
 */
export const MAIN_APP_ROUTES = [
  ROUTES.HOME,
  ROUTES.THREE_D_SCENE,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
  ROUTES.AVATAR_MANAGEMENT,
  ROUTES.SOCIAL,
  ROUTES.CHAT,
] as const;

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = [
  ROUTES.FIRST,
  ROUTES.UI_TEST,
  ROUTES.AUTH_WELCOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.ERROR_SCREEN,
  ROUTES.WEB_VIEW,
  ROUTES.DEEP_LINK_HANDLER,
] as const;

/**
 * Routes that require completed onboarding
 */
export const ONBOARDING_REQUIRED_ROUTES = [
  ROUTES.HOME,
  ROUTES.THREE_D_SCENE,
  ROUTES.SOCIAL,
  ROUTES.CHAT,
] as const;

/**
 * Routes that require avatar creation
 */
export const AVATAR_REQUIRED_ROUTES = [
  ROUTES.THREE_D_SCENE,
  ROUTES.AVATAR_MANAGEMENT,
] as const;

// ========================================================================================
// ROUTE METADATA - ENHANCED NAVIGATION INFORMATION
// ========================================================================================

/**
 * Route metadata for analytics, permissions, and navigation behavior
 */
export interface RouteMetadata {
  // Basic Information
  name: string;
  title: string;
  persianTitle?: string;
  
  // Navigation Behavior
  requiresAuth: boolean;
  requiresOnboarding: boolean;
  requiresAvatar: boolean;
  allowsBackNavigation: boolean;
  
  // Analytics
  analyticsName: string;
  trackScreenView: boolean;
  
  // Permissions
  requiredRoles?: string[];
  requiredPermissions?: string[];
  
  // UI Behavior
  showHeader: boolean;
  showTabBar: boolean;
  orientation?: 'portrait' | 'landscape' | 'any';
  
  // Deep Link Support
  deepLinkEnabled: boolean;
  deepLinkPattern?: string;
  
  // Performance
  preloadable: boolean;
  cacheable: boolean;
}

/**
 * Complete route metadata configuration
 */
export const ROUTE_METADATA: Record<keyof RootStackParamList, RouteMetadata> = {
  // Entry Point Routes
  First: {
    name: 'First',
    title: 'IRANVERSE',
    persianTitle: 'ایرانورس',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: false,
    analyticsName: 'first_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    orientation: 'any',
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  UITest: {
    name: 'UITest',
    title: 'UI Component Test',
    persianTitle: 'تست کامپوننت‌های رابط کاربری',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'ui_test_screen',
    trackScreenView: true,
    showHeader: true,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  // Authentication Routes
  AuthWelcome: {
    name: 'AuthWelcome',
    title: 'Welcome to IRANVERSE',
    persianTitle: 'به ایرانورس خوش آمدید',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'auth_welcome',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: true,
    cacheable: false,
  },
  
  Login: {
    name: 'Login',
    title: 'Sign In',
    persianTitle: 'ورود',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'login_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://auth/login',
    preloadable: true,
    cacheable: false,
  },
  
  Signup: {
    name: 'Signup',
    title: 'Create Account',
    persianTitle: 'ایجاد حساب کاربری',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'signup_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://auth/signup',
    preloadable: true,
    cacheable: false,
  },
  
  EmailSent: {
    name: 'EmailSent',
    title: 'Check Your Email',
    persianTitle: 'ایمیل خود را بررسی کنید',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: false,
    analyticsName: 'email_sent_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  VerificationError: {
    name: 'VerificationError',
    title: 'Verification Error',
    persianTitle: 'خطا در تأیید',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'verification_error_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  ForgotPassword: {
    name: 'ForgotPassword',
    title: 'Reset Password',
    persianTitle: 'بازیابی رمز عبور',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'forgot_password_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://auth/reset-password',
    preloadable: true,
    cacheable: false,
  },
  
  AuthComplete: {
    name: 'AuthComplete',
    title: 'Welcome!',
    persianTitle: 'خوش آمدید!',
    requiresAuth: true,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: false,
    analyticsName: 'auth_complete_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  // Onboarding Routes
  AvatarCreation: {
    name: 'AvatarCreation',
    title: 'Create Your Avatar',
    persianTitle: 'آواتار خود را بسازید',
    requiresAuth: true,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: false,
    analyticsName: 'avatar_creation_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    orientation: 'portrait',
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  OnboardingComplete: {
    name: 'OnboardingComplete',
    title: 'Ready to Explore!',
    persianTitle: 'آماده کاوش!',
    requiresAuth: true,
    requiresOnboarding: false,
    requiresAvatar: true,
    allowsBackNavigation: false,
    analyticsName: 'onboarding_complete_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  // Main Application Routes
  Home: {
    name: 'Home',
    title: 'Home',
    persianTitle: 'خانه',
    requiresAuth: true,
    requiresOnboarding: true,
    requiresAvatar: true,
    allowsBackNavigation: false,
    analyticsName: 'home_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: true,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://home',
    preloadable: true,
    cacheable: true,
  },
  
  ThreeDScene: {
    name: 'ThreeDScene',
    title: '3D World',
    persianTitle: 'دنیای سه‌بعدی',
    requiresAuth: true,
    requiresOnboarding: true,
    requiresAvatar: true,
    allowsBackNavigation: true,
    analyticsName: 'three_d_scene_screen',
    trackScreenView: true,
    showHeader: false,
    showTabBar: false,
    orientation: 'landscape',
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://3d',
    preloadable: true,
    cacheable: false,
  },
  
  Profile: {
    name: 'Profile',
    title: 'Profile',
    persianTitle: 'پروفایل',
    requiresAuth: true,
    requiresOnboarding: true,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'profile_screen',
    trackScreenView: true,
    showHeader: true,
    showTabBar: true,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://profile',
    preloadable: true,
    cacheable: true,
  },
  
  Settings: {
    name: 'Settings',
    title: 'Settings',
    persianTitle: 'تنظیمات',
    requiresAuth: true,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'settings_screen',
    trackScreenView: true,
    showHeader: true,
    showTabBar: false,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://settings',
    preloadable: true,
    cacheable: true,
  },
  
  AvatarManagement: {
    name: 'AvatarManagement',
    title: 'Avatar Settings',
    persianTitle: 'تنظیمات آواتار',
    requiresAuth: true,
    requiresOnboarding: true,
    requiresAvatar: true,
    allowsBackNavigation: true,
    analyticsName: 'avatar_management_screen',
    trackScreenView: true,
    showHeader: true,
    showTabBar: false,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://avatar',
    preloadable: true,
    cacheable: false,
  },
  
  Social: {
    name: 'Social',
    title: 'Social',
    persianTitle: 'اجتماعی',
    requiresAuth: true,
    requiresOnboarding: true,
    requiresAvatar: true,
    allowsBackNavigation: true,
    analyticsName: 'social_screen',
    trackScreenView: true,
    showHeader: true,
    showTabBar: true,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://social',
    preloadable: true,
    cacheable: true,
  },
  
  Chat: {
    name: 'Chat',
    title: 'Chat',
    persianTitle: 'گفتگو',
    requiresAuth: true,
    requiresOnboarding: true,
    requiresAvatar: true,
    allowsBackNavigation: true,
    analyticsName: 'chat_screen',
    trackScreenView: true,
    showHeader: true,
    showTabBar: false,
    deepLinkEnabled: true,
    deepLinkPattern: 'iranverse://chat',
    preloadable: true,
    cacheable: false,
  },
  
  // Utility Routes
  ErrorScreen: {
    name: 'ErrorScreen',
    title: 'Error',
    persianTitle: 'خطا',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'error_screen',
    trackScreenView: true,
    showHeader: true,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  LoadingScreen: {
    name: 'LoadingScreen',
    title: 'Loading',
    persianTitle: 'در حال بارگذاری',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: false,
    analyticsName: 'loading_screen',
    trackScreenView: false,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  WebView: {
    name: 'WebView',
    title: 'Web View',
    persianTitle: 'نمایش وب',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: true,
    analyticsName: 'web_view_screen',
    trackScreenView: true,
    showHeader: true,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
  
  DeepLinkHandler: {
    name: 'DeepLinkHandler',
    title: 'Processing Link',
    persianTitle: 'پردازش لینک',
    requiresAuth: false,
    requiresOnboarding: false,
    requiresAvatar: false,
    allowsBackNavigation: false,
    analyticsName: 'deep_link_handler',
    trackScreenView: false,
    showHeader: false,
    showTabBar: false,
    deepLinkEnabled: false,
    preloadable: false,
    cacheable: false,
  },
};

// ========================================================================================
// NAVIGATION FLOWS - PREDEFINED SEQUENCES
// ========================================================================================

/**
 * Complete authentication flow sequence
 */
export const AUTH_FLOW = [
  ROUTES.AUTH_WELCOME,
  ROUTES.SIGNUP,
  ROUTES.EMAIL_SENT,
  ROUTES.AUTH_COMPLETE,
] as const;

/**
 * Complete onboarding flow sequence
 */
export const ONBOARDING_FLOW = [
  ROUTES.AVATAR_CREATION,
  ROUTES.ONBOARDING_COMPLETE,
  ROUTES.HOME,
] as const;

/**
 * Login flow sequence
 */
export const LOGIN_FLOW = [
  ROUTES.LOGIN,
  ROUTES.HOME,
] as const;

/**
 * Password reset flow sequence
 */
export const PASSWORD_RESET_FLOW = [
  ROUTES.FORGOT_PASSWORD,
  ROUTES.EMAIL_SENT,
  ROUTES.LOGIN,
] as const;

// ========================================================================================
// ROUTE UTILITIES - HELPER FUNCTIONS
// ========================================================================================

/**
 * Check if route requires authentication
 */
export const requiresAuth = (routeName: keyof RootStackParamList): boolean => {
  return ROUTE_METADATA[routeName]?.requiresAuth || false;
};

/**
 * Check if route requires onboarding completion
 */
export const requiresOnboarding = (routeName: keyof RootStackParamList): boolean => {
  return ROUTE_METADATA[routeName]?.requiresOnboarding || false;
};

/**
 * Check if route requires avatar creation
 */
export const requiresAvatar = (routeName: keyof RootStackParamList): boolean => {
  return ROUTE_METADATA[routeName]?.requiresAvatar || false;
};

/**
 * Check if route allows back navigation
 */
export const allowsBackNavigation = (routeName: keyof RootStackParamList): boolean => {
  return ROUTE_METADATA[routeName]?.allowsBackNavigation !== false;
};

/**
 * Get route title with localization support
 */
export const getRouteTitle = (
  routeName: keyof RootStackParamList,
  language: 'en' | 'fa' = 'en'
): string => {
  const metadata = ROUTE_METADATA[routeName];
  if (!metadata) return routeName;
  
  return language === 'fa' && metadata.persianTitle 
    ? metadata.persianTitle 
    : metadata.title;
};

/**
 * Get analytics name for route
 */
export const getAnalyticsName = (routeName: keyof RootStackParamList): string => {
  return ROUTE_METADATA[routeName]?.analyticsName || routeName.toLowerCase();
};

/**
 * Check if route supports deep linking
 */
export const supportsDeepLink = (routeName: keyof RootStackParamList): boolean => {
  return ROUTE_METADATA[routeName]?.deepLinkEnabled || false;
};

/**
 * Get deep link pattern for route
 */
export const getDeepLinkPattern = (routeName: keyof RootStackParamList): string | undefined => {
  return ROUTE_METADATA[routeName]?.deepLinkPattern;
};

/**
 * Check if route is public (no authentication required)
 */
export const isPublicRoute = (routeName: keyof RootStackParamList): boolean => {
  return PUBLIC_ROUTES.includes(routeName as any);
};

/**
 * Check if route is part of authentication flow
 */
export const isAuthRoute = (routeName: keyof RootStackParamList): boolean => {
  return AUTH_ROUTES.includes(routeName as any);
};

/**
 * Check if route is part of onboarding flow
 */
export const isOnboardingRoute = (routeName: keyof RootStackParamList): boolean => {
  return ONBOARDING_ROUTES.includes(routeName as any);
};

/**
 * Check if route is part of main application
 */
export const isMainAppRoute = (routeName: keyof RootStackParamList): boolean => {
  return MAIN_APP_ROUTES.includes(routeName as any);
};

/**
 * Get next route in a flow
 */
export const getNextRouteInFlow = (
  currentRoute: keyof RootStackParamList,
  flow: readonly (keyof RootStackParamList)[]
): keyof RootStackParamList | null => {
  const currentIndex = flow.indexOf(currentRoute);
  if (currentIndex === -1 || currentIndex === flow.length - 1) {
    return null;
  }
  return flow[currentIndex + 1];
};

/**
 * Get previous route in a flow
 */
export const getPreviousRouteInFlow = (
  currentRoute: keyof RootStackParamList,
  flow: readonly (keyof RootStackParamList)[]
): keyof RootStackParamList | null => {
  const currentIndex = flow.indexOf(currentRoute);
  if (currentIndex <= 0) {
    return null;
  }
  return flow[currentIndex - 1];
};

/**
 * Calculate route completion percentage in a flow
 */
export const getFlowProgress = (
  currentRoute: keyof RootStackParamList,
  flow: readonly (keyof RootStackParamList)[]
): number => {
  const currentIndex = flow.indexOf(currentRoute);
  if (currentIndex === -1) return 0;
  return Math.round(((currentIndex + 1) / flow.length) * 100);
};

// ========================================================================================
// DEEP LINK ROUTING - URL PATTERN MATCHING
// ========================================================================================

/**
 * Deep link route mapping
 */
export const DEEP_LINK_ROUTES = {
  // Authentication Deep Links
  'auth/login': ROUTES.LOGIN,
  'auth/signup': ROUTES.SIGNUP,
  'auth/verify-email': ROUTES.DEEP_LINK_HANDLER,
  'auth/reset-password': ROUTES.FORGOT_PASSWORD,
  'auth/magic-link': ROUTES.DEEP_LINK_HANDLER,
  
  // Main App Deep Links
  'home': ROUTES.HOME,
  '3d': ROUTES.THREE_D_SCENE,
  'profile': ROUTES.PROFILE,
  'settings': ROUTES.SETTINGS,
  'avatar': ROUTES.AVATAR_MANAGEMENT,
  'social': ROUTES.SOCIAL,
  'chat': ROUTES.CHAT,
  
  // Utility Deep Links
  'share/avatar': ROUTES.DEEP_LINK_HANDLER,
} as const;

/**
 * Parse deep link URL to route and parameters
 */
export const parseDeepLink = (url: string): {
  route: keyof RootStackParamList | null;
  params: Record<string, string>;
} => {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.replace('/', '');
    const searchParams = Object.fromEntries(parsedUrl.searchParams.entries());
    
    // Find matching route
    const route = DEEP_LINK_ROUTES[path as keyof typeof DEEP_LINK_ROUTES] || null;
    
    return {
      route,
      params: searchParams,
    };
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return {
      route: null,
      params: {},
    };
  }
};

/**
 * Generate deep link URL for route
 */
export const generateDeepLink = (
  route: keyof RootStackParamList,
  params: Record<string, string> = {}
): string | null => {
  const pattern = getDeepLinkPattern(route);
  if (!pattern) return null;
  
  try {
    const url = new URL(pattern);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  } catch (error) {
    console.error('Failed to generate deep link:', error);
    return null;
  }
};

// ========================================================================================
// NAVIGATION PERMISSIONS - ACCESS CONTROL
// ========================================================================================

/**
 * User permission levels
 */
export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  PREMIUM: 'premium',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

/**
 * Type for user roles
 */
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Route access permissions
 */
export const ROUTE_PERMISSIONS: Record<keyof RootStackParamList, {
  minRole: UserRole;
  requiredPermissions?: string[];
}> = {
  // Public routes (guest access)
  First: { minRole: USER_ROLES.GUEST },
  UITest: { minRole: USER_ROLES.GUEST },
  AuthWelcome: { minRole: USER_ROLES.GUEST },
  Login: { minRole: USER_ROLES.GUEST },
  Signup: { minRole: USER_ROLES.GUEST },
  ForgotPassword: { minRole: USER_ROLES.GUEST },
  ErrorScreen: { minRole: USER_ROLES.GUEST },
  LoadingScreen: { minRole: USER_ROLES.GUEST },
  WebView: { minRole: USER_ROLES.GUEST },
  DeepLinkHandler: { minRole: USER_ROLES.GUEST },
  
  // Authenticated routes (user access)
  EmailSent: { minRole: USER_ROLES.USER },
  VerificationError: { minRole: USER_ROLES.USER },
  AuthComplete: { minRole: USER_ROLES.USER },
  AvatarCreation: { minRole: USER_ROLES.USER },
  OnboardingComplete: { minRole: USER_ROLES.USER },
  Home: { minRole: USER_ROLES.USER },
  ThreeDScene: { minRole: USER_ROLES.USER },
  Profile: { minRole: USER_ROLES.USER },
  Settings: { minRole: USER_ROLES.USER },
  AvatarManagement: { minRole: USER_ROLES.USER },
  
  // Social features (premium or special permissions)
  Social: { 
    minRole: USER_ROLES.USER,
    requiredPermissions: ['social_access']
  },
  Chat: { 
    minRole: USER_ROLES.USER,
    requiredPermissions: ['messaging_access']
  },
};

/**
 * Check if user has permission to access route
 */
export const hasRoutePermission = (
  route: keyof RootStackParamList,
  userRole: UserRole = USER_ROLES.GUEST,
  userPermissions: string[] = []
): boolean => {
  const routePermission = ROUTE_PERMISSIONS[route];
  if (!routePermission) return false;
  
  // Check role hierarchy
  const roleHierarchy: UserRole[] = [
    USER_ROLES.GUEST,
    USER_ROLES.USER,
    USER_ROLES.PREMIUM,
    USER_ROLES.MODERATOR,
    USER_ROLES.ADMIN,
  ];
  
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(routePermission.minRole);
  
  if (userRoleIndex < requiredRoleIndex) {
    return false;
  }
  
  // Check specific permissions
  if (routePermission.requiredPermissions) {
    return routePermission.requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }
  
  return true;
};

// ========================================================================================
// ROUTE ANALYTICS - TRACKING CONFIGURATION
// ========================================================================================

/**
 * Analytics events for route navigation
 */
export const ROUTE_ANALYTICS_EVENTS = {
  SCREEN_VIEW: 'screen_view',
  NAVIGATION_START: 'navigation_start',
  NAVIGATION_COMPLETE: 'navigation_complete',
  NAVIGATION_ERROR: 'navigation_error',
  DEEP_LINK_OPENED: 'deep_link_opened',
  FLOW_STARTED: 'flow_started',
  FLOW_COMPLETED: 'flow_completed',
  FLOW_ABANDONED: 'flow_abandoned',
} as const;

/**
 * Track route navigation event
 */
export const trackRouteEvent = (
  eventType: string,
  routeName: keyof RootStackParamList,
  additionalData: Record<string, any> = {}
) => {
  const metadata = ROUTE_METADATA[routeName];
  
  // Skip tracking if disabled for this route
  if (!metadata?.trackScreenView && eventType === ROUTE_ANALYTICS_EVENTS.SCREEN_VIEW) {
    return;
  }
  
  const eventData = {
    event: eventType,
    screen_name: metadata?.analyticsName || routeName,
    screen_title: metadata?.title || routeName,
    requires_auth: metadata?.requiresAuth || false,
    requires_onboarding: metadata?.requiresOnboarding || false,
    requires_avatar: metadata?.requiresAvatar || false,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };
  
  // Send to analytics service
  // Note: Implementation would depend on chosen analytics provider
  console.log('Analytics Event:', eventData);
};

// ========================================================================================
// ROUTE VALIDATION - NAVIGATION GUARDS
// ========================================================================================

/**
 * Validate navigation to route based on app state
 */
export const validateNavigation = (
  targetRoute: keyof RootStackParamList,
  appState: {
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    hasAvatar: boolean;
    userRole: UserRole;
    userPermissions: string[];
  }
): {
  allowed: boolean;
  redirectTo?: keyof RootStackParamList;
  reason?: string;
} => {
  const metadata = ROUTE_METADATA[targetRoute];
  
  // Check basic permissions
  if (!hasRoutePermission(targetRoute, appState.userRole, appState.userPermissions)) {
    return {
      allowed: false,
      redirectTo: ROUTES.ERROR_SCREEN,
      reason: 'Insufficient permissions',
    };
  }
  
  // Check authentication requirement
  if (metadata.requiresAuth && !appState.isAuthenticated) {
    return {
      allowed: false,
      redirectTo: ROUTES.AUTH_WELCOME,
      reason: 'Authentication required',
    };
  }
  
  // Check onboarding requirement
  if (metadata.requiresOnboarding && !appState.hasCompletedOnboarding) {
    return {
      allowed: false,
      redirectTo: ROUTES.AVATAR_CREATION,
      reason: 'Onboarding required',
    };
  }
  
  // Check avatar requirement
  if (metadata.requiresAvatar && !appState.hasAvatar) {
    return {
      allowed: false,
      redirectTo: ROUTES.AVATAR_CREATION,
      reason: 'Avatar creation required',
    };
  }
  
  return { allowed: true };
};

/**
 * Get appropriate initial route based on app state
 */
export const getInitialRoute = (appState: {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  hasAvatar: boolean;
  isFirstLaunch: boolean;
}): keyof RootStackParamList => {
  // First time user - show splash screen
  if (appState.isFirstLaunch) {
    return ROUTES.FIRST;
  }
  
  // Not authenticated - show auth welcome
  if (!appState.isAuthenticated) {
    return ROUTES.AUTH_WELCOME;
  }
  
  // Authenticated but no avatar - show avatar creation
  if (!appState.hasAvatar) {
    return ROUTES.AVATAR_CREATION;
  }
  
  // Authenticated but haven't completed onboarding
  if (!appState.hasCompletedOnboarding) {
    return ROUTES.ONBOARDING_COMPLETE;
  }
  
  // All requirements met - show home
  return ROUTES.HOME;
};

// ========================================================================================
// EXPORTS - CENTRALIZED ROUTE MANAGEMENT
// ========================================================================================

export default {
  // Core route constants
  ROUTES,
  ROUTE_METADATA,
  
  // Route groups
  AUTH_ROUTES,
  ONBOARDING_ROUTES,
  MAIN_APP_ROUTES,
  PUBLIC_ROUTES,
  
  // Navigation flows
  AUTH_FLOW,
  ONBOARDING_FLOW,
  LOGIN_FLOW,
  PASSWORD_RESET_FLOW,
  
  // Utility functions
  requiresAuth,
  requiresOnboarding,
  requiresAvatar,
  allowsBackNavigation,
  getRouteTitle,
  getAnalyticsName,
  supportsDeepLink,
  getDeepLinkPattern,
  isPublicRoute,
  isAuthRoute,
  isOnboardingRoute,
  isMainAppRoute,
  getNextRouteInFlow,
  getPreviousRouteInFlow,
  getFlowProgress,
  
  // Deep linking
  DEEP_LINK_ROUTES,
  parseDeepLink,
  generateDeepLink,
  
  // Permissions
  USER_ROLES,
  ROUTE_PERMISSIONS,
  hasRoutePermission,
  
  // Analytics
  ROUTE_ANALYTICS_EVENTS,
  trackRouteEvent,
  
  // Validation
  validateNavigation,
  getInitialRoute,
};