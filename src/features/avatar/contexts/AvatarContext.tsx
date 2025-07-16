// src/context/AvatarContext.tsx
// IRANVERSE Enterprise Avatar State Management
// Complete avatar lifecycle with Ready Player Me integration
// Built for 90M users - 3D Pipeline + Real-time Sync + Status Polling
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useRef } from 'react';
import { AvatarState, AvatarContextValue, UpdateAvatarRequest, AvatarError, AvatarProcessingStatus, AvatarGender, AvatarStatusResponse } from '../types';
import { avatarApi } from '../../../core/constants/api';
import { secureStorage } from '../../../core/utils/storage';
import { mapAvatarResponse, getDefaultAvatar, validateAvatarData, isAvatarExpired } from '../utils';
import { ENCRYPTION_CONFIG, AVATAR_CONFIG } from '../../../core/config/app.config';

// ========================================================================================
// AVATAR CONTEXT SETUP - ENTERPRISE STATE MANAGEMENT
// ========================================================================================

/**
 * Avatar context for global avatar state management
 */
const AvatarContext = createContext<AvatarContextValue | null>(null);

/**
 * Avatar action types for reducer
 */
type AvatarAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AVATAR'; payload: AvatarState }
  | { type: 'UPDATE_AVATAR'; payload: Partial<AvatarState> }
  | { type: 'SET_STATUS'; payload: AvatarProcessingStatus }
  | { type: 'SET_ERROR'; payload: AvatarError | null }
  | { type: 'CLEAR_AVATAR' }
  | { type: 'START_STATUS_POLLING' }
  | { type: 'STOP_STATUS_POLLING' }
  | { type: 'UPDATE_PROGRESS'; payload: number };

/**
 * Initial avatar state
 */
const initialAvatarState: AvatarState = {
  rpmId: null,
  rpmUrl: null,
  version: 0,
  status: 'none',
  lastUpdated: null,
  thumbnails: {
    small: null,
    medium: null,
    large: null,
    square: null,
    portrait: null,
    landscape: null,
  },
  optimized: {
    mobile: null,
    mobileHd: null,
    web: null,
    webHd: null,
    ar: null,
    vr: null,
    streaming: null,
    lowLatency: null,
  },
  glb: null,
  usdz: null,
  fbx: null,
  configuration: {
    gender: 'male',
    bodyType: 'halfbody',
    skinTone: 'medium',
    hairStyle: 'default',
    hairColor: 'brown',
    eyeColor: 'brown',
    culturalContext: 'international',
    qualityLevel: 'medium',
    optimizationProfile: 'balanced',
  },
  customizations: null,
  processingMetadata: null,
  error: null,
  cacheKey: null,
  expiresAt: null,
};

/**
 * Avatar state reducer
 */
const avatarReducer = (state: AvatarState, action: AvatarAction): AvatarState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        error: action.payload ? null : state.error, // Clear error on new loading
      };

    case 'SET_AVATAR':
      return {
        ...action.payload,
        error: null,
      };

    case 'UPDATE_AVATAR':
      return {
        ...state,
        ...action.payload,
        lastUpdated: new Date(),
      };

    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
        lastUpdated: new Date(),
        error: action.payload === 'error' ? state.error : null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        status: action.payload ? 'error' : state.status,
      };

    case 'CLEAR_AVATAR':
      return {
        ...initialAvatarState,
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        processingMetadata: state.processingMetadata ? {
          ...state.processingMetadata,
          progress: action.payload,
        } : null,
      };

    default:
      return state;
  }
};

// ========================================================================================
// TYPE MAPPING UTILITIES - API COMPATIBILITY LAYER
// ========================================================================================

/**
 * Convert AvatarGender to API-compatible gender
 * Maps 'custom' to 'non-binary' for API compatibility
 */
const mapGenderForApi = (gender: AvatarGender): 'male' | 'female' | 'non-binary' => {
  if (gender === 'custom') {
    return 'non-binary';
  }
  return gender;
};

/**
 * Convert AvatarBodyType to API-compatible body type
 * Maps extended body types to API-supported types
 */
