// src/components/ui/LogoWatermark.tsx
// IRANVERSE Enterprise Logo Watermark - Enhanced Production System v2.0
// Tesla + Grok + Neuralink Fusion - Professional Background Identity
// Built for 90M users - Enterprise-Grade Watermark Architecture

import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  StyleSheet,
  ViewStyle,
  Dimensions,
  useColorScheme,
} from 'react-native';
import Logo, { LogoVariant } from './Logo';
import { useTheme } from '../theme/ThemeProvider';

// ========================================================================================
// WATERMARK SYSTEM CONSTANTS - PROFESSIONAL STANDARDS
// ========================================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Watermark Configuration
const WATERMARK_CONFIG = {
  // Opacity Levels - Subtle Professional Presence
  OPACITY_SUBTLE: 0.025,
  OPACITY_NORMAL: 0.04,
  OPACITY_PROMINENT: 0.06,
  
  // Size Presets - Responsive to Screen
  SIZE_SMALL: SCREEN_WIDTH * 0.35,
  SIZE_NORMAL: SCREEN_WIDTH * 0.5,
  SIZE_LARGE: SCREEN_WIDTH * 0.65,
  
  // Animation Constants
  FADE_DURATION: 2500,
  FLOAT_DURATION: 12000,
  FLOAT_DISTANCE: 8,
  
  // Positioning
  CENTER_OFFSET_Y: -SCREEN_HEIGHT * 0.05, // Slightly above center
  ROTATION_ANGLE: -12, // Subtle diagonal tilt
} as const;

// ========================================================================================
// TYPE DEFINITIONS - CLEAN WATERMARK INTERFACE
// ========================================================================================

export type WatermarkSize = 'small' | 'normal' | 'large' | number;
export type WatermarkOpacity = 'subtle' | 'normal' | 'prominent';
export type WatermarkAnimation = 'none' | 'float' | 'fade';

export interface LogoWatermarkProps {
  /** Watermark size preset or custom size */
  size?: WatermarkSize;
  
  /** Logo variant for watermark */
  variant?: LogoVariant;
  
  /** Opacity level preset */
  opacity?: WatermarkOpacity;
  
  /** Custom opacity value (0-1) */
  customOpacity?: number;
  
  /** Animation mode */
  animation?: WatermarkAnimation;
  
  /** Rotation angle in degrees */
  rotation?: number;
  
  /** Custom position offset */
  offsetX?: number;
  offsetY?: number;
  
  /** Custom container styles */
  style?: ViewStyle;
  
  /** Disable watermark entirely */
  disabled?: boolean;
  
  /** Auto-start animations */
  autoPlay?: boolean;
  
  /** Test ID for automation */
  testID?: string;
}

// ========================================================================================
// WATERMARK SIZE RESOLUTION
// ========================================================================================

const useWatermarkSize = (size: WatermarkSize = 'normal'): number => {
  return useMemo(() => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'small':
        return WATERMARK_CONFIG.SIZE_SMALL;
      case 'large':
        return WATERMARK_CONFIG.SIZE_LARGE;
      case 'normal':
      default:
        return WATERMARK_CONFIG.SIZE_NORMAL;
    }
  }, [size]);
};

// ========================================================================================
// WATERMARK OPACITY RESOLUTION
// ========================================================================================

const useWatermarkOpacity = (
  opacity: WatermarkOpacity = 'normal',
  customOpacity?: number
): number => {
  return useMemo(() => {
    if (customOpacity !== undefined) return customOpacity;
    
    switch (opacity) {
      case 'subtle':
        return WATERMARK_CONFIG.OPACITY_SUBTLE;
      case 'prominent':
        return WATERMARK_CONFIG.OPACITY_PROMINENT;
      case 'normal':
      default:
        return WATERMARK_CONFIG.OPACITY_NORMAL;
    }
  }, [opacity, customOpacity]);
};

// ========================================================================================
// WATERMARK ANIMATION SYSTEM
// ========================================================================================

const useWatermarkAnimation = (
  animation: WatermarkAnimation,
  autoPlay: boolean,
  targetOpacity: number
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (!autoPlay) return;
    
    // Entrance fade-in
    Animated.timing(fadeAnim, {
      toValue: targetOpacity,
      duration: WATERMARK_CONFIG.FADE_DURATION,
      useNativeDriver: true,
    }).start();
    
    // Float animation if enabled
    if (animation === 'float') {
      const floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: WATERMARK_CONFIG.FLOAT_DISTANCE,
            duration: WATERMARK_CONFIG.FLOAT_DURATION / 2,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: -WATERMARK_CONFIG.FLOAT_DISTANCE,
            duration: WATERMARK_CONFIG.FLOAT_DURATION / 2,
            useNativeDriver: true,
          }),
        ])
      );
      
      floatAnimation.start();
      return () => floatAnimation.stop();
    }
  }, [animation, autoPlay, targetOpacity, fadeAnim, floatAnim]);
  
  return { fadeAnim, floatAnim };
};

