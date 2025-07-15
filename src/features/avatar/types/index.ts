// src/types/avatar.ts
// IRANVERSE Enterprise Avatar Management Types
// Complete type safety for Ready Player Me integration and avatar lifecycle
// Built for 90M users - 3D Avatar + Metaverse Ready
import { ViewStyle } from 'react-native';

// ========================================================================================
// CORE AVATAR STATE TYPES - ENTERPRISE 3D PIPELINE
// ========================================================================================

/**
 * Complete avatar state structure for the application
 * Manages Ready Player Me integration, 3D assets, and optimization states
 */
export interface AvatarState {
  // Avatar Identification
  rpmId: string | null;
  rpmUrl: string | null;
  version: number;
  
  // Processing Status
  status: AvatarProcessingStatus;
  lastUpdated: Date | null;
  
  // Asset URLs - Multi-Resolution Pipeline
  thumbnails: AvatarThumbnails;
  optimized: AvatarOptimizedAssets;
  
  // 3D Model Files
  glb: string | null; // Primary 3D format
  usdz: string | null; // iOS AR Quick Look
  fbx: string | null; // High-fidelity editing
  
  // Avatar Configuration
  configuration: AvatarConfiguration;
  
  // Customization Data
  customizations: AvatarCustomizations | null;
  
  // Processing Metadata
  processingMetadata: AvatarProcessingMetadata | null;
  
  // Error Handling
  error: AvatarError | null;
  
  // Cache Control
  cacheKey: string | null;
  expiresAt: Date | null;
}

/**
 * Avatar processing status tracking
 */
export type AvatarProcessingStatus =
  | 'none' // No avatar created
  | 'creating' // User is in creation flow
  | 'queued' // Submitted to processing pipeline
  | 'processing' // Being optimized/rendered
  | 'complete' // Ready for use
  | 'error' // Processing failed
  | 'updating' // Modifications being applied
  | 'optimizing'; // Performance optimization in progress

/**
 * Multi-resolution thumbnail assets
 */
export interface AvatarThumbnails {
  small: string | null; // 128x128 - Profile pics
  medium: string | null; // 256x256 - Avatar selection
  large: string | null; // 512x512 - High-res displays
  
  // Specialized thumbnails
  square: string | null; // 1:1 aspect ratio
  portrait: string | null; // 3:4 aspect ratio for profiles
  landscape: string | null; // 16:9 for banners
}

/**
 * Performance-optimized avatar assets for different platforms
 */
export interface AvatarOptimizedAssets {
  // Mobile Optimizations
  mobile: string | null; // Low-poly for mobile rendering
  mobileHd: string | null; // Medium-poly for high-end devices
  
  // Platform-Specific
  web: string | null; // Web-optimized with texture compression
  webHd: string | null; // High-quality web version
  
  // AR/VR Optimizations
  ar: string | null; // Optimized for AR experiences
  vr: string | null; // VR-ready with proper LODs
  
  // Streaming Assets
  streaming: string | null; // Progressive loading version
  lowLatency: string | null; // Ultra-fast loading version
}

/**
 * Avatar configuration and metadata
 */
export interface AvatarConfiguration {
  // Basic Configuration
  gender: AvatarGender;
  bodyType: AvatarBodyType;
  
  // Appearance Settings
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  
  // Cultural Customizations
  culturalContext: 'iranian' | 'international' | 'mixed';
  traditionalElements?: TraditionalElements;
  
  // Quality Settings
  qualityLevel: AvatarQualityLevel;
  optimizationProfile: AvatarOptimizationProfile;
  
  // Accessibility
  accessibilityFeatures?: AvatarAccessibilityFeatures;
}

/**
 * Avatar gender options
 */
export type AvatarGender = 'male' | 'female' | 'non-binary' | 'custom';

/**
 * Avatar body type variations
 */
export type AvatarBodyType = 
  | 'fullbody' // Complete avatar with legs
  | 'halfbody' // Torso and arms only
  | 'bust' // Head and shoulders
  | 'head'; // Head only

/**
 * Avatar quality levels for different device capabilities
 */
