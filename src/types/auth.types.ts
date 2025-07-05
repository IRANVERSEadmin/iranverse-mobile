// src/types/auth.types.ts
/**
 * IRANVERSE Authentication Types
 * Enterprise-grade TypeScript definitions for authentication system
 * Supports Persian/Farsi localization and Iranian market requirements
 */

// ==================== USER TYPES ====================

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  date_of_birth?: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  is_staff: boolean;
  is_premium: boolean;
  
  // Iranian-specific fields
  iranian_verification?: IranianVerification;
  preferred_language: 'en' | 'fa';
  timezone: string;
  
  // Social features
  followers_count: number;
  following_count: number;
  posts_count: number;
  
  // Privacy settings
  privacy_settings: PrivacySettings;
  
  // Subscription information
  subscription?: SubscriptionInfo;
}

export interface IranianVerification {
  is_iranian_citizen: boolean;
  verification_level: 'unverified' | 'phone_verified' | 'document_verified' | 'full_verified';
  national_id_verified: boolean;
  phone_verified: boolean;
  address_verified: boolean;
  verification_date?: string;
  verification_documents?: string[];
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  allow_friend_requests: boolean;
  allow_messages: boolean;
  show_online_status: boolean;
  data_processing_consent: boolean;
  marketing_consent: boolean;
}

export interface SubscriptionInfo {
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  features: string[];
}

// ==================== AUTHENTICATION DTOs ====================

export interface RegisterDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  date_of_birth?: string;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  marketing_consent?: boolean;
  preferred_language?: 'en' | 'fa';
  referral_code?: string;
  
  // Device information
  device_fingerprint?: string;
  timezone?: string;
  
  // Iranian-specific
  iranian_citizen?: boolean;
  national_id?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  remember_me?: boolean;
  device_fingerprint?: string;
  captcha_token?: string;
  
  // Two-factor authentication
  totp_code?: string;
  backup_code?: string;
  
  // Location for security
  login_location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

export interface OAuthLoginDto {
  provider: 'google' | 'apple' | 'twitter' | 'facebook';
  access_token: string;
  id_token?: string;
  device_fingerprint?: string;
  
  // Additional OAuth data
  provider_user_id?: string;
  provider_email?: string;
  provider_name?: string;
  provider_picture?: string;
}

export interface ForgotPasswordDto {
  email: string;
  captcha_token?: string;
  language?: 'en' | 'fa';
}

export interface ResetPasswordDto {
  token: string;
  new_password: string;
  confirm_password: string;
  device_fingerprint?: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
  logout_other_devices?: boolean;
}

export interface VerifyEmailDto {
  email: string;
  token: string;
  device_fingerprint?: string;
}

export interface ResendVerificationDto {
  email: string;
  language?: 'en' | 'fa';
}

// ==================== RESPONSE TYPES ====================

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds
  scope?: string;
}

export interface AuthSuccessResponse {
  success: true;
  message?: string;
  message_fa?: string;
  user?: User;
  tokens?: AuthTokens;
  
  // Additional metadata
  session_id?: string;
  device_id?: string;
  login_timestamp?: string;
  
  // Feature flags
  features?: FeatureFlags;
}

export interface FeatureFlags {
  avatar_creation_required: boolean;
  email_verification_required: boolean;
  two_factor_auth_enabled: boolean;
  iranian_verification_available: boolean;
  premium_features_enabled: boolean;
  social_features_enabled: boolean;
  dark_mode_available: boolean;
  persian_language_support: boolean;
}

// ==================== ERROR TYPES ====================

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  retry_after?: number; // for rate limiting
  correlation_id?: string;
}

export interface ApiError {
  code: string;
  message: string;
  message_fa?: string; // Persian translation
  details?: ErrorDetails;
  correlation_id: string;
  timestamp?: string;
}

export interface ErrorDetails {
  field_errors?: FieldError[];
  validation_errors?: ValidationError[];
  security_errors?: SecurityError[];
  rate_limit_info?: RateLimitInfo;
}

export interface FieldError {
  field: string;
  code: string;
  message: string;
  message_fa?: string;
  value?: any;
}

export interface ValidationError {
  constraint: string;
  message: string;
  message_fa?: string;
  property: string;
  value?: any;
}

export interface SecurityError {
  type: 'suspicious_activity' | 'device_mismatch' | 'location_anomaly' | 'rate_limit' | 'captcha_required';
  message: string;
  message_fa?: string;
  action_required?: 'verify_device' | 'solve_captcha' | 'contact_support' | 'wait_cooldown';
  cooldown_until?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_time: string;
  retry_after: number;
}


