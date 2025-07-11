// src/constants/api.ts
// IRANVERSE Enterprise API Configuration & Service Layer
// Complete HTTP client with automatic token refresh + retry logic
// Built for 90M users - Enterprise grade error handling
import { 
  ApiResponse, 
  ApiError, 
  ApiErrorType,
  ApiRequestConfig,
  LoginApiRequest,
  LoginApiResponse,
  RegisterApiRequest,
  RegisterApiResponse,
  RefreshTokenApiRequest,
  RefreshTokenApiResponse,
  UserProfileApiResponse,
  LogoutApiRequest,
  VerifyEmailApiRequest,
  PasswordResetRequestApiRequest,
  PasswordResetConfirmApiRequest,
  GetAvatarApiResponse,
  UpdateAvatarApiRequest,
  UpdateAvatarApiResponse,
  AvatarStatusApiResponse,
  DeleteAvatarApiRequest
} from '../types/api';

// ========================================================================================
// API ENDPOINTS CONFIGURATION - SINGLE DECLARATION
// ========================================================================================

export const API_ENDPOINTS = {
  // Base Configuration
  BASE_URL: 'https://api.iranverse.com/v1',
  BASE_URL_DEV: 'https://dev-api.iranverse.com/v1',
  BASE_URL_STAGING: 'https://staging-api.iranverse.com/v1',
  
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    PASSWORD_RESET_REQUEST: '/auth/password-reset-request',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm',
  },
  
  // User Endpoints
  USER: {
    PROFILE: '/users/me',
    SETTINGS: '/users/me/settings',
    AVATAR: '/users/me/avatar',
    AVATAR_UPDATE: '/users/me/avatar/update',
    AVATAR_STATUS: '/users/me/avatar/status',
    METRICS: '/users/me/metrics',
  },
  
  // Upload Endpoints
  UPLOAD: {
    FILE: '/upload',
    AVATAR_ASSET: '/upload/avatar',
  },
  
  // Search & Discovery
  SEARCH: {
    GLOBAL: '/search',
    USERS: '/search/users',
    AVATARS: '/search/avatars',
  },
  
  // Analytics
  ANALYTICS: {
    EVENTS: '/analytics/events',
    METRICS: '/analytics/metrics',
  },
  
  // System
  SYSTEM: {
    HEALTH: '/health',
    VERSION: '/version',
  },
} as const;

// ========================================================================================
// HTTP STATUS CODES - SINGLE DECLARATION
// ========================================================================================

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ========================================================================================
// API CLIENT CLASS - ENTERPRISE GRADE
// ========================================================================================

/**
 * Enterprise API client with automatic token management
 * Features: Auto-refresh, retry logic, request queuing, error handling
 */