const mapBodyTypeForApi = (bodyType: string): 'halfbody' | 'fullbody' => {
  switch (bodyType) {
    case 'bust':
    case 'halfbody':
      return 'halfbody';
    case 'fullbody':
    default:
      return 'fullbody';
  }
};

/**
 * Convert UpdateAvatarRequest to API-compatible format
 * Ensures all types align with backend API expectations
 */
const mapUpdateRequestForApi = (request: UpdateAvatarRequest) => {
  const apiRequest: any = {
    ...request,
    configuration: {
      ...request.configuration,
      gender: mapGenderForApi(request.configuration.gender),
      bodyType: mapBodyTypeForApi(request.configuration.bodyType),
    },
  };

  // Handle customizations - only include if not null/undefined, otherwise provide empty object
  if (request.customizations) {
    apiRequest.customizations = request.customizations;
  } else {
    apiRequest.customizations = {};
  }

  return apiRequest;
};

// ========================================================================================
// AVATAR PROVIDER - ENTERPRISE CONTEXT PROVIDER
// ========================================================================================

/**
 * Avatar provider props
 */
interface AvatarProviderProps {
  children: ReactNode;
}

/**
 * Enterprise avatar provider with 3D pipeline management
 */
export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(avatarReducer, initialAvatarState);
  
  // Status polling management
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const pollingAttemptsRef = useRef<number>(0);

  // ========================================================================================
  // INITIALIZATION - RESTORE AVATAR STATE
  // ========================================================================================

  /**
   * Initialize avatar state from secure storage and API
   */
  const initializeAvatar = useCallback(async () => {
    try {
      // Try to load cached avatar data first
      const cachedAvatar = await secureStorage.getItem<AvatarState>(
        ENCRYPTION_CONFIG.storageKeys.avatarMetadata
      );

      if (cachedAvatar.success && cachedAvatar.data) {
        // Check if cached data is expired
        if (!isAvatarExpired(cachedAvatar.data)) {
          dispatch({ type: 'SET_AVATAR', payload: cachedAvatar.data });
          
          // If avatar is processing, start status polling
          if (['queued', 'processing'].includes(cachedAvatar.data.status)) {
            startStatusPolling();
          }
          
          return;
        }
      }

      // Fetch fresh avatar data from API
      await syncAvatar();
    } catch (error) {
      console.error('Failed to initialize avatar:', error);
      dispatch({ type: 'SET_ERROR', payload: createAvatarError('INITIALIZATION_ERROR', 'Failed to initialize avatar') });
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAvatar();
    
    // Cleanup on unmount
    return () => {
      stopStatusPolling();
    };
  }, [initializeAvatar]);

  // ========================================================================================
  // AVATAR MANAGEMENT - CORE OPERATIONS
  // ========================================================================================

  /**
   * Set avatar data (from avatar creation or updates)
   */
  const setAvatar = useCallback(async (avatarData: UpdateAvatarRequest): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Map request to API-compatible format
      const apiRequest = mapUpdateRequestForApi(avatarData);

      // Call API to update avatar
      const response = await avatarApi.updateAvatar(apiRequest);

      if (response.success && response.data) {
        const newAvatarState = mapAvatarResponse(response.data.avatar);
        
        // Update state
        dispatch({ type: 'SET_AVATAR', payload: newAvatarState });
        
        // Store in secure storage
        await secureStorage.setItem(
          ENCRYPTION_CONFIG.storageKeys.avatarMetadata,
          newAvatarState
        );

        // Start status polling if processing
        if (['queued', 'processing'].includes(newAvatarState.status)) {
          startStatusPolling();
        }
      } else {
        const error = createAvatarError('UPDATE_FAILED', response.error?.message || 'Failed to update avatar');
        dispatch({ type: 'SET_ERROR', payload: error });
        throw error;
      }
    } catch (error) {
      const avatarError = createAvatarError('AVATAR_UPDATE_ERROR', getErrorMessage(error));
      dispatch({ type: 'SET_ERROR', payload: avatarError });
      throw avatarError;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  /**
   * Update existing avatar with partial data
   */
  const updateAvatar = useCallback(async (updates: Partial<UpdateAvatarRequest>): Promise<void> => {
    if (!state.rpmId) {
      throw new Error('No avatar exists to update');
    }

    // Merge updates with existing data
    const updateData: UpdateAvatarRequest = {
      rpmId: state.rpmId,
      rpmUrl: state.rpmUrl || '',
      configuration: { ...state.configuration, ...updates.configuration },
      customizations: updates.customizations ?? state.customizations ?? undefined,
      preferences: updates.preferences || {
        autoOptimize: true,
        qualityPreference: 'medium',
        optimizationProfile: 'balanced',
        iranianContext: false,
        culturalAdaptations: false,
        targetPlatform: 'mobile',
        accessibilityOptimizations: false,
        highContrastMode: false,
      },
      metadata: updates.metadata,
    };

    await setAvatar(updateData);
  }, [state.rpmId, state.rpmUrl, state.configuration, state.customizations, setAvatar]);

  /**
   * Clear avatar data
   */
  const clearAvatar = useCallback(async (): Promise<void> => {
    try {
      // Stop any ongoing polling
      stopStatusPolling();

      // Call API to delete avatar if it exists
      if (state.rpmId) {
        try {
          // API requires confirmation for avatar deletion
          await avatarApi.deleteAvatar({
            confirmation: true,
          });
        } catch (error) {
          console.warn('Failed to delete avatar on server:', error);
          // Continue with local cleanup even if API call fails
        }
      }

      // Clear from secure storage
      await secureStorage.removeItem(ENCRYPTION_CONFIG.storageKeys.avatarMetadata);

      // Clear state
      dispatch({ type: 'CLEAR_AVATAR' });
    } catch (error) {
      console.error('Failed to clear avatar:', error);
      // Force clear state even on error
      dispatch({ type: 'CLEAR_AVATAR' });
    }
  }, [state.rpmId]);

  /**
   * Fetch avatar from API and sync with local state
   */
  const fetchAvatar = useCallback(async (): Promise<AvatarState | null> => {
    try {
      const response = await avatarApi.getAvatar();

      if (response.success && response.data) {
        if (response.data.hasAvatar && response.data.avatar) {
          const avatarState = mapAvatarResponse(response.data.avatar);
          
          // Update state
          dispatch({ type: 'SET_AVATAR', payload: avatarState });
          
          // Store in secure storage
          await secureStorage.setItem(
            ENCRYPTION_CONFIG.storageKeys.avatarMetadata,
            avatarState
          );

          // Start status polling if processing
          if (['queued', 'processing'].includes(avatarState.status)) {
            startStatusPolling();
          }

          return avatarState;
        } else {
          // No avatar exists
          dispatch({ type: 'CLEAR_AVATAR' });
          return null;
        }
      } else {
        throw new Error('Failed to fetch avatar data');
      }
    } catch (error) {
      console.error('Fetch avatar error:', error);
      
      // Try to use cached data as fallback
      const cachedAvatar = await secureStorage.getItem<AvatarState>(
        ENCRYPTION_CONFIG.storageKeys.avatarMetadata
      );
      
      if (cachedAvatar.success && cachedAvatar.data) {
        dispatch({ type: 'SET_AVATAR', payload: cachedAvatar.data });
        return cachedAvatar.data;
      }
      
      throw error;
    }
  }, []);

  /**
   * Sync avatar state with server
   */
  const syncAvatar = useCallback(async (): Promise<void> => {
    try {
      await fetchAvatar();
    } catch (error) {
      const avatarError = createAvatarError('SYNC_ERROR', getErrorMessage(error));
      dispatch({ type: 'SET_ERROR', payload: avatarError });
      throw avatarError;
    }
  }, [fetchAvatar]);

  // ========================================================================================
  // STATUS MONITORING - PROCESSING PIPELINE
  // ========================================================================================

  /**
   * Check avatar processing status
   * Returns properly typed AvatarStatusResponse
   */
  const checkAvatarStatus = useCallback(async (): Promise<AvatarStatusResponse> => {
    try {
      // Use rpmId as processingId if available, otherwise use empty string
      const processingId = state.rpmId || '';
      const response = await avatarApi.getAvatarStatus(processingId);

      if (response.success && response.data) {
        const { status, progress, avatar, error } = response.data;

        // Update status and progress
        dispatch({ type: 'SET_STATUS', payload: status });
        if (progress !== undefined) {
          dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
        }

        // Handle completion
        if (status === 'complete' && avatar) {
          const avatarState = mapAvatarResponse(avatar);
          dispatch({ type: 'SET_AVATAR', payload: avatarState });
          
          // Store completed avatar
          await secureStorage.setItem(
            ENCRYPTION_CONFIG.storageKeys.avatarMetadata,
            avatarState
          );
          
          stopStatusPolling();
        }

        // Handle errors
        if (status === 'error' && error) {
          const avatarError = createAvatarError('PROCESSING_ERROR', error.message);
          dispatch({ type: 'SET_ERROR', payload: avatarError });
          stopStatusPolling();
        }

        // Create properly typed response
        const statusResponse: AvatarStatusResponse = {
          status,
          progress: progress || 0,
          avatar: avatar ? {
            rpmId: avatar.rpmId || '',
            rpmUrl: avatar.rpmUrl || '',
            thumbnails: avatar.thumbnails,
            optimized: avatar.optimized,
            glb: avatar.glb || '',
            usdz: avatar.usdz || undefined,
          } : undefined,
          error: error ? createAvatarError('PROCESSING_ERROR', error.message) : undefined,
        };

        return statusResponse;
      } else {
        throw new Error('Failed to get avatar status');
      }
    } catch (error) {
      console.error('Avatar status check failed:', error);
      
      // Increment failed attempts
      pollingAttemptsRef.current += 1;
      
      // Stop polling after max attempts
      if (pollingAttemptsRef.current >= AVATAR_CONFIG.statusPolling.maxAttempts) {
        stopStatusPolling();
        const avatarError = createAvatarError('STATUS_CHECK_FAILED', 'Avatar status monitoring failed');
        dispatch({ type: 'SET_ERROR', payload: avatarError });
      }
      
      throw error;
    }
  }, [state.rpmId]);

  /**
   * Start status polling for processing avatars
   */
  const startStatusPolling = useCallback(() => {
    if (isPollingRef.current) {
      return; // Already polling
    }

    isPollingRef.current = true;
    pollingAttemptsRef.current = 0;

    const poll = async () => {
      try {
        await checkAvatarStatus();
        
        // Continue polling if still processing
        if (isPollingRef.current && ['queued', 'processing'].includes(state.status)) {
          statusPollingRef.current = setTimeout(poll, AVATAR_CONFIG.statusPolling.interval);
        }
      } catch (error) {
        // Error handling is done in checkAvatarStatus
        if (isPollingRef.current && pollingAttemptsRef.current < AVATAR_CONFIG.statusPolling.maxAttempts) {
          statusPollingRef.current = setTimeout(poll, AVATAR_CONFIG.statusPolling.interval);
        }
      }
    };

    // Start polling with initial delay
    statusPollingRef.current = setTimeout(poll, AVATAR_CONFIG.statusPolling.initialDelay);
  }, [checkAvatarStatus, state.status]);

  /**
   * Stop status polling
   */
  const stopStatusPolling = useCallback(() => {
    isPollingRef.current = false;
    pollingAttemptsRef.current = 0;
    
    if (statusPollingRef.current) {
      clearTimeout(statusPollingRef.current);
      statusPollingRef.current = null;
    }
  }, []);

  // ========================================================================================
  // ASSET MANAGEMENT - PRELOADING & CACHING
  // ========================================================================================

  /**
   * Preload avatar assets for better performance
   */
  const preloadAssets = useCallback(async (avatar: AvatarState): Promise<void> => {
    try {
      const assetsToPreload: string[] = [];

      // Collect asset URLs
      if (avatar.optimized.mobile) assetsToPreload.push(avatar.optimized.mobile);
      if (avatar.thumbnails.medium) assetsToPreload.push(avatar.thumbnails.medium);
      if (avatar.glb) assetsToPreload.push(avatar.glb);

      // Preload assets (implementation would depend on caching strategy)
      await Promise.allSettled(
        assetsToPreload.map(async (url) => {
          try {
            // In a real implementation, this would cache the asset
            await fetch(url, { method: 'HEAD' });
          } catch (error) {
            console.warn('Failed to preload asset:', url, error);
          }
        })
      );
    } catch (error) {
      console.warn('Asset preloading failed:', error);
    }
  }, []);

  /**
   * Clear avatar cache
   */
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      // Clear secure storage
      await secureStorage.removeItem(ENCRYPTION_CONFIG.storageKeys.avatarMetadata);
      
      // In a real implementation, this would also clear any cached assets
      console.log('Avatar cache cleared');
    } catch (error) {
      console.error('Failed to clear avatar cache:', error);
    }
  }, []);

  // ========================================================================================
  // UTILITY METHODS - HELPER FUNCTIONS
  // ========================================================================================

  /**
   * Generate fallback avatar
   * Handles all AvatarGender types including 'custom'
   */
  const generateFallbackAvatar = useCallback(async (gender?: AvatarGender): Promise<AvatarState> => {
    // Map gender for compatibility with getDefaultAvatar function
    const safeGender = gender === 'custom' ? 'non-binary' : gender;
    const fallbackAvatar = getDefaultAvatar(safeGender);
    
    // Store fallback avatar
    await secureStorage.setItem(
      ENCRYPTION_CONFIG.storageKeys.avatarMetadata,
      fallbackAvatar
    );
    
    dispatch({ type: 'SET_AVATAR', payload: fallbackAvatar });
    return fallbackAvatar;
  }, []);

  /**
   * Validate avatar data
   */
  const validateAvatarDataInternal = useCallback(async (data: any): Promise<boolean> => {
    const validation = validateAvatarData(data);
    
    if (!validation.isValid) {
      const error = createAvatarError('VALIDATION_ERROR', validation.errors.join(', '));
      dispatch({ type: 'SET_ERROR', payload: error });
      return false;
    }
    
    return true;
  }, []);

  /**
   * Clear avatar error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  /**
   * Retry last failed operation
   */
  const retryOperation = useCallback(async (): Promise<void> => {
    // Clear current error
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Retry based on current state
    if (state.status === 'error') {
      if (state.rpmId) {
        // Retry status check
        await checkAvatarStatus();
      } else {
        // Retry sync
        await syncAvatar();
      }
    }
  }, [state.status, state.rpmId, checkAvatarStatus, syncAvatar]);

  // ========================================================================================
  // CONTEXT VALUE - COMPLETE AVATAR INTERFACE
  // ========================================================================================

  const contextValue: AvatarContextValue = {
    // State
    ...state,
    
    // Core Avatar Management
    setAvatar,
    updateAvatar,
    clearAvatar,
    
    // Avatar Retrieval
    fetchAvatar,
    syncAvatar,
    
    // Status Monitoring
    checkAvatarStatus,
    startStatusPolling,
    stopStatusPolling,
    
    // Asset Management
    preloadAssets,
    clearCache,
    
    // Utility Methods
    generateFallbackAvatar,
    validateAvatarData: validateAvatarDataInternal,
    
    // Error Handling
    clearError,
    retryOperation,
  };

  return (
    <AvatarContext.Provider value={contextValue}>
      {children}
    </AvatarContext.Provider>
  );
};

// ========================================================================================
// UTILITY FUNCTIONS - HELPERS
// ========================================================================================

/**
 * Create standardized avatar error
 */
const createAvatarError = (type: string, message: string): AvatarError => {
  return {
    type: type as any,
    code: type,
    message,
    userMessage: message,
    timestamp: new Date(),
    retryable: true,
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
 * Custom hook to use avatar context
 * Provides type-safe access to avatar state and methods
 */
export const useAvatarContext = (): AvatarContextValue => {
  const context = useContext(AvatarContext);
  
  if (!context) {
    throw new Error('useAvatarContext must be used within an AvatarProvider');
  }
  
  return context;
};

export default AvatarContext;