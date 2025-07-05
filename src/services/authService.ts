// src/services/authService.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

// Types
import { 
  LoginDto, 
  RegisterDto, 
  AuthSuccessResponse, 
  ApiErrorResponse,
  User,
  OAuthLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendVerificationDto
} from '../types/auth.types';

// Configuration for Iranian Network Optimization
const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.iranverse.com',
  TIMEOUT: 30000, // 30 seconds for Iranian networks
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // Start with 1 second
  COMPRESSION_THRESHOLD: 1024, // Compress requests larger than 1KB
  MAX_CONCURRENT_REQUESTS: 5,
  REQUEST_QUEUE_SIZE: 50,
};

// Request Queue for Iranian Network Optimization
interface QueuedRequest {
  id: string;
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

class AuthService {
  private apiClient: AxiosInstance;
  private requestQueue: QueuedRequest[] = [];
  private activeRequests: number = 0;
  private isProcessingQueue: boolean = false;
  private authToken: string | null = null;
  private refreshPromise: Promise<any> | null = null;

  constructor() {
    this.apiClient = this.createApiClient();
    this.setupInterceptors();
    this.monitorNetworkStatus();
  }

  /**
   * Create optimized API client for Iranian networks
   */
  private createApiClient(): AxiosInstance {
    const client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Iranian-Optimization': 'enabled',
        'User-Agent': `IRANVERSE-Mobile/${Platform.OS}/${Platform.Version}`,
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      // Enable compression for better performance on slow networks
      decompress: true,
      // Retry configuration
      transformRequest: [
        (data, headers) => {
          // Compress large payloads
          if (data && JSON.stringify(data).length > API_CONFIG.COMPRESSION_THRESHOLD) {
            headers['Content-Encoding'] = 'gzip';
          }
          return JSON.stringify(data);
        }
      ],
    });

    return client;
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor
    this.apiClient.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add Iranian network optimizations
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Iranian-Network'] = 'true';
        config.headers['X-Platform'] = Platform.OS;
        config.headers['X-App-Version'] = '1.0.0'; // TODO: Get from app.json

        // Network quality header for server optimization
        const networkState = await NetInfo.fetch();
        if (networkState.details) {
          config.headers['X-Network-Quality'] = this.getNetworkQuality(networkState);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor with Auto-Retry and Token Refresh
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized - Token Refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (this.authToken && !originalRequest.url?.includes('/auth/refresh')) {
            try {
              await this.refreshToken();
              // Retry original request with new token
              if (this.authToken) {
                originalRequest.headers.Authorization = `Bearer ${this.authToken}`;
                return this.apiClient(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.clearAuthToken();
              return Promise.reject(refreshError);
            }
          }
        }

        // Handle Network Errors with Retry Logic
        if (this.isRetryableError(error) && !originalRequest._retryCount) {
          return this.retryRequest(originalRequest, error);
        }

        // Handle Rate Limiting
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
          return this.delayedRetry(originalRequest, retryAfter * 1000);
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Monitor network status for queue management
   */
  private monitorNetworkStatus(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.requestQueue.length > 0) {
        this.processRequestQueue();
      }
    });
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determine network quality for server optimization
   */
  private getNetworkQuality(networkState: any): string {
    if (!networkState.isConnected) return 'offline';
    
    const type = networkState.type;
    const details = networkState.details;

    if (type === 'wifi') {
      return details?.strength > 80 ? 'excellent' : 
             details?.strength > 60 ? 'good' : 
             details?.strength > 40 ? 'fair' : 'poor';
    } else if (type === 'cellular') {
      return details?.cellularGeneration === '5g' ? 'excellent' :
             details?.cellularGeneration === '4g' ? 'good' :
             details?.cellularGeneration === '3g' ? 'fair' : 'poor';
    }

    return 'unknown';
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) return true; // Network error
    
    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest(originalRequest: any, error: AxiosError): Promise<any> {
    const retryCount = (originalRequest._retryCount || 0) + 1;
    
    if (retryCount > API_CONFIG.RETRY_ATTEMPTS) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = retryCount;
    
    const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, retryCount - 1); // Exponential backoff
    
