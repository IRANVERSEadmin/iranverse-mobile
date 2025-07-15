// src/hooks/useWebView.ts
// IRANVERSE Enterprise WebView Communication Hook
// Secure Ready Player Me WebView integration with enterprise validation
// Built for 90M users - Complete RPM Pipeline + Navigation Management
import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import { useAvatar } from './useAvatar';
import { useAuth } from './useAuth';
import { RPMWebViewMessage, RPMAvatarCompleteEventData, UpdateAvatarRequest } from '../types/avatar';
import { parseRPMEvent } from '../utils/avatar';
import { RPM_CONFIG } from '../constants/config';

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE WEBVIEW SYSTEM
// ========================================================================================

/**
 * WebView message event structure
 */
interface WebViewMessageEvent {
  origin?: string;
  data?: any;
  nativeEvent?: {
    origin?: string;
    data?: any;
    url?: string;
  };
}

/**
 * WebView hook configuration
 */
interface UseWebViewConfig {
  // Security Configuration
  allowedOrigins?: string[];
  validateSource?: boolean;
  strictOriginCheck?: boolean;
  
  // Timeout & Retry Configuration
  messageTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  
  // Navigation Configuration
  autoNavigate?: boolean;
  navigationTarget?: string;
  
  // Debug Configuration
  enableDebugLogs?: boolean;
  logAllMessages?: boolean;
  
  // Event Handlers
  onMessage?: (message: RPMWebViewMessage) => void;
  onAvatarExported?: (data: RPMAvatarCompleteEventData) => void;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
  onNavigationTriggered?: (target: string) => void;
}

/**
 * WebView hook state
 */
interface WebViewState {
  // Connection State
  isConnected: boolean;
  isReady: boolean;
  isProcessing: boolean;
  
  // Message History
  lastMessage: RPMWebViewMessage | null;
  messageCount: number;
  
  // Error State
  error: Error | null;
  hasError: boolean;
  
  // Processing State
  currentStep: string | null;
  progress: number;
  
  // Retry Management
  retryCount: number;
  canRetry: boolean;
}

/**
 * WebView hook return type
 */
interface UseWebViewReturn {
  // State
  state: WebViewState;
  
  // Message Handling
  handleMessage: (event: WebViewMessageEvent) => void;
  injectMessage: (message: any) => void;
  
  // Control Methods
  reset: () => void;
  retry: () => void;
  clearError: () => void;
  
  // Utility
  isOriginAllowed: (origin: string) => boolean;
  getMessageHistory: () => RPMWebViewMessage[];
  
  // Configuration
  config: Required<UseWebViewConfig>;
}

// ========================================================================================
// ENTERPRISE WEBVIEW HOOK - COMPLETE RPM INTEGRATION
// ========================================================================================

/**
 * Enterprise WebView communication hook for Ready Player Me integration
 * Provides secure, type-safe communication with RPM iframe
 */
