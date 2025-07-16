// src/context/AuthContext.tsx
// IRANVERSE Enterprise Authentication Context
// Complete authentication state management with enterprise security
// Built for 90M users - JWT + Token Refresh + Secure Storage
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { AuthState, AuthContextValue, LoginRequest, SignupRequest, AuthResponse, AuthError, AuthenticatedUser, TokenRefreshResponse } from '../types';
import { authApi } from '../../../core/constants/api';
import { authTokenStorage, secureStorage } from '../../../core/utils/storage';
import { ENCRYPTION_CONFIG } from '../../../core/config/app.config';
import { Platform } from 'react-native';

// ========================================================================================
// AUTHENTICATION CONTEXT SETUP - ENTERPRISE STATE MANAGEMENT
// ========================================================================================

/**
 * Authentication context for global auth state management
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication action types for reducer
 */
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { user: AuthenticatedUser; tokens: any } }
  | { type: 'SET_USER'; payload: AuthenticatedUser }
  | { type: 'SET_ERROR'; payload: AuthError | null }
  | { type: 'CLEAR_AUTH' }
  | { type: 'UPDATE_LAST_ACTIVITY' }
  | { type: 'SET_DEVICE_ID'; payload: string };

/**
 * Initial authentication state
 */
const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  user: null,
  tokens: null,
  error: null,
  sessionMetadata: null,
  lastActivity: null,
  deviceId: null,
};

