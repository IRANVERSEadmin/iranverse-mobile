// src/types/api.ts
// IRANVERSE Enterprise API Types & Contracts
// Complete type safety for all backend communications
// Built for 90M users - RESTful + GraphQL Ready
import { AuthTokens, AuthenticatedUser } from './auth';
import { AvatarState } from './avatar';

// ========================================================================================
// CORE API TYPES - ENTERPRISE HTTP COMMUNICATION
// ========================================================================================

/**
 * Standard API response wrapper for all endpoints
 * Provides consistent response structure across the application
 */
export interface ApiResponse<T = any> {
  // Response Status
  success: boolean;
  message: string;
  
  // Response Data
  data?: T;
  
  // Error Information
  error?: ApiError;
  
  // Metadata
  metadata?: ApiResponseMetadata;
  
  // Pagination (when applicable)
  pagination?: ApiPagination;
  
  // Request Tracking
  requestId: string;
  timestamp: string; // ISO 8601
}

/**
 * API response metadata for debugging and analytics
 */
export interface ApiResponseMetadata {
  // Performance Metrics
  processingTime: number; // milliseconds
  serverTime: string; // ISO 8601
  
  // API Version
  apiVersion: string;
  endpoint: string;
  method: HttpMethod;
  
  // Rate Limiting
  rateLimit?: {
    limit: number;
    remaining: number;
    resetTime: string; // ISO 8601
  };
  
  // Caching Information
  cache?: {
    hit: boolean;
    ttl: number; // seconds
    etag?: string;
  };
  
  // Deprecation Warnings
  deprecated?: boolean;
  deprecationMessage?: string;
  migrationPath?: string;
}

/**
 * Pagination information for list endpoints
 */
export interface ApiPagination {
  // Current Page
  page: number;
  pageSize: number;
  
  // Total Information
  totalItems: number;
  totalPages: number;
  
  // Navigation
  hasNext: boolean;
  hasPrevious: boolean;
  
  // Links
  nextPage?: string;
  previousPage?: string;
  firstPage?: string;
  lastPage?: string;
}

/**
 * HTTP methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  // HTTP Configuration
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  
  // Authentication
  requiresAuth?: boolean;
  authToken?: string;
  
  // Request Body
  data?: any;
  params?: Record<string, any>;
  
  // Timeout & Retry
  timeout?: number; // milliseconds
  retries?: number;
  retryDelay?: number; // milliseconds
  
  // Cache Control
  cache?: boolean;
  cacheTtl?: number; // seconds
  
  // Progress Tracking
  onUploadProgress?: (progress: number) => void;
  onDownloadProgress?: (progress: number) => void;
  
  // Request Metadata
  requestId?: string;
  priority?: 'low' | 'normal' | 'high';
}

// ========================================================================================
// ERROR HANDLING TYPES - ENTERPRISE GRADE
// ========================================================================================

/**
 * Comprehensive API error structure
 */
export interface ApiError {
  // Error Classification
  type: ApiErrorType;
  code: string;
  message: string;
  
  // HTTP Information
  status: number;
  statusText: string;
  
  // Detailed Error Information
  details?: ApiErrorDetails;
  
  // User-Friendly Messaging
  userMessage: string;
  persianMessage?: string;
  
  // Context Information
  endpoint?: string;
  method?: HttpMethod;
  requestId?: string;
  timestamp: string; // ISO 8601
  
  // Recovery Information
  retryable: boolean;
  retryAfter?: number; // seconds
  suggestedAction?: string;
  
  // Validation Errors (when applicable)
  validationErrors?: ValidationError[];
}

/**
 * Detailed error information for debugging
 */
export interface ApiErrorDetails {
  // Request Information
  requestUrl?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  
  // Response Information
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  
  // Network Information
  networkError?: boolean;
  timeout?: boolean;
  
  // Server Information
  serverVersion?: string;
  serverTime?: string;
  
  // Trace Information
  traceId?: string;
  spanId?: string;
}

/**
 * Field-specific validation error
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
  constraint?: string;
}

/**
 * API error types for precise error handling
 */
export type ApiErrorType =
  // Client Errors (4xx)
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  
  // Server Errors (5xx)
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'
  | 'DATABASE_ERROR'
  
  // Network Errors
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CONNECTION_ERROR'
  | 'DNS_ERROR'
  
  // Client-Side Errors
  | 'SERIALIZATION_ERROR'
  | 'DESERIALIZATION_ERROR'
  | 'CACHE_ERROR'
  
  // Unknown/Generic
  | 'UNKNOWN_ERROR';

// ========================================================================================
// AUTHENTICATION API TYPES
// ========================================================================================

/**
 * Login endpoint request
 * POST /auth/login
 */
export interface LoginApiRequest {
  email: string;
  password: string;
  deviceInfo: {
    platform: 'ios' | 'android';
    osVersion: string;
    appVersion: string;
    deviceId: string;
  };
  rememberMe?: boolean;
  captchaToken?: string;
}

/**
 * Login endpoint response
 * POST /auth/login
 */
