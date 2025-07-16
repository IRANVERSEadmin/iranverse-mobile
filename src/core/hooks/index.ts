// src/hooks/index.ts
// IRANVERSE Enterprise Custom Hooks Collection
// Complete hook ecosystem for authentication, avatar, and WebView management
// Built for 90M users - Type-Safe + Performance Optimized + Error Boundaries

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useAuthContext } from '../../features/auth/contexts/AuthContext';
import { useAvatarContext } from '../../features/avatar/contexts/AvatarContext';
import { AuthState, AuthenticatedUser, LoginRequest, SignupRequest } from '../../features/auth/types';
import { AvatarState, RPMWebViewMessage, RPMAvatarCompleteEventData } from '../../features/avatar/types';
import { parseRPMEvent } from '../../features/avatar/utils';
import { isTokenExpired as checkTokenExpired } from '../utils/storage';

// ========================================================================================
// AUTHENTICATION HOOKS - ENTERPRISE AUTH MANAGEMENT
// ========================================================================================

/**
 * Enhanced authentication hook with computed properties and error handling
 * Provides complete authentication interface with automatic token management
 */
export const useAuth = () => {
  const authContext = useAuthContext();
  
  // Computed properties for enhanced UX
  const isTokenExpiredState = useMemo(() => {
    if (!authContext.tokens?.accessToken) return true;
    return checkTokenExpired(authContext.tokens.accessToken);
  }, [authContext.tokens?.accessToken]);
  
  const isTokenExpiringSoon = useMemo(() => {
    if (!authContext.tokens?.accessToken) return true;
    
    try {
      const parts = authContext.tokens.accessToken.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      
      if (!exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60; // 5 minutes in seconds
      
      return (exp - now) <= fiveMinutes;
    } catch (error) {
      return true;
    }
  }, [authContext.tokens?.accessToken]);
  
  const timeUntilExpiry = useMemo(() => {
    if (!authContext.tokens?.accessToken) return null;
    
    try {
      const parts = authContext.tokens.accessToken.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      
      if (!exp) return null;
      
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, exp - now);
    } catch (error) {
      return null;
    }
  }, [authContext.tokens?.accessToken]);
  
  // Enhanced methods with error handling
  const getValidToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!authContext.tokens?.accessToken) return null;
      
      if (isTokenExpiredState) {
        await authContext.refreshToken();
        return authContext.tokens?.accessToken || null;
      }
      
      return authContext.tokens.accessToken;
    } catch (error) {
      console.error('Failed to get valid token:', error);
      return null;
    }
  }, [authContext, isTokenExpiredState]);
  
  const requireAuth = useCallback((): boolean => {
    if (!authContext.isAuthenticated) {
      throw new Error('Authentication required');
    }
    return true;
  }, [authContext.isAuthenticated]);
  
  const requireEmailVerification = useCallback((): boolean => {
    if (!authContext.user?.isEmailVerified) {
      throw new Error('Email verification required');
    }
    return true;
  }, [authContext.user?.isEmailVerified]);
  
  return {
    // State from context
    ...authContext,
    
    // Computed properties
    isTokenExpired: isTokenExpiredState,
    isTokenExpiringSoon,
    timeUntilExpiry,
    
    // Enhanced methods
    getValidToken,
    requireAuth,
    requireEmailVerification,
  };
};

// ========================================================================================
// AVATAR HOOKS - 3D ASSET MANAGEMENT
// ========================================================================================

/**
 * Enhanced avatar hook with computed properties and lifecycle management
 * Provides complete avatar interface with automatic synchronization
 */