    await this.delay(delay);
    
    return this.apiClient(originalRequest);
  }

  /**
   * Delayed retry for rate limiting
   */
  private async delayedRetry(originalRequest: any, delay: number): Promise<any> {
    await this.delay(delay);
    return this.apiClient(originalRequest);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format error for consistent handling
   */
  private formatError(error: AxiosError): ApiErrorResponse {
    if (error.response?.data) {
      return error.response.data as ApiErrorResponse;
    }

    // Network or unknown error
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network connection failed',
        message_fa: 'خطا در اتصال به شبکه',
        correlation_id: this.generateRequestId(),
      },
    };
  }

  /**
   * Execute request with queue management
   */
  private async executeRequest<T>(
    config: AxiosRequestConfig,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<T> {
    const networkState = await NetInfo.fetch();
    
    if (!networkState.isConnected) {
      throw new Error('No internet connection');
    }

    if (this.activeRequests >= API_CONFIG.MAX_CONCURRENT_REQUESTS) {
      return this.queueRequest<T>(config, priority);
    }

    return this.performRequest<T>(config);
  }

  /**
   * Queue request for later execution
   */
  private queueRequest<T>(config: AxiosRequestConfig, priority: 'high' | 'medium' | 'low'): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.requestQueue.length >= API_CONFIG.REQUEST_QUEUE_SIZE) {
        // Remove lowest priority item
        const lowPriorityIndex = this.requestQueue.findIndex(req => req.priority === 'low');
        if (lowPriorityIndex !== -1) {
          const removed = this.requestQueue.splice(lowPriorityIndex, 1)[0];
          removed.reject(new Error('Request queue full'));
        } else {
          reject(new Error('Request queue full'));
          return;
        }
      }

      const queuedRequest: QueuedRequest = {
        id: this.generateRequestId(),
        config,
        resolve,
        reject,
        retryCount: 0,
        priority,
      };

      // Insert based on priority
      if (priority === 'high') {
        this.requestQueue.unshift(queuedRequest);
      } else {
        this.requestQueue.push(queuedRequest);
      }

      this.processRequestQueue();
    });
  }

  /**
   * Process queued requests
   */
  private async processRequestQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0 && this.activeRequests < API_CONFIG.MAX_CONCURRENT_REQUESTS) {
      const queuedRequest = this.requestQueue.shift();
      
      if (queuedRequest) {
        this.performRequest(queuedRequest.config)
          .then(queuedRequest.resolve)
          .catch(queuedRequest.reject);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Perform actual HTTP request
   */
  private async performRequest<T>(config: AxiosRequestConfig): Promise<T> {
    this.activeRequests++;
    
    try {
      const response = await this.apiClient(config);
      return response.data;
    } finally {
      this.activeRequests--;
      this.processRequestQueue();
    }
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * User Registration
   */
  public async register(userData: RegisterDto): Promise<AuthSuccessResponse> {
    return this.executeRequest<AuthSuccessResponse>({
      method: 'POST',
      url: '/auth/register',
      data: userData,
    }, 'high');
  }

  /**
   * User Login
   */
  public async login(credentials: LoginDto): Promise<AuthSuccessResponse> {
    const response = await this.executeRequest<AuthSuccessResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    }, 'high');

    // Store token for subsequent requests
    if (response.success && response.tokens) {
      this.setAuthToken(response.tokens.access_token);
    }

    return response;
  }

  /**
   * OAuth Login (Google, Apple)
   */
  public async oauthLogin(oauthData: OAuthLoginDto): Promise<AuthSuccessResponse> {
    const response = await this.executeRequest<AuthSuccessResponse>({
      method: 'POST',
      url: '/auth/oauth/login',
      data: oauthData,
    }, 'high');

    // Store token for subsequent requests
    if (response.success && response.tokens) {
      this.setAuthToken(response.tokens.access_token);
    }

    return response;
  }

  /**
   * Logout
   */
  public async logout(): Promise<{ success: boolean }> {
    try {
      const response = await this.executeRequest<{ success: boolean }>({
        method: 'POST',
        url: '/auth/logout',
      }, 'high');

      this.clearAuthToken();
      return response;
    } catch (error) {
      this.clearAuthToken();
      throw error;
    }
  }

  /**
   * Logout from all devices
   */
  public async logoutFromAllDevices(): Promise<{ success: boolean }> {
    try {
      const response = await this.executeRequest<{ success: boolean }>({
        method: 'DELETE',
        url: '/auth/sessions',
      }, 'high');

      this.clearAuthToken();
      return response;
    } catch (error) {
      this.clearAuthToken();
      throw error;
    }
  }

  /**
   * Refresh Access Token
   */
  public async refreshToken(): Promise<AuthSuccessResponse> {
    // Prevent multiple concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<AuthSuccessResponse> {
    const refreshToken = await SecureStore.getItemAsync('iranverse_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.executeRequest<AuthSuccessResponse>({
      method: 'POST',
      url: '/auth/refresh',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    }, 'high');

    // Update stored token
    if (response.success && response.tokens) {
      this.setAuthToken(response.tokens.access_token);
      await SecureStore.setItemAsync('iranverse_access_token', response.tokens.access_token);
      await SecureStore.setItemAsync('iranverse_refresh_token', response.tokens.refresh_token);
    }

    return response;
  }

  /**
   * Get Current User
   */
  public async getCurrentUser(): Promise<AuthSuccessResponse> {
    return this.executeRequest<AuthSuccessResponse>({
      method: 'GET',
      url: '/auth/me',
    }, 'medium');
  }

  /**
   * Update User Profile
   */
  public async updateProfile(userData: Partial<User>): Promise<AuthSuccessResponse> {
    return this.executeRequest<AuthSuccessResponse>({
      method: 'PATCH',
      url: '/auth/profile',
      data: userData,
    }, 'medium');
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Forgot Password
   */
  public async forgotPassword(data: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
    return this.executeRequest<{ success: boolean; message: string }>({
      method: 'POST',
      url: '/auth/forgot-password',
      data,
    }, 'high');
  }

  /**
   * Reset Password
   */
  public async resetPassword(data: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    return this.executeRequest<{ success: boolean; message: string }>({
      method: 'POST',
      url: '/auth/reset-password',
      data,
    }, 'high');
  }

  /**
   * Change Password
   */
  public async changePassword(data: ChangePasswordDto): Promise<{ success: boolean; message: string }> {
    return this.executeRequest<{ success: boolean; message: string }>({
      method: 'PATCH',
      url: '/auth/change-password',
      data,
    }, 'medium');
  }

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Verify Email
   */
  public async verifyEmail(email: string, token?: string): Promise<{ success: boolean; message: string }> {
    return this.executeRequest<{ success: boolean; message: string }>({
      method: 'POST',
      url: '/email-verification/verify-email',
      data: { email, token },
    }, 'high');
  }

  /**
   * Resend Verification Email
   */
  public async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    return this.executeRequest<{ success: boolean; message: string }>({
      method: 'POST',
      url: '/email-verification/resend-verification',
      data: { email },
    }, 'medium');
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check API Health
   */
  public async checkHealth(): Promise<{ status: string; timestamp: number }> {
    return this.executeRequest<{ status: string; timestamp: number }>({
      method: 'GET',
      url: '/health',
    }, 'low');
  }

  /**
   * Get API Statistics (for diagnostics)
   */
  public getApiStatistics() {
    return {
      queueLength: this.requestQueue.length,
      activeRequests: this.activeRequests,
      isAuthenticated: !!this.authToken,
      baseURL: API_CONFIG.BASE_URL,
    };
  }

  /**
   * Clear request queue (for cleanup)
   */
  public clearRequestQueue(): void {
    this.requestQueue.forEach(req => {
      req.reject(new Error('Request queue cleared'));
    });
    this.requestQueue = [];
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;