export interface LoginApiResponse {
  user: AuthenticatedUser;
  tokens: AuthTokens;
  session: {
    sessionId: string;
    deviceId: string;
    expiresAt: string; // ISO 8601
  };
  isNewUser: boolean;
  nextAction: 'avatar_creation' | 'onboarding' | 'home';
}

/**
 * Registration endpoint request
 * POST /auth/register
 */
export interface RegisterApiRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  preferredLanguage: 'en' | 'fa';
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  deviceInfo: {
    platform: 'ios' | 'android';
    osVersion: string;
    appVersion: string;
    deviceId: string;
  };
  captchaToken?: string;
}

/**
 * Registration endpoint response
 * POST /auth/register
 */
export interface RegisterApiResponse {
  user: AuthenticatedUser;
  tokens: AuthTokens;
  session: {
    sessionId: string;
    deviceId: string;
    tempUserId: string; // For email verification
  };
  requiresEmailVerification: boolean;
  nextAction: 'email_verification' | 'avatar_creation';
}

/**
 * Token refresh endpoint request
 * POST /auth/refresh
 */
export interface RefreshTokenApiRequest {
  refreshToken: string;
  deviceId: string;
}

/**
 * Token refresh endpoint response
 * POST /auth/refresh
 */
export interface RefreshTokenApiResponse {
  tokens: AuthTokens;
  user?: Partial<AuthenticatedUser>; // Updated user data if changed
  session: {
    sessionId: string;
    expiresAt: string; // ISO 8601
  };
}

/**
 * User profile endpoint response
 * GET /auth/me
 */
export interface UserProfileApiResponse {
  user: AuthenticatedUser;
  session: {
    sessionId: string;
    lastActivity: string; // ISO 8601
    deviceInfo: {
      platform: string;
      osVersion: string;
      appVersion: string;
    };
  };
}

/**
 * Logout endpoint request
 * POST /auth/logout
 */
export interface LogoutApiRequest {
  refreshToken?: string;
  allDevices?: boolean;
  deviceId: string;
}

/**
 * Email verification endpoint request
 * POST /auth/verify-email
 */
export interface VerifyEmailApiRequest {
  token: string;
  email?: string;
}

/**
 * Password reset request endpoint
 * POST /auth/password-reset-request
 */
export interface PasswordResetRequestApiRequest {
  email: string;
  captchaToken?: string;
}

/**
 * Password reset confirmation endpoint
 * POST /auth/password-reset-confirm
 */
export interface PasswordResetConfirmApiRequest {
  token: string;
  newPassword: string;
  deviceId: string;
}

// ========================================================================================
// AVATAR API TYPES
// ========================================================================================

/**
 * Get user avatar endpoint response
 * GET /users/me/avatar
 */
export interface GetAvatarApiResponse {
  avatar: AvatarState | null;
  hasAvatar: boolean;
  lastUpdated?: string; // ISO 8601
}

/**
 * Update avatar endpoint request
 * POST /users/me/avatar/update
 */
export interface UpdateAvatarApiRequest {
  rpmId: string;
  rpmUrl: string;
  configuration: {
    gender: 'male' | 'female' | 'non-binary';
    bodyType: 'fullbody' | 'halfbody';
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
  };
  customizations: Record<string, any>;
  preferences: {
    autoOptimize: boolean;
    iranianContext: boolean;
    qualityPreference: 'low' | 'medium' | 'high';
  };
}

/**
 * Update avatar endpoint response
 * POST /users/me/avatar/update
 */
export interface UpdateAvatarApiResponse {
  avatar: AvatarState;
  processingId: string;
  estimatedProcessingTime: number; // seconds
}

/**
 * Avatar status endpoint response
 * GET /users/me/avatar/status
 */
export interface AvatarStatusApiResponse {
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  currentStep?: string;
  estimatedTimeRemaining?: number; // seconds
  processingId: string;
  
  // Results (if complete)
  avatar?: AvatarState;
  
  // Error information (if failed)
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Delete avatar endpoint request
 * DELETE /users/me/avatar
 */
export interface DeleteAvatarApiRequest {
  confirmation: boolean;
  reason?: string;
}

// ========================================================================================
// USER API TYPES
// ========================================================================================

/**
 * Update user profile endpoint request
 * PATCH /users/me
 */
export interface UpdateProfileApiRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  preferredLanguage?: 'en' | 'fa';
  timezone?: string;
}

/**
 * Update user profile endpoint response
 * PATCH /users/me
 */
export interface UpdateProfileApiResponse {
  user: AuthenticatedUser;
  updatedFields: string[];
}

/**
 * User settings endpoint response
 * GET /users/me/settings
 */
export interface UserSettingsApiResponse {
  settings: {
    // Privacy Settings
    profileVisibility: 'public' | 'friends' | 'private';
    allowDirectMessages: boolean;
    showOnlineStatus: boolean;
    
    // Notification Settings
    emailNotifications: boolean;
    pushNotifications: boolean;
    avatarProcessingNotifications: boolean;
    
    // Preference Settings
    language: 'en' | 'fa' | 'auto';
    theme: 'light' | 'dark' | 'auto';
    culturalContext: 'iranian' | 'international' | 'mixed';
    
    // Performance Settings
    avatarQuality: 'low' | 'medium' | 'high' | 'auto';
    autoOptimization: boolean;
    lowDataMode: boolean;
  };
}

