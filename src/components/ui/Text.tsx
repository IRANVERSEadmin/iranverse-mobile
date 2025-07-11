// src/components/ui/Text.tsx
// IRANVERSE Enterprise Text - Revolutionary Typography System
// Tesla-inspired text rendering with Persian Excellence
// Built for 90M users - Universal Typography & Accessibility
import React, { useMemo, forwardRef } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { useTheme, useColors, useTypography } from '../theme/ThemeProvider';

// ========================================================================================
// TEXT VARIANTS & TYPES - ENTERPRISE TYPOGRAPHY SYSTEM
// ========================================================================================

export type TextVariant = 
  | 'display'      // Hero text - largest
  | 'h1'           // Primary headings
  | 'h2'           // Secondary headings
  | 'h3'           // Tertiary headings
  | 'body'         // Main body text
  | 'bodySmall'    // Secondary body text
  | 'caption'      // Supporting text
  | 'button'       // Button labels
  | 'input'        // Input field text
  | 'mono'         // Monospace/code text
  | 'inherit';     // Inherit from parent

export type TextWeight = 
  | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  | 'thin' | 'ultraLight' | 'light' | 'normal' | 'medium' | 'semiBold' | 'bold' | 'heavy' | 'black';

export type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify';

export type TextColor = 
  | 'primary'      // Main text color
  | 'secondary'    // Secondary text color
  | 'disabled'     // Disabled text color
  | 'error'        // Error state color
  | 'warning'      // Warning state color
  | 'success'      // Success state color
  | 'info'         // Info state color
  | 'critical'     // Critical action color (vibrant orange)
  | 'inherit';     // Inherit from parent

export interface TextProps extends Omit<RNTextProps, 'style'> {
  // Core Props
  children: React.ReactNode;
  
  // Typography Variants
  variant?: TextVariant;
  weight?: TextWeight;
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
  
  // Color System
  color?: TextColor | string;
  opacity?: number;
  
  // Alignment & Layout
  align?: TextAlign;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Styling
  style?: TextStyle | TextStyle[];
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  persianNumbers?: boolean;
  
  // Responsive & Accessibility
  scaleFontSize?: boolean;
  maxFontSizeMultiplier?: number;
  minimumFontScale?: number;
  
  // Advanced Features
  gradient?: boolean;
  gradientColors?: string[];
  shadow?: boolean;
  glow?: boolean;
  
  // Interaction
  selectable?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  
  // Accessibility Enhancement
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLanguage?: string;
  testID?: string;
}

// ========================================================================================
// TEXT IMPLEMENTATION - REVOLUTIONARY TYPOGRAPHY
// ========================================================================================

