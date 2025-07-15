// src/hooks/useAvatar.ts
// IRANVERSE Enterprise Avatar Management Hook
// Dedicated avatar hook wrapping AvatarContext with enhanced functionality
// Built for 90M users - Complete Avatar Lifecycle + Status Polling
import { useCallback, useMemo, useEffect } from 'react';
import { useAvatarContext } from '../context/AvatarContext';
import { AvatarState, UpdateAvatarRequest, AvatarProcessingStatus, AvatarGender } from '../types/avatar';
import { generateVersionedUrl, getOptimizedAvatarUrl, isAvatarExpired, getAvatarQualityScore } from '../utils/avatar';

// ========================================================================================
// ENHANCED AVATAR HOOK - ENTERPRISE INTERFACE
// ========================================================================================

/**
 * Enhanced avatar hook return type
 */
export interface UseAvatarReturn {
  // Avatar State
  rpmId: string | null;
  rpmUrl: string | null;
  version: number;
  status: AvatarProcessingStatus;
  lastUpdated: Date | null;
  thumbnails: AvatarState['thumbnails'];
  optimized: AvatarState['optimized'];
  glb: string | null;
  usdz: string | null;
  fbx: string | null;
  configuration: AvatarState['configuration'];
  customizations: AvatarState['customizations'];
  error: AvatarState['error'];
  
  // Computed Properties
  hasAvatar: boolean;
  isProcessing: boolean;
  isReady: boolean;
  hasError: boolean;
  isExpired: boolean;
  qualityScore: number;
  processingProgress: number;
  
  // Core Avatar Management
  setAvatar: (avatarData: UpdateAvatarRequest) => Promise<void>;
  updateAvatar: (updates: Partial<UpdateAvatarRequest>) => Promise<void>;
  clearAvatar: () => Promise<void>;
  
  // Avatar Retrieval & Sync
  fetchAvatar: () => Promise<AvatarState | null>;
  syncAvatar: () => Promise<void>;
  refreshAvatar: () => Promise<void>;
  
  // Status Monitoring
  checkAvatarProcessingStatus: () => Promise<any>;
  startStatusPolling: () => void;
  stopStatusPolling: () => void;
  
  // Asset Management
  getThumbnailUrl: (size: keyof AvatarState['thumbnails'], versioned?: boolean) => string | null;
  getOptimizedUrl: (type: keyof AvatarState['optimized'], versioned?: boolean) => string | null;
  get3DModelUrl: (format: 'glb' | 'usdz' | 'fbx', versioned?: boolean) => string | null;
  getBestAvailableUrl: (context?: 'thumbnail' | 'display' | '3d' | 'ar') => string | null;
  
  // Utility Methods
  preloadAssets: () => Promise<void>;
  clearCache: () => Promise<void>;
  generateFallbackAvatar: (gender?: AvatarGender) => Promise<AvatarState>;
  validateAvatarData: (data: any) => Promise<boolean>;
  
  // Error Handling
  clearError: () => void;
  retryOperation: () => Promise<void>;
  canRetry: boolean;
}

/**
 * Enhanced avatar management hook with complete avatar interface
 * Wraps AvatarContext and provides computed properties and helper methods
 */
