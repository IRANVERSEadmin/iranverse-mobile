// src/constants/config.ts
// IRANVERSE Enterprise Configuration Management
// Centralized configuration for scalable architecture
// Built for 90M users - Environment-Aware + Feature Flags
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ========================================================================================
// ENVIRONMENT DETECTION - ENTERPRISE DEPLOYMENT
// ========================================================================================

/**
 * Current build mode detection
 * Determines runtime environment for configuration switching
 */
export const BUILD_MODE = __DEV__ ? 'development' : 'production';

/**
 * Environment detection from Expo configuration
 * Supports development, staging, and production environments
 */
export const ENVIRONMENT = Constants.expoConfig?.extra?.environment || 
  (__DEV__ ? 'development' : 'production');

/**
 * Release channel for OTA updates
 * Fixed: Safely access releaseChannel via manifest or provide fallback
 */
export const RELEASE_CHANNEL = Constants.manifest?.releaseChannel || 
  Constants.manifest2?.runtimeVersion || 'default';

/**
 * App version information
 */
export const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

/**
 * Build number - safely accessed from appropriate manifest location
 * Fixed: Use manifest.revisionId or ios.buildNumber for build identification
 */
export const BUILD_NUMBER = Constants.manifest?.revisionId || 
  Constants.expoConfig?.ios?.buildNumber || 
  Constants.expoConfig?.android?.versionCode?.toString() || '1';

// ========================================================================================
// API CONFIGURATION - MULTI-ENVIRONMENT SUPPORT
// ========================================================================================

/**
 * Environment-specific API endpoints
 * Automatically switches based on build configuration
 */
const API_ENDPOINTS = {
  development: {
    base: 'https://dev-api.iranverse.io',
    cdn: 'https://dev-cdn.iranverse.io',
    websocket: 'wss://dev-ws.iranverse.io',
    iranianCdn: 'https://dev-cdn.iranverse.ir',
  },
  staging: {
    base: 'https://staging-api.iranverse.io',
    cdn: 'https://staging-cdn.iranverse.io',
    websocket: 'wss://staging-ws.iranverse.io',
    iranianCdn: 'https://staging-cdn.iranverse.ir',
  },
  production: {
    base: 'https://api.iranverse.io',
    cdn: 'https://cdn.iranverse.io',
    websocket: 'wss://ws.iranverse.io',
    iranianCdn: 'https://cdn.iranverse.ir',
  },
} as const;

/**
 * Current API configuration based on environment
 */
const currentEndpoints = API_ENDPOINTS[ENVIRONMENT as keyof typeof API_ENDPOINTS] || API_ENDPOINTS.production;

export const API_BASE_URL = currentEndpoints.base;
export const CDN_BASE_URL = currentEndpoints.cdn;
export const WEBSOCKET_URL = currentEndpoints.websocket;
export const IRANIAN_CDN_BASE = currentEndpoints.iranianCdn;

/**
 * API versioning configuration
 */
export const API_VERSION = 'v1';
export const API_FULL_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// ========================================================================================
// READY PLAYER ME CONFIGURATION - 3D AVATAR INTEGRATION
// ========================================================================================

/**
 * Ready Player Me configuration for avatar creation
 */
export const RPM_CONFIG = {
  // Base Configuration
  baseUrl: 'https://creator.readyplayer.me',
  validOrigin: 'https://creator.readyplayer.me',
  
  // Quality Settings
  defaultQuality: 'medium' as const,
  textureAtlas: '512' as const,
  
  // Feature Configuration
  features: {
    quickStart: true,
    clearCache: false,
    bodyTypeSelection: true,
    facialFeatures: true,
    skinEditor: true,
    hairEditor: true,
    outfitEditor: true,
  },
  
  // Language Support
  defaultLanguage: 'en' as const,
  supportedLanguages: ['en', 'fa'] as const,
  
  // Performance Settings
  messageTimeout: 30000, // 30 seconds
  maxRetries: 3,
  
  // Iranian Context
  iranianAssets: true,
  culturalCustomizations: true,
} as const;

// ========================================================================================
// SECURITY CONFIGURATION - ENTERPRISE GRADE
// ========================================================================================

/**
 * Encryption configuration for secure storage
 */
