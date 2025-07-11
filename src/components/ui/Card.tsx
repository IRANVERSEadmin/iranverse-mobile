import { TouchableOpacity } from 'react-native';
// src/components/ui/Card.tsx
// IRANVERSE Enterprise Card - Revolutionary Information Architecture
// Tesla-inspired containers with Glassmorphism Excellence
// Built for 90M users - Agent Identity Content Organization
import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Animated,
  ViewStyle,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { useTheme, useColors, useSpacing, useRadius, useShadows, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// CARD VARIANTS & TYPES - ENTERPRISE DESIGN SYSTEM
// ========================================================================================

export type CardVariant = 
  | 'default'      // Standard surface card
  | 'glass'        // Glassmorphism card - matches FirstScreen.tsx
  | 'elevated'     // Enhanced shadow card
  | 'outlined'     // Border-focused card
  | 'filled';      // Solid background card

export type CardSize = 'small' | 'medium' | 'large';

export type CardPressEffect = 'none' | 'scale' | 'opacity' | 'lift';

export interface CardProps {
  // Core Props
  children: React.ReactNode;
  
  // Design Variants
  variant?: CardVariant;
  size?: CardSize;
  
  // Interaction
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  pressEffect?: CardPressEffect;
  disabled?: boolean;
  
  // Layout
  fullWidth?: boolean;
  centered?: boolean;
  
  // Styling
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'none';
  testID?: string;
  
  // Advanced Features
  hapticFeedback?: boolean;
  animatedEntrance?: boolean;
  entranceDelay?: number;
  
  // Glass Effect Customization
  glassOpacity?: number;
  glassBlur?: number;
  
  // Border & Spacing
  padding?: number | 'none' | 'small' | 'medium' | 'large';
  margin?: number | 'none' | 'small' | 'medium' | 'large';
  borderRadius?: number | 'none' | 'small' | 'medium' | 'large';
}

// ========================================================================================
// CARD IMPLEMENTATION - REVOLUTIONARY CONTAINERS
// ========================================================================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  onPress,
  onLongPress,
  pressEffect = 'scale',
  disabled = false,
  fullWidth = false,
  centered = false,
  style,
  contentStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  testID,
  hapticFeedback = true,
  animatedEntrance = false,
  entranceDelay = 0,
  glassOpacity = 0.08,
  glassBlur = 20,
  padding = 'medium',
  margin = 'none',
  borderRadius = 'medium',
}) => {
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const spacing = useSpacing();
  const radius = useRadius();
  const shadows = useShadows();
  const animations = useAnimations();
  
  // Animation Values with cleanup
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const entranceAnim = useRef(new Animated.Value(animatedEntrance ? 0 : 1)).current;
  
  // Cleanup animations
  useEffect(() => {
    return () => {
      scaleAnim.stopAnimation();
      opacityAnim.stopAnimation();
      liftAnim.stopAnimation();
      entranceAnim.stopAnimation();
      scaleAnim.removeAllListeners();
      opacityAnim.removeAllListeners();
      liftAnim.removeAllListeners();
      entranceAnim.removeAllListeners();
    };
  }, [scaleAnim, opacityAnim, liftAnim, entranceAnim]);
  
  // Determine interaction state
  const isInteractive = !!(onPress || onLongPress) && !disabled;
  
  // ========================================================================================
  // STYLE COMPUTATION - VARIANT-BASED DESIGN
  // ========================================================================================
  
  const cardStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      overflow: 'hidden',
      position: 'relative',
    };
    
    // Size-based styles
    const sizeStyles: Record<CardSize, ViewStyle> = {
      small: {
        minHeight: 80,
      },
      medium: {
        minHeight: 120,
      },
      large: {
        minHeight: 160,
      },
    };
    
    // Padding calculation
    const getPadding = () => {
      if (typeof padding === 'number') return padding;
      
      const paddingMap = {
        none: 0,
        small: spacing.md,
        medium: spacing.lg,
        large: spacing.xl,
      };
      
      return paddingMap[padding] || spacing.lg;
    };
    
    // Margin calculation
    const getMargin = () => {
      if (typeof margin === 'number') return margin;
      
      const marginMap = {
        none: 0,
        small: spacing.sm,
        medium: spacing.md,
        large: spacing.lg,
      };
      
      return marginMap[margin] || 0;
    };
    
    // Border radius calculation
    const getBorderRadius = () => {
      if (typeof borderRadius === 'number') return borderRadius;
      
      const radiusMap = {
        none: 0,
        small: radius.sm,
        medium: radius.card,
        large: radius.lg,
      };
      
      return radiusMap[borderRadius] || radius.card;
    };
    
    // Variant-based styles
    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: colors.interactive.surface,
        borderWidth: 1,
        borderColor: colors.interactive.border,
        ...shadows.card,
      },
      glass: {
        backgroundColor: `rgba(255, 255, 255, ${glassOpacity})`,
        borderWidth: 1,
        borderColor: colors.glass.border,
        ...shadows.glass,
        // Glass blur effect (platform specific with fallbacks)
        ...Platform.select({
          ios: {
            backdropFilter: `blur(${glassBlur}px)`,
          },
          android: {
            // Android fallback - enhanced shadow for depth
            elevation: 8,
            shadowColor: colors.glass.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          },
          web: {
            backdropFilter: `blur(${glassBlur}px)`,
            WebkitBackdropFilter: `blur(${glassBlur}px)`,
          },
          default: {
            // Generic fallback
            backgroundColor: `rgba(255, 255, 255, ${glassOpacity + 0.05})`,
          },
        }),
      },
      elevated: {
        backgroundColor: colors.interactive.surface,
        borderWidth: 0,
        ...shadows.strong,
        elevation: 12,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.interactive.border,
      },
      filled: {
        backgroundColor: colors.interactive.backgroundSecondary,
        borderWidth: 0,
      },
    };
    
    // Layout styles
    const layoutStyle: ViewStyle = {
      width: fullWidth ? '100%' : undefined,
      alignSelf: centered ? 'center' : undefined,
      padding: getPadding(),
      margin: getMargin(),
      borderRadius: getBorderRadius(),
    };
    
    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...layoutStyle,
    };
  }, [
    variant,
    size,
    fullWidth,
    centered,
    padding,
    margin,
    borderRadius,
    glassOpacity,
    glassBlur,
    colors,
    spacing,
    radius,
    shadows,
  ]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - REVOLUTIONARY FEEDBACK
  // ========================================================================================
  
  const handlePressIn = useCallback(() => {
    if (!isInteractive) return;
    
    // Haptic feedback with proper error handling
    if (hapticFeedback && Platform.OS !== 'web') {
      try {
        const { Vibration } = require('react-native');
        Vibration.vibrate(30);
      } catch (error) {
        console.warn('Card haptic feedback error:', error);
      }
    }
    
    // Press effect animations
    const animationConfig = {
      duration: animations.duration.fast,
      useNativeDriver: pressEffect !== 'lift',
    };
    
    switch (pressEffect) {
      case 'scale':
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          ...animationConfig,
        }).start();
        break;
        
      case 'opacity':
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          ...animationConfig,
        }).start();
        break;
        
      case 'lift':
        Animated.timing(liftAnim, {
          toValue: 1,
          duration: animations.duration.fast,
          useNativeDriver: false,
        }).start();
        break;
        
      default:
        break;
    }
  }, [isInteractive, hapticFeedback, pressEffect, animations, scaleAnim, opacityAnim, liftAnim]);
  
  const handlePressOut = useCallback(() => {
    if (!isInteractive) return;
    
    // Return to normal state with spring animation
    const springConfig = {
      tension: 400,
      friction: 12,
      useNativeDriver: pressEffect !== 'lift',
    };
    
    switch (pressEffect) {
      case 'scale':
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...springConfig,
        }).start();
        break;
        
      case 'opacity':
        Animated.spring(opacityAnim, {
          toValue: 1,
          ...springConfig,
        }).start();
        break;
        
      case 'lift':
        Animated.spring(liftAnim, {
          toValue: 0,
          tension: 400,
          friction: 12,
          useNativeDriver: false,
        }).start();
        break;
        
      default:
        break;
    }
  }, [isInteractive, pressEffect, scaleAnim, opacityAnim, liftAnim]);
  
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (!isInteractive || !onPress) return;
    onPress(event);
  }, [isInteractive, onPress]);
  
  const handleLongPress = useCallback((event: GestureResponderEvent) => {
    if (!isInteractive || !onLongPress) return;
    onLongPress(event);
  }, [isInteractive, onLongPress]);
  
  // ENTRANCE ANIMATION - AGENT IDENTITY REVEAL with cleanup
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    if (animatedEntrance) {
      timer = setTimeout(() => {
        Animated.timing(entranceAnim, {
          toValue: 1,
          duration: animations.duration.slow,
          useNativeDriver: true,
        }).start();
      }, entranceDelay);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [animatedEntrance, entranceDelay, animations, entranceAnim]);
  
  // ========================================================================================
  // DYNAMIC STYLES - ANIMATION INTEGRATION
  // ========================================================================================
  
  const animatedStyles = useMemo(() => {
    const baseAnimatedStyle: ViewStyle = {
      opacity: animatedEntrance ? entranceAnim : 1,
    };
    
    // Press effect styles
    switch (pressEffect) {
      case 'scale':
        return {
          ...baseAnimatedStyle,
          transform: [
            { scale: scaleAnim },
            {
              translateY: animatedEntrance ? entranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }) : 0,
            },
          ],
        };
        
      case 'opacity':
        return {
          ...baseAnimatedStyle,
          opacity: animatedEntrance ? 
            Animated.multiply(entranceAnim, opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.8],
            })) :
            opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.8],
            }),
          transform: animatedEntrance ? [{
            translateY: entranceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }] : [],
        };
        
      case 'lift':
        return {
          ...baseAnimatedStyle,
          transform: [
            {
              translateY: animatedEntrance ? 
                Animated.add(
                  entranceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                  liftAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  })
                ) :
                liftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4],
                }),
            },
          ],
          shadowOpacity: variant === 'glass' || variant === 'elevated' ?
            liftAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.5],
            }) : undefined,
          shadowRadius: variant === 'glass' || variant === 'elevated' ?
            liftAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 20],
            }) : undefined,
        };
        
      default:
        return {
          ...baseAnimatedStyle,
          transform: animatedEntrance ? [{
            translateY: entranceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }] : [],
        };
    }
  }, [
    pressEffect,
    animatedEntrance,
    variant,
    scaleAnim,
    opacityAnim,
    liftAnim,
    entranceAnim,
  ]);
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  const CardComponent = isInteractive ? TouchableOpacity : View;
  
  return (
    <Animated.View style={[cardStyles, animatedStyles, style]}>
      <CardComponent
        onPress={isInteractive ? handlePress : undefined}
        onLongPress={isInteractive ? handleLongPress : undefined}
        onPressIn={isInteractive ? handlePressIn : undefined}
        onPressOut={isInteractive ? handlePressOut : undefined}
        disabled={disabled}
        activeOpacity={isInteractive ? 1 : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole || (isInteractive ? 'button' : 'none')}
        accessibilityState={{
          disabled,
        }}
        testID={testID}
        style={[{ flex: 1 }, contentStyle]}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const GlassCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="glass" />
);

export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="outlined" />
);

export const FilledCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="filled" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Card;