export type AvatarQualityLevel =
  | 'low' // Basic devices, <2GB RAM
  | 'medium' // Standard devices, 2-4GB RAM  
  | 'high' // Premium devices, >4GB RAM
  | 'ultra'; // Flagship devices, unlimited

/**
 * Optimization profiles for different use cases
 */
export type AvatarOptimizationProfile =
  | 'performance' // Prioritize frame rate
  | 'quality' // Prioritize visual fidelity
  | 'balanced' // Balance performance and quality
  | 'bandwidth' // Minimize download size
  | 'battery'; // Optimize for battery life

/**
 * Traditional cultural elements for Iranian context
 */
export interface TraditionalElements {
  clothing?: {
    hijab?: boolean;
    traditionalOutfit?: string;
    patterns?: string[];
  };
  accessories?: {
    jewelry?: string[];
    culturalItems?: string[];
  };
  expressions?: {
    culturalGestures?: boolean;
    traditionalPoses?: string[];
  };
}

/**
 * Accessibility features for inclusive avatar design
 */
export interface AvatarAccessibilityFeatures {
  // Visual Accessibility
  highContrast?: boolean;
  largeText?: boolean;
  colorBlindFriendly?: boolean;
  
  // Motor Accessibility
  simplifiedGestures?: boolean;
  alternativeControls?: boolean;
  
  // Cognitive Accessibility
  simplifiedInterface?: boolean;
  guidedCreation?: boolean;
}

/**
 * Avatar customization data from Ready Player Me
 */
export interface AvatarCustomizations {
  // Facial Features
  face: {
    shape?: string;
    features?: Record<string, number>;
    expressions?: string[];
  };
  
  // Hair & Style
  hair: {
    style: string;
    color: string;
    length?: string;
  };
  
  // Clothing & Assets
  outfit: {
    top?: string;
    bottom?: string;
    shoes?: string;
    accessories?: string[];
  };
  
  // Body Proportions
  body: {
    height?: number;
    build?: string;
    proportions?: Record<string, number>;
  };
  
  // Advanced Customizations
  advanced?: {
    blendShapes?: Record<string, number>;
    morphTargets?: Record<string, number>;
    customAssets?: string[];
  };
}

/**
 * Processing metadata for tracking and debugging
 */
export interface AvatarProcessingMetadata {
  // Processing Timeline
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Processing Details
  processingSteps: AvatarProcessingStep[];
  currentStep?: string;
  progress: number; // 0-100
  
  // Quality Metrics
  qualityScore?: number;
  performanceScore?: number;
  
  // Resource Usage
  processingTime?: number; // milliseconds
  fileSize?: number; // bytes
  polygonCount?: number;
  textureResolution?: string;
  
  // Version Tracking
  pipelineVersion: string;
  rpmVersion?: string;
}

/**
 * Individual processing step information
 */
export interface AvatarProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  error?: string;
  metadata?: Record<string, any>;
}

// ========================================================================================
// READY PLAYER ME INTEGRATION TYPES
// ========================================================================================

/**
 * Ready Player Me avatar creation event data
 */
export interface RPMAvatarCompleteEventData {
  // Core Avatar Data
  id: string;
  url: string;
  
  // Configuration
  configuration: {
    gender: string;
    bodyType: string;
    assets: RPMAssetData[];
  };
  
  // Metadata
  metadata: {
    createdAt: string;
    version: string;
    quality: string;
  };
  
  // Additional Data
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
}

/**
 * Ready Player Me asset information
 */
export interface RPMAssetData {
  id: string;
  type: 'hair' | 'outfit' | 'accessory' | 'facial-hair' | 'glasses';
  name: string;
  category: string;
  color?: string;
  metadata?: Record<string, any>;
}

/**
 * Ready Player Me WebView message structure
 */
export interface RPMWebViewMessage {
  type: 'v1.avatar.exported' | 'v1.user.set' | 'v1.frame.ready';
  data: any;
  source: 'readyplayerme';
  timestamp: number;
}

/**
 * Ready Player Me configuration for WebView
 */