export const useAvatar = (): UseAvatarReturn => {
  const avatarContext = useAvatarContext();
  
  // ========================================================================================
  // COMPUTED PROPERTIES - ENHANCED UX
  // ========================================================================================
  
  /**
   * Check if user has an avatar
   */
  const hasAvatar = useMemo(() => {
    return !!(avatarContext.rpmId || avatarContext.glb);
  }, [avatarContext.rpmId, avatarContext.glb]);
  
  /**
   * Check if avatar is currently processing
   */
  const isProcessing = useMemo(() => {
    return ['queued', 'processing', 'creating', 'updating', 'optimizing'].includes(avatarContext.status);
  }, [avatarContext.status]);
  
  /**
   * Check if avatar is ready for use
   */
  const isReady = useMemo(() => {
    return avatarContext.status === 'complete' && hasAvatar;
  }, [avatarContext.status, hasAvatar]);
  
  /**
   * Check if avatar has errors
   */
  const hasError = useMemo(() => {
    return avatarContext.status === 'error' || !!avatarContext.error;
  }, [avatarContext.status, avatarContext.error]);
  
  /**
   * Check if avatar data is expired
   */
  const isExpired = useMemo(() => {
    return isAvatarExpired(avatarContext as AvatarState);
  }, [avatarContext]);
  
  /**
   * Calculate avatar quality score
   */
  const qualityScore = useMemo(() => {
    return getAvatarQualityScore(avatarContext as AvatarState);
  }, [avatarContext]);
  
  /**
   * Get processing progress percentage
   */
  const processingProgress = useMemo(() => {
    return avatarContext.processingMetadata?.progress || 0;
  }, [avatarContext.processingMetadata?.progress]);
  
  /**
   * Check if operations can be retried
   */
  const canRetry = useMemo(() => {
    return hasError && (avatarContext.error?.retryable !== false);
  }, [hasError, avatarContext.error?.retryable]);
  
  // ========================================================================================
  // ENHANCED AVATAR METHODS
  // ========================================================================================
  
  /**
   * Enhanced avatar update with progress tracking
   */
  const updateAvatar = useCallback(async (updates: Partial<UpdateAvatarRequest>): Promise<void> => {
    try {
      await avatarContext.updateAvatar(updates);
    } catch (error) {
      console.error('Enhanced avatar update failed:', error);
      throw error;
    }
  }, [avatarContext]);
  
  /**
   * Enhanced avatar fetch with caching
   */
  const fetchAvatar = useCallback(async (): Promise<AvatarState | null> => {
    try {
      return await avatarContext.fetchAvatar();
    } catch (error) {
      console.error('Enhanced avatar fetch failed:', error);
      throw error;
    }
  }, [avatarContext]);
  
  /**
   * Refresh avatar data from server
   */
  const refreshAvatar = useCallback(async (): Promise<void> => {
    try {
      await avatarContext.syncAvatar();
    } catch (error) {
      console.error('Avatar refresh failed:', error);
      throw error;
    }
  }, [avatarContext]);
  
  /**
   * Enhanced avatar processing status check
   */
  const checkAvatarProcessingStatus = useCallback(async () => {
    try {
      return await avatarContext.checkAvatarStatus();
    } catch (error) {
      console.error('Avatar status check failed:', error);
      throw error;
    }
  }, [avatarContext]);
  
  // ========================================================================================
  // ASSET URL HELPERS - OPTIMIZED ASSET ACCESS
  // ========================================================================================
  
  /**
   * Get thumbnail URL with optional versioning
   */
  const getThumbnailUrl = useCallback((
    size: keyof AvatarState['thumbnails'],
    versioned: boolean = true
  ): string | null => {
    const url = avatarContext.thumbnails[size];
    if (!url) return null;
    
    return versioned ? generateVersionedUrl(url, avatarContext.version) : url;
  }, [avatarContext.thumbnails, avatarContext.version]);
  
  /**
   * Get optimized asset URL with optional versioning
   */
  const getOptimizedUrl = useCallback((
    type: keyof AvatarState['optimized'],
    versioned: boolean = true
  ): string | null => {
    const url = avatarContext.optimized[type];
    if (!url) return null;
    
    return versioned ? generateVersionedUrl(url, avatarContext.version) : url;
  }, [avatarContext.optimized, avatarContext.version]);
  
  /**
   * Get 3D model URL with optional versioning
   */
  const get3DModelUrl = useCallback((
    format: 'glb' | 'usdz' | 'fbx',
    versioned: boolean = true
  ): string | null => {
    let url: string | null = null;
    
    switch (format) {
      case 'glb':
        url = avatarContext.glb;
        break;
      case 'usdz':
        url = avatarContext.usdz;
        break;
      case 'fbx':
        url = avatarContext.fbx;
        break;
    }
    
    if (!url) return null;
    
    return versioned ? generateVersionedUrl(url, avatarContext.version) : url;
  }, [avatarContext.glb, avatarContext.usdz, avatarContext.fbx, avatarContext.version]);
  
  /**
   * Get best available URL for context
   */
  const getBestAvailableUrl = useCallback((
    context: 'thumbnail' | 'display' | '3d' | 'ar' = 'display'
  ): string | null => {
    return getOptimizedAvatarUrl(avatarContext as AvatarState, context);
  }, [avatarContext]);
  
  // ========================================================================================
  // ASSET MANAGEMENT - PERFORMANCE OPTIMIZATION
  // ========================================================================================
  
  /**
   * Preload avatar assets for better performance
   */
  const preloadAssets = useCallback(async (): Promise<void> => {
    try {
      await avatarContext.preloadAssets(avatarContext as AvatarState);
    } catch (error) {
      console.warn('Asset preloading failed:', error);
      // Don't throw - preloading is optimization, not critical
    }
  }, [avatarContext]);
  
  /**
   * Clear avatar cache
   */
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await avatarContext.clearCache();
    } catch (error) {
      console.error('Cache clearing failed:', error);
      throw error;
    }
  }, [avatarContext]);
  
  // ========================================================================================
  // UTILITY METHODS
  // ========================================================================================
  
  /**
   * Generate fallback avatar
   */
  const generateFallbackAvatar = useCallback(async (gender?: AvatarGender): Promise<AvatarState> => {
    try {
      return await avatarContext.generateFallbackAvatar(gender);
    } catch (error) {
      console.error('Fallback avatar generation failed:', error);
      throw error;
    }
  }, [avatarContext]);
  
  /**
   * Validate avatar data
   */
  const validateAvatarData = useCallback(async (data: any): Promise<boolean> => {
    try {
      return await avatarContext.validateAvatarData(data);
    } catch (error) {
      console.error('Avatar data validation failed:', error);
      return false;
    }
  }, [avatarContext]);
  
  /**
   * Retry last failed operation
   */
  const retryOperation = useCallback(async (): Promise<void> => {
    try {
      await avatarContext.retryOperation();
    } catch (error) {
      console.error('Retry operation failed:', error);
      throw error;
    }
  }, [avatarContext]);
  
  // ========================================================================================
  // AUTOMATIC BEHAVIOR - SMART DEFAULTS
  // ========================================================================================
  
  /**
   * Auto-preload assets when avatar becomes ready
   */
  useEffect(() => {
    if (isReady && !isExpired) {
      preloadAssets().catch(error => {
        console.warn('Auto-preload failed:', error);
      });
    }
  }, [isReady, isExpired, preloadAssets]);
  
  /**
   * Auto-refresh expired avatars
   */
  useEffect(() => {
    if (hasAvatar && isExpired && !isProcessing) {
      refreshAvatar().catch(error => {
        console.warn('Auto-refresh failed:', error);
      });
    }
  }, [hasAvatar, isExpired, isProcessing, refreshAvatar]);
  
  // ========================================================================================
  // RETURN ENHANCED AVATAR INTERFACE
  // ========================================================================================
  
  return {
    // Avatar State
    rpmId: avatarContext.rpmId,
    rpmUrl: avatarContext.rpmUrl,
    version: avatarContext.version,
    status: avatarContext.status,
    lastUpdated: avatarContext.lastUpdated,
    thumbnails: avatarContext.thumbnails,
    optimized: avatarContext.optimized,
    glb: avatarContext.glb,
    usdz: avatarContext.usdz,
    fbx: avatarContext.fbx,
    configuration: avatarContext.configuration,
    customizations: avatarContext.customizations,
    error: avatarContext.error,
    
    // Computed Properties
    hasAvatar,
    isProcessing,
    isReady,
    hasError,
    isExpired,
    qualityScore,
    processingProgress,
    
    // Core Avatar Management
    setAvatar: avatarContext.setAvatar,
    updateAvatar,
    clearAvatar: avatarContext.clearAvatar,
    
    // Avatar Retrieval & Sync
    fetchAvatar,
    syncAvatar: avatarContext.syncAvatar,
    refreshAvatar,
    
    // Status Monitoring
    checkAvatarProcessingStatus,
    startStatusPolling: avatarContext.startStatusPolling,
    stopStatusPolling: avatarContext.stopStatusPolling,
    
    // Asset Management
    getThumbnailUrl,
    getOptimizedUrl,
    get3DModelUrl,
    getBestAvailableUrl,
    
    // Utility Methods
    preloadAssets,
    clearCache,
    generateFallbackAvatar,
    validateAvatarData,
    
    // Error Handling
    clearError: avatarContext.clearError,
    retryOperation,
    canRetry,
  };
};

export default useAvatar;