export const ENCRYPTION_CONFIG = {
  // Algorithm Configuration
  algorithm: 'aes-256-gcm' as const,
  keyDerivation: {
    algorithm: 'pbkdf2' as const,
    iterations: 100000,
    keyLength: 32, // 256 bits
    hashAlgorithm: 'sha512' as const,
  },
  
  // Storage Keys (prefixed for namespace isolation)
  storageKeys: {
    accessToken: '@iranverse:auth:access_token_encrypted',
    refreshToken: '@iranverse:auth:refresh_token_encrypted',
    avatarMetadata: '@iranverse:avatar:metadata_encrypted',
    userProfile: '@iranverse:user:profile_encrypted',
    deviceKey: '@iranverse:security:device_key',
    encryptionSalt: '@iranverse:security:encryption_salt',
  },
  
  // Security Settings
  tokenRefreshBuffer: 5 * 60, // 5 minutes in seconds
  sessionTimeout: 24 * 60 * 60, // 24 hours in seconds
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60, // 15 minutes in seconds
} as const;

/**
 * Deep link configuration for authentication flows
 */
export const DEEP_LINK_CONFIG = {
  scheme: 'iranverse',
  baseUrl: 'iranverse://auth',
  
  // Supported deep link types
  types: {
    emailVerification: 'email-verification',
    passwordReset: 'password-reset',
    magicLink: 'magic-link',
    avatarShare: 'avatar-share',
  },
  
  // URL patterns
  patterns: {
    emailVerification: 'iranverse://auth/verify-email',
    passwordReset: 'iranverse://auth/reset-password',
    magicLink: 'iranverse://auth/magic-link',
    avatarShare: 'iranverse://share/avatar',
  },
} as const;

// ========================================================================================
// PERFORMANCE CONFIGURATION - 90M USER SCALE
// ========================================================================================

/**
 * Network configuration for optimal performance
 */
export const NETWORK_CONFIG = {
  // Timeout Settings
  requestTimeout: 30000, // 30 seconds
  uploadTimeout: 120000, // 2 minutes
  downloadTimeout: 60000, // 1 minute
  
  // Retry Configuration
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryMultiplier: 2, // Exponential backoff
  
  // Connection Settings
  maxConcurrentRequests: 6,
  keepAliveTimeout: 30000,
  
  // Cache Configuration
  cacheSize: 50 * 1024 * 1024, // 50MB
  imageCacheSize: 100 * 1024 * 1024, // 100MB
  cacheTtl: 24 * 60 * 60, // 24 hours
  
  // Iranian Network Optimization
  iranianNetworkOptimization: true,
  domesticCdnPreference: true,
} as const;

/**
 * Avatar processing configuration
 */
export const AVATAR_CONFIG = {
  // Processing Settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxPolygonCount: 50000,
  supportedFormats: ['glb', 'usdz', 'fbx'] as const,
  
  // Quality Levels
  qualityLevels: {
    low: {
      maxPolygons: 10000,
      textureSize: 512,
      compressionLevel: 'high',
    },
    medium: {
      maxPolygons: 25000,
      textureSize: 1024,
      compressionLevel: 'medium',
    },
    high: {
      maxPolygons: 50000,
      textureSize: 2048,
      compressionLevel: 'low',
    },
  },
  
  // Status Polling
  statusPolling: {
    initialDelay: 2000, // 2 seconds
    interval: 4000, // 4 seconds
    maxAttempts: 5,
    timeout: 60000, // 1 minute total
  },
  
  // Fallback Avatars
  fallbackAvatars: {
    male: 'https://cdn.iranverse.io/avatars/defaults/male.glb',
    female: 'https://cdn.iranverse.io/avatars/defaults/female.glb',
    nonBinary: 'https://cdn.iranverse.io/avatars/defaults/non-binary.glb',
  },
} as const;

// ========================================================================================
// DEVICE & PLATFORM CONFIGURATION
// ========================================================================================

/**
 * Platform-specific configuration
 */
export const PLATFORM_CONFIG = {
  // Current Platform
  platform: Platform.OS,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  
  // Version Detection
  osVersion: Platform.Version,
  
  // Feature Support
  features: {
    hapticFeedback: Platform.OS === 'ios',
    biometricAuth: true,
    pushNotifications: true,
    backgroundAppRefresh: Platform.OS === 'ios',
    fileDownload: true,
    deepLinking: true,
  },
  
  // Performance Optimization
  optimization: {
    nativeAnimations: true,
    imageOptimization: true,
    memoryManagement: Platform.OS === 'ios' ? 'automatic' : 'manual',
    garbageCollection: Platform.OS === 'android',
  },
} as const;

/**
 * Device capability detection
 */