export const Text = forwardRef<RNText, TextProps>(({
  children,
  variant = 'body',
  weight,
  size,
  lineHeight,
  letterSpacing,
  color = 'primary',
  opacity = 1,
  align = 'auto',
  transform = 'none',
  style,
  italic = false,
  underline = false,
  strikethrough = false,
  rtl = false,
  persianText = false,
  persianNumbers = false,
  scaleFontSize = true,
  maxFontSizeMultiplier = 2,
  minimumFontScale = 0.8,
  gradient = false,
  gradientColors,
  shadow = false,
  glow = false,
  selectable = true,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityLanguage,
  testID,
  ...props
}, ref) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  
  // ========================================================================================
  // STYLE COMPUTATION - ENTERPRISE TYPOGRAPHY SYSTEM
  // ========================================================================================
  
  const textStyles = useMemo(() => {
    // Base variant styles
    const variantStyles = variant === 'inherit' ? {} : typography.scale[variant] || typography.scale.body;
    
    // Font family selection - Persian Excellence
    const fontFamily = persianText ? typography.families.persian :
                       variant === 'mono' ? typography.families.mono :
                       typography.families.primary;
    
    // Weight mapping - Enterprise precision
    const getWeight = (): TextStyle['fontWeight'] => {
      if (weight) {
        // Convert string weights to numeric
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
      }
      
      return variantStyles.fontWeight;
    };
    
    // Color resolution - Revolutionary color system
    const getColor = (): string => {
      if (typeof color === 'string' && !color.startsWith('#') && !color.startsWith('rgb')) {
        const colorMap: Record<string, string> = {
          primary: colors.interactive.text,
          secondary: colors.interactive.textSecondary,
          disabled: colors.interactive.textDisabled,
          error: colors.semantic.error,
          warning: colors.semantic.warning,
          success: colors.semantic.success,
          info: colors.interactive.text,
          critical: colors.semantic.critical,
          inherit: 'inherit',
        };
        
        return colorMap[color] || colors.interactive.text;
      }
      
      return color as string;
    };
    
    // Text alignment - RTL support
    const getTextAlign = (): TextStyle['textAlign'] => {
      if (align === 'auto') {
        return rtl ? 'right' : 'left';
      }
      return align;
    };
    
    // Text decoration
    const getTextDecorationLine = (): TextStyle['textDecorationLine'] => {
      const decorations: string[] = [];
      if (underline) decorations.push('underline');
      if (strikethrough) decorations.push('line-through');
      return decorations.length > 0 ? decorations.join(' ') as TextStyle['textDecorationLine'] : 'none';
    };
    
    // Base computed styles
    const computedStyles: TextStyle = {
      ...variantStyles,
      fontFamily,
      fontWeight: getWeight(),
      fontSize: size || variantStyles.fontSize,
      lineHeight: lineHeight || variantStyles.lineHeight,
      letterSpacing: letterSpacing !== undefined ? letterSpacing : variantStyles.letterSpacing,
      color: getColor(),
      opacity,
      textAlign: getTextAlign(),
      textTransform: transform,
      fontStyle: italic ? 'italic' : 'normal',
      textDecorationLine: getTextDecorationLine(),
      
      // RTL Support
      ...(rtl ? typography.rtl.persian : {}),
      writingDirection: rtl ? 'rtl' : 'ltr',
      
      // Platform optimizations
      ...Platform.select({
        ios: {
          fontVariant: variant === 'mono' ? ['tabular-nums'] : undefined,
        },
        android: {
          includeFontPadding: false,
          textAlignVertical: 'center',
        },
        web: {
          fontFeatureSettings: variant === 'mono' ? '"tnum"' : undefined,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      }),
    };
    
    // Shadow effect
    if (shadow) {
      Object.assign(computedStyles, {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      });
    }
    
    // Glow effect
    if (glow) {
      Object.assign(computedStyles, {
        textShadowColor: computedStyles.color,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
      });
    }
    
    return computedStyles;
  }, [
    variant,
    weight,
    size,
    lineHeight,
    letterSpacing,
    color,
    opacity,
    align,
    transform,
    italic,
    underline,
    strikethrough,
    rtl,
    persianText,
    shadow,
    glow,
    typography,
    colors,
  ]);
  
  // ========================================================================================
  // CONTENT PROCESSING - PERSIAN NUMBERS & RTL
  // ========================================================================================
  
  const processedChildren = useMemo(() => {
    if (typeof children !== 'string' || !persianNumbers) {
      return children;
    }
    
    // Define Persian number constants
    const englishNumbers = '0123456789';
    const persianNumberChars = '۰۱۲۳۴۵۶۷۸۹';
    
    // Convert English numbers to Persian
    return children.replace(/[0-9]/g, (match) => {
      const index = englishNumbers.indexOf(match);
      return persianNumberChars[index] || match;
    });
  }, [children, persianNumbers]);
  
  // ========================================================================================
  // ACCESSIBILITY ENHANCEMENT - ENTERPRISE STANDARDS
  // ========================================================================================
  
  const accessibilityProps = useMemo(() => {
    const props: any = {
      accessibilityRole: onPress ? 'button' : 'text',
      accessibilityLabel: accessibilityLabel || (typeof children === 'string' ? children : undefined),
      accessibilityHint,
      accessible: true,
    };
    
    // Language hint for screen readers
    if (accessibilityLanguage || persianText) {
      props.accessibilityLanguage = accessibilityLanguage || (persianText ? 'fa' : 'en');
    }
    
    // Reading traits
    if (variant === 'h1' || variant === 'h2' || variant === 'h3' || variant === 'display') {
      props.accessibilityTraits = ['header'];
    }
    
    if (onPress) {
      props.accessibilityTraits = [...(props.accessibilityTraits || []), 'button'];
    }
    
    return props;
  }, [
    onPress,
    accessibilityLabel,
    accessibilityHint,
    accessibilityLanguage,
    persianText,
    variant,
    children,
  ]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - USER EXPERIENCE
  // ========================================================================================
  
  const handlePress = React.useCallback(() => {
    // Announce to screen readers
    if (Platform.OS !== 'web' && accessibilityLabel) {
      AccessibilityInfo.announceForAccessibility(accessibilityLabel);
    }
    
    onPress?.();
  }, [onPress, accessibilityLabel]);
  
  // ========================================================================================
  // COMPONENT RENDER - UNIVERSAL TYPOGRAPHY
  // ========================================================================================
  
  const Component = onPress ? RNText : RNText;
  
  return (
    <Component
      ref={ref}
      style={[textStyles, style]}
      onPress={onPress ? handlePress : undefined}
      onLongPress={onLongPress}
      selectable={selectable}
      allowFontScaling={scaleFontSize}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      minimumFontScale={minimumFontScale}
      testID={testID}
      {...accessibilityProps}
      {...props}
    >
      {processedChildren}
    </Component>
  );
});

Text.displayName = 'Text';

// ========================================================================================
// TEXT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const DisplayText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="display" />
);

export const H1Text: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="h1" />
);

export const H2Text: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="h2" />
);

export const H3Text: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="h3" />
);

export const BodyText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="body" />
);

export const BodySmallText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="bodySmall" />
);

export const CaptionText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="caption" />
);

export const ButtonText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="button" />
);

export const MonoText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text {...props} variant="mono" />
);

// Persian Text Variants
export const PersianText: React.FC<Omit<TextProps, 'persianText'>> = (props) => (
  <Text {...props} persianText rtl />
);

export const PersianDisplayText: React.FC<Omit<TextProps, 'variant' | 'persianText'>> = (props) => (
  <Text {...props} variant="display" persianText rtl />
);

export const PersianBodyText: React.FC<Omit<TextProps, 'variant' | 'persianText'>> = (props) => (
  <Text {...props} variant="body" persianText rtl />
);

// Color Variants
export const ErrorText: React.FC<Omit<TextProps, 'color'>> = (props) => (
  <Text {...props} color="error" />
);

export const SuccessText: React.FC<Omit<TextProps, 'color'>> = (props) => (
  <Text {...props} color="success" />
);

export const WarningText: React.FC<Omit<TextProps, 'color'>> = (props) => (
  <Text {...props} color="warning" />
);

export const CriticalText: React.FC<Omit<TextProps, 'color'>> = (props) => (
  <Text {...props} color="critical" />
);

export const SecondaryText: React.FC<Omit<TextProps, 'color'>> = (props) => (
  <Text {...props} color="secondary" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Text;