export interface RPMConfiguration {
  // Basic Settings
  quickStart: boolean;
  clearCache: boolean;
  bodyType: 'halfbody' | 'fullbody';
  
  // Quality Settings
  quality: 'low' | 'medium' | 'high';
  morphTargets: string[];
  textureAtlas: 'none' | '256' | '512' | '1024';
  
  // UI Configuration
  language: 'en' | 'fa';
  ui: {
    bodyTypeSelection: boolean;
    facialFeatures: boolean;
    skinEditor: boolean;
    hairEditor: boolean;
    outfitEditor: boolean;
  };
  
  // Advanced Features
  customAssets?: string[];
  brand?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

// ========================================================================================
// API REQUEST/RESPONSE TYPES
// ========================================================================================

/**
 * Update avatar request payload
 */
export interface UpdateAvatarRequest {
  // Core Avatar Data
  rpmId: string;
  rpmUrl: string;
  
  // Configuration
  configuration: AvatarConfiguration;
  
  // Customization Data
  customizations?: AvatarCustomizations;
  
  // Processing Preferences
  preferences?: AvatarProcessingPreferences;
  
  // Metadata
  metadata?: {
    createdWith: 'readyplayerme' | 'custom' | 'imported';
    version: string;
    source?: string;
  };
}

/**
 * Avatar processing preferences
 */
export interface AvatarProcessingPreferences {
  // Quality Settings
  autoOptimize: boolean;
  qualityPreference: AvatarQualityLevel;
  optimizationProfile: AvatarOptimizationProfile;
  
  // Cultural Context
  iranianContext: boolean;
  culturalAdaptations: boolean;
  
  // Performance Settings
  targetPlatform: 'mobile' | 'web' | 'both';
  maxFileSize?: number; // bytes
  maxPolygonCount?: number;
  
  // Accessibility
  accessibilityOptimizations: boolean;
  highContrastMode: boolean;
}

/**
 * Avatar status check response
 */
export interface AvatarStatusResponse {
  // Status Information
  status: AvatarProcessingStatus;
  progress: number; // 0-100
  
  // Current Processing Step
  currentStep?: string;
  estimatedTimeRemaining?: number; // seconds
  
  // Results (if complete)
  avatar?: {
    rpmId: string;
    rpmUrl: string;
    thumbnails: AvatarThumbnails;
    optimized: AvatarOptimizedAssets;
    glb: string;
    usdz?: string;
  };
  
  // Error Information (if failed)
  error?: AvatarError;
  
  // Metadata
  processingMetadata?: AvatarProcessingMetadata;
}

/**
 * Get avatar response
 */
export interface GetAvatarResponse {
  success: boolean;
  avatar?: AvatarState;
  error?: AvatarError;
}

// ========================================================================================
// ERROR HANDLING TYPES
// ========================================================================================

/**
 * Avatar-specific error structure
 */
export interface AvatarError {
  // Error Classification
  type: AvatarErrorType;
  code: string;
  message: string;
  
  // Context Information
  step?: string;
  rpmId?: string;
  
  // User-Friendly Messaging
  userMessage: string;
  persianMessage?: string;
  
  // Technical Details
  details?: Record<string, any>;
  timestamp: Date;
  
  // Recovery Information
  retryable: boolean;
  suggestedAction?: string;
  fallbackOptions?: string[];
}

/**
 * Avatar error types for precise error handling
 */
export type AvatarErrorType =
  // Creation Errors
  | 'CREATION_FAILED'
  | 'INVALID_CONFIGURATION'
  | 'RPM_ERROR'
  | 'WEBVIEW_ERROR'
  
  // Processing Errors
  | 'PROCESSING_FAILED'
  | 'OPTIMIZATION_FAILED'
  | 'QUALITY_CHECK_FAILED'
  | 'TIMEOUT_ERROR'
  
  // Asset Errors
  | 'ASSET_LOAD_FAILED'
  | 'INVALID_FORMAT'
  | 'CORRUPTED_FILE'
  | 'SIZE_LIMIT_EXCEEDED'
  
