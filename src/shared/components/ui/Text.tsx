// src/components/ui/Text.tsx
// IRANVERSE Enterprise Text - Revolutionary Typography System
// Tesla-inspired text rendering with Persian excellence and advanced features
// Built for 90M users - Universal typography system with enterprise capabilities

import React, {
  memo,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
} from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
  Platform,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const TEXT_CONFIG = {
  PERSIAN_FONT_SCALE: 1.1,
  LINE_HEIGHT_MULTIPLIER: 1.5,
  LETTER_SPACING_SCALE: 0.02,
  TRUNCATION_SUFFIX: '...',
  HIGHLIGHT_OPACITY: 0.3,
  ANIMATION_DURATION: 300,
  GRADIENT_ANGLE: 45,
  SHADOW_DEFAULT_RADIUS: 2,
  GLOW_DEFAULT_RADIUS: 4,
  MAX_FONT_SCALE: 2,
  MIN_FONT_SCALE: 0.8,
  READABILITY_THRESHOLD: 4.5,
} as const;

const PERSIAN_NUMBERS = {
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type TextVariant = 
  | 'display'      // Hero text - 48px
  | 'h1'           // Primary headings - 32px
  | 'h2'           // Secondary headings - 24px
  | 'h3'           // Tertiary headings - 20px
  | 'h4'           // Quaternary headings - 18px
  | 'h5'           // Quinary headings - 16px
  | 'h6'           // Senary headings - 14px
  | 'body'         // Main body text - 16px
  | 'bodyLarge'    // Large body text - 18px
  | 'bodySmall'    // Small body text - 14px
  | 'caption'      // Supporting text - 12px
  | 'legal'        // Legal text - 10px
  | 'button'       // Button labels - 16px
  | 'input'        // Input field text - 16px
  | 'code'         // Code/mono text - 14px
  | 'inherit';     // Inherit from parent

export type TextWeight = 
  | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  | 'thin' | 'ultraLight' | 'light' | 'normal' | 'medium' | 'semiBold' | 'bold' | 'heavy' | 'black';

export type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type TextDecoration = 'none' | 'underline' | 'line-through' | 'underline line-through';

export type TextColor = 
  | 'primary'      // Main text color
  | 'secondary'    // Secondary text color
  | 'tertiary'     // Tertiary text color
  | 'disabled'     // Disabled text color
  | 'error'        // Error state color
  | 'warning'      // Warning state color
  | 'success'      // Success state color
  | 'info'         // Info state color
  | 'critical'     // Critical action color (#EC602A)
  | 'inherit';     // Inherit from parent

export interface TextHighlight {
  text: string;
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
}

export interface TextGradient {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
}

export interface TextShadow {
  color?: string;
  offset?: { width: number; height: number };
  radius?: number;
  opacity?: number;
}

export interface TextAnimationConfig {
  type?: 'fade' | 'slide' | 'scale' | 'typewriter';
  duration?: number;
  delay?: number;
  loop?: boolean;
}

export interface TextProps extends Omit<RNTextProps, 'style'> {
  // Core
  children: React.ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
  
  // Color & Effects
  color?: TextColor | string;
  opacity?: number;
  gradient?: boolean | TextGradient;
  shadow?: boolean | TextShadow;
  glow?: boolean | { color?: string; radius?: number };
  
  // Layout
  align?: TextAlign;
  transform?: TextTransform;
  decoration?: TextDecoration;
  
  // Styling
  style?: TextStyle | TextStyle[];
  italic?: boolean;
  
  // Persian/RTL
  rtl?: boolean;
  persianText?: boolean;
  persianNumbers?: boolean;
  persianFont?: string;
  
  // Truncation
  truncate?: boolean;
  truncateLines?: number;
  truncateMode?: 'head' | 'middle' | 'tail' | 'clip';
  
  // Highlighting
  highlight?: string | RegExp | TextHighlight[];
  highlightColor?: string;
  highlightBackground?: string;
  
  // Accessibility
  scaleFontSize?: boolean;
  maxFontSizeMultiplier?: number;
  minimumFontScale?: number;
  readabilityCheck?: boolean;
  
  // Animation
  animated?: boolean;
  animation?: TextAnimationConfig;
  
  // Interaction
  selectable?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onCopy?: (text: string) => void;
  
  // Enterprise
  analytics?: {
    textName?: string;
    category?: string;
    trackInteractions?: boolean;
  };
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLanguage?: string;
  accessibilityRole?: 'text' | 'header' | 'button' | 'link';
  testID?: string;
}

export interface TextRef {
  focus: () => void;
  blur: () => void;
  measureText: () => Promise<{ width: number; height: number }>;
  animateIn: () => void;
  animateOut: () => void;
}

// ========================================================================================
// UTILITY FUNCTIONS
// ========================================================================================

const convertToPersianNumbers = (text: string): string => {
  return text.replace(/[0-9]/g, (match) => PERSIAN_NUMBERS[match as keyof typeof PERSIAN_NUMBERS] || match);
};

const calculateContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast calculation
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useTextAnimation = (
  animated: boolean,
  animation?: TextAnimationConfig
) => {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(animated ? 0.9 : 1)).current;
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  
  const animateIn = useCallback(() => {
    if (!animated || !animation) return;
    
    const { type = 'fade', duration = TEXT_CONFIG.ANIMATION_DURATION, delay = 0 } = animation;
    
    const animations: Animated.CompositeAnimation[] = [];
    
    switch (type) {
      case 'fade':
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'slide':
        animations.push(
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ])
        );
        break;
        
      case 'scale':
        animations.push(
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 5,
              tension: 40,
              delay,
              useNativeDriver: true,
            }),
          ])
        );
        break;
        
      case 'typewriter':
        // Typewriter effect handled separately
        break;
    }
    
    if (animations.length > 0) {
      if (animation.loop) {
        Animated.loop(Animated.sequence(animations)).start();
      } else {
        Animated.parallel(animations).start();
      }
    }
  }, [animated, animation, fadeAnim, slideAnim, scaleAnim]);
  
  const animateOut = useCallback(() => {
    if (!animated || !animation) return;
    
    const { duration = TEXT_CONFIG.ANIMATION_DURATION } = animation;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, animation, fadeAnim, scaleAnim]);
  
  // Typewriter animation
  useEffect(() => {
    if (animated && animation?.type === 'typewriter') {
      const { duration = 50, delay = 0 } = animation;
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setTypewriterIndex(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, duration);
        
        return () => clearInterval(interval);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [animated, animation]);
  
  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    typewriterIndex,
    animateIn,
    animateOut,
  };
};

