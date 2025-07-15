// src/types/auth.ts
// IRANVERSE Enterprise Authentication Types
// Complete type safety for authentication flow with enterprise security
// Built for 90M users - JWT + OAuth + MFA Ready
import { GestureResponderEvent } from 'react-native';

// ========================================================================================
// CORE AUTHENTICATION TYPES - ENTERPRISE SECURITY
// ========================================================================================

/**
 * Authentication state structure for the entire application
 * Manages user session, tokens, and authentication status
 */
export interface AuthState {
  // User Authentication Status
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  
  // User Data
  user: AuthenticatedUser | null;
  
  // Token Management
  tokens: AuthTokens | null;
  
  // Error Handling
  error: AuthError | null;
  
  // Session Metadata
  sessionMetadata: SessionMetadata | null;
  
  // Security Tracking
  lastActivity: Date | null;
  deviceId: string | null;
}

/**
 * Authenticated user profile information
 * Contains verified user data post-authentication
 */
export interface AuthenticatedUser {
  // Core Identity
  id: string;
  email: string;
  username: string;
  
  // Profile Information
  firstName?: string;
  lastName?: string;
  displayName: string;
  
  // Account Status
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  is2FAEnabled?: boolean;
  
  // Persian/Localization Support
  preferredLanguage: 'en' | 'fa' | 'auto';
  timezone?: string;
  
  // Account Metadata
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastLoginAt?: string; // ISO 8601
  
  // Role & Permissions (Future-ready)
  role: 'user' | 'premium' | 'admin' | 'moderator';
  permissions?: string[];
  
  // Avatar Reference
  hasAvatar: boolean;
  avatarVersion?: number;
}

/**
 * JWT token structure with enterprise security features
 * Handles access tokens, refresh tokens, and expiration
 */
export interface AuthTokens {
  // Primary Tokens
  accessToken: string;
  refreshToken: string;
  
  // Token Metadata
  tokenType: 'Bearer';
  expiresIn: number; // seconds until expiration
  expiresAt: Date; // absolute expiration time
  
  // Security Information
  scope?: string[];
  jti?: string; // JWT ID for tracking
  iat?: number; // issued at
  
  // Device Binding (Enterprise Security)
  deviceFingerprint?: string;
  ipAddress?: string;
}

/**
 * Session metadata for enterprise tracking and security
 */
export interface SessionMetadata {
  // Session Tracking
  sessionId: string;
  deviceId: string;
  
  // Device Information
  deviceInfo: {
    platform: 'ios' | 'android' | 'web';
    osVersion: string;
    appVersion: string;
    deviceModel?: string;
  };
  
  // Location & Network
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  
  // Security Flags
  isTrustedDevice: boolean;
  requiresStepUp?: boolean; // For sensitive operations
}

// ========================================================================================
// AUTHENTICATION REQUEST/RESPONSE PAYLOADS
// ========================================================================================

/**
 * Login request payload with enterprise validation
 */
export interface LoginRequest {
  // Credentials
  email: string;
  password: string;
  
  // Security Features
  rememberMe?: boolean;
  captchaToken?: string;
  
  // Device Information
  deviceInfo: {
    platform: 'ios' | 'android';
    osVersion: string;
    appVersion: string;
    deviceModel?: string;
    deviceId: string;
  };
  
  // Optional MFA
  mfaCode?: string;
  mfaMethod?: 'totp' | 'sms' | 'email';
}

/**
 * Registration request payload with comprehensive validation
 */
export interface SignupRequest {
  // Required Fields
  email: string;
  password: string;
  username: string;
  
  // Optional Profile Data
  firstName?: string;
  lastName?: string;
  displayName?: string;
  
  // Localization
  preferredLanguage: 'en' | 'fa' | 'auto';
  timezone?: string;
  
  // Legal Compliance
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  marketingOptIn?: boolean;
  
  // Device Information
  deviceInfo: {
    platform: 'ios' | 'android';
    osVersion: string;
    appVersion: string;
    deviceModel?: string;
    deviceId: string;
  };
  
  // Anti-Spam
  captchaToken?: string;
  inviteCode?: string;
}

/**
 * Successful authentication response from backend
 */
export interface AuthResponse {
  // Response Status
  success: true;
  message: string;
  
  // User Data
  user: AuthenticatedUser;
  
  // Token Information
  tokens: AuthTokens;
  
  // Session Data
  session: SessionMetadata;
  
  // Additional Flags
  isNewUser?: boolean;
  requiresEmailVerification?: boolean;
  requiresAvatarCreation?: boolean;
  
  // Next Steps
  nextAction?: 'avatar_creation' | 'onboarding' | 'home' | 'email_verification';
}

/**
 * Token refresh request payload
 */
export interface TokenRefreshRequest {
  refreshToken: string;
  deviceId: string;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  success: true;
  tokens: AuthTokens;
  user?: Partial<AuthenticatedUser>; // Updated user data if changed
}

/**
 * Logout request with session management
 */
