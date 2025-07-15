// src/components/theme/ThemeProvider.tsx
// IRANVERSE Design System - Grok iOS Revolution
// Minimal High-Tech Aesthetic + Premium Glassmorphism
// Optimized for 90M users - Revolutionary UI Transformation
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Platform, TextStyle, ViewStyle } from 'react-native';

// ========================================================================================
// GROK IOS DESIGN TOKENS - REVOLUTIONARY MINIMALISM
// ========================================================================================

interface ColorTokens {
  // Grok iOS Foundation - Deep Blacks & Premium Accents
  foundation: {
    black: string;      // #000000
    darkest: string;    // #0a0a0a
    darker: string;     // #1a1a1a
    dark: string;       // #2a2a2a
    medium: string;     // #3a3a3a
    light: string;      // #8a8a8a
    lighter: string;    // #cccccc
    white: string;      // #ffffff
  };
  
  // Grok Accent Colors - Premium & Vibrant
  accent: {
    primary: string;    // #00d4ff - Cyan
    secondary: string;  // #4ecdc4 - Teal
    critical: string;   // #ff6b6b - Coral
    success: string;    // #51cf66 - Green
    warning: string;    // #ff9f43 - Orange
  };
  
  // Interactive States - Grok Minimalism
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    ghost: string;
    ghostHover: string;
    surface: string;
    border: {
      subtle: string;
      medium: string;
      strong: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
    };
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
  
  // Glassmorphism - Premium Effects
  glass: {
    subtle: string;
    medium: string;
    strong: string;
    border: string;
  };
}

interface GradientTokens {
  // Grok Button Gradients - Minimal & Premium
  button: {
    primary: string[];
    secondary: string[];
    critical: string[];
  };
  
  // Simplified Background Gradients
  background: {
    subtle: string[];
    premium: string[];
  };
}

interface TypographyTokens {
  // Grok iOS Typography
  families: {
    primary: string;
    mono: string;
  };
  
  // Simplified Type Scale
  scale: {
    display: TextStyle;
    h1: TextStyle;
    h2: TextStyle;
    body: TextStyle;
    caption: TextStyle;
  };
  
  // RTL Support
  rtl: TextStyle;
}

interface SpacingTokens {
  // Minimal Spacing Scale
  xs: number;    // 4px
  sm: number;    // 8px
  md: number;    // 16px
  lg: number;    // 24px
  xl: number;    // 32px
}

interface RadiusTokens {
  // Grok iOS Corner Radius
  xs: number;        // 2px
  minimal: number;   // 4px
  sm: number;        // 6px
  standard: number;  // 8px
  large: number;     // 16px
  lg: number;        // 20px
  full: number;      // 9999px
}

interface ShadowTokens {
  // Grok iOS Shadow System - Clean & Minimal
  none: ViewStyle;
  subtle: ViewStyle;
  medium: ViewStyle;
  strong: ViewStyle;
  
  // Premium Shadows with Colored Tints
  glow: {
    cyan: ViewStyle;
    teal: ViewStyle;
    coral: ViewStyle;
  };
}

interface AnimationTokens {
  // Grok iOS Animation Timing
  duration: {
    fast: number;      // 150ms
    medium: number;    // 250ms
    slow: number;      // 400ms
  };
  
  // Premium Easing Curves
  easing: {
    smooth: string;    // cubic-bezier(0.4, 0, 0.2, 1)
    bounce: string;    // cubic-bezier(0.68, -0.55, 0.265, 1.55)
    premium: string;   // cubic-bezier(0.16, 1, 0.3, 1)
  };
  
  // Lift Animation Specs
  lift: {
    scale: number;
    translateY: number;
    shadowIntensity: number;
  };
}

// ========================================================================================
// GROK IOS THEME INTERFACE - REVOLUTIONARY MINIMALISM
// ========================================================================================

export interface IranverseTheme {
  colors: ColorTokens;
  gradients: GradientTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  animations: AnimationTokens;
  
  // Essential Utilities Only
  utils: {
    getGlassStyle: (level: 'subtle' | 'medium' | 'strong') => ViewStyle;
    getElevation: (level: 'low' | 'medium' | 'high') => ViewStyle;
    getDepthShadow: (color?: string) => ViewStyle;
  };
}

// ========================================================================================
// THEME IMPLEMENTATION - REVOLUTIONARY DESIGN
// ========================================================================================

