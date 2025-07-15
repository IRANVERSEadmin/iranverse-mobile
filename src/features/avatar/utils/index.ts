// src/utils/avatar.ts
// IRANVERSE Enterprise Avatar Processing Utilities
// Complete avatar lifecycle management with Ready Player Me integration
// Built for 90M users - 3D Asset Pipeline + Cultural Customization
import { Platform } from 'react-native';
import { AvatarState, AvatarConfiguration, AvatarCustomizations, RPMAvatarCompleteEventData, UpdateAvatarRequest, AvatarError, AvatarGender, AvatarBodyType, AvatarQualityLevel } from '../types/avatar';
import { AVATAR_CONFIG, CONFIG } from '../constants/config';

// ========================================================================================
// READY PLAYER ME EVENT PROCESSING - WEBVIEW INTEGRATION
// ========================================================================================

/**
 * Parse Ready Player Me avatar completion event data
 * Converts RPM WebView message to UpdateAvatarRequest format
 */
export const parseRPMEvent = (eventData: RPMAvatarCompleteEventData): UpdateAvatarRequest => {
  try {
    // Extract core avatar information
    const { id: rpmId, url: rpmUrl, configuration, metadata } = eventData;

    // Parse avatar configuration
    const avatarConfig: AvatarConfiguration = {
      gender: parseGender(configuration.gender),
      bodyType: parseBodyType(configuration.bodyType),
      skinTone: extractAssetValue(configuration.assets, 'skin', 'tone') || 'medium',
      hairStyle: extractAssetValue(configuration.assets, 'hair', 'style') || 'default',
      hairColor: extractAssetValue(configuration.assets, 'hair', 'color') || 'brown',
      eyeColor: extractAssetValue(configuration.assets, 'eyes', 'color') || 'brown',
      culturalContext: 'international', // Default, can be enhanced later
      qualityLevel: parseQualityLevel(metadata.quality) || 'medium',
      optimizationProfile: 'balanced',
    };

    // Parse customizations from RPM assets
    const customizations: AvatarCustomizations = {
      face: {
        shape: extractAssetValue(configuration.assets, 'face', 'shape') || 'default',
        features: extractFacialFeatures(configuration.assets),
        expressions: [],
      },
      hair: {
        style: avatarConfig.hairStyle,
        color: avatarConfig.hairColor,
        length: extractAssetValue(configuration.assets, 'hair', 'length'),
      },
      outfit: {
        top: extractAssetValue(configuration.assets, 'outfit', 'top'),
        bottom: extractAssetValue(configuration.assets, 'outfit', 'bottom'),
        shoes: extractAssetValue(configuration.assets, 'outfit', 'shoes'),
        accessories: extractAccessories(configuration.assets),
      },
      body: {
        height: 1.0, // Default height
        build: 'medium',
        proportions: {},
      },
    };

    // Build update request
    const updateRequest: UpdateAvatarRequest = {
      rpmId,
      rpmUrl,
      configuration: avatarConfig,
      customizations,
      preferences: {
        autoOptimize: true,
        qualityPreference: avatarConfig.qualityLevel,
        optimizationProfile: avatarConfig.optimizationProfile,
        iranianContext: false, // Can be enhanced based on user preference
        culturalAdaptations: false,
        targetPlatform: 'mobile',
        accessibilityOptimizations: false,
        highContrastMode: false,
      },
      metadata: {
        createdWith: 'readyplayerme',
        version: metadata.version || '1.0',
        source: 'avatar_creation_screen',
      },
    };

    return updateRequest;
  } catch (error) {
    console.error('Failed to parse RPM event data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Invalid RPM event data: ${errorMessage}`);
  }
};

/**
 * Extract asset value by type and property from RPM assets array
 */
const extractAssetValue = (assets: any[], type: string, property: string): string | undefined => {
  try {
    const asset = assets?.find(a => a.type === type || a.category === type);
    return asset?.[property] || asset?.name;
  } catch (error) {
    return undefined;
  }
};

/**
 * Extract facial features from RPM assets
 */
const extractFacialFeatures = (assets: any[]): Record<string, number> => {
  try {
    const faceAssets = assets?.filter(a => a.type === 'face' || a.category === 'facial') || [];
    const features: Record<string, number> = {};
    
    faceAssets.forEach(asset => {
      if (asset.metadata?.features) {
        Object.assign(features, asset.metadata.features);
      }
    });
    
    return features;
  } catch (error) {
    return {};
  }
};

/**
 * Extract accessories from RPM assets
 */
const extractAccessories = (assets: any[]): string[] => {
  try {
    return assets
      ?.filter(a => a.type === 'accessory' || a.category === 'accessories')
      ?.map(a => a.id || a.name)
      ?.filter(Boolean) || [];
  } catch (error) {
    return [];
  }
};

/**
 * Parse gender from RPM format to internal format
 */
const parseGender = (rpmGender: string): AvatarGender => {
  const normalized = rpmGender?.toLowerCase() || '';
  switch (normalized) {
    case 'male':
    case 'm':
      return 'male';
    case 'female':
    case 'f':
      return 'female';
    case 'non-binary':
    case 'nonbinary':
    case 'nb':
      return 'non-binary';
    default:
      return 'male'; // Default fallback
  }
};

/**
 * Parse body type from RPM format to internal format
 */
const parseBodyType = (rpmBodyType: string): AvatarBodyType => {
  const normalized = rpmBodyType?.toLowerCase() || '';
  switch (normalized) {
    case 'fullbody':
    case 'full':
    case 'complete':
      return 'fullbody';
    case 'halfbody':
    case 'half':
    case 'bust':
      return 'halfbody';
    case 'head':
    case 'headonly':
      return 'head';
    default:
      return 'halfbody'; // Default for mobile performance
  }
};

/**
 * Parse quality level from RPM format to internal format
 */
const parseQualityLevel = (rpmQuality: string): AvatarQualityLevel => {
  const normalized = rpmQuality?.toLowerCase() || '';
  switch (normalized) {
    case 'low':
    case 'basic':
      return 'low';
    case 'medium':
    case 'standard':
      return 'medium';
    case 'high':
    case 'premium':
      return 'high';
    case 'ultra':
    case 'maximum':
      return 'ultra';
    default:
      return 'medium'; // Default balance
  }
};

// ========================================================================================
// AVATAR RESPONSE MAPPING - API INTEGRATION
// ========================================================================================

/**
 * Map backend avatar response to internal AvatarState format
 * Handles API response transformation with proper error handling
 */
export const mapAvatarResponse = (response: any): AvatarState => {
  try {
    // Validate required fields
    if (!response) {
      throw new Error('Avatar response is null or undefined');
    }

    // Extract core data with defaults
    const avatarState: AvatarState = {
      rpmId: response.rpmId || null,
      rpmUrl: response.rpmUrl || null,
      version: response.version || 1,
      status: response.status || 'none',
      lastUpdated: response.lastUpdated ? new Date(response.lastUpdated) : null,

      // Thumbnails with fallbacks
      thumbnails: {
        small: response.thumbnails?.small || null,
        medium: response.thumbnails?.medium || null,
        large: response.thumbnails?.large || null,
        square: response.thumbnails?.square || null,
        portrait: response.thumbnails?.portrait || null,
        landscape: response.thumbnails?.landscape || null,
      },

      // Optimized assets
      optimized: {
        mobile: response.optimized?.mobile || null,
        mobileHd: response.optimized?.mobileHd || null,
        web: response.optimized?.web || null,
        webHd: response.optimized?.webHd || null,
        ar: response.optimized?.ar || null,
        vr: response.optimized?.vr || null,
        streaming: response.optimized?.streaming || null,
        lowLatency: response.optimized?.lowLatency || null,
      },

      // 3D model files
      glb: response.glb || null,
      usdz: response.usdz || null,
      fbx: response.fbx || null,

      // Configuration
      configuration: mapAvatarConfiguration(response.configuration),

      // Customizations
      customizations: response.customizations || null,

      // Processing metadata
      processingMetadata: response.processingMetadata || null,

      // Error state
      error: response.error ? mapAvatarError(response.error) : null,

      // Cache control
      cacheKey: generateCacheKey(response.rpmId, response.version),
      expiresAt: response.expiresAt ? new Date(response.expiresAt) : null,
    };

    return avatarState;
  } catch (error) {
    console.error('Failed to map avatar response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Avatar response mapping failed: ${errorMessage}`);
  }
};

/**
 * Map avatar configuration from API response
 */
const mapAvatarConfiguration = (config: any): AvatarConfiguration => {
  if (!config) {
    return getDefaultConfiguration();
  }

  return {
    gender: parseGender(config.gender),
    bodyType: parseBodyType(config.bodyType),
    skinTone: config.skinTone || 'medium',
    hairStyle: config.hairStyle || 'default',
    hairColor: config.hairColor || 'brown',
    eyeColor: config.eyeColor || 'brown',
    culturalContext: config.culturalContext || 'international',
    traditionalElements: config.traditionalElements || undefined,
    qualityLevel: parseQualityLevel(config.qualityLevel),
    optimizationProfile: config.optimizationProfile || 'balanced',
    accessibilityFeatures: config.accessibilityFeatures || undefined,
  };
};

/**
 * Map avatar error from API response
 */
const mapAvatarError = (error: any): AvatarError => {
  return {
    type: error.type || 'UNKNOWN_ERROR',
    code: error.code || 'UNKNOWN',
    message: error.message || 'An unknown error occurred',
    step: error.step,
    rpmId: error.rpmId,
    userMessage: error.userMessage || 'Something went wrong with your avatar',
    persianMessage: error.persianMessage,
    details: error.details,
    timestamp: error.timestamp ? new Date(error.timestamp) : new Date(),
    retryable: error.retryable !== false,
    suggestedAction: error.suggestedAction,
    fallbackOptions: error.fallbackOptions,
  };
};

// ========================================================================================
// DEFAULT AVATAR SYSTEM - FALLBACK MANAGEMENT
// ========================================================================================

/**
 * Get default avatar configuration
 */
export const getDefaultConfiguration = (): AvatarConfiguration => {
  return {
    gender: 'male',
    bodyType: 'halfbody',
    skinTone: 'medium',
    hairStyle: 'short_001',
    hairColor: 'brown',
    eyeColor: 'brown',
    culturalContext: 'international',
    qualityLevel: 'medium',
    optimizationProfile: 'balanced',
  };
};

/**
 * Generate fallback avatar for cases where creation fails
 * Provides immediate avatar experience while user retries creation
 */
export const getDefaultAvatar = (gender?: AvatarGender): AvatarState => {
  const selectedGender = gender || 'male';
  // Map gender to config property key (non-binary -> nonBinary)
  const configKey = selectedGender === 'non-binary' ? 'nonBinary' : selectedGender;
  const fallbackUrl = AVATAR_CONFIG.fallbackAvatars[configKey as keyof typeof AVATAR_CONFIG.fallbackAvatars] || AVATAR_CONFIG.fallbackAvatars.male;

  return {
    rpmId: `fallback_${selectedGender}`,
    rpmUrl: fallbackUrl,
    version: 1,
    status: 'complete',
    lastUpdated: new Date(),
    
    thumbnails: {
      small: `${fallbackUrl}?size=128`,
      medium: `${fallbackUrl}?size=256`,
      large: `${fallbackUrl}?size=512`,
      square: `${fallbackUrl}?size=256&crop=square`,
      portrait: `${fallbackUrl}?size=256&crop=portrait`,
      landscape: `${fallbackUrl}?size=256&crop=landscape`,
    },

    optimized: {
      mobile: fallbackUrl,
      mobileHd: fallbackUrl,
      web: fallbackUrl,
      webHd: fallbackUrl,
      ar: null,
      vr: null,
      streaming: fallbackUrl,
      lowLatency: fallbackUrl,
    },

    glb: fallbackUrl,
    usdz: Platform.OS === 'ios' ? fallbackUrl.replace('.glb', '.usdz') : null,
    fbx: null,

    configuration: {
      ...getDefaultConfiguration(),
      gender: selectedGender,
    },

    customizations: null,
    processingMetadata: null,
    error: null,
    cacheKey: generateCacheKey(`fallback_${selectedGender}`, 1),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };
};

// ========================================================================================
// AVATAR URL UTILITIES - CDN & VERSIONING
// ========================================================================================

/**
 * Generate versioned URL for avatar assets with cache busting
 * Ensures proper CDN cache invalidation when avatars are updated
 */
export const generateVersionedUrl = (baseUrl: string | null, version: number): string | null => {
  if (!baseUrl) return null;

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('v', version.toString());
    url.searchParams.set('t', Date.now().toString());
    return url.toString();
  } catch (error) {
    // Fallback for invalid URLs
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}v=${version}&t=${Date.now()}`;
  }
};

/**
 * Generate optimized avatar URL based on device capabilities
 * Automatically selects best quality/performance balance
 */
export const getOptimizedAvatarUrl = (
  avatarState: AvatarState,
  context: 'thumbnail' | 'display' | '3d' | 'ar' | 'vr' = 'display'
): string | null => {
  if (!avatarState) return null;

  switch (context) {
    case 'thumbnail':
      return avatarState.thumbnails.medium || 
             avatarState.thumbnails.small || 
             avatarState.optimized.mobile;

    case 'display':
      return avatarState.optimized.mobile || 
             avatarState.optimized.web || 
             avatarState.glb;

    case '3d':
      return avatarState.glb || 
             avatarState.optimized.mobile;

    case 'ar':
      return avatarState.optimized.ar || 
             avatarState.usdz || 
             avatarState.glb;

    case 'vr':
      return avatarState.optimized.vr || 
             avatarState.glb;

    default:
      return avatarState.optimized.mobile || avatarState.glb;
  }
};

/**
 * Generate cache key for avatar data
 */
export const generateCacheKey = (rpmId: string | null, version: number): string | null => {
  if (!rpmId) return null;
  return `avatar_${rpmId}_v${version}`;
};

// ========================================================================================
// AVATAR VALIDATION UTILITIES - DATA INTEGRITY
// ========================================================================================

/**
 * Validate avatar data integrity and completeness
 * Ensures avatar data meets minimum requirements for display
 */
export const validateAvatarData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  if (!data.rpmId && !data.fallback) {
    errors.push('Missing RPM ID or fallback indicator');
  }

  if (!data.rpmUrl && !data.glb) {
    errors.push('Missing avatar URL or GLB file');
  }

  // Validate configuration
  if (data.configuration) {
    if (!['male', 'female', 'non-binary', 'custom'].includes(data.configuration.gender)) {
      errors.push('Invalid gender configuration');
    }

    if (!['fullbody', 'halfbody', 'bust', 'head'].includes(data.configuration.bodyType)) {
      errors.push('Invalid body type configuration');
    }
  }

  // Validate URLs
  if (data.rpmUrl && !isValidUrl(data.rpmUrl)) {
    errors.push('Invalid RPM URL format');
  }

  if (data.glb && !isValidUrl(data.glb)) {
    errors.push('Invalid GLB URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if avatar is expired and needs refresh
 */
export const isAvatarExpired = (avatarState: AvatarState): boolean => {
  if (!avatarState.expiresAt) return false;
  return Date.now() > avatarState.expiresAt.getTime();
};

/**
 * Get avatar quality score based on available assets
 */
export const getAvatarQualityScore = (avatarState: AvatarState): number => {
  let score = 0;
  const maxScore = 10;

  // Base avatar (2 points)
  if (avatarState.rpmUrl || avatarState.glb) score += 2;

  // Thumbnails (2 points)
  const thumbnailCount = Object.values(avatarState.thumbnails).filter(Boolean).length;
  score += Math.min(2, thumbnailCount / 3);

  // Optimized assets (3 points)
  const optimizedCount = Object.values(avatarState.optimized).filter(Boolean).length;
  score += Math.min(3, optimizedCount / 4);

  // Additional formats (2 points)
  if (avatarState.usdz) score += 1;
  if (avatarState.fbx) score += 1;

  // Configuration completeness (1 point)
  if (avatarState.configuration && avatarState.customizations) score += 1;

  return Math.round((score / maxScore) * 100);
};

// ========================================================================================
// UTILITY FUNCTIONS - HELPERS
// ========================================================================================

/**
 * Simple URL validation
 */
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Extract file extension from URL
 */
export const getFileExtension = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    return extension || null;
  } catch (error) {
    // Fallback for invalid URLs
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || null;
  }
};

/**
 * Estimate file size category based on quality level
 */
export const estimateFileSizeCategory = (qualityLevel: AvatarQualityLevel): 'small' | 'medium' | 'large' => {
  switch (qualityLevel) {
    case 'low':
      return 'small';
    case 'medium':
      return 'medium';
    case 'high':
    case 'ultra':
      return 'large';
    default:
      return 'medium';
  }
};

/**
 * Get platform-appropriate avatar format
 */
export const getPlatformOptimalFormat = (platform: string = Platform.OS): '3d' | 'ar' | 'standard' => {
  switch (platform) {
    case 'ios':
      return 'ar'; // Supports USDZ for AR Quick Look
    case 'android':
      return '3d'; // Use GLB for 3D rendering
    default:
      return 'standard'; // Fallback to standard format
  }
};

export default {
  parseRPMEvent,
  mapAvatarResponse,
  getDefaultAvatar,
  generateVersionedUrl,
  getOptimizedAvatarUrl,
  validateAvatarData,
  isAvatarExpired,
  getAvatarQualityScore,
  getFileExtension,
  estimateFileSizeCategory,
  getPlatformOptimalFormat,
};