// ========================================================================================
// MAIN TEXT COMPONENT
// ========================================================================================

export const Text = memo(forwardRef<TextRef, TextProps>(({
    children,
    variant = 'body',
    weight,
    size,
    lineHeight,
    letterSpacing,
    color = 'primary',
    opacity = 1,
    gradient = false,
    shadow = false,
    glow = false,
    align = 'auto',
    transform = 'none',
    decoration = 'none',
    style,
    italic = false,
    rtl = false,
    persianText = false,
    persianNumbers = false,
    persianFont,
    truncate = false,
    truncateLines = 1,
    truncateMode = 'tail',
    highlight,
    highlightColor,
    highlightBackground,
    scaleFontSize = true,
    maxFontSizeMultiplier = TEXT_CONFIG.MAX_FONT_SCALE,
    minimumFontScale = TEXT_CONFIG.MIN_FONT_SCALE,
    readabilityCheck = false,
    animated = false,
    animation,
    selectable = true,
    onPress,
    onLongPress,
    onCopy,
    analytics,
    accessibilityLabel,
    accessibilityHint,
    accessibilityLanguage,
    accessibilityRole = 'text',
    testID = 'text',
    ...props
  }, ref) => {
  
  const theme = useTheme();
  const textRef = useRef<RNText>(null);
  const [, setDimensions] = useState({ width: 0, height: 0 });
  
  // Animations
  const { fadeAnim, slideAnim, scaleAnim, typewriterIndex, animateIn, animateOut } = useTextAnimation(animated, animation);
  
  // Variant styles
  const getVariantStyles = useCallback((): TextStyle => {
    const baseStyles = theme.typography.scale;
    
    switch (variant) {
      case 'display':
        return baseStyles.display;
      case 'h1':
        return baseStyles.h1;
      case 'h2':
        return baseStyles.h2;
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          ...baseStyles.body,
          fontSize: variant === 'h3' ? 20 : variant === 'h4' ? 18 : variant === 'h5' ? 16 : 14,
          fontWeight: '600',
        };
      case 'body':
        return baseStyles.body;
      case 'bodyLarge':
        return { ...baseStyles.body, fontSize: 18 };
      case 'bodySmall':
        return { ...baseStyles.body, fontSize: 14 };
      case 'caption':
        return baseStyles.caption;
      case 'legal':
        return { ...baseStyles.caption, fontSize: 10 };
      case 'button':
        return { ...baseStyles.body, fontWeight: '600' };
      case 'input':
        return baseStyles.body;
      case 'code':
        return { ...baseStyles.body, fontFamily: theme.typography.families.mono };
      case 'inherit':
        return {};
      default:
        return baseStyles.body;
    }
  }, [variant, theme]);
  
  // Weight mapping
  const getFontWeight = useCallback((): TextStyle['fontWeight'] => {
    if (!weight) return getVariantStyles().fontWeight;
    
    const weightMap: Record<string, TextStyle['fontWeight']> = {
      thin: '100',
      ultraLight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
      heavy: '800',
      black: '900',
    };
    
    return weightMap[weight] || weight as TextStyle['fontWeight'];
  }, [weight, getVariantStyles]);
  
  // Color resolution
  const getTextColor = useCallback((): string => {
    if (typeof color === 'string' && (color.startsWith('#') || color.startsWith('rgb'))) {
      return color;
    }
    
    const colorMap: Record<TextColor, string> = {
      primary: theme.colors.interactive.text.primary,
      secondary: theme.colors.interactive.text.secondary,
      tertiary: theme.colors.interactive.text.tertiary,
      disabled: theme.colors.interactive.text.disabled,
      error: theme.colors.accent.critical,
      warning: theme.colors.accent.warning,
      success: theme.colors.accent.success,
      info: theme.colors.accent.primary,
      critical: '#EC602A',
      inherit: 'inherit',
    };
    
    return colorMap[color as TextColor] || theme.colors.interactive.text.primary;
  }, [color, theme]);
  
  // Font family
  const getFontFamily = useCallback((): string => {
    if (persianFont) return persianFont;
    if (persianText) return theme.typography.families.primary;
    if (variant === 'code') return theme.typography.families.mono;
    return getVariantStyles().fontFamily || theme.typography.families.primary;
  }, [persianFont, persianText, variant, theme, getVariantStyles]);
  
  // Process children for Persian numbers
  const processedChildren = useMemo(() => {
    if (!persianNumbers || typeof children !== 'string') {
      return children;
    }
    
    return convertToPersianNumbers(children);
  }, [children, persianNumbers]);
  
  // Process children for typewriter animation
  const animatedChildren = useMemo(() => {
    if (!animated || animation?.type !== 'typewriter' || typeof processedChildren !== 'string') {
      return processedChildren;
    }
    
    const length = Math.floor((processedChildren.length * typewriterIndex) / 100);
    return processedChildren.substring(0, length);
  }, [animated, animation, processedChildren, typewriterIndex]);
  
  // Highlight processing
  const highlightedChildren = useMemo(() => {
    if (!highlight || typeof animatedChildren !== 'string') {
      return animatedChildren;
    }
    
    // Complex highlight logic would go here
    // For now, return the original text
    return animatedChildren;
  }, [highlight, animatedChildren]);
  
  // Compute text styles
  const textStyles = useMemo((): TextStyle => {
    const variantStyles = getVariantStyles();
    const baseColor = getTextColor();
    
    const computedStyles: TextStyle = {
      ...variantStyles,
      fontFamily: getFontFamily(),
      fontWeight: getFontWeight(),
      fontSize: size || variantStyles.fontSize,
      lineHeight: lineHeight || (variantStyles.lineHeight ? variantStyles.lineHeight : (size || variantStyles.fontSize || 16) * TEXT_CONFIG.LINE_HEIGHT_MULTIPLIER),
      letterSpacing: letterSpacing !== undefined ? letterSpacing : variantStyles.letterSpacing,
      color: baseColor,
      opacity,
      textAlign: align === 'auto' ? (rtl ? 'right' : 'left') : align,
      textTransform: transform,
      textDecorationLine: decoration as TextStyle['textDecorationLine'],
      fontStyle: italic ? 'italic' : 'normal',
      writingDirection: rtl ? 'rtl' : 'ltr',
      
      // Platform optimizations
      ...Platform.select({
        ios: {
          fontVariant: variant === 'code' ? ['tabular-nums'] : undefined,
        },
        android: {
          includeFontPadding: false,
          textAlignVertical: 'center',
        },
      }),
    };
    
    // Shadow effect
    if (shadow) {
      const shadowConfig = typeof shadow === 'object' ? shadow : {};
      Object.assign(computedStyles, {
        textShadowColor: shadowConfig.color || 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: shadowConfig.offset || { width: 0, height: 1 },
        textShadowRadius: shadowConfig.radius || TEXT_CONFIG.SHADOW_DEFAULT_RADIUS,
      });
    }
    
    // Glow effect
    if (glow) {
      const glowConfig = typeof glow === 'object' ? glow : {};
      Object.assign(computedStyles, {
        textShadowColor: glowConfig.color || baseColor,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: glowConfig.radius || TEXT_CONFIG.GLOW_DEFAULT_RADIUS,
      });
    }
    
    // Persian text adjustments
    if (persianText) {
      computedStyles.fontSize = (computedStyles.fontSize || 16) * TEXT_CONFIG.PERSIAN_FONT_SCALE;
      computedStyles.lineHeight = (computedStyles.lineHeight || 24) * TEXT_CONFIG.PERSIAN_FONT_SCALE;
    }
    
    return computedStyles;
  }, [
    getVariantStyles,
    getTextColor,
    getFontFamily,
    getFontWeight,
    size,
    lineHeight,
    letterSpacing,
    opacity,
    align,
    rtl,
    transform,
    decoration,
    italic,
    variant,
    shadow,
    glow,
    persianText,
  ]);
  
  // Animated container styles
  const animatedContainerStyle = useMemo(() => {
    if (!animated) return {};
    
    return {
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim },
      ],
    };
  }, [animated, fadeAnim, slideAnim, scaleAnim]);
  
  // Accessibility
  const accessibilityProps = useMemo(() => {
    const props: any = {
      accessible: true,
      accessibilityRole,
      accessibilityLabel: accessibilityLabel || (typeof highlightedChildren === 'string' ? highlightedChildren : undefined),
      accessibilityHint,
    };
    
    if (accessibilityLanguage || persianText) {
      props.accessibilityLanguage = accessibilityLanguage || (persianText ? 'fa' : 'en');
    }
    
    if (variant === 'h1' || variant === 'h2' || variant === 'h3' || variant === 'display') {
      props.accessibilityRole = 'header';
    }
    
    if (onPress) {
      props.accessibilityRole = 'button';
    }
    
    return props;
  }, [
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    accessibilityLanguage,
    persianText,
    variant,
    onPress,
    highlightedChildren,
  ]);
  
  // Handlers
  const handlePress = useCallback(() => {
    if (analytics?.trackInteractions) {
      console.log('Text interaction:', analytics.textName);
    }
    
    if (Platform.OS !== 'web' && accessibilityLabel) {
      AccessibilityInfo.announceForAccessibility(accessibilityLabel);
    }
    
    onPress?.();
  }, [onPress, analytics, accessibilityLabel]);
  
  const handleTextLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }, []);
  
  // Imperative API
  useImperativeHandle(ref, () => ({
    focus: () => {
      // Text components can't be focused directly
    },
    blur: () => {
      // Text components can't be blurred directly
    },
    measureText: async () => {
      return new Promise((resolve) => {
        textRef.current?.measure((_x, _y, width, height) => {
          resolve({ width, height });
        });
      });
    },
    animateIn,
    animateOut,
  }), [animateIn, animateOut]);
  
  // Start animation on mount
  useEffect(() => {
    if (animated) {
      animateIn();
    }
  }, [animated, animateIn]);
  
  // Readability check
  useEffect(() => {
    if (readabilityCheck && textStyles.color) {
      const backgroundColor = '#000000'; // Would need to get actual background
      const contrast = calculateContrastRatio(textStyles.color as string, backgroundColor);
      
      if (contrast < TEXT_CONFIG.READABILITY_THRESHOLD) {
        console.warn(`Text contrast ratio (${contrast.toFixed(2)}) is below recommended threshold`);
      }
    }
  }, [readabilityCheck, textStyles.color]);
  
  // Render gradient text if needed
  if (gradient && typeof gradient === 'object') {
    // Gradient text would require a custom implementation
    // For now, fall back to regular text
  }
  
  // Ensure only string content is passed to RNText
  const safeChildren = typeof highlightedChildren === 'string' || typeof highlightedChildren === 'number' 
    ? highlightedChildren 
    : React.Children.toArray(highlightedChildren).filter(
        child => typeof child === 'string' || typeof child === 'number'
      ).join('');

  const textElement = (
    <RNText
      ref={textRef}
      style={[textStyles, style]}
      onPress={onPress ? handlePress : undefined}
      onLongPress={onLongPress}
      selectable={selectable}
      allowFontScaling={scaleFontSize}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      minimumFontScale={minimumFontScale}
      numberOfLines={truncate ? truncateLines : undefined}
      ellipsizeMode={truncate ? truncateMode : undefined}
      onLayout={handleTextLayout}
      testID={testID}
      {...accessibilityProps}
      {...props}
    >
      {safeChildren}
    </RNText>
  );
  
  if (animated) {
    return (
      <Animated.View style={animatedContainerStyle}>
        {textElement}
      </Animated.View>
    );
  }
  
  return textElement;
}));

