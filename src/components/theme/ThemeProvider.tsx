// src/components/theme/ThemeProvider.tsx
// IRANVERSE Enterprise Design System - Revolutionary Minimalism
// Tesla-inspired + Grok-inspired + Persian Excellence
// Built for 90M users - Agent Identity Empowerment
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Platform, TextStyle, ViewStyle } from 'react-native';

// ========================================================================================
// CORE DESIGN TOKENS - ENTERPRISE GRADE
// ========================================================================================

interface ColorTokens {
  // Foundation Palette - Black/Gray/White + Vibrant Orange
  foundation: {
    black: string;
    charcoal: string;
    graphite: string;
    steel: string;
    silver: string;
    platinum: string;
    white: string;
    orange: string;
  };
  
  // Semantic Colors - Agent Identity Empowerment
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
    critical: string; // Vibrant Orange for logout, etc.
  };
  
  // Interactive States - Revolutionary Confidence
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryDisabled: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
    ghost: string;
    ghostHover: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderFocus: string;
    text: string;
    textSecondary: string;
    textDisabled: string;
    background: string;
    backgroundSecondary: string;
  };
  
  // Glass Morphism - Consistent with FirstScreen.tsx
  glass: {
    surface: string;
    surfaceHover: string;
    border: string;
    shadow: string;
  };
}

interface TypographyTokens {
  // Font Families - Persian Excellence (Twitter/X Quality)
  families: {
    primary: string; // Main UI font
    persian: string; // Premium Persian typography
    mono: string; // Code/technical elements
  };
  
  // Type Scale - Enterprise Hierarchy
  scale: {
    display: TextStyle; // Hero text
    h1: TextStyle; // Primary headings
    h2: TextStyle; // Secondary headings
    h3: TextStyle; // Tertiary headings
    body: TextStyle; // Main body text
    bodySmall: TextStyle; // Secondary body
    caption: TextStyle; // Supporting text
    button: TextStyle; // Button labels
    input: TextStyle; // Input field text
    mono: TextStyle; // Technical text
  };
  
  // RTL Support - Persian/Arabic Excellence
  rtl: {
    persian: TextStyle;
    arabic: TextStyle;
  };
}

interface SpacingTokens {
  // Spacing Scale - Consistent Rhythm
  xs: number;    // 4px
  sm: number;    // 8px
  md: number;    // 16px
  lg: number;    // 24px
  xl: number;    // 32px
  xxl: number;   // 48px
  xxxl: number;  // 64px
  
  // Component Specific
  button: {
    paddingHorizontal: number;
    paddingVertical: number;
    height: {
      small: number;
      medium: number;
      large: number;
    };
  };
  
  input: {
    paddingHorizontal: number;
    paddingVertical: number;
    height: number;
  };
  
  card: {
    padding: number;
    margin: number;
  };
}

interface RadiusTokens {
  none: number;
  xs: number;    // 4px
  sm: number;    // 8px
  md: number;    // 12px
  lg: number;    // 16px
  xl: number;    // 24px
  full: number;  // 9999px
  
  // Component Specific
  button: number;
  input: number;
  card: number;
  modal: number;
}

interface ShadowTokens {
  // Enterprise Shadow System
  none: ViewStyle;
  subtle: ViewStyle;
  medium: ViewStyle;
  strong: ViewStyle;
  glass: ViewStyle; // Glassmorphism shadows
  
  // Component Specific
  button: ViewStyle;
  card: ViewStyle;
  modal: ViewStyle;
  dropdown: ViewStyle;
}

interface AnimationTokens {
  // Duration Scale - Smooth & Confident
  duration: {
    instant: number;   // 0ms
    fast: number;      // 150ms
    normal: number;    // 300ms
    slow: number;      // 500ms
    slower: number;    // 750ms
  };
  
  // Easing Curves - Revolutionary Feel
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    spring: string;
    bounce: string;
  };
  
  // Component Animations
  button: {
    scale: number;
    duration: number;
  };
  
  input: {
    focusDuration: number;
    borderDuration: number;
  };
  
  modal: {
    enterDuration: number;
    exitDuration: number;
  };
}

