// src/components/ui/Button.tsx
// IRANVERSE Enterprise Button - Revolutionary Confidence
// Tesla-inspired interactions with Agent Identity Empowerment
// Built for 90M users - Enterprise Performance & Accessibility
import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  ActivityIndicator,
  Platform,
  AccessibilityInfo,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme, useColors, useTypography, useSpacing, useRadius, useShadows, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// BUTTON VARIANTS & TYPES - ENTERPRISE DESIGN SYSTEM
// ========================================================================================

export type ButtonVariant = 
  | 'primary'      // White button - Main actions
  | 'secondary'    // Gray button - Secondary actions  
  | 'ghost'        // Transparent - Subtle actions
  | 'critical';    // Orange button - Critical actions (logout, delete)

export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonIconPosition = 'left' | 'right';

export interface ButtonProps {
  // Core Props
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  
  // Design Variants
  variant?: ButtonVariant;
  size?: ButtonSize;
  
  // States
  disabled?: boolean;
  loading?: boolean;
  
  // Icon Support
  icon?: React.ReactNode;
  iconPosition?: ButtonIconPosition;
  iconOnly?: boolean;
  
  // Styling
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link';
  testID?: string;
  
  // Advanced Features
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
  pressScale?: number;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
}

// ========================================================================================
// BUTTON IMPLEMENTATION - REVOLUTIONARY DESIGN
// ========================================================================================

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  onLongPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  hapticFeedback = true,
  rippleEffect = true,
  pressScale,
  rtl = false,
  persianText = false,
}) => {
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const radius = useRadius();
  const shadows = useShadows();
  const animations = useAnimations();
  
  // Animation Values with proper cleanup
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  
  // Cleanup effect for animations
  useEffect(() => {
    return () => {
      scaleAnim.stopAnimation();
      opacityAnim.stopAnimation();
      rippleAnim.stopAnimation();
      scaleAnim.removeAllListeners();
      opacityAnim.removeAllListeners();
      rippleAnim.removeAllListeners();
    };
  }, [scaleAnim, opacityAnim, rippleAnim]);
  
  // Determine button state
  const isDisabled = disabled || loading;
  const isInteractive = !isDisabled;
  
  // ========================================================================================
  // STYLE COMPUTATION - VARIANT-BASED DESIGN
  // ========================================================================================
  
  const buttonStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      borderRadius: radius.button,
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    };
    
    // Size-based styles
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        height: spacing.button.height.small,
        paddingHorizontal: spacing.button.paddingHorizontal * 0.75,
        paddingVertical: spacing.button.paddingVertical * 0.75,
      },
      medium: {
        height: spacing.button.height.medium,
        paddingHorizontal: spacing.button.paddingHorizontal,
        paddingVertical: spacing.button.paddingVertical,
      },
      large: {
        height: spacing.button.height.large,
        paddingHorizontal: spacing.button.paddingHorizontal * 1.25,
        paddingVertical: spacing.button.paddingVertical * 1.25,
      },
    };
    
    // Variant-based styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: isDisabled ? colors.interactive.primaryDisabled : colors.interactive.primary,
        borderWidth: 1,
        borderColor: isDisabled ? colors.interactive.primaryDisabled : colors.interactive.primary,
        ...shadows.button,
      },
      secondary: {
        backgroundColor: isDisabled ? colors.interactive.primaryDisabled : colors.interactive.secondary,
        borderWidth: 1,
        borderColor: isDisabled ? colors.interactive.primaryDisabled : colors.interactive.border,
        ...shadows.button,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isDisabled ? colors.interactive.primaryDisabled : colors.interactive.border,
      },
      critical: {
        backgroundColor: isDisabled ? colors.interactive.primaryDisabled : colors.semantic.critical,
        borderWidth: 1,
        borderColor: isDisabled ? colors.interactive.primaryDisabled : colors.semantic.critical,
        ...shadows.button,
      },
    };
    
    // Full width style
    const fullWidthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};
    
    // Icon-only style
    const iconOnlyStyle: ViewStyle = iconOnly ? {
      width: sizeStyles[size].height,
      paddingHorizontal: 0,
    } : {};
    
    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...fullWidthStyle,
      ...iconOnlyStyle,
    };
  }, [variant, size, isDisabled, fullWidth, iconOnly, rtl, colors, spacing, radius, shadows]);
  
  const textStyles = useMemo(() => {
    const baseTextStyle: TextStyle = {
      ...typography.scale.button,
      fontFamily: persianText ? typography.families.persian : typography.families.primary,
      textAlign: rtl ? 'right' : 'left',
    };
    
    // Size-based text styles
    const sizeTextStyles: Record<ButtonSize, TextStyle> = {
      small: {
        fontSize: typography.scale.bodySmall.fontSize,
        lineHeight: typography.scale.bodySmall.lineHeight,
      },
      medium: {
        fontSize: typography.scale.button.fontSize,
        lineHeight: typography.scale.button.lineHeight,
      },
      large: {
        fontSize: typography.scale.h3.fontSize,
        lineHeight: typography.scale.h3.lineHeight,
      },
    };
    
    // Variant-based text colors
    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: isDisabled ? colors.interactive.textDisabled : colors.interactive.background,
      },
      secondary: {
        color: isDisabled ? colors.interactive.textDisabled : colors.interactive.text,
      },
      ghost: {
        color: isDisabled ? colors.interactive.textDisabled : colors.interactive.text,
      },
      critical: {
        color: isDisabled ? colors.interactive.textDisabled : colors.foundation.white,
      },
    };
    
    // RTL text styles
    const rtlTextStyle: TextStyle = rtl ? {
      ...typography.rtl.persian,
    } : {};
    
    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...rtlTextStyle,
    };
  }, [variant, size, isDisabled, rtl, persianText, colors, typography]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - REVOLUTIONARY FEEDBACK
  // ========================================================================================
  
  // Enhanced error handling with logging and fallbacks
  const withErrorHandling = useCallback((fn: () => void, fallback?: () => void) => {
    try {
      fn();
    } catch (error) {
      console.warn('IRANVERSE Button Error:', error);
      fallback?.();
    }
  }, []);
  
  const handlePressIn = useCallback(() => {
    if (!isInteractive) return;
    
    // Haptic feedback with proper error handling
    if (hapticFeedback && Platform.OS !== 'web') {
      withErrorHandling(() => {
        const { Vibration } = require('react-native');
        Vibration.vibrate(50);
      });
    }
    
    // Scale animation - Tesla-inspired confidence
    const targetScale = pressScale || animations.button.scale;
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: animations.button.duration,
        useNativeDriver: true,
      }),
      rippleEffect ? Animated.timing(rippleAnim, {
        toValue: 1,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }) : Animated.timing(new Animated.Value(0), { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
  }, [isInteractive, hapticFeedback, pressScale, rippleEffect, animations, scaleAnim, rippleAnim, withErrorHandling]);
  
  const handlePressOut = useCallback(() => {
    if (!isInteractive) return;
    
    // Return to normal state
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 400,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: animations.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isInteractive, animations, scaleAnim, rippleAnim]);
  
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (!isInteractive || !onPress) return;
    
    // Announce to screen readers
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(
        accessibilityLabel || 'Button pressed'
      );
    }
    
    onPress(event);
  }, [isInteractive, onPress, accessibilityLabel]);
  
  // ========================================================================================
  // CONTENT RENDERING - AGENT IDENTITY EMPOWERMENT
  // ========================================================================================
  
  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
          <ActivityIndicator 
            size={size === 'small' ? 'small' : 'small'} 
            color={textStyles.color}
            style={{ marginRight: rtl ? 0 : spacing.sm, marginLeft: rtl ? spacing.sm : 0 }}
          />
          {!iconOnly && (
            <Text style={[textStyles, textStyle]} numberOfLines={1}>
              {children}
            </Text>
          )}
        </View>
      );
    }
    
    if (iconOnly && icon) {
      return (
        <View style={{ width: size === 'small' ? 16 : size === 'large' ? 24 : 20, height: size === 'small' ? 16 : size === 'large' ? 24 : 20 }}>
          {icon}
        </View>
      );
    }
    
    if (icon) {
      const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
      
      return (
        <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
          {iconPosition === 'left' && (
            <View style={{ width: iconSize, height: iconSize }}>
              {icon}
            </View>
          )}
          <Text 
            style={[
              textStyles, 
              textStyle,
              {
                marginLeft: iconPosition === 'left' && !rtl ? spacing.sm : iconPosition === 'right' && rtl ? spacing.sm : 0,
                marginRight: iconPosition === 'right' && !rtl ? spacing.sm : iconPosition === 'left' && rtl ? spacing.sm : 0,
              }
            ]} 
            numberOfLines={1}
          >
            {children}
          </Text>
          {iconPosition === 'right' && (
            <View style={{ width: iconSize, height: iconSize }}>
              {icon}
            </View>
          )}
        </View>
      );
    }
    
    return (
      <Text style={[textStyles, textStyle]} numberOfLines={1}>
        {children}
      </Text>
    );
  };
  
  const renderRippleEffect = () => {
    if (!rippleEffect || !isInteractive) return null;
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.interactive.surfaceHover,
          opacity: rippleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.2],
          }),
          borderRadius: radius.button,
        }}
        pointerEvents="none"
      />
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      testID={testID}
      style={[
        { 
          transform: [{ scale: scaleAnim }],
          opacity: isDisabled ? 0.6 : 1,
        }
      ]}
    >
      <View style={[buttonStyles, style]}>
        {renderRippleEffect()}
        {renderContent()}
      </View>
    </TouchableOpacity>
  );
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="ghost" />
);

export const CriticalButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="critical" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Button;