Text.displayName = 'Text';

// ========================================================================================
// PRESET COMPONENTS
// ========================================================================================

// Typography variants
export const DisplayText = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="display" />
));
DisplayText.displayName = 'DisplayText';

export const H1 = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="h1" />
));
H1.displayName = 'H1';

export const H2 = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="h2" />
));
H2.displayName = 'H2';

export const H3 = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="h3" />
));
H3.displayName = 'H3';

export const H4 = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="h4" />
));
H4.displayName = 'H4';

export const H5 = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="h5" />
));
H5.displayName = 'H5';

export const H6 = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="h6" />
));
H6.displayName = 'H6';

export const Body = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="body" />
));
Body.displayName = 'Body';

export const BodyLarge = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="bodyLarge" />
));
BodyLarge.displayName = 'BodyLarge';

export const BodySmall = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="bodySmall" />
));
BodySmall.displayName = 'BodySmall';

export const Caption = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="caption" />
));
Caption.displayName = 'Caption';

export const Legal = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="legal" />
));
Legal.displayName = 'Legal';

export const Code = memo<Omit<TextProps, 'variant'>>((props) => (
  <Text {...props} variant="code" />
));
Code.displayName = 'Code';

// Persian variants
export const PersianText = memo<Omit<TextProps, 'persianText' | 'rtl'>>((props) => (
  <Text {...props} persianText rtl persianNumbers />
));
PersianText.displayName = 'PersianText';