export const useAvatar = () => {
  const avatarContext = useAvatarContext();
  
  // Computed properties for enhanced UX
  const hasAvatar = useMemo(() => {
    return !!(avatarContext.rpmId || avatarContext.glb);
  }, [avatarContext.rpmId, avatarContext.glb]);
  
  const isProcessing = useMemo(() => {
    return ['queued', 'processing', 'creating', 'updating', 'optimizing'].includes(avatarContext.status);
  }, [avatarContext.status]);
  
  const isReady = useMemo(() => {
    return avatarContext.status === 'complete' && hasAvatar;
  }, [avatarContext.status, hasAvatar]);
  
  const hasError = useMemo(() => {
    return avatarContext.status === 'error' || !!avatarContext.error;
  }, [avatarContext.status, avatarContext.error]);
  
  // Asset URL helpers
  const getThumbnailUrl = useCallback((size: 'small' | 'medium' | 'large' | 'square' | 'portrait' | 'landscape') => {
    return avatarContext.thumbnails[size];
  }, [avatarContext.thumbnails]);
  
  const getOptimizedUrl = useCallback((type: 'mobile' | 'mobileHd' | 'web' | 'webHd' | 'ar' | 'vr' | 'streaming' | 'lowLatency') => {
    return avatarContext.optimized[type];
  }, [avatarContext.optimized]);
  
  const get3DModelUrl = useCallback((format: 'glb' | 'usdz' | 'fbx') => {
    switch (format) {
      case 'glb':
        return avatarContext.glb;
      case 'usdz':
        return avatarContext.usdz;
      case 'fbx':
        return avatarContext.fbx;
      default:
        return null;
    }
  }, [avatarContext.glb, avatarContext.usdz, avatarContext.fbx]);
  
  // Enhanced methods
  const refreshAvatar = useCallback(async (): Promise<void> => {
    try {
      await avatarContext.syncAvatar();
    } catch (error) {
      console.error('Failed to refresh avatar:', error);
      throw error;
    }
  }, [avatarContext]);
  
  const isAvatarExpired = useCallback((): boolean => {
    if (!avatarContext.expiresAt) return false;
    return Date.now() > avatarContext.expiresAt.getTime();
  }, [avatarContext.expiresAt]);
  
  return {
    // State from context
    ...avatarContext,
    
    // Computed properties
    hasAvatar,
    isProcessing,
    isReady,
    hasError,
    
    // Asset helpers
    getThumbnailUrl,
    getOptimizedUrl,
    get3DModelUrl,
    
    // Enhanced methods
    refreshAvatar,
    isAvatarExpired,
  };
};

// ========================================================================================
// WEBVIEW HOOKS - READY PLAYER ME INTEGRATION
// ========================================================================================

/**
 * WebView message handling configuration
 */
interface WebViewMessageConfig {
  allowedOrigins: string[];
  validateSource: boolean;
  messageTimeout: number;
  maxRetries: number;
  onMessage?: (message: RPMWebViewMessage) => void;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
}

/**
 * WebView state for avatar creation
 */
interface WebViewState {
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  hasError: boolean;
  lastMessage: RPMWebViewMessage | null;
  messageHistory: RPMWebViewMessage[];
  creationProgress: number;
  currentStep: string | null;
}

/**
 * Ready Player Me WebView communication hook
 * Handles secure postMessage communication with RPM iframe
 */