/**
 * Authentication state reducer
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error, // Clear error on new loading
      };

    case 'SET_REFRESHING':
      return {
        ...state,
        isRefreshing: action.payload,
      };

    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        isRefreshing: false,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
        lastActivity: new Date(),
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        lastActivity: new Date(),
      };

    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        isRefreshing: false,
        error: action.payload,
      };

    case 'CLEAR_AUTH':
      return {
        ...initialAuthState,
        deviceId: state.deviceId, // Preserve device ID
      };

    case 'UPDATE_LAST_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date(),
      };

    case 'SET_DEVICE_ID':
      return {
        ...state,
        deviceId: action.payload,
      };

    default:
      return state;
  }
};

// ========================================================================================
// AUTHENTICATION PROVIDER - ENTERPRISE CONTEXT PROVIDER
// ========================================================================================

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Enterprise authentication provider with secure token management
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // ========================================================================================
  // INITIALIZATION - RESTORE SESSION ON APP START
  // ========================================================================================

  /**
   * Initialize authentication state from secure storage
   */
  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Initialize secure storage
      await secureStorage.initialize();

      // Generate or retrieve device ID
      const deviceId = await getOrCreateDeviceId();
      dispatch({ type: 'SET_DEVICE_ID', payload: deviceId });

      // Attempt to restore session from stored tokens
      const accessToken = await authTokenStorage.getAccessToken();
      const refreshToken = await authTokenStorage.getRefreshToken();

      if (accessToken && refreshToken) {
        // Check if access token is still valid
        const isExpired = await authTokenStorage.isTokenExpired(accessToken);
        
        if (!isExpired) {
          // Token is valid, get user profile
          await getCurrentUser();
        } else {
          // Token expired, try to refresh
          await handleTokenRefresh();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      dispatch({ type: 'SET_ERROR', payload: createAuthError('INITIALIZATION_ERROR', 'Failed to initialize authentication') });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  /**
   * Get or create unique device ID
   */
  const getOrCreateDeviceId = async (): Promise<string> => {
    try {
      const existingId = await secureStorage.getItem<string>('device_id');
      if (existingId.success && existingId.data) {
        return existingId.data;
      }

      // Generate new device ID
      const newDeviceId = `device_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await secureStorage.setItem('device_id', newDeviceId);
      return newDeviceId;
    } catch (error) {
      // Fallback device ID
      return `device_${Platform.OS}_${Date.now()}`;
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ========================================================================================
  // AUTHENTICATION METHODS - CORE AUTH OPERATIONS
  // ========================================================================================

  /**
   * User login with credentials
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Add device information to login request
      const loginData = {
        ...credentials,
        deviceInfo: {
          platform: Platform.OS as 'ios' | 'android',
          osVersion: Platform.Version.toString(),
          appVersion: '1.0.0', // Should come from config
          deviceId: state.deviceId || 'unknown',
        },
      };

      const response = await authApi.login(loginData);

      if (response.success && response.data) {
        // Store tokens securely
        await authTokenStorage.storeTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );

        // Store user profile
        await secureStorage.setItem(
          ENCRYPTION_CONFIG.storageKeys.userProfile,
          response.data.user
        );

        // Update state
        dispatch({
          type: 'SET_AUTHENTICATED',
          payload: {
            user: response.data.user,
            tokens: response.data.tokens,
          },
        });

        return {
          success: true,
          message: 'Login successful',
          user: response.data.user,
          tokens: response.data.tokens,
          session: {
            sessionId: response.data.session.sessionId,
            deviceId: response.data.session.deviceId,
            deviceInfo: {
              platform: Platform.OS as 'ios' | 'android',
              osVersion: Platform.Version.toString(),
              appVersion: '1.0.0',
            },
            isTrustedDevice: true,
          },
          isNewUser: response.data.isNewUser,
          nextAction: response.data.nextAction,
        };
      } else {
        const error = createAuthError('LOGIN_FAILED', response.error?.message || 'Login failed');
        dispatch({ type: 'SET_ERROR', payload: error });
        throw error;
      }
    } catch (error) {
      const authError = createAuthError('LOGIN_ERROR', getErrorMessage(error));
      dispatch({ type: 'SET_ERROR', payload: authError });
      throw authError;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.deviceId]);

  /**
   * User signup with registration data
   */
  const signup = useCallback(async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Handle preferredLanguage conversion
      const normalizedPreferredLanguage = data.preferredLanguage === 'auto' ? 'en' : data.preferredLanguage;

      // Add device information to signup request
      const signupData = {
        ...data,
        preferredLanguage: normalizedPreferredLanguage,
        deviceInfo: {
          platform: Platform.OS as 'ios' | 'android',
          osVersion: Platform.Version.toString(),
          appVersion: '1.0.0', // Should come from config
          deviceId: state.deviceId || 'unknown',
        },
      };

      const response = await authApi.register(signupData);

      if (response.success && response.data) {
        // Store tokens securely
        await authTokenStorage.storeTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );

        // Store user profile
        await secureStorage.setItem(
          ENCRYPTION_CONFIG.storageKeys.userProfile,
          response.data.user
        );

        // Update state
        dispatch({
          type: 'SET_AUTHENTICATED',
          payload: {
            user: response.data.user,
            tokens: response.data.tokens,
          },
        });

        return {
          success: true,
          message: 'Signup successful',
          user: response.data.user,
          tokens: response.data.tokens,
          session: {
            sessionId: response.data.session.sessionId,
            deviceId: response.data.session.deviceId,
            deviceInfo: {
              platform: Platform.OS as 'ios' | 'android',
              osVersion: Platform.Version.toString(),
              appVersion: '1.0.0',
            },
            isTrustedDevice: true,
          },
          isNewUser: true,
          requiresEmailVerification: response.data.requiresEmailVerification,
          nextAction: response.data.nextAction,
        };
      } else {
        const error = createAuthError('SIGNUP_FAILED', response.error?.message || 'Signup failed');
        dispatch({ type: 'SET_ERROR', payload: error });
        throw error;
      }
    } catch (error) {
      const authError = createAuthError('SIGNUP_ERROR', getErrorMessage(error));
      dispatch({ type: 'SET_ERROR', payload: authError });
      throw authError;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.deviceId]);

  /**
   * User logout with optional device management
   */
  const logout = useCallback(async (options: { allDevices?: boolean } = {}): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Call logout API if authenticated
      if (state.isAuthenticated) {
        try {
          await authApi.logout({ 
            allDevices: options.allDevices || false,
            deviceId: state.deviceId || 'unknown'
          });
        } catch (error) {
          // Continue with local logout even if API call fails
          console.warn('Logout API call failed, continuing with local logout:', error);
        }
      }

      // Clear stored tokens and user data
      await authTokenStorage.clearTokens();
      await secureStorage.removeItem(ENCRYPTION_CONFIG.storageKeys.userProfile);
      await secureStorage.removeItem(ENCRYPTION_CONFIG.storageKeys.avatarMetadata);

      // Clear auth state
      dispatch({ type: 'CLEAR_AUTH' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear state even on error
      dispatch({ type: 'CLEAR_AUTH' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.isAuthenticated]);

  /**
   * Refresh authentication tokens
   */
  const refreshToken = useCallback(async (): Promise<TokenRefreshResponse> => {
    if (state.isRefreshing) {
      throw new Error('Token refresh already in progress');
    }

    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });

      const currentRefreshToken = await authTokenStorage.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refresh({ 
        refreshToken: currentRefreshToken,
        deviceId: state.deviceId || 'unknown'
      });

      if (response.success && response.data) {
        // Store new tokens
        await authTokenStorage.storeTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );

        // Update user data if provided
        if (response.data.user) {
          const updatedUser: AuthenticatedUser = {
            ...state.user!,
            ...response.data.user
          };
          dispatch({ type: 'SET_USER', payload: updatedUser });
          await secureStorage.setItem(
            ENCRYPTION_CONFIG.storageKeys.userProfile,
            updatedUser
          );
        }

        return {
          success: true,
          tokens: response.data.tokens,
          user: response.data.user
        };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear auth state on refresh failure
      await logout();
      throw error;
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [state.isRefreshing, logout]);

  /**
   * Handle automatic token refresh
   */
  const handleTokenRefresh = useCallback(async (): Promise<boolean> => {
    try {
      await refreshToken();
      await getCurrentUser(); // Refresh user data
      return true;
    } catch (error) {
      console.error('Automatic token refresh failed:', error);
      return false;
    }
  }, [refreshToken]);

  /**
   * Get current user profile from cache
   */
  const getCurrentUser = useCallback(async (): Promise<AuthenticatedUser> => {
    try {
      // Get cached user data from secure storage
      const cachedUser = await secureStorage.getItem<AuthenticatedUser>(ENCRYPTION_CONFIG.storageKeys.userProfile);
      if (cachedUser.success && cachedUser.data) {
        dispatch({ type: 'SET_USER', payload: cachedUser.data });
        return cachedUser.data;
      }
      
      throw new Error('No cached user data available');
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }, []);

  // ========================================================================================
  // UTILITY METHODS - HELPER FUNCTIONS
  // ========================================================================================

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const accessToken = await authTokenStorage.getAccessToken();
      if (!accessToken) return false;

      const isExpired = await authTokenStorage.isTokenExpired(accessToken);
      if (isExpired) {
        // Try to refresh token
        return await handleTokenRefresh();
      }

      return true;
    } catch (error) {
      console.error('Auth status check failed:', error);
      return false;
    }
  }, [handleTokenRefresh]);

  /**
   * Update last activity timestamp
   */
  const updateActivity = useCallback(() => {
    dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
  }, []);

  // ========================================================================================
  // SESSION MANAGEMENT - ACTIVITY TRACKING
  // ========================================================================================

  /**
   * Set up session timeout monitoring
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const sessionTimeout = ENCRYPTION_CONFIG.sessionTimeout * 1000; // Convert to milliseconds
    let timeoutId: NodeJS.Timeout;

    const resetSessionTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Session timeout - logging out user');
        logout();
      }, sessionTimeout);
    };

    // Initial timeout setup
    resetSessionTimeout();

    // Reset timeout on activity
    const handleActivity = () => {
      updateActivity();
      resetSessionTimeout();
    };

    // Note: In a real app, you'd add event listeners for user activity
    // For now, we'll rely on manual activity updates

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state.isAuthenticated, logout, updateActivity]);

  // ========================================================================================
  // CONTEXT VALUE - COMPLETE AUTH INTERFACE
  // ========================================================================================

  const contextValue: AuthContextValue = {
    // State
    ...state,
    
    // Core Authentication
    login,
    signup,
    logout,
    
    // Token Management
    refreshToken,
    clearTokens: async () => {
      await authTokenStorage.clearTokens();
      dispatch({ type: 'CLEAR_AUTH' });
    },
    
    // Profile Management
    getProfile: getCurrentUser,
    updateProfile: async (updates) => {
      // Ensure we have a current user
      if (!state.user) {
        throw new Error('No user authenticated');
      }
      
      // Create properly typed updated user
      const updatedUser: AuthenticatedUser = {
        ...state.user,
        ...updates,
        // Ensure all required fields are present
        id: updates.id ?? state.user.id,
        email: updates.email ?? state.user.email,
        username: updates.username ?? state.user.username,
        displayName: updates.displayName ?? state.user.displayName,
        firstName: updates.firstName ?? state.user.firstName,
        lastName: updates.lastName ?? state.user.lastName,
        isEmailVerified: updates.isEmailVerified ?? state.user.isEmailVerified,
        preferredLanguage: updates.preferredLanguage ?? state.user.preferredLanguage,
        lastLoginAt: updates.lastLoginAt ?? state.user.lastLoginAt,
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      await secureStorage.setItem(
        ENCRYPTION_CONFIG.storageKeys.userProfile,
        updatedUser
      );
      
      return updatedUser;
    },
    
    // Email/Password (placeholder implementations)
    requestPasswordReset: async (email: string) => {
      // Placeholder - would call password reset API
      console.log('Password reset requested for:', email);
    },
    confirmPasswordReset: async (request) => {
      // Placeholder - would call password reset confirmation API
      console.log('Password reset confirmation:', request);
    },
    verifyEmail: async (token: string) => {
      // Placeholder - would call email verification API
      console.log('Email verification:', token);
    },
    resendEmailVerification: async () => {
      // Placeholder - would call resend verification API
      console.log('Resend email verification');
    },
    
    // Security (placeholder implementations)
    enableTwoFactor: async () => {
      // Placeholder - would enable 2FA
      console.log('Enable 2FA');
    },
    disableTwoFactor: async (code: string) => {
      // Placeholder - would disable 2FA
      console.log('Disable 2FA:', code);
    },
    
    // Utility
    checkAuthStatus,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ========================================================================================
// UTILITY FUNCTIONS - HELPERS
// ========================================================================================

/**
 * Create standardized authentication error
 */
const createAuthError = (type: string, message: string): AuthError => {
  return {
    type: type as any,
    code: type,
    message,
    userMessage: message,
    timestamp: new Date(),
    retryable: false,
  };
};

/**
 * Extract error message from various error types
 */
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.userMessage) return error.userMessage;
  return 'An unknown error occurred';
};

// ========================================================================================
// CUSTOM HOOK - EASY CONTEXT ACCESS
// ========================================================================================

/**
 * Custom hook to use authentication context
 * Provides type-safe access to auth state and methods
 */
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;