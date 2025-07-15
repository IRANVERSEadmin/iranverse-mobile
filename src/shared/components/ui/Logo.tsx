// src/components/ui/Logo.tsx
// IRANVERSE Enterprise Logo Component - Enhanced Production System v2.0
// Tesla + Grok + Neuralink Fusion - Clean Professional Implementation
// Built for 90M users - Enterprise-Grade Logo Architecture

import React, { useMemo } from 'react';
import {
  Image,
  ImageStyle,
  View,
  ViewStyle,
  ColorSchemeName,
  useColorScheme,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// ========================================================================================
// ENTERPRISE LOGO SYSTEM - PRODUCTION CONSTANTS
// ========================================================================================

// Logo Asset Registry - Production Ready PNG Assets
const LOGO_ASSETS = {
  black: require('../../../assets/logo/iranverse-logo-black.png'),
  white: require('../../../assets/logo/iranverse-logo-white.png'),
  gray: require('../../../assets/logo/iranverse-logo-gray.png'),
} as const;

// Professional Size System - Button to Hero Scale
const LOGO_SIZES = {
  // Button & UI Elements
  button: 20,
  buttonLarge: 24,
  
  // Navigation & Headers
  nav: 28,
  header: 32,
  
  // Content Areas
  small: 40,
  medium: 56,
  large: 72,
  
  // Screen & Hero Usage
  hero: 120,
  splash: 160,
  display: 200,
} as const;

// Visual Constants - Tesla Precision
const VISUAL_CONSTANTS = {
  ASPECT_RATIO: 1.2, // Brand standard width:height ratio
  SHADOW_RADIUS: 8,
  SHADOW_OPACITY: 0.12,
  GLOW_RADIUS: 16,
  GLOW_OPACITY: 0.3,
} as const;

// ========================================================================================
// TYPE DEFINITIONS - ENTERPRISE INTERFACE
// ========================================================================================

export type LogoVariant = 'black' | 'white' | 'gray' | 'auto';
export type LogoSize = keyof typeof LOGO_SIZES | number;

export interface LogoProps {
  /** Logo color variant - auto adapts to theme */
  variant?: LogoVariant;
  
  /** Logo size preset or custom number */
  size?: LogoSize;
  
  /** Custom width (maintains aspect ratio) */
  width?: number;
  
  /** Custom height (maintains aspect ratio) */
  height?: number;
  
  /** Enable subtle shadow effect */
  shadow?: boolean;
  
  /** Enable glow effect for emphasis */
  glow?: boolean;
  
  /** Opacity override (0-1) */
  opacity?: number;
  
  /** Additional image styles */
  style?: ImageStyle;
  
  /** Container styles */
  containerStyle?: ViewStyle;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Test ID for automation */
  testID?: string;
  
  /** Resize mode */
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

// ========================================================================================
// LOGO VARIANT RESOLUTION - THEME ADAPTIVE
// ========================================================================================

const useLogoVariant = (variant: LogoVariant, colorScheme: ColorSchemeName): keyof typeof LOGO_ASSETS => {
  return useMemo(() => {
    let resolvedVariant: keyof typeof LOGO_ASSETS;
    
    switch (variant) {
      case 'black':
      case 'white':
      case 'gray':
        resolvedVariant = variant;
        break;
      case 'auto':
      default:
        resolvedVariant = colorScheme === 'dark' ? 'white' : 'black';
        break;
    }
    
    // Production logging for asset validation
    if (__DEV__) {
      console.log('Logo variant resolved:', {
        requested: variant,
        colorScheme,
        resolved: resolvedVariant,
        assetAvailable: !!LOGO_ASSETS[resolvedVariant]
      });
    }
    
    return resolvedVariant;
  }, [variant, colorScheme]);
};

// ========================================================================================
// DIMENSIONS CALCULATION - ASPECT RATIO PRECISION
// ========================================================================================

const useLogoDimensions = (
  size?: LogoSize,
  width?: number,
  height?: number
): { calculatedWidth: number; calculatedHeight: number } => {
  return useMemo(() => {
    let calculatedWidth: number;
    let calculatedHeight: number;
    
    // Custom dimensions with validation
    if (width && height) {
      calculatedWidth = width;
      calculatedHeight = height;
    }
    // Width with aspect ratio
    else if (width) {
      calculatedWidth = width;
      calculatedHeight = Math.round(width / VISUAL_CONSTANTS.ASPECT_RATIO);
    }
    // Height with aspect ratio
    else if (height) {
      calculatedWidth = Math.round(height * VISUAL_CONSTANTS.ASPECT_RATIO);
      calculatedHeight = height;
    }
    // Size preset calculation
    else {
      const baseSize = typeof size === 'number' ? size : LOGO_SIZES[size || 'medium'];
      calculatedWidth = baseSize;
      calculatedHeight = Math.round(baseSize / VISUAL_CONSTANTS.ASPECT_RATIO);
    }
    
    // Validation with fallback
    if (calculatedWidth <= 0 || calculatedHeight <= 0) {
      if (__DEV__) {
        console.error('Invalid logo dimensions, using fallback:', {
          input: { size, width, height },
          calculated: { calculatedWidth, calculatedHeight }
        });
      }
      calculatedWidth = LOGO_SIZES.medium;
      calculatedHeight = Math.round(LOGO_SIZES.medium / VISUAL_CONSTANTS.ASPECT_RATIO);
    }
    
    return { calculatedWidth, calculatedHeight };
  }, [size, width, height]);
};

// ========================================================================================
// ENHANCED LOGO COMPONENT - ENTERPRISE PRODUCTION
// ========================================================================================

const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  size = 'medium',
  width,
  height,
  shadow = false,
  glow = false,
  opacity = 1,
  style,
  containerStyle,
  accessibilityLabel = 'IRANVERSE Logo',
  testID = 'iranverse-logo',
  resizeMode = 'contain',
}) => {
  // ========================================================================================
  // THEME & VARIANT RESOLUTION
  // ========================================================================================
  
  const theme = useTheme();
  const colors = theme.colors;
  const colorScheme = useColorScheme();
  
  const resolvedVariant = useLogoVariant(variant, colorScheme);
  const { calculatedWidth, calculatedHeight } = useLogoDimensions(size, width, height);
  const logoSource = LOGO_ASSETS[resolvedVariant];
  
  // ========================================================================================
  // PRODUCTION VALIDATION
  // ========================================================================================
  
  if (!logoSource) {
    if (__DEV__) {
      console.error('CRITICAL: Logo asset missing for variant:', resolvedVariant);
    }
    return null;
  }
  
  // ========================================================================================
  // DYNAMIC STYLE COMPOSITION
  // ========================================================================================
  
  const containerStyles: ViewStyle = useMemo(() => ({
    alignItems: 'center',
    justifyContent: 'center',
    width: calculatedWidth,
    height: calculatedHeight,
    ...containerStyle,
  }), [calculatedWidth, calculatedHeight, containerStyle]);
  
  const imageStyles: ImageStyle = useMemo(() => {
    const baseStyles: ImageStyle = {
      width: calculatedWidth,
      height: calculatedHeight,
      opacity,
    };
    
    // Shadow effect
    if (shadow) {
      Object.assign(baseStyles, {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: VISUAL_CONSTANTS.SHADOW_OPACITY,
        shadowRadius: VISUAL_CONSTANTS.SHADOW_RADIUS,
        elevation: 4,
      });
    }
    
    // Glow effect for emphasis
    if (glow) {
      const glowColor = resolvedVariant === 'white' ? '#FFFFFF' : colors.interactive?.primary || '#007AFF';
      Object.assign(baseStyles, {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: VISUAL_CONSTANTS.GLOW_OPACITY,
        shadowRadius: VISUAL_CONSTANTS.GLOW_RADIUS,
        elevation: 8,
      });
    }
    
    return {
      ...baseStyles,
      ...style,
    };
  }, [
    calculatedWidth,
    calculatedHeight,
    opacity,
    shadow,
    glow,
    resolvedVariant,
    colors.interactive?.primary,
    style,
  ]);
  
  // ========================================================================================
  // ENTERPRISE PRODUCTION RENDER
  // ========================================================================================
  
  return (
    <View style={containerStyles}>
      <Image
        source={logoSource}
        style={imageStyles}
        resizeMode={resizeMode}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        testID={testID}
        onError={(error) => {
          if (__DEV__) {
            console.error('Logo asset loading failed:', {
              variant: resolvedVariant,
              source: logoSource,
              error
            });
          }
        }}
        onLoad={() => {
          if (__DEV__) {
            console.log('Logo loaded successfully:', {
              variant: resolvedVariant,
              dimensions: `${calculatedWidth}x${calculatedHeight}`
            });
          }
        }}
      />
    </View>
  );
};

// ========================================================================================
// ENTERPRISE PRESETS - COMMON USE CASES
// ========================================================================================

// Button Logo - For UI elements
export const ButtonLogo: React.FC<Omit<LogoProps, 'size'>> = (props) => (
  <Logo size="button" {...props} />
);

// Header Logo - For navigation bars
export const HeaderLogo: React.FC<Omit<LogoProps, 'size'>> = (props) => (
  <Logo size="header" {...props} />
);

// Hero Logo - For splash and main screens
export const HeroLogo: React.FC<Omit<LogoProps, 'size'>> = (props) => (
  <Logo size="hero" glow shadow {...props} />
);

// Display Logo - For marketing and presentations
export const DisplayLogo: React.FC<Omit<LogoProps, 'size'>> = (props) => (
  <Logo size="display" glow shadow {...props} />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Logo;
export { LOGO_SIZES, LOGO_ASSETS, VISUAL_CONSTANTS };