export interface LogoutRequest {
  // Token Management
  refreshToken?: string;
  
  // Logout Scope
  allDevices?: boolean;
  currentDeviceOnly?: boolean;
  
  // Device Information
  deviceId: string;
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  token: string;
  email?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
  captchaToken?: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ========================================================================================
// ERROR HANDLING TYPES - ENTERPRISE GRADE
// ========================================================================================

/**
 * Comprehensive authentication error structure
 */
export interface AuthError {
  // Error Classification
  type: AuthErrorType;
  code: string;
  message: string;
  
  // Detailed Information
  field?: string; // Which field caused the error
  details?: Record<string, any>;
  
  // User-Friendly Messaging
  userMessage: string;
  persianMessage?: string;
  
  // Technical Information
  timestamp: Date;
  requestId?: string;
  
  // Recovery Information
  retryable: boolean;
  retryAfter?: number; // seconds
  suggestedAction?: string;
}

/**
 * Authentication error types for precise error handling
 */
export type AuthErrorType =
  // Validation Errors
  | 'VALIDATION_ERROR'
  | 'INVALID_EMAIL'
  | 'INVALID_PASSWORD'
  | 'INVALID_USERNAME'
  
  // Authentication Errors
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_NOT_FOUND'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_SUSPENDED'
  | 'EMAIL_NOT_VERIFIED'
  
  // Token Errors
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'TOKEN_REVOKED'
  | 'REFRESH_TOKEN_EXPIRED'
  
  // Security Errors
  | 'TOO_MANY_ATTEMPTS'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DEVICE_NOT_TRUSTED'
  | 'MFA_REQUIRED'
  | 'MFA_INVALID'
  
  // Network/Server Errors
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT_ERROR'
  
  // Registration Errors
  | 'EMAIL_ALREADY_EXISTS'
  | 'USERNAME_ALREADY_EXISTS'
  | 'REGISTRATION_DISABLED'
  | 'INVALID_INVITE_CODE'
  
  // Unknown/Generic
  | 'UNKNOWN_ERROR';

// ========================================================================================
// AUTHENTICATION CONTEXT TYPES
// ========================================================================================

/**
 * Authentication context methods for components
 */
export interface AuthContextMethods {
  // Core Authentication
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  signup: (data: SignupRequest) => Promise<AuthResponse>;
  logout: (options?: LogoutRequest) => Promise<void>;
  
  // Token Management
  refreshToken: () => Promise<TokenRefreshResponse>;
  clearTokens: () => Promise<void>;
  
  // Profile Management
  getProfile: () => Promise<AuthenticatedUser>;
  updateProfile: (updates: Partial<AuthenticatedUser>) => Promise<AuthenticatedUser>;
  
  // Email/Password
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (request: PasswordResetConfirmRequest) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  
  // Security
  enableTwoFactor: () => Promise<void>;
  disableTwoFactor: (code: string) => Promise<void>;
  
  // Utility
  checkAuthStatus: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * Complete authentication context interface
 */
export interface AuthContextValue extends AuthState, AuthContextMethods {}

// ========================================================================================
// AUTHENTICATION HOOK TYPES
// ========================================================================================

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturn extends AuthContextValue {
  // Computed Properties
  isTokenExpired: boolean;
  isTokenExpiringSoon: boolean; // <5 minutes remaining
  timeUntilExpiry: number | null; // seconds
  
  // Helper Methods
  getValidToken: () => Promise<string | null>;
  requireAuth: () => boolean;
  requireEmailVerification: () => boolean;
}

// ========================================================================================
// OAUTH TYPES - FUTURE READY
// ========================================================================================

/**
 * OAuth provider configuration
 */
export interface OAuthProvider {
  id: 'google' | 'apple' | 'facebook' | 'twitter';
  name: string;
  enabled: boolean;
  clientId?: string;
  scopes: string[];
}

/**
 * OAuth authentication request
 */
export interface OAuthRequest {
  provider: string;
  authorizationCode: string;
  deviceInfo: {
    platform: 'ios' | 'android';
    osVersion: string;
    appVersion: string;
    deviceId: string;
  };
}

/**
 * OAuth authentication response
 */
export interface OAuthResponse extends AuthResponse {
  // OAuth-specific data
  providerUserId: string;
  providerEmail?: string;
  isLinkedAccount: boolean;
}

// ========================================================================================
// UTILITY TYPES
// ========================================================================================

/**
 * Authentication event types for tracking
 */
export type AuthEvent =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'token_refresh'
  | 'password_reset'
  | 'email_verified'
  | 'account_locked'
  | 'suspicious_activity';

/**
 * Authentication analytics payload
 */
export interface AuthAnalytics {
  event: AuthEvent;
  userId?: string;
  timestamp: Date;
  deviceId: string;
  metadata?: Record<string, any>;
}

/**
 * Deep link authentication data
 */
export interface AuthDeepLinkData {
  action: 'verify_email' | 'reset_password' | 'magic_link';
  token: string;
  email?: string;
  expires?: string;
}

export default AuthState;