// ==================== SIGN UP STATE ====================
export interface SignUpState {
  // Core fields
  email: string;
  password: string;
  
  // Personal information
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  date_of_birth?: string;
  
  // Consent and agreements
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  marketing_consent: boolean;
  
  // Validation state
  validationErrors: {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    phone_number?: string;
    date_of_birth?: string;
    terms_accepted?: string;
    privacy_policy_accepted?: string;
  };
  
  // UI state
  isSubmitting: boolean;
  currentStep: number;
  completedSteps: number[];
}

// ==================== AUTHENTICATION STATE ====================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  hasHydrated: boolean;
  
  // Session information
  sessionExpiry: number | null;
  lastRefreshTime: number | null;
  
  // Device and security
  deviceId: string | null;
  deviceTrusted: boolean;
  
  // Network and offline support
  networkStatus: 'online' | 'offline' | 'unknown';
  pendingActions: AuthAction[];
  
  // Error handling
  lastError: ApiErrorResponse | null;
  errorCount: number;
  lastErrorTime: number | null;
}

export interface AuthAction {
  type: string;
  payload?: any;
  timestamp: number;
  retry?: boolean;
}

// ==================== FORM VALIDATION ====================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  score?: number; // for password strength
}

export interface FormFieldValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => ValidationResult;
  
  // Messages
  requiredMessage: string;
  requiredMessageFa?: string;
  invalidMessage: string;
  invalidMessageFa?: string;
}

// ==================== SESSION MANAGEMENT ====================

export interface SessionInfo {
  session_id: string;
  device_id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  platform: string;
  ip_address: string;
  location?: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  created_at: string;
  last_activity: string;
  is_current: boolean;
  user_agent: string;
}

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  platform: string;
  os_version: string;
  app_version: string;
  is_trusted: boolean;
  first_seen: string;
  last_seen: string;
}

// ==================== SECURITY TYPES ====================

export interface SecurityEvent {
  event_type: 'login' | 'logout' | 'password_change' | 'email_change' | 'suspicious_activity';
  timestamp: string;
  ip_address: string;
  device_id: string;
  location?: {
    city: string;
    country: string;
  };
  user_agent: string;
  success: boolean;
  risk_score: number;
  details?: Record<string, any>;
}

export interface TwoFactorAuthSettings {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  backup_codes_generated: boolean;
  last_used: string | null;
  setup_date: string;
}

// ==================== PROFILE MANAGEMENT ====================

export interface ProfileUpdateDto {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone_number?: string;
  date_of_birth?: string;
  preferred_language?: 'en' | 'fa';
  timezone?: string;
  
  // Privacy settings
  privacy_settings?: Partial<PrivacySettings>;
  
  // Avatar and media
  profile_picture?: string;
  cover_photo?: string;
}

export interface EmailChangeDto {
  new_email: string;
  password: string;
  captcha_token?: string;
}

export interface PhoneChangeDto {
  new_phone: string;
  password: string;
  verification_code?: string;
}

// ==================== IRANIAN SPECIFIC TYPES ====================

export interface IranianVerificationDto {
  national_id: string;
  phone_number: string;
  address: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
  };
  documents: {
    national_id_image: string;
    address_proof_image: string;
  };
}

export interface IranianBankingInfo {
  bank_name: string;
  account_number: string;
  iban: string;
  card_number?: string;
  is_verified: boolean;
  verification_date?: string;
}

// ==================== SUBSCRIPTION AND BILLING ====================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  description_fa?: string;
  price: number;
  currency: 'USD' | 'EUR' | 'IRR';
  billing_period: 'monthly' | 'yearly';
  features: string[];
  is_popular: boolean;
  is_available: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'crypto' | 'iranian_gateway';
  provider: string;
  last_four?: string;
  expires_at?: string;
  is_default: boolean;
  is_verified: boolean;
}

// ==================== ANALYTICS AND TRACKING ====================

export interface UserAnalytics {
  total_sessions: number;
  total_time_spent: number; // in seconds
  last_activity: string;
  most_used_features: string[];
  platform_usage: Record<string, number>;
  location_stats: Record<string, number>;
  referral_source?: string;
}

// ==================== NOTIFICATION PREFERENCES ====================

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  
  // Notification types
  friend_requests: boolean;
  messages: boolean;
  posts_interactions: boolean;
  system_updates: boolean;
  marketing: boolean;
  security_alerts: boolean;
  
  // Timing preferences
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:mm format
    end_time: string;   // HH:mm format
    timezone: string;
  };
}

// ==================== EXPORT ALL TYPES ====================