// ========================================================================================
// THEME INTERFACE - COMPLETE DESIGN SYSTEM
// ========================================================================================

export interface IranverseTheme {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  animations: AnimationTokens;
  
  // Utility Functions
  utils: {
    getGlassStyle: (opacity?: number) => ViewStyle;
    getElevation: (level: number) => ViewStyle;
    getResponsiveValue: <T>(mobile: T, tablet?: T, desktop?: T) => T;
  };
}

// ========================================================================================
// THEME IMPLEMENTATION - REVOLUTIONARY DESIGN
// ========================================================================================

const createIranverseTheme = (): IranverseTheme => {
  
  // Foundation Colors - Black/Gray/White + Vibrant Orange
  const foundationColors = {
    black: '#000000',
    charcoal: '#1a1a1a',
    graphite: '#2a2a2a',
    steel: '#3a3a3a',
    silver: '#8a8a8a',
    platinum: '#cccccc',
    white: '#ffffff',
    orange: '#ff6b35', // Vibrant Orange - Critical Actions
  };
  
  const colors: ColorTokens = {
    foundation: foundationColors,
    
    semantic: {
      success: '#10b981',    // Subtle green
      warning: '#f59e0b',    // Muted amber
      error: '#ef4444',      // Clear red
      info: '#3b82f6',       // Clean blue
      critical: foundationColors.orange, // Vibrant Orange
    },
    
    interactive: {
      primary: foundationColors.white,
      primaryHover: foundationColors.platinum,
      primaryActive: foundationColors.silver,
      primaryDisabled: foundationColors.steel,
      secondary: foundationColors.graphite,
      secondaryHover: foundationColors.steel,
      secondaryActive: foundationColors.silver,
      ghost: 'transparent',
      ghostHover: 'rgba(255, 255, 255, 0.05)',
      surface: foundationColors.charcoal,
      surfaceHover: foundationColors.graphite,
      border: 'rgba(255, 255, 255, 0.1)',
      borderFocus: 'rgba(255, 255, 255, 0.3)',
      text: foundationColors.white,
      textSecondary: foundationColors.silver,
      textDisabled: foundationColors.steel,
      background: foundationColors.black,
      backgroundSecondary: foundationColors.charcoal,
    },
    
    glass: {
      surface: 'rgba(255, 255, 255, 0.05)',
      surfaceHover: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.5)',
    },
  };
  
  const typography: TypographyTokens = {
    families: {
      primary: Platform.select({
        ios: 'SF Pro Display',
        android: 'Roboto',
        default: 'system',
      }),
      persian: Platform.select({
        ios: 'SF Pro Display', // Excellent Persian support
        android: 'Roboto',     // Good Persian rendering
        default: 'system',
      }),
      mono: Platform.select({
        ios: 'SF Mono',
        android: 'Roboto Mono',
        default: 'monospace',
      }),
    },
    
    scale: {
      display: {
        fontSize: 48,
        fontWeight: '700',
        lineHeight: 56,
        letterSpacing: -1.5,
      },
      h1: {
        fontSize: 32,
        fontWeight: '600',
        lineHeight: 40,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
        letterSpacing: -0.25,
      },
      h3: {
        fontSize: 20,
        fontWeight: '500',
        lineHeight: 28,
        letterSpacing: 0,
      },
      body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0,
      },
      bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0,
      },
      caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.5,
      },
      button: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20,
        letterSpacing: 0.25,
      },
      input: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0,
      },
      mono: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0,
      },
    },
    
    rtl: {
      persian: {
        textAlign: 'right',
        writingDirection: 'rtl',
      },
      arabic: {
        textAlign: 'right',
        writingDirection: 'rtl',
      },
    },
  };
  
  const spacing: SpacingTokens = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      height: {
        small: 36,
        medium: 48,
        large: 56,
      },
    },
    
    input: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      height: 48,
    },
    
    card: {
      padding: 24,
      margin: 16,
    },
  };
  
  const radius: RadiusTokens = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
    
    button: 12,
    input: 12,
    card: 16,
    modal: 20,
  };
  
  const shadows: ShadowTokens = {
    none: {},
    
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    
    strong: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    
    glass: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    
    button: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    
    modal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
    
    dropdown: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  };
  
  const animations: AnimationTokens = {
    duration: {
      instant: 0,
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 750,
    },
    
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    button: {
      scale: 0.96,
      duration: 150,
    },
    
    input: {
      focusDuration: 200,
      borderDuration: 150,
    },
    
    modal: {
      enterDuration: 300,
      exitDuration: 250,
    },
  };
  
  // Utility Functions
  const utils = {
    getGlassStyle: (opacity: number = 0.05): ViewStyle => ({
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      borderWidth: 1,
      borderColor: colors.glass.border,
      ...shadows.glass,
    }),
    
    getElevation: (level: number): ViewStyle => {
      const elevationMap = {
        0: shadows.none,
        1: shadows.subtle,
        2: shadows.medium,
        3: shadows.strong,
      };
      return elevationMap[level as keyof typeof elevationMap] || shadows.medium;
    },
    
    getResponsiveValue: function<T>(mobile: T, tablet?: T, desktop?: T): T {
      return mobile; // For now, return mobile value
    },
  };
  
  return {
    colors,
    typography,
    spacing,
    radius,
    shadows,
    animations,
    utils,
  };
};