const createIranverseTheme = (): IranverseTheme => {
  
  // GROK Premium Dark Color Palette - Ultra Deep Blacks
  const colors: ColorTokens = {
    foundation: {
      black: '#000000',      // Pure black
      darkest: '#0a0a0a',    // Barely lighter
      darker: '#141414',     // Card surfaces
      dark: '#1a1a1a',       // Interactive elements
      medium: '#2a2a2a',     // Borders
      light: '#8a8a8a',
      lighter: '#cccccc',
      white: '#ffffff',
    },
    
    accent: {
      primary: '#EC602A',    // IRANVERSE Brand Orange
      secondary: '#4ecdc4',  // Teal
      critical: '#ff6b6b',   // Coral
      success: '#51cf66',    // Green
      warning: '#ff9f43',    // Orange
    },
    
    interactive: {
      primary: '#EC602A',
      primaryHover: 'rgba(236, 96, 42, 0.8)',
      primaryActive: 'rgba(236, 96, 42, 0.6)',
      secondary: 'rgba(255, 255, 255, 0.05)',  // Darker for GROK
      secondaryHover: 'rgba(255, 255, 255, 0.08)',
      ghost: 'transparent',
      ghostHover: 'rgba(255, 255, 255, 0.02)',  // Very subtle
      surface: 'rgba(15, 15, 15, 0.95)',  // Dark surface
      border: {
        subtle: 'rgba(255, 255, 255, 0.06)',   // Subtle borders
        medium: 'rgba(255, 255, 255, 0.08)',   // Slightly visible
        strong: 'rgba(255, 255, 255, 0.12)',   // More visible
      },
      text: {
        primary: '#ffffff',                    // Pure white text
        secondary: 'rgba(255, 255, 255, 0.7)', // Dimmed white
        tertiary: 'rgba(255, 255, 255, 0.4)',  // Very dimmed
        disabled: 'rgba(255, 255, 255, 0.3)',
      },
      background: {
        primary: '#000000',
        secondary: '#0a0a0a',
        tertiary: '#141414',  // Darker tertiary
      },
    },
    
    glass: {
      subtle: 'rgba(20, 20, 20, 0.8)',     // Dark glass
      medium: 'rgba(15, 15, 15, 0.85)',    // Darker glass
      strong: 'rgba(10, 10, 10, 0.9)',     // Very dark glass
      border: 'rgba(255, 255, 255, 0.08)', // Subtle rim light
    },
  };
  

  // GROK Dark Gradient System - Premium Dark Aesthetic
  const gradients: GradientTokens = {
    button: {
      primary: ['#EC602A', '#D9501A'],  // Brand orange gradient
      secondary: ['rgba(25, 25, 25, 1)', 'rgba(15, 15, 15, 1)'],  // Dark gradient
      critical: ['#ff6b6b', 'rgba(255, 107, 107, 0.8)'],
    },
    background: {
      subtle: ['#000000', '#0a0a0a'],
      premium: ['#000000', '#0a0a0a', '#000000'],  // Pure black gradient
    },
  };
  
  // Grok iOS Typography - Premium & Minimal
  const typography: TypographyTokens = {
    families: {
      primary: Platform.select({
        ios: 'SF Pro Display',
        android: 'Inter',
        default: 'system',
      }) as string,
      mono: Platform.select({
        ios: 'SF Mono',
        android: 'JetBrains Mono',
        default: 'monospace',
      }) as string,
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
        fontWeight: '500',
        lineHeight: 32,
        letterSpacing: -0.25,
      },
      body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0,
      },
      caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.5,
      },
    },
    rtl: {
      textAlign: 'right',
      writingDirection: 'rtl',
    },
  };
  
  // Minimal Spacing System
  const spacing: SpacingTokens = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };
  
  // Grok iOS Corner Radius
  const radius: RadiusTokens = {
    xs: 2,
    minimal: 4,
    sm: 6,
    standard: 8,
    large: 16,
    lg: 20,
    full: 9999,
  };
  
  // GROK Premium Shadow System - Deep & Dramatic
  const shadows: ShadowTokens = {
    none: {},
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.9,  // Much darker shadows
      shadowRadius: 8,
      elevation: 4,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,  // Pure black shadows
      shadowRadius: 16,
      elevation: 8,
    },
    strong: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,  // Maximum shadow depth
      shadowRadius: 24,
      elevation: 16,
    },
    glow: {
      cyan: {
        shadowColor: '#EC602A',  // Brand orange glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
      },
      teal: {
        shadowColor: '#4ecdc4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
      },
      coral: {
        shadowColor: '#ff6b6b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
      },
    },
  };
  
  // Grok iOS Animation System
  const animations: AnimationTokens = {
    duration: {
      fast: 150,
      medium: 250,
      slow: 400,
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    lift: {
      scale: 1.02,
      translateY: -2,
      shadowIntensity: 1.5,
    },
  };
  
  // Essential Utilities Only
  const utils = {
    getGlassStyle: (level: 'subtle' | 'medium' | 'strong' = 'subtle'): ViewStyle => {
      const glassMap = {
        subtle: {
          backgroundColor: colors.glass.subtle,
          borderWidth: 1,
          borderColor: colors.glass.border,
          backdropFilter: 'blur(4px)',
          ...shadows.subtle,
        },
        medium: {
          backgroundColor: colors.glass.medium,
          borderWidth: 1,
          borderColor: colors.glass.border,
          backdropFilter: 'blur(8px)',
          ...shadows.medium,
        },
        strong: {
          backgroundColor: colors.glass.strong,
          borderWidth: 1,
          borderColor: colors.glass.border,
          backdropFilter: 'blur(16px)',
          ...shadows.strong,
        },
      };
      return glassMap[level];
    },
    
    getElevation: (level: 'low' | 'medium' | 'high'): ViewStyle => {
      const elevationMap = {
        low: shadows.subtle,
        medium: shadows.medium,
        high: shadows.strong,
      };
      return elevationMap[level];
    },
    
    getDepthShadow: (color: string = '#000000'): ViewStyle => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    }),
  };
  
  return {
    colors,
    gradients,
    typography,
    spacing,
    radius,
    shadows,
    animations,
    utils,
  };
};


// ========================================================================================
// THEME CONTEXT & PROVIDER - OPTIMIZED
// ========================================================================================

const ThemeContext = createContext<IranverseTheme | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useMemo(() => createIranverseTheme(), []);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// ========================================================================================
// THEME HOOK - SIMPLIFIED
// ========================================================================================

export const useTheme = (): IranverseTheme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};

// ========================================================================================
// EXPORTS
// ========================================================================================

export type { ColorTokens, GradientTokens, TypographyTokens, SpacingTokens, RadiusTokens, ShadowTokens, AnimationTokens };
export { createIranverseTheme };
export default ThemeProvider;