export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private requestQueue: Array<() => void> = [];
  
  // Request Configuration
  private defaultTimeout = 30000; // 30 seconds
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  
  constructor(config: {
    environment: 'development' | 'staging' | 'production';
    enableLogging?: boolean;
  }) {
    // Set base URL based on environment
    switch (config.environment) {
      case 'development':
        this.baseUrl = API_ENDPOINTS.BASE_URL_DEV;
        break;
      case 'staging':
        this.baseUrl = API_ENDPOINTS.BASE_URL_STAGING;
        break;
      case 'production':
        this.baseUrl = API_ENDPOINTS.BASE_URL;
        break;
      default:
        this.baseUrl = API_ENDPOINTS.BASE_URL;
    }
  }
  
  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
  
  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
  
  /**
   * Make authenticated API request with automatic token refresh
   */
  async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    let retryCount = 0;
    
    while (retryCount <= this.maxRetries) {
      try {
        // Add authentication header if token available
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Version': '1.0.0',
          'X-Platform': 'mobile',
          ...config.headers,
        };
        
        // Add auth token if available and required
        if (config.requiresAuth && this.accessToken) {
          headers.Authorization = `Bearer ${this.accessToken}`;
        }
        
        // Make HTTP request
        const response = await this.makeHttpRequest<T>({
          ...config,
          headers,
          timeout: config.timeout || this.defaultTimeout,
        });
        
        return response;
        
      } catch (error) {
        // Handle token refresh for 401 errors
        if (this.isUnauthorizedError(error) && config.requiresAuth && retryCount === 0) {
          try {
            await this.refreshAccessToken();
            retryCount++; // Try once more with new token
            continue;
          } catch (refreshError) {
            throw this.createApiError(refreshError, config);
          }
        }
        
        // Handle retryable errors
        if (this.isRetryableError(error) && retryCount < this.maxRetries) {
          await this.delay(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          retryCount++;
          continue;
        }
        
        // Throw error if not retryable or max retries exceeded
        throw this.createApiError(error, config);
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new Error('Maximum retries exceeded');
  }
  
  /**
   * Make HTTP request using fetch API
   */
  private async makeHttpRequest<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${config.url}`;
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method: config.method,
      headers: config.headers,
      signal: AbortSignal.timeout(config.timeout || this.defaultTimeout),
    };
    
    // Add body for non-GET requests
    if (config.data && config.method !== 'GET') {
      requestOptions.body = JSON.stringify(config.data);
    }
    
    // Add query parameters for GET requests
    let finalUrl = url;
    if (config.params && Object.keys(config.params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      finalUrl = `${url}?${searchParams.toString()}`;
    }
    
    // Make request
    const response = await fetch(finalUrl, requestOptions);
    
    // Parse response
    const responseData = await response.json();
    
    // Check if response is successful
    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
      };
    }
    
    // Return structured response
    return {
      success: true,
      message: responseData.message || 'Request successful',
      data: responseData.data || responseData,
      requestId: responseData.requestId || this.generateRequestId(),
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: 0,
        serverTime: responseData.serverTime || new Date().toISOString(),
        apiVersion: responseData.apiVersion || '1.0.0',
        endpoint: config.url,
        method: config.method,
        cache: responseData.cache ? {
          hit: responseData.cache.hit || false,
          ttl: responseData.cache.ttl || 0,
          etag: responseData.cache.etag ?? undefined, // FIX: Convert null to undefined
        } : undefined,
      },
    };
  }
  
  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }
    
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      
      // Process queued requests
      this.processRequestQueue();
      
      return newToken;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }
  
  /**
   * Perform actual token refresh
   */
  private async performTokenRefresh(): Promise<string> {
    const response = await this.makeHttpRequest<RefreshTokenApiResponse>({
      method: 'POST',
      url: API_ENDPOINTS.AUTH.REFRESH,
      data: {
        refreshToken: this.refreshToken,
        deviceId: 'mobile-device', // Should come from device info
      },
      requiresAuth: false,
    });
    
    if (!response.data?.tokens?.accessToken) {
      throw new Error('Invalid refresh response');
    }
    
    // Update tokens
    this.accessToken = response.data.tokens.accessToken;
    if (response.data.tokens.refreshToken) {
      this.refreshToken = response.data.tokens.refreshToken;
    }
    
    return this.accessToken;
  }
  
  /**
   * Process queued requests after token refresh
   */
  private processRequestQueue(): void {
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        request();
      }
    }
  }
  
  /**
   * Check if error is unauthorized (401)
   */
  private isUnauthorizedError(error: any): boolean {
    return error?.status === HTTP_STATUS.UNAUTHORIZED;
  }
  
  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors, timeouts, and 5xx server errors are retryable
    return (
      !error?.status || // Network error
      error.status >= 500 || // Server error
      error.status === HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }
  
  /**
   * Create structured API error from raw error
   */
  private createApiError(error: any, config: ApiRequestConfig): ApiError {
    // FIX: Handle unknown error type with type guard
    let errorMessage = 'An unknown error occurred';
    let errorType: ApiErrorType = 'UNKNOWN_ERROR';
    let status = 0;
    let statusText = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      if ('status' in error && typeof error.status === 'number') {
        status = error.status;
      }
      if ('statusText' in error && typeof error.statusText === 'string') {
        statusText = error.statusText;
      }
    }
    
    // Determine error type based on status code
    if (status >= 400 && status < 500) {
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          errorType = 'AUTHENTICATION_ERROR';
          break;
        case HTTP_STATUS.FORBIDDEN:
          errorType = 'AUTHORIZATION_ERROR';
          break;
        case HTTP_STATUS.NOT_FOUND:
          errorType = 'NOT_FOUND';
          break;
        case HTTP_STATUS.CONFLICT:
          errorType = 'CONFLICT';
          break;
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          errorType = 'RATE_LIMITED';
          break;
        case HTTP_STATUS.PAYLOAD_TOO_LARGE:
          errorType = 'PAYLOAD_TOO_LARGE';
          break;
        default:
          errorType = 'VALIDATION_ERROR';
      }
    } else if (status >= 500) {
      switch (status) {
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          errorType = 'SERVICE_UNAVAILABLE';
          break;
        case HTTP_STATUS.GATEWAY_TIMEOUT:
          errorType = 'GATEWAY_TIMEOUT';
          break;
        default:
          errorType = 'INTERNAL_ERROR';
      }
    } else if (status === 0) {
      errorType = 'NETWORK_ERROR';
    }
    
    return {
      type: errorType, // FIX: Now properly typed as ApiErrorType
      code: `API_${status || 'NETWORK'}`,
      message: errorMessage,
      status,
      statusText,
      userMessage: this.getUserFriendlyMessage(errorType),
      persianMessage: this.getPersianMessage(errorType),
      endpoint: config.url,
      method: config.method,
      requestId: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      retryable: this.isRetryableError(error),
      retryAfter: this.getRetryAfter(error),
      suggestedAction: this.getSuggestedAction(errorType),
    };
  }
  
  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(errorType: ApiErrorType): string {
    switch (errorType) {
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Please log in again to continue.';
      case 'AUTHORIZATION_ERROR':
        return 'You don\'t have permission to perform this action.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'SERVICE_UNAVAILABLE':
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  
  /**
   * Get Persian error message
   */
  private getPersianMessage(errorType: ApiErrorType): string {
    switch (errorType) {
      case 'NETWORK_ERROR':
        return 'لطفا اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
      case 'AUTHENTICATION_ERROR':
        return 'لطفا مجددا وارد شوید.';
      case 'AUTHORIZATION_ERROR':
        return 'شما اجازه انجام این عمل را ندارید.';
      case 'NOT_FOUND':
        return 'منبع درخواستی یافت نشد.';
      case 'RATE_LIMITED':
        return 'درخواست‌های زیادی ارسال شده. لطفا کمی صبر کنید.';
      case 'SERVICE_UNAVAILABLE':
        return 'سرویس موقتا در دسترس نیست. لطفا بعدا تلاش کنید.';
      default:
        return 'مشکلی پیش آمده. لطفا دوباره تلاش کنید.';
    }
  }
  
  /**
   * Get suggested action for error type
   */
  private getSuggestedAction(errorType: ApiErrorType): string {
    switch (errorType) {
      case 'NETWORK_ERROR':
        return 'Check internet connection';
      case 'AUTHENTICATION_ERROR':
        return 'Re-authenticate';
      case 'AUTHORIZATION_ERROR':
        return 'Contact support';
      case 'RATE_LIMITED':
        return 'Wait and retry';
      case 'SERVICE_UNAVAILABLE':
        return 'Retry later';
      default:
        return 'Retry request';
    }
  }
  
  /**
   * Get retry delay from error response
   */
  private getRetryAfter(error: any): number | undefined {
    const retryAfter = error?.headers?.['retry-after'];
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      return isNaN(seconds) ? undefined : seconds;
    }
    return undefined;
  }
  
  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // ========================================================================================
  // CONVENIENCE METHODS FOR COMMON REQUESTS
  // ========================================================================================
  
  /**
   * GET request
   */
  async get<T>(url: string, params?: Record<string, any>, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      requiresAuth,
    });
  }
  
  /**
   * POST request
   */
  async post<T>(url: string, data?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      requiresAuth,
    });
  }
  
  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      requiresAuth,
    });
  }
  
  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      requiresAuth,
    });
  }
  
  /**
   * DELETE request
   */
  async delete<T>(url: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      requiresAuth,
    });
  }
}

// ========================================================================================
// SINGLETON API CLIENT INSTANCE
// ========================================================================================

// Create global API client instance
let apiClientInstance: ApiClient | null = null;

/**
 * Get singleton API client instance
 */
export const getApiClient = (environment?: 'development' | 'staging' | 'production'): ApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient({
      environment: environment || 'production',
      enableLogging: __DEV__,
    });
  }
  return apiClientInstance;
};

// ========================================================================================
// TYPED API SERVICE METHODS
// ========================================================================================

/**
 * Authentication API service methods
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (data: LoginApiRequest): Promise<ApiResponse<LoginApiResponse>> => {
    const client = getApiClient();
    return client.post<LoginApiResponse>(API_ENDPOINTS.AUTH.LOGIN, data, false);
  },
  
  /**
   * Register new user
   */
  register: async (data: RegisterApiRequest): Promise<ApiResponse<RegisterApiResponse>> => {
    const client = getApiClient();
    return client.post<RegisterApiResponse>(API_ENDPOINTS.AUTH.REGISTER, data, false);
  },
  
  /**
   * Refresh access token
   */
  refresh: async (data: RefreshTokenApiRequest): Promise<ApiResponse<RefreshTokenApiResponse>> => {
    const client = getApiClient();
    return client.post<RefreshTokenApiResponse>(API_ENDPOINTS.AUTH.REFRESH, data, false);
  },
  
  /**
   * Get current user profile
   */
  getMe: async (): Promise<ApiResponse<UserProfileApiResponse>> => {
    const client = getApiClient();
    return client.get<UserProfileApiResponse>(API_ENDPOINTS.AUTH.ME);
  },
  
  /**
   * Logout user
   */
  logout: async (data: LogoutApiRequest): Promise<ApiResponse<void>> => {
    const client = getApiClient();
    return client.post<void>(API_ENDPOINTS.AUTH.LOGOUT, data);
  },
  
  /**
   * Verify email
   */
  verifyEmail: async (data: VerifyEmailApiRequest): Promise<ApiResponse<void>> => {
    const client = getApiClient();
    return client.post<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data, false);
  },
  
  /**
   * Request password reset
   */
  requestPasswordReset: async (data: PasswordResetRequestApiRequest): Promise<ApiResponse<void>> => {
    const client = getApiClient();
    return client.post<void>(API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST, data, false);
  },
  
  /**
   * Confirm password reset
   */
  confirmPasswordReset: async (data: PasswordResetConfirmApiRequest): Promise<ApiResponse<void>> => {
    const client = getApiClient();
    return client.post<void>(API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, data, false);
  },
};

/**
 * Avatar API service methods
 */
export const avatarApi = {
  /**
   * Get user avatar
   */
  getAvatar: async (): Promise<ApiResponse<GetAvatarApiResponse>> => {
    const client = getApiClient();
    return client.get<GetAvatarApiResponse>(API_ENDPOINTS.USER.AVATAR);
  },
  
  /**
   * Update user avatar
   */
  updateAvatar: async (data: UpdateAvatarApiRequest): Promise<ApiResponse<UpdateAvatarApiResponse>> => {
    const client = getApiClient();
    return client.post<UpdateAvatarApiResponse>(API_ENDPOINTS.USER.AVATAR_UPDATE, data);
  },
  
  /**
   * Get avatar processing status
   */
  getAvatarStatus: async (processingId: string): Promise<ApiResponse<AvatarStatusApiResponse>> => {
    const client = getApiClient();
    return client.get<AvatarStatusApiResponse>(API_ENDPOINTS.USER.AVATAR_STATUS, { processingId });
  },
  
  /**
   * Delete user avatar
   */
  deleteAvatar: async (data: DeleteAvatarApiRequest): Promise<ApiResponse<void>> => {
    const client = getApiClient();
    return client.delete<void>(API_ENDPOINTS.USER.AVATAR);
  },
};

// Default export
export default getApiClient;