// ========================================================================================
// ERROR HANDLING UTILITIES - ENTERPRISE GRADE
// ========================================================================================

export const withErrorBoundary = function<T extends any[]>(
  fn: (...args: T) => void,
  fallback?: (...args: T) => void,
  context?: string
) {
  return (...args: T) => {
    try {
      fn(...args);
    } catch (error) {
      console.warn(`IRANVERSE ${context || 'Component'} Error:`, error);
      fallback?.(...args);
    }
  };
};

export const safeAnimatedTiming = (
  value: any,
  config: any
): any => {
  try {
    const { Animated } = require('react-native');
    return Animated.timing(value, config);
  } catch (error) {
    console.warn('IRANVERSE Animation Error:', error);
    // Return a no-op animation
    return {
      start: () => {},
      stop: () => {},
      reset: () => {},
    } as any;
  }
};

export const safeVibration = (pattern: number | number[]) => {
  try {
    if (Platform.OS !== 'web') {
      const { Vibration } = require('react-native');
      Vibration.vibrate(pattern);
    }
  } catch (error) {
    console.warn('IRANVERSE Vibration Error:', error);
  }
};

// ========================================================================================
// THEME CONTEXT & PROVIDER
// ========================================================================================

const ThemeContext = createContext<IranverseTheme | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  theme?: Partial<IranverseTheme>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme: customTheme 
}) => {
  const theme = useMemo(() => {
    const defaultTheme = createIranverseTheme();
    
    // Allow theme customization while maintaining type safety
    if (customTheme) {
      return {
        ...defaultTheme,
        ...customTheme,
        colors: { ...defaultTheme.colors, ...customTheme.colors },
        typography: { ...defaultTheme.typography, ...customTheme.typography },
        spacing: { ...defaultTheme.spacing, ...customTheme.spacing },
        radius: { ...defaultTheme.radius, ...customTheme.radius },
        shadows: { ...defaultTheme.shadows, ...customTheme.shadows },
        animations: { ...defaultTheme.animations, ...customTheme.animations },
      };
    }
    
    return defaultTheme;
  }, [customTheme]);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// ========================================================================================
// THEME HOOKS & UTILITIES
// ========================================================================================

export const useTheme = (): IranverseTheme => {
  const theme = useContext(ThemeContext);
  
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return theme;
};

// Hook for accessing specific theme sections
export const useColors = () => useTheme().colors;
export const useTypography = () => useTheme().typography;
export const useSpacing = () => useTheme().spacing;
export const useRadius = () => useTheme().radius;
export const useShadows = () => useTheme().shadows;
export const useAnimations = () => useTheme().animations;
export const useThemeUtils = () => useTheme().utils;

// ========================================================================================
// THEME EXPORTS
// ========================================================================================

export type { ColorTokens, TypographyTokens, SpacingTokens, RadiusTokens, ShadowTokens, AnimationTokens };
export { createIranverseTheme };
export default ThemeProvider;