export const PersianDisplay = memo<Omit<TextProps, 'variant' | 'persianText' | 'rtl'>>((props) => (
  <Text {...props} variant="display" persianText rtl persianNumbers />
));
PersianDisplay.displayName = 'PersianDisplay';

export const PersianH1 = memo<Omit<TextProps, 'variant' | 'persianText' | 'rtl'>>((props) => (
  <Text {...props} variant="h1" persianText rtl persianNumbers />
));
PersianH1.displayName = 'PersianH1';

export const PersianBody = memo<Omit<TextProps, 'variant' | 'persianText' | 'rtl'>>((props) => (
  <Text {...props} variant="body" persianText rtl persianNumbers />
));
PersianBody.displayName = 'PersianBody';

// Color variants
export const ErrorText = memo<Omit<TextProps, 'color'>>((props) => (
  <Text {...props} color="error" />
));
ErrorText.displayName = 'ErrorText';

export const SuccessText = memo<Omit<TextProps, 'color'>>((props) => (
  <Text {...props} color="success" />
));
SuccessText.displayName = 'SuccessText';

export const WarningText = memo<Omit<TextProps, 'color'>>((props) => (
  <Text {...props} color="warning" />
));
WarningText.displayName = 'WarningText';

export const CriticalText = memo<Omit<TextProps, 'color'>>((props) => (
  <Text {...props} color="critical" />
));
CriticalText.displayName = 'CriticalText';