// ========================================================================================
// ENHANCED LOGO WATERMARK COMPONENT - PROFESSIONAL BACKGROUND
// ========================================================================================

const LogoWatermark: React.FC<LogoWatermarkProps> = ({
  size = 'normal',
  variant = 'gray',
  opacity = 'normal',
  customOpacity,
  animation = 'fade',
  rotation = WATERMARK_CONFIG.ROTATION_ANGLE,
  offsetX = 0,
  offsetY = WATERMARK_CONFIG.CENTER_OFFSET_Y,
  style,
  disabled = false,
  autoPlay = true,
  testID = 'iranverse-watermark',
}) => {
  // ========================================================================================
  // EARLY RETURN FOR DISABLED STATE
  // ========================================================================================
  
  if (disabled) return null;
  
  // ========================================================================================
  // THEME INTEGRATION
  // ========================================================================================
  
  const theme = useTheme();
  
  // ========================================================================================
  // WATERMARK CALCULATIONS
  // ========================================================================================
  
  const watermarkSize = useWatermarkSize(size);
  const watermarkOpacity = useWatermarkOpacity(opacity, customOpacity);
  const { fadeAnim, floatAnim } = useWatermarkAnimation(animation, autoPlay, watermarkOpacity);
  
  // ========================================================================================
  // VARIANT RESOLUTION FOR WATERMARK
  // ========================================================================================
  
  const resolvedVariant: LogoVariant = useMemo(() => {
    if (variant === 'auto') return 'gray'; // Always gray for watermarks
    return variant;
  }, [variant]);
  
  // ========================================================================================
  // STYLE COMPOSITION
  // ========================================================================================
  
  const containerStyles: ViewStyle = useMemo(() => ({
    ...styles.watermarkContainer,
    transform: [
      { translateX: offsetX },
      { translateY: offsetY },
      { rotate: `${rotation}deg` },
      ...(animation === 'float' ? [{ translateY: floatAnim }] : []),
    ],
    ...style,
  }), [offsetX, offsetY, rotation, animation, floatAnim, style]);
  
  const animatedStyles = useMemo(() => ({
    opacity: animation === 'none' ? watermarkOpacity : fadeAnim,
  }), [animation, watermarkOpacity, fadeAnim]);
  
  // ========================================================================================
  // CLEANUP SYSTEM
  // ========================================================================================
  
  useEffect(() => {
    return () => {
      fadeAnim.removeAllListeners();
      floatAnim.removeAllListeners();
    };
  }, [fadeAnim, floatAnim]);
  
  // ========================================================================================
  // PROFESSIONAL WATERMARK RENDER
  // ========================================================================================
  
  return (
    <Animated.View
      style={[containerStyles, animatedStyles]}
      pointerEvents="none"
      testID={testID}
    >
      <Logo
        variant={resolvedVariant}
        width={watermarkSize}
        opacity={0.8} // Additional opacity reduction for watermark effect
        accessibilityLabel="IRANVERSE Watermark"
      />
    </Animated.View>
  );
};

// ========================================================================================
// STYLE DEFINITIONS
// ========================================================================================

const styles = StyleSheet.create({
  watermarkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -SCREEN_HEIGHT * 0.1,
    marginLeft: -SCREEN_WIDTH * 0.25,
    zIndex: -1,
  },
});

// ========================================================================================
// ENTERPRISE PRESETS - PROFESSIONAL CONFIGURATIONS
// ========================================================================================

// Auth Screen - Subtle presence for authentication flows
export const AuthWatermark: React.FC<Partial<LogoWatermarkProps>> = (props) => (
  <LogoWatermark
    size="small"
    opacity="subtle"
    animation="fade"
    {...props}
  />
);

// Loading Screen - Gentle animation during loading
export const LoadingWatermark: React.FC<Partial<LogoWatermarkProps>> = (props) => (
  <LogoWatermark
    size="normal"
    opacity="normal"
    animation="float"
    {...props}
  />
);

// Home Screen - Prominent but unobtrusive
export const HomeWatermark: React.FC<Partial<LogoWatermarkProps>> = (props) => (
  <LogoWatermark
    size="large"
    opacity="normal"
    animation="fade"
    rotation={-8}
    {...props}
  />
);

// Success Screen - Celebratory prominence
export const SuccessWatermark: React.FC<Partial<LogoWatermarkProps>> = (props) => (
  <LogoWatermark
    size="normal"
    opacity="prominent"
    animation="float"
    rotation={0}
    {...props}
  />
);

// Error Screen - Minimal distraction
export const ErrorWatermark: React.FC<Partial<LogoWatermarkProps>> = (props) => (
  <LogoWatermark
    size="small"
    opacity="subtle"
    animation="none"
    {...props}
  />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default LogoWatermark;
export { WATERMARK_CONFIG };