  // Network Errors
  | 'UPLOAD_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'CDN_ERROR'
  | 'NETWORK_ERROR'
  
  // Validation Errors
  | 'INVALID_AVATAR_DATA'
  | 'MISSING_REQUIRED_FIELD'
  | 'VALIDATION_ERROR'
  
  // Unknown/Generic
  | 'UNKNOWN_ERROR';

// ========================================================================================
// AVATAR CONTEXT TYPES
// ========================================================================================

/**
 * Avatar context methods for components
 */
export interface AvatarContextMethods {
  // Core Avatar Management
  setAvatar: (avatarData: UpdateAvatarRequest) => Promise<void>;
  updateAvatar: (updates: Partial<UpdateAvatarRequest>) => Promise<void>;
  clearAvatar: () => Promise<void>;
  
  // Avatar Retrieval
  fetchAvatar: () => Promise<AvatarState | null>;
  syncAvatar: () => Promise<void>;
  
  // Status Monitoring
  checkAvatarStatus: () => Promise<AvatarStatusResponse>;
  startStatusPolling: () => void;
  stopStatusPolling: () => void;
  
  // Asset Management
  preloadAssets: (avatar: AvatarState) => Promise<void>;
  clearCache: () => Promise<void>;
  
  // Utility Methods
  generateFallbackAvatar: (gender?: AvatarGender) => Promise<AvatarState>;
  validateAvatarData: (data: any) => Promise<boolean>;
  
  // Error Handling
  clearError: () => void;
  retryOperation: () => Promise<void>;
}

/**
 * Complete avatar context interface
 */
export interface AvatarContextValue extends AvatarState, AvatarContextMethods {}

// ========================================================================================
// AVATAR HOOK TYPES
// ========================================================================================

/**
 * Return type for useAvatar hook
 */
export interface UseAvatarReturn extends AvatarContextValue {
  // Computed Properties
  hasAvatar: boolean;
  isProcessing: boolean;
  isReady: boolean;
  hasError: boolean;
  
  // Asset Helpers
  getThumbnailUrl: (size: keyof AvatarThumbnails) => string | null;
  getOptimizedUrl: (type: keyof AvatarOptimizedAssets) => string | null;
  get3DModelUrl: (format: 'glb' | 'usdz' | 'fbx') => string | null;
  
  // Utility Methods
  refreshAvatar: () => Promise<void>;
  isAvatarExpired: () => boolean;
}

// ========================================================================================
// WEBVIEW COMMUNICATION TYPES
// ========================================================================================

/**
 * WebView message handling configuration
 */
export interface WebViewMessageConfig {
  // Security
  allowedOrigins: string[];
  validateSource: boolean;
  
  // Message Handling
  messageTimeout: number; // milliseconds
  maxRetries: number;
  
  // Event Handlers
  onMessage?: (message: RPMWebViewMessage) => void;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
}

/**
 * WebView state for avatar creation
 */
export interface WebViewState {
  // Loading State
  isLoading: boolean;
  isReady: boolean;
  
  // Error Handling
  error: Error | null;
  hasError: boolean;
  
  // Communication
  lastMessage: RPMWebViewMessage | null;
  messageHistory: RPMWebViewMessage[];
  
  // Configuration
  config: RPMConfiguration;
  
  // Progress Tracking
  creationProgress: number; // 0-100
  currentStep: string | null;
}

// ========================================================================================
// UTILITY TYPES
// ========================================================================================

/**
 * Avatar analytics event types
 */
export type AvatarEvent =
  | 'avatar_creation_started'
  | 'avatar_creation_completed'
  | 'avatar_creation_failed'
  | 'avatar_updated'
  | 'avatar_cached'
  | 'avatar_shared';

/**
 * Avatar analytics payload
 */
export interface AvatarAnalytics {
  event: AvatarEvent;
  userId?: string;
  avatarId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Default avatar configuration
 */
export interface DefaultAvatarConfig {
  male: AvatarState;
  female: AvatarState;
  nonBinary: AvatarState;
}

export default AvatarState;