export const DEVICE_CONFIG = {
  // Memory Thresholds (in MB)
  memoryThresholds: {
    low: 2048, // 2GB
    medium: 4096, // 4GB
    high: 6144, // 6GB
    ultra: 8192, // 8GB+
  },
  
  // Performance Profiles
  performanceProfiles: {
    low: {
      avatarQuality: 'low',
      animationQuality: 'reduced',
      particleEffects: false,
      shadowQuality: 'off',
      textureQuality: 'low',
    },
    medium: {
      avatarQuality: 'medium',
      animationQuality: 'standard',
      particleEffects: true,
      shadowQuality: 'medium',
      textureQuality: 'medium',
    },
    high: {
      avatarQuality: 'high',
      animationQuality: 'high',
      particleEffects: true,
      shadowQuality: 'high',
      textureQuality: 'high',
    },
  },
} as const;

// ========================================================================================
// LOCALIZATION CONFIGURATION - PERSIAN + INTERNATIONAL
// ========================================================================================

/**
 * Localization configuration for multi-language support
 */
export const LOCALIZATION_CONFIG = {
  // Default Language
  defaultLanguage: 'en' as const,
  fallbackLanguage: 'en' as const,
  
  // Supported Languages
  supportedLanguages: ['en', 'fa'] as const,
  
  // RTL Languages
  rtlLanguages: ['fa'] as const,
  
  // Persian Configuration
  persian: {
    fontFamily: 'IRANSans',
    numeralSystem: 'persian', // Use Persian numerals
    calendar: 'persian', // Jalali calendar support
    dateFormat: 'jYYYY/jMM/jDD',
    timeFormat: 'HH:mm',
  },
  
  // Regional Settings
  regions: {
    iran: {
      currency: 'IRR',
      timezone: 'Asia/Tehran',
      dateFormat: 'jYYYY/jMM/jDD',
      firstDayOfWeek: 6, // Saturday
    },
    international: {
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      firstDayOfWeek: 1, // Monday
    },
  },
} as const;

// ========================================================================================
// FEATURE FLAGS - ENTERPRISE DEPLOYMENT CONTROL
// ========================================================================================

/**
 * Feature flags for gradual rollout and A/B testing
 */
export const FEATURE_FLAGS = {
  // Authentication Features
  oauthEnabled: false, // Google/Apple OAuth
  magicLinkLogin: false, // Passwordless login
  twoFactorAuth: false, // 2FA support
  biometricAuth: true, // Face ID/Touch ID
  
  // Avatar Features
  avatarCustomization: true, // Enhanced customization
  avatarSharing: false, // Share avatars publicly
  avatarMarketplace: false, // Buy/sell avatar assets
  culturalAssets: true, // Iranian cultural items
  
  // Social Features
  friendsSystem: false, // Add friends
  messaging: false, // Direct messaging
  avatarChat: false, // Avatar-based chat
  groupFeatures: false, // Group creation
  
  // Advanced Features
  arMode: false, // Augmented reality
  vrSupport: false, // Virtual reality
  aiAssistant: false, // AI chat assistant
  voiceCommands: false, // Voice control
  
  // Performance Features
  offlineMode: false, // Offline functionality
  backgroundSync: true, // Background synchronization
  pushNotifications: true, // Push notifications
  analyticsTracking: true, // User analytics
  
  // Regional Features
  iranianPayments: false, // Iranian payment gateways
  persianCalendar: true, // Jalali calendar
  culturalThemes: true, // Iranian cultural themes
  domesticCdn: true, // Use Iranian CDN when available
} as const;

// ========================================================================================
// ANALYTICS CONFIGURATION - USER BEHAVIOR TRACKING
// ========================================================================================

/**
 * Analytics configuration for user behavior tracking
 */
export const ANALYTICS_CONFIG = {
  // Analytics Providers
  providers: {
    firebase: {
      enabled: true,
      projectId: 'iranverse-mobile',
    },
    mixpanel: {
      enabled: false, // Enable for production
      projectToken: '', // Set in environment
    },
    amplitude: {
      enabled: false, // Enable for detailed analytics
      apiKey: '', // Set in environment
    },
  },
  
  // Event Tracking
  events: {
    // Authentication Events
    userSignup: 'user_signup',
    userLogin: 'user_login',
    userLogout: 'user_logout',
    emailVerification: 'email_verification',
    
    // Avatar Events
    avatarCreationStarted: 'avatar_creation_started',
    avatarCreationCompleted: 'avatar_creation_completed',
    avatarUpdated: 'avatar_updated',
    avatarShared: 'avatar_shared',
    
    // Navigation Events
    screenView: 'screen_view',
    navigationEvent: 'navigation_event',
    deepLinkOpened: 'deep_link_opened',
    
    // Performance Events
    appLaunch: 'app_launch',
    crashEvent: 'crash_event',
    performanceMetric: 'performance_metric',
    errorEvent: 'error_event',
  },
  
  // Privacy Settings
  privacy: {
    anonymizeIpAddresses: true,
    respectDoNotTrack: true,
    gdprCompliant: true,
    ccpaCompliant: true,
  },
  
  // Batch Configuration
  batching: {
    enabled: true,
    batchSize: 20,
    flushInterval: 30000, // 30 seconds
    maxBatchAge: 300000, // 5 minutes
  },
} as const;