export type AuthenticationFlow = 
  | 'registration'
  | 'login'
  | 'oauth'
  | 'password_reset'
  | 'email_verification'
  | 'two_factor_auth';

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export type AccountStatus = 
  | 'active'
  | 'pending_verification'
  | 'suspended'
  | 'banned'
  | 'deleted';

export type VerificationStatus = 
  | 'unverified'
  | 'email_verified'
  | 'phone_verified'
  | 'document_verified'
  | 'fully_verified';

// Error Codes Enum for better type safety
export enum AuthErrorCodes {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  PASSWORDS_DONT_MATCH = 'PASSWORDS_DONT_MATCH',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_USERNAME = 'INVALID_USERNAME',
  INVALID_DATE_OF_BIRTH = 'INVALID_DATE_OF_BIRTH',
  
  // Authentication Errors
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Registration Errors
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  PHONE_ALREADY_EXISTS = 'PHONE_ALREADY_EXISTS',
  TERMS_NOT_ACCEPTED = 'TERMS_NOT_ACCEPTED',
  PRIVACY_POLICY_NOT_ACCEPTED = 'PRIVACY_POLICY_NOT_ACCEPTED',
  AGE_RESTRICTION = 'AGE_RESTRICTION',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  COOLDOWN_PERIOD = 'COOLDOWN_PERIOD',
  
  // Security Errors
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DEVICE_NOT_TRUSTED = 'DEVICE_NOT_TRUSTED',
  LOCATION_ANOMALY = 'LOCATION_ANOMALY',
  CAPTCHA_REQUIRED = 'CAPTCHA_REQUIRED',
  CAPTCHA_INVALID = 'CAPTCHA_INVALID',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  TWO_FACTOR_INVALID = 'TWO_FACTOR_INVALID',
  
  // Password Reset Errors
  RESET_TOKEN_INVALID = 'RESET_TOKEN_INVALID',
  RESET_TOKEN_EXPIRED = 'RESET_TOKEN_EXPIRED',
  RESET_TOKEN_USED = 'RESET_TOKEN_USED',
  RESET_REQUEST_NOT_FOUND = 'RESET_REQUEST_NOT_FOUND',
  
  // Email Verification Errors
  VERIFICATION_TOKEN_INVALID = 'VERIFICATION_TOKEN_INVALID',
  VERIFICATION_TOKEN_EXPIRED = 'VERIFICATION_TOKEN_EXPIRED',
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
  VERIFICATION_ATTEMPTS_EXCEEDED = 'VERIFICATION_ATTEMPTS_EXCEEDED',
  
  // OAuth Errors
  OAUTH_PROVIDER_ERROR = 'OAUTH_PROVIDER_ERROR',
  OAUTH_TOKEN_INVALID = 'OAUTH_TOKEN_INVALID',
  OAUTH_EMAIL_NOT_VERIFIED = 'OAUTH_EMAIL_NOT_VERIFIED',
  OAUTH_ACCOUNT_LINKING_FAILED = 'OAUTH_ACCOUNT_LINKING_FAILED',
  
  // Network and System Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  
  // Iranian Specific Errors
  IRANIAN_VERIFICATION_FAILED = 'IRANIAN_VERIFICATION_FAILED',
  NATIONAL_ID_INVALID = 'NATIONAL_ID_INVALID',
  IRANIAN_PHONE_REQUIRED = 'IRANIAN_PHONE_REQUIRED',
  IRANIAN_ADDRESS_REQUIRED = 'IRANIAN_ADDRESS_REQUIRED',
  
  // Permission Errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
}

// Export commonly used type unions
export type AuthErrorCode = keyof typeof AuthErrorCodes;

export type NetworkStatus = 'online' | 'offline' | 'unknown';

export type AuthFlowStep = 
  | 'personal_info'
  | 'account_preferences' 
  | 'email_verification'
  | 'avatar_creation'
  | 'complete';

export type LoginMethod = 
  | 'email_password'
  | 'google_oauth'
  | 'apple_oauth'
  | 'phone_otp'
  | 'biometric';

export type SecurityLevel = 'basic' | 'standard' | 'enhanced' | 'maximum';

export type DataExportFormat = 'json' | 'csv' | 'xml';

// ==================== DEEP LINKING TYPES ====================

export interface DeepLinkParams {
  token?: string;
  email?: string;
  action?: string;
  redirect?: string;
  [key: string]: string | undefined;
}

export interface DeepLinkRoutes {
  'auth/verify-email': DeepLinkParams;
  'auth/reset-password': DeepLinkParams;
  'auth/login': DeepLinkParams;
  'auth/register': DeepLinkParams;
  'auth/oauth-callback': DeepLinkParams;
}