export const SecondaryText = memo<Omit<TextProps, 'color'>>((props) => (
  <Text {...props} color="secondary" />
));
SecondaryText.displayName = 'SecondaryText';

export const TertiaryText = memo<Omit<TextProps, 'color'>>((props) => (
  <Text {...props} color="tertiary" />
));
TertiaryText.displayName = 'TertiaryText';

// Special variants
export const Link = memo<TextProps & { href?: string }>((props) => (
  <Text
    {...props}
    color={props.color || 'info'}
    decoration="underline"
    accessibilityRole="link"
  />
));
Link.displayName = 'Link';

export const AnimatedText = memo<TextProps>((props) => (
  <Text {...props} animated animation={{ type: 'fade', duration: 300 }} />
));
AnimatedText.displayName = 'AnimatedText';

export const TypewriterText = memo<TextProps>((props) => (
  <Text {...props} animated animation={{ type: 'typewriter', duration: 50 }} />
));
TypewriterText.displayName = 'TypewriterText';

export const GradientText = memo<TextProps & { colors: string[] }>((props) => (
  <Text {...props} gradient={{ colors: props.colors }} />
));
GradientText.displayName = 'GradientText';

export const GlowText = memo<TextProps & { glowColor?: string }>((props) => (
  <Text {...props} glow={{ color: props.glowColor }} />
));
GlowText.displayName = 'GlowText';

export const TruncatedText = memo<TextProps & { lines?: number }>((props) => (
  <Text {...props} truncate truncateLines={props.lines || 1} />
));
TruncatedText.displayName = 'TruncatedText';

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Text;