// ========================================================================================
// DEBUGGING & DEVELOPMENT CONFIGURATION
// ========================================================================================

/**
 * Development and debugging configuration
 */
export const DEBUG_CONFIG = {
  // Logging Configuration
  logging: {
    enabled: __DEV__,
    level: __DEV__ ? 'debug' : 'error',
    logToConsole: __DEV__,
    logToFile: !__DEV__,
    maxLogFileSize: 5 * 1024 * 1024, // 5MB
  },
  
  // Network Debugging
  network: {
    logRequests: __DEV__,
    logResponses: __DEV__,
    logErrors: true,
    mockMode: false, // Enable for testing without backend
  },
  
  // Performance Monitoring
  performance: {
    enabled: true,
    trackScreenRenders: __DEV__,
    trackMemoryUsage: __DEV__,
    trackNetworkUsage: __DEV__,
    slowOperationThreshold: 1000, // 1 second
  },
  
  // Error Reporting
  errorReporting: {
    enabled: !__DEV__,
    crashReporting: true,
    performanceMonitoring: true,
    userFeedback: true,
  },
  
  // Development Tools
  devTools: {
    reactotron: __DEV__ && Platform.OS !== 'web',
    flipper: __DEV__ && Platform.OS !== 'web',
    devMenu: __DEV__,
    hotReload: __DEV__,
  },
} as const;

// ========================================================================================
// ACCESSIBILITY CONFIGURATION - INCLUSIVE DESIGN
// ========================================================================================

/**
 * Accessibility configuration for inclusive user experience
 */
export const ACCESSIBILITY_CONFIG = {
  // WCAG 2.1 Compliance
  wcagLevel: 'AA' as const,
  
  // Screen Reader Support
  screenReader: {
    enabled: true,
    announceScreenChanges: true,
    announceLoadingStates: true,
    customLabels: true,
  },
  
  // Visual Accessibility
  visual: {
    highContrastMode: false, // User preference
    largeTextMode: false, // User preference
    reducedMotion: false, // User preference
    colorBlindSupport: true,
  },
  
  // Motor Accessibility
  motor: {
    extendedTouchTargets: true, // Minimum 44x44pt
    alternativeNavigation: true,
    voiceControl: false, // Future feature
    switchControl: false, // Future feature
  },
  
  // Cognitive Accessibility
  cognitive: {
    simplifiedInterface: false, // User preference
    guidedOnboarding: true,
    confirmationDialogs: true,
    clearErrorMessages: true,
  },
  
  // Language Accessibility
  language: {
    rtlSupport: true,
    simplifiedLanguage: false, // User preference
    translationSupport: true,
    phoneticAids: false, // Fixed: Properly define property instead of shorthand
  },
} as const;

// ========================================================================================
// EXPORT CONFIGURATION OBJECT - CENTRALIZED ACCESS
// ========================================================================================

/**
 * Master configuration object
 * Provides centralized access to all configuration settings
 */
export const CONFIG = {
  // Environment
  environment: ENVIRONMENT,
  buildMode: BUILD_MODE,
  version: APP_VERSION,
  buildNumber: BUILD_NUMBER,
  
  // URLs
  api: {
    base: API_BASE_URL,
    full: API_FULL_URL,
    version: API_VERSION,
    websocket: WEBSOCKET_URL,
  },
  cdn: {
    base: CDN_BASE_URL,
    iranian: IRANIAN_CDN_BASE,
  },
  
  // Features
  rpm: RPM_CONFIG,
  encryption: ENCRYPTION_CONFIG,
  deepLink: DEEP_LINK_CONFIG,
  network: NETWORK_CONFIG,
  avatar: AVATAR_CONFIG,
  platform: PLATFORM_CONFIG,
  device: DEVICE_CONFIG,
  localization: LOCALIZATION_CONFIG,
  features: FEATURE_FLAGS,
  analytics: ANALYTICS_CONFIG,
  debug: DEBUG_CONFIG,
  accessibility: ACCESSIBILITY_CONFIG,
} as const;

// Type export for configuration object
export type ConfigType = typeof CONFIG;

export default CONFIG;