/**
 * Update user settings endpoint request
 * PATCH /users/me/settings
 */
export interface UpdateSettingsApiRequest {
  settings: Partial<UserSettingsApiResponse['settings']>;
}

// ========================================================================================
// FILE UPLOAD TYPES
// ========================================================================================

/**
 * File upload endpoint request
 * POST /upload
 */
export interface FileUploadApiRequest {
  file: {
    uri: string;
    type: string;
    name: string;
    size: number;
  };
  category: 'avatar' | 'profile' | 'asset';
  metadata?: Record<string, any>;
}

/**
 * File upload endpoint response
 * POST /upload
 */
export interface FileUploadApiResponse {
  fileId: string;
  url: string;
  cdnUrl: string;
  metadata: {
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string; // ISO 8601
  };
}

// ========================================================================================
// SEARCH & DISCOVERY TYPES
// ========================================================================================

/**
 * Search endpoint request
 * GET /search
 */
export interface SearchApiRequest {
  query: string;
  type?: 'users' | 'avatars' | 'content' | 'all';
  filters?: {
    category?: string;
    tags?: string[];
    dateRange?: {
      from: string; // ISO 8601
      to: string; // ISO 8601
    };
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
}

/**
 * Search endpoint response
 * GET /search
 */
export interface SearchApiResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number; // milliseconds
  suggestions?: string[];
}

/**
 * Individual search result
 */
export interface SearchResult {
  id: string;
  type: 'user' | 'avatar' | 'content';
  title: string;
  description?: string;
  thumbnailUrl?: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

// ========================================================================================
// ANALYTICS & METRICS TYPES
// ========================================================================================

/**
 * Analytics event endpoint request
 * POST /analytics/events
 */
export interface AnalyticsEventApiRequest {
  events: AnalyticsEvent[];
}

/**
 * Individual analytics event
 */
export interface AnalyticsEvent {
  eventType: string;
  timestamp: string; // ISO 8601
  userId?: string;
  sessionId?: string;
  deviceId: string;
  properties?: Record<string, any>;
  context?: {
    screen?: string;
    feature?: string;
    experiment?: string;
  };
}

/**
 * User metrics endpoint response
 * GET /users/me/metrics
 */
export interface UserMetricsApiResponse {
  metrics: {
    // Usage Metrics
    totalSessions: number;
    averageSessionDuration: number; // seconds
    lastActivity: string; // ISO 8601
    
    // Avatar Metrics
    avatarCreationCount: number;
    avatarUpdates: number;
    lastAvatarUpdate: string; // ISO 8601
    
    // Engagement Metrics
    screenViews: Record<string, number>;
    featureUsage: Record<string, number>;
    
    // Performance Metrics
    averageLoadTime: number; // milliseconds
    errorRate: number; // percentage
  };
}

// ========================================================================================
// SYSTEM & HEALTH TYPES
// ========================================================================================

/**
 * Health check endpoint response
 * GET /health
 */
export interface HealthCheckApiResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string; // ISO 8601
  version: string;
  uptime: number; // seconds
  
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    storage: ServiceHealth;
    avatarProcessing: ServiceHealth;
  };
  
  metrics: {
    requestsPerMinute: number;
    averageResponseTime: number; // milliseconds
    errorRate: number; // percentage
  };
}

/**
 * Individual service health status
 */
export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number; // milliseconds
  lastCheck: string; // ISO 8601
  error?: string;
}

/**
 * API version information endpoint response
 * GET /version
 */
export interface VersionApiResponse {
  version: string;
  buildNumber: string;
  buildDate: string; // ISO 8601
  gitCommit: string;
  environment: 'development' | 'staging' | 'production';
  
  features: {
    name: string;
    enabled: boolean;
    version?: string;
  }[];
  
  deprecations: {
    endpoint: string;
    deprecatedAt: string; // ISO 8601
    sunsetAt: string; // ISO 8601
    migrationPath: string;
  }[];
}

// ========================================================================================
// UTILITY TYPES
// ========================================================================================

/**
 * API client configuration
 */
export interface ApiClientConfig {
  // Base Configuration
  baseUrl: string;
  timeout: number; // milliseconds
  retries: number;
  retryDelay: number; // milliseconds
  
  // Authentication
  authTokenProvider: () => Promise<string | null>;
  refreshTokenProvider: () => Promise<string | null>;
  
  // Headers
  defaultHeaders: Record<string, string>;
  
  // Interceptors
  requestInterceptor?: (config: ApiRequestConfig) => ApiRequestConfig;
  responseInterceptor?: (response: ApiResponse) => ApiResponse;
  errorInterceptor?: (error: ApiError) => ApiError;
  
  // Debugging
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
}

/**
 * API cache configuration
 */
export interface ApiCacheConfig {
  enabled: boolean;
  defaultTtl: number; // seconds
  maxSize: number; // bytes
  
  strategies: {
    [endpoint: string]: {
      ttl: number;
      strategy: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
    };
  };
}

export default ApiResponse;