export const useWebView = (config?: Partial<WebViewMessageConfig>) => {
  const { setAvatar } = useAvatar();
  
  // Configuration with defaults
  const fullConfig: WebViewMessageConfig = useMemo(() => ({
    allowedOrigins: ['https://creator.readyplayer.me'],
    validateSource: true,
    messageTimeout: 30000, // 30 seconds
    maxRetries: 3,
    ...config,
  }), [config]);
  
  // WebView state
  const [webViewState, setWebViewState] = useState<WebViewState>({
    isLoading: true,
    isReady: false,
    error: null,
    hasError: false,
    lastMessage: null,
    messageHistory: [],
    creationProgress: 0,
    currentStep: null,
  });
  
  // Message timeout management
  const messageTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const retryCountRef = useRef<number>(0);
  
  // Clear message timeout
  const clearMessageTimeout = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = undefined;
    }
  }, []);
  
  // Set message timeout
  const setMessageTimeout = useCallback(() => {
    clearMessageTimeout();
    messageTimeoutRef.current = setTimeout(() => {
      if (fullConfig.onTimeout) {
        fullConfig.onTimeout();
      }
      setWebViewState(prev => ({
        ...prev,
        error: new Error('Message timeout - no response from RPM'),
        hasError: true,
      }));
    }, fullConfig.messageTimeout);
  }, [fullConfig, clearMessageTimeout]);
  
  // Validate message origin and source
  const validateMessage = useCallback((event: any): boolean => {
    if (!fullConfig.validateSource) return true;
    
    // Validate origin
    if (!fullConfig.allowedOrigins.includes(event.origin)) {
      console.warn('Message from unauthorized origin:', event.origin);
      return false;
    }
    
    // Validate message structure
    if (!event.data || typeof event.data !== 'object') {
      console.warn('Invalid message structure:', event.data);
      return false;
    }
    
    return true;
  }, [fullConfig]);
  
  // Handle WebView messages
  const handleMessage = useCallback(async (event: any) => {
    try {
      // Security validation
      if (!validateMessage(event)) {
        return;
      }
      
      const messageData = event.data;
      
      // Parse message
      const message: RPMWebViewMessage = {
        type: messageData.type,
        data: messageData.data,
        source: 'readyplayerme',
        timestamp: Date.now(),
      };
      
      // Update state
      setWebViewState(prev => ({
        ...prev,
        lastMessage: message,
        messageHistory: [...prev.messageHistory, message].slice(-10), // Keep last 10 messages
        error: null,
        hasError: false,
      }));
      
      // Clear timeout on successful message
      clearMessageTimeout();
      retryCountRef.current = 0;
      
      // Handle specific message types
      switch (message.type) {
        case 'v1.frame.ready':
          setWebViewState(prev => ({
            ...prev,
            isLoading: false,
            isReady: true,
            currentStep: 'ready',
          }));
          break;
          
        case 'v1.user.set':
          setWebViewState(prev => ({
            ...prev,
            currentStep: 'user_configured',
            creationProgress: 25,
          }));
          break;
          
        case 'v1.avatar.exported':
          await handleAvatarExported(message.data as RPMAvatarCompleteEventData);
          break;
          
        default:
          console.log('Unhandled RPM message type:', message.type);
      }
      
      // Call custom message handler
      if (fullConfig.onMessage) {
        fullConfig.onMessage(message);
      }
      
    } catch (error) {
      console.error('Error handling WebView message:', error);
      
      const errorObj = error instanceof Error ? error : new Error('Message handling failed');
      
      setWebViewState(prev => ({
        ...prev,
        error: errorObj,
        hasError: true,
      }));
      
      if (fullConfig.onError) {
        fullConfig.onError(errorObj);
      }
    }
  }, [validateMessage, clearMessageTimeout, fullConfig, setAvatar]);
  
  // Handle avatar export completion
  const handleAvatarExported = useCallback(async (eventData: RPMAvatarCompleteEventData) => {
    try {
      setWebViewState(prev => ({
        ...prev,
        currentStep: 'processing_avatar',
        creationProgress: 75,
      }));
      
      // Parse RPM event data into avatar update request
      const avatarUpdateRequest = parseRPMEvent(eventData);
      
      // Set avatar data
      await setAvatar(avatarUpdateRequest);
      
      setWebViewState(prev => ({
        ...prev,
        currentStep: 'avatar_complete',
        creationProgress: 100,
      }));
      
    } catch (error) {
      console.error('Failed to handle avatar export:', error);
      
      const errorObj = error instanceof Error ? error : new Error('Avatar export handling failed');
      
      setWebViewState(prev => ({
        ...prev,
        error: errorObj,
        hasError: true,
      }));
      
      if (fullConfig.onError) {
        fullConfig.onError(errorObj);
      }
    }
  }, [setAvatar, fullConfig]);
  
  // Reset WebView state
  const resetState = useCallback(() => {
    clearMessageTimeout();
    retryCountRef.current = 0;
    setWebViewState({
      isLoading: true,
      isReady: false,
      error: null,
      hasError: false,
      lastMessage: null,
      messageHistory: [],
      creationProgress: 0,
      currentStep: null,
    });
  }, [clearMessageTimeout]);
  
  // Retry last operation
  const retry = useCallback(() => {
    if (retryCountRef.current >= fullConfig.maxRetries) {
      const error = new Error('Maximum retry attempts exceeded');
      setWebViewState(prev => ({
        ...prev,
        error,
        hasError: true,
      }));
      return;
    }
    
    retryCountRef.current += 1;
    resetState();
    setMessageTimeout();
  }, [fullConfig.maxRetries, resetState, setMessageTimeout]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMessageTimeout();
    };
  }, [clearMessageTimeout]);
  
  // Start message timeout when loading
  useEffect(() => {
    if (webViewState.isLoading && !webViewState.hasError) {
      setMessageTimeout();
    }
  }, [webViewState.isLoading, webViewState.hasError, setMessageTimeout]);
  
  return {
    // WebView state
    ...webViewState,
    
    // Message handling
    handleMessage,
    
    // Control methods
    resetState,
    retry,
    
    // Configuration
    config: fullConfig,
    
    // Utility
    retryCount: retryCountRef.current,
    canRetry: retryCountRef.current < fullConfig.maxRetries,
  };
};

// ========================================================================================
// UTILITY HOOKS - COMMON PATTERNS
// ========================================================================================

/**
 * Enhanced loading state hook with timeout and error handling
 */
export const useLoading = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const startLoading = useCallback((timeout?: number) => {
    setIsLoading(true);
    setError(null);
    
    if (timeout) {
      timeoutRef.current = setTimeout(() => {
        setError(new Error('Operation timed out'));
        setIsLoading(false);
      }, timeout);
    }
  }, []);
  
  const stopLoading = useCallback(() => {
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);
  
  const setLoadingError = useCallback((error: Error | string) => {
    setError(error instanceof Error ? error : new Error(error));
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    isLoading,
    error,
    hasError: !!error,
    startLoading,
    stopLoading,
    setError: setLoadingError,
    clearError: () => setError(null),
  };
};

/**
 * Debounced value hook for search and form inputs
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * Previous value hook for comparison
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

/**
 * Local storage hook with JSON serialization
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
};

// ========================================================================================
// EXPORTS - CENTRALIZED HOOK ACCESS
// ========================================================================================

// Export error handler hook
export * from './useErrorHandler';

export default {
  // Core hooks
  useAuth,
  useAvatar,
  useWebView,
  
  // Utility hooks
  useLoading,
  useDebounce,
  usePrevious,
  useLocalStorage,
};