export const useWebView = (config: UseWebViewConfig = {}): UseWebViewReturn => {
  const navigation = useNavigation();
  const { setAvatar, updateAvatar } = useAvatar();
  const { user } = useAuth();

  // ========================================================================================
  // CONFIGURATION - ENTERPRISE DEFAULTS
  // ========================================================================================

  const fullConfig: Required<UseWebViewConfig> = useMemo(() => ({
    // Security Configuration
    allowedOrigins: [RPM_CONFIG.validOrigin, 'https://creator.readyplayer.me'],
    validateSource: true,
    strictOriginCheck: true,
    
    // Timeout & Retry Configuration
    messageTimeout: RPM_CONFIG.messageTimeout,
    maxRetries: RPM_CONFIG.maxRetries,
    retryDelay: 2000, // 2 seconds
    
    // Navigation Configuration
    autoNavigate: true,
    navigationTarget: 'OnboardingComplete',
    
    // Debug Configuration
    enableDebugLogs: __DEV__,
    logAllMessages: __DEV__,
    
    // Event Handlers
    onMessage: () => {},
    onAvatarExported: () => {},
    onError: () => {},
    onTimeout: () => {},
    onNavigationTriggered: () => {},
    
    // Override with user config
    ...config,
  }), [config]);

  // ========================================================================================
  // STATE MANAGEMENT - HOOK STATE
  // ========================================================================================

  const [state, setState] = useState<WebViewState>({
    isConnected: false,
    isReady: false,
    isProcessing: false,
    lastMessage: null,
    messageCount: 0,
    error: null,
    hasError: false,
    currentStep: null,
    progress: 0,
    retryCount: 0,
    canRetry: true,
  });

  // Refs for cleanup and timeout management
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const messageHistoryRef = useRef<RPMWebViewMessage[]>([]);
  const webViewRef = useRef<any>(null);

  // ========================================================================================
  // UTILITY FUNCTIONS - VALIDATION & HELPERS
  // ========================================================================================

  /**
   * Validate message origin against allowed origins
   */
  const isOriginAllowed = useCallback((origin: string): boolean => {
    if (!fullConfig.strictOriginCheck) return true;
    
    return fullConfig.allowedOrigins.some(allowedOrigin => {
      // Exact match
      if (origin === allowedOrigin) return true;
      
      // Subdomain match for RPM
      if (allowedOrigin.includes('readyplayer.me')) {
        try {
          const originUrl = new URL(origin);
          const allowedUrl = new URL(allowedOrigin);
          
          // Check if it's a subdomain of readyplayer.me
          return originUrl.hostname.endsWith('.readyplayer.me') && 
                 originUrl.protocol === allowedUrl.protocol;
        } catch {
          return false;
        }
      }
      
      return false;
    });
  }, [fullConfig.allowedOrigins, fullConfig.strictOriginCheck]);

  /**
   * Parse and validate WebView message
   */
  const parseMessage = useCallback((event: WebViewMessageEvent): RPMWebViewMessage | null => {
    try {
      // Extract origin and data from event
      const origin = event.origin || event.nativeEvent?.origin;
      let data = event.data || event.nativeEvent?.data;

      // Validate origin if strict checking is enabled
      if (fullConfig.validateSource && origin) {
        if (!isOriginAllowed(origin)) {
          if (fullConfig.enableDebugLogs) {
            console.warn('[useWebView] Message from unauthorized origin:', origin);
          }
          return null;
        }
      }

      // Parse data if it's a string
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (parseError) {
          if (fullConfig.enableDebugLogs) {
            console.warn('[useWebView] Failed to parse message data:', data);
          }
          return null;
        }
      }

      // Validate message structure
      if (!data || typeof data !== 'object') {
        if (fullConfig.enableDebugLogs) {
          console.warn('[useWebView] Invalid message structure:', data);
        }
        return null;
      }

      // Create RPM message structure
      const message: RPMWebViewMessage = {
        type: data.eventName || data.type || 'unknown',
        data: data.data || data,
        source: data.source || 'unknown',
        timestamp: Date.now(),
      };

      return message;
    } catch (error) {
      if (fullConfig.enableDebugLogs) {
        console.error('[useWebView] Error parsing message:', error);
      }
      return null;
    }
  }, [fullConfig, isOriginAllowed]);

  /**
   * Clear message timeout
   */
  const clearMessageTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  /**
   * Set message timeout
   */
  const setMessageTimeout = useCallback(() => {
    clearMessageTimeout();
    
    if (fullConfig.messageTimeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          error: new Error('WebView message timeout'),
          hasError: true,
        }));
        
        fullConfig.onTimeout();
      }, fullConfig.messageTimeout);
    }
  }, [fullConfig, clearMessageTimeout]);

  // ========================================================================================
  // MESSAGE HANDLING - CORE FUNCTIONALITY
  // ========================================================================================

  /**
   * Handle incoming WebView messages
   */
  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      // Parse and validate message
      const message = parseMessage(event);
      if (!message) return;

      // Update state
      setState(prev => ({
        ...prev,
        lastMessage: message,
        messageCount: prev.messageCount + 1,
        error: null,
        hasError: false,
      }));

      // Add to message history
      messageHistoryRef.current = [
        ...messageHistoryRef.current.slice(-9), // Keep last 9 messages
        message
      ];

      // Clear timeout on successful message
      clearMessageTimeout();

      // Debug logging
      if (fullConfig.enableDebugLogs) {
        if (fullConfig.logAllMessages || message.type.startsWith('v1.')) {
          console.log('[useWebView] Message received:', {
            type: message.type,
            source: message.source,
            data: message.data
          });
        }
      }

      // Handle specific message types
      await handleSpecificMessage(message);

      // Call custom message handler
      fullConfig.onMessage(message);

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Message handling failed');
      
      setState(prev => ({
        ...prev,
        error: errorObj,
        hasError: true,
      }));

      if (fullConfig.enableDebugLogs) {
        console.error('[useWebView] Error handling message:', error);
      }

      fullConfig.onError(errorObj);
    }
  }, [parseMessage, clearMessageTimeout, fullConfig]);

  /**
   * Handle specific RPM message types
   */
  const handleSpecificMessage = useCallback(async (message: RPMWebViewMessage) => {
    // Type assertion to allow extended message types
    const messageType = message.type as string;
    
    switch (messageType) {
      case 'v1.frame.ready':
        setState(prev => ({
          ...prev,
          isConnected: true,
          isReady: true,
          currentStep: 'ready',
        }));
        
        if (fullConfig.enableDebugLogs) {
          console.log('[useWebView] RPM frame ready');
        }
        break;

      case 'v1.user.set':
        setState(prev => ({
          ...prev,
          currentStep: 'user_configured',
          progress: 25,
        }));
        
        if (fullConfig.enableDebugLogs) {
          console.log('[useWebView] User configured in RPM');
        }
        break;

      case 'v1.avatar.exported':
        await handleAvatarExported(message.data as RPMAvatarCompleteEventData);
        break;

      case 'v1.user.authorized':
        setState(prev => ({
          ...prev,
          currentStep: 'user_authorized',
          progress: 10,
        }));
        break;

      case 'v1.user.updated':
        setState(prev => ({
          ...prev,
          currentStep: 'user_updated',
          progress: 50,
        }));
        break;

      default:
        if (fullConfig.enableDebugLogs) {
          console.log('[useWebView] Unhandled message type:', messageType);
        }
        break;
    }
  }, [fullConfig]);

  /**
   * Handle avatar export completion
   */
  const handleAvatarExported = useCallback(async (eventData: RPMAvatarCompleteEventData) => {
    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        currentStep: 'processing_avatar',
        progress: 75,
      }));

      if (fullConfig.enableDebugLogs) {
        console.log('[useWebView] Avatar exported:', eventData);
      }

      // Parse RPM event data into avatar update request
      const avatarUpdateRequest: UpdateAvatarRequest = parseRPMEvent(eventData);

      // Call avatar context to set/update avatar
      await setAvatar(avatarUpdateRequest);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentStep: 'avatar_complete',
        progress: 100,
      }));

      // Call custom avatar exported handler
      fullConfig.onAvatarExported(eventData);

      // Auto-navigate if enabled
      if (fullConfig.autoNavigate && fullConfig.navigationTarget) {
        if (fullConfig.enableDebugLogs) {
          console.log('[useWebView] Auto-navigating to:', fullConfig.navigationTarget);
        }

        // Add user context for navigation
        const navigationParams = {
          userId: user?.id || 'unknown',
          avatarUrl: avatarUpdateRequest.rpmUrl,
          isFromAvatarCreation: true,
        };

        fullConfig.onNavigationTriggered(fullConfig.navigationTarget);
        
        // Navigate based on target
        if (fullConfig.navigationTarget === 'OnboardingComplete') {
          (navigation as any).navigate('OnboardingComplete', navigationParams);
        } else {
          (navigation as any).navigate(fullConfig.navigationTarget, navigationParams);
        }
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error : new Error('Avatar export handling failed'),
        hasError: true,
      }));

      if (fullConfig.enableDebugLogs) {
        console.error('[useWebView] Error handling avatar export:', error);
      }

      fullConfig.onError(error instanceof Error ? error : new Error('Avatar export failed'));
    }
  }, [setAvatar, fullConfig, navigation, user]);

  // ========================================================================================
  // CONTROL METHODS - HOOK MANAGEMENT
  // ========================================================================================

  /**
   * Reset WebView state
   */
  const reset = useCallback(() => {
    clearMessageTimeout();
    
    setState({
      isConnected: false,
      isReady: false,
      isProcessing: false,
      lastMessage: null,
      messageCount: 0,
      error: null,
      hasError: false,
      currentStep: null,
      progress: 0,
      retryCount: 0,
      canRetry: true,
    });

    messageHistoryRef.current = [];

    if (fullConfig.enableDebugLogs) {
      console.log('[useWebView] State reset');
    }
  }, [clearMessageTimeout, fullConfig]);

  /**
   * Retry WebView operation
   */
  const retry = useCallback(() => {
    if (state.retryCount >= fullConfig.maxRetries) {
      setState(prev => ({
        ...prev,
        error: new Error('Maximum retry attempts exceeded'),
        hasError: true,
        canRetry: false,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null,
      hasError: false,
    }));

    // Retry with delay
    setTimeout(() => {
      reset();
      setMessageTimeout();
    }, fullConfig.retryDelay);

    if (fullConfig.enableDebugLogs) {
      console.log('[useWebView] Retrying operation, attempt:', state.retryCount + 1);
    }
  }, [state.retryCount, fullConfig, reset, setMessageTimeout]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      hasError: false,
    }));
  }, []);

  /**
   * Inject message into WebView
   */
  const injectMessage = useCallback((message: any) => {
    if (webViewRef.current) {
      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        webViewRef.current.injectJavaScript(`
          if (window.postMessage) {
            window.postMessage(${JSON.stringify(messageStr)}, '*');
          }
          true;
        `);

        if (fullConfig.enableDebugLogs) {
          console.log('[useWebView] Message injected:', message);
        }
      } catch (error) {
        if (fullConfig.enableDebugLogs) {
          console.error('[useWebView] Error injecting message:', error);
        }
      }
    }
  }, [fullConfig]);

  /**
   * Get message history
   */
  const getMessageHistory = useCallback((): RPMWebViewMessage[] => {
    return [...messageHistoryRef.current];
  }, []);

  // ========================================================================================
  // LIFECYCLE EFFECTS - SETUP & CLEANUP
  // ========================================================================================

  /**
   * Set up message timeout when component mounts or resets
   */
  useEffect(() => {
    if (!state.isReady && !state.hasError && fullConfig.messageTimeout > 0) {
      setMessageTimeout();
    }

    return () => {
      clearMessageTimeout();
    };
  }, [state.isReady, state.hasError, fullConfig.messageTimeout, setMessageTimeout, clearMessageTimeout]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearMessageTimeout();
    };
  }, [clearMessageTimeout]);

  /**
   * Platform-specific setup
   */
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web-specific WebView setup
      if (fullConfig.enableDebugLogs) {
        console.log('[useWebView] Web platform detected, adjusting configuration');
      }
    }
  }, [fullConfig]);

  // ========================================================================================
  // RETURN HOOK INTERFACE
  // ========================================================================================

  return {
    // State
    state,
    
    // Message Handling
    handleMessage,
    injectMessage,
    
    // Control Methods
    reset,
    retry,
    clearError,
    
    // Utility
    isOriginAllowed,
    getMessageHistory,
    
    // Configuration
    config: fullConfig,
  };
};

// ========================================================================================
// EXPORT DEFAULT
// ========================================================================================

export default useWebView;