// ==================== LANGUAGE AND LOCALIZATION ====================

export interface LocalizationConfig {
  language: 'en' | 'fa';
  isRTL: boolean;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
}

export interface TranslationKeys {
  // Common
  'common.ok': string;
  'common.cancel': string;
  'common.back': string;
  'common.next': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.retry': string;
  'common.changeLanguage': string;
  
  // Authentication
  'auth.login': string;
  'auth.register': string;
  'auth.logout': string;
  'auth.forgotPassword': string;
  'auth.resetPassword': string;
  
  // Form Labels
  'form.email.label': string;
  'form.email.placeholder': string;
  'form.password.label': string;
  'form.password.placeholder': string;
  'form.confirmPassword.label': string;
  'form.firstName.label': string;
  'form.lastName.label': string;
  'form.username.label': string;
  'form.phone.label': string;
  'form.dateOfBirth.label': string;
  
  // Validation Messages
  'validation.required': string;
  'validation.email.invalid': string;
  'validation.password.weak': string;
  'validation.password.noMatch': string;
  'validation.phone.invalid': string;
  'validation.age.minimum': string;
  
  // Error Messages
  'error.networkError': string;
  'error.serverError': string;
  'error.invalidCredentials': string;
  'error.accountLocked': string;
  'error.sessionExpired': string;
  
  // Success Messages
  'success.loginSuccess': string;
  'success.registrationSuccess': string;
  'success.passwordReset': string;
  'success.emailVerified': string;
  
  [key: string]: string;
}

// ==================== API CONFIGURATION ====================

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  compressionThreshold: number;
  maxConcurrentRequests: number;
  requestQueueSize: number;
  
  // Iranian Network Optimizations
  iranianOptimization: boolean;
  networkQualityAware: boolean;
  adaptiveTimeout: boolean;
  priorityQueuing: boolean;
}

export interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  lastRequestTime: number;
  queuedRequests: number;
  activeRequests: number;
}

// ==================== AVATAR AND PROFILE ====================

export interface AvatarConfig {
  required: boolean;
  provider: 'readyplayerme' | 'custom';
  morphTargets: string[];
  textureSize: number;
  format: 'glb' | 'fbx' | 'obj';
  customizationLevel: 'basic' | 'advanced' | 'professional';
}

export interface ProfileMedia {
  profile_picture?: MediaFile;
  cover_photo?: MediaFile;
  avatar_url?: string;
  avatar_config?: AvatarConfig;
}

export interface MediaFile {
  url: string;
  thumbnail_url?: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  uploaded_at: string;
}

// ==================== SEARCH AND DISCOVERY ====================

export interface UserSearchParams {
  query?: string;
  location?: string;
  age_range?: [number, number];
  verified_only?: boolean;
  has_avatar?: boolean;
  language?: 'en' | 'fa' | 'both';
  sort_by?: 'relevance' | 'recent' | 'popular';
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total_count: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_previous: boolean;
}

// ==================== SOCIAL FEATURES ====================

export interface FriendRequest {
  id: string;
  from_user: User;
  to_user: User;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  created_at: string;
  responded_at?: string;
}

export interface UserConnection {
  user: User;
  connection_type: 'friend' | 'following' | 'follower' | 'blocked';
  connected_at: string;
  mutual_connections?: number;
}

// ==================== CONTENT AND POSTS ====================

export interface Post {
  id: string;
  author: User;
  content: string;
  media_files: MediaFile[];
  avatar_scene?: string; // 3D scene data
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  visibility: 'public' | 'friends' | 'private';
  tags: string[];
  location?: {
    name: string;
    coordinates: [number, number];
  };
}

// ==================== MESSAGING ====================

export interface Message {
  id: string;
  conversation_id: string;
  sender: User;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'avatar_scene' | 'file';
  media_file?: MediaFile;
  avatar_data?: string;
  created_at: string;
  read_at?: string;
  edited_at?: string;
  reply_to?: Message;
}

export interface Conversation {
  id: string;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
  is_group: boolean;
  group_name?: string;
  group_avatar?: string;
}

// ==================== EXPORT DEFAULT TYPE GUARDS ====================

export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isAuthSuccessResponse = (obj: any): obj is AuthSuccessResponse => {
  return obj && obj.success === true;
};

export const isApiErrorResponse = (obj: any): obj is ApiErrorResponse => {
  return obj && obj.success === false && obj.error;
};

export const isValidationResult = (obj: any): obj is ValidationResult => {
  return obj && typeof obj.isValid === 'boolean' && typeof obj.errors === 'object';
};
