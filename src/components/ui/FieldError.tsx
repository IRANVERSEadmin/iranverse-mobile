// src/components/ui/FieldError.tsx
// IRANVERSE Enterprise FieldError - Revolutionary Validation Feedback
// Tesla-inspired error communication with Agent Identity Guidance
// Built for 90M users - Precision Error Handling & Accessibility
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme, useColors, useTypography, useSpacing, useRadius, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// FIELD ERROR VARIANTS & TYPES - ENTERPRISE VALIDATION SYSTEM
// ========================================================================================

export type FieldErrorVariant = 
  | 'error'        // Standard validation error
  | 'warning'      // Warning message  
  | 'critical'     // Critical system error (vibrant orange)
  | 'info'         // Informational guidance
  | 'success';     // Validation success feedback

export type FieldErrorSize = 'small' | 'medium' | 'large';

export type FieldErrorAnimation = 'slide' | 'fade' | 'shake' | 'bounce';

export interface FieldErrorProps {
  // Core Props
  visible?: boolean;
  message?: string;
  
  // Design Variants
  variant?: FieldErrorVariant;
  size?: FieldErrorSize;
  
  // Animation
  animation?: FieldErrorAnimation;
  animationDuration?: number;
  autoHide?: boolean;
  autoHideDuration?: number;
  
  // Icon & Actions
  icon?: React.ReactNode;
  showIcon?: boolean;
  action?: {
    text: string;
    onPress: () => void;
  };
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  
  // Advanced Features
  multiline?: boolean;
  maxLines?: number;
  hapticFeedback?: boolean;
  
  // Callbacks
  onShow?: () => void;
  onHide?: () => void;
  onPress?: () => void;
}

// ========================================================================================
// FIELD ERROR IMPLEMENTATION - REVOLUTIONARY VALIDATION UX
// ========================================================================================

export const FieldError: React.FC<FieldErrorProps> = ({
  visible = false,
  message = '',
  variant = 'error',
  size = 'medium',
  animation = 'slide',
  animationDuration = 300,
  autoHide = false,
  autoHideDuration = 5000,
  icon,
  showIcon = true,
  action,
  style,
  textStyle,
  containerStyle,
  accessibilityLabel,
  testID,
  rtl = false,
  persianText = false,
  multiline = true,
  maxLines = 3,
  hapticFeedback = true,
  onShow,
  onHide,
  onPress,
}) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const radius = useRadius();
  const animations = useAnimations();
  
  // Animation Values with cleanup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;
  
  // Auto-hide timer with proper cleanup
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cleanup animations and timers
  useEffect(() => {
    return () => {
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
      
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      scaleAnim.stopAnimation();
      shakeAnim.stopAnimation();
      heightAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      scaleAnim.removeAllListeners();
      shakeAnim.removeAllListeners();
      heightAnim.removeAllListeners();
    };
  }, [fadeAnim, slideAnim, scaleAnim, shakeAnim, heightAnim]);
  
  // ========================================================================================
  // VARIANT CONFIGURATION - ENTERPRISE ERROR TAXONOMY
  // ========================================================================================
  
  const variantConfig = useMemo(() => {
    const configs = {
      error: {
        color: colors.semantic.error,
        backgroundColor: `${colors.semantic.error}15`, // 15% opacity
        borderColor: `${colors.semantic.error}30`,
        icon: '!',
        intensity: 'high',
      },
      warning: {
        color: colors.semantic.warning,
        backgroundColor: `${colors.semantic.warning}15`,
        borderColor: `${colors.semantic.warning}30`,
        icon: '⚠',
        intensity: 'medium',
      },
      critical: {
        color: colors.semantic.critical,
        backgroundColor: `${colors.semantic.critical}15`,
        borderColor: `${colors.semantic.critical}30`,
        icon: '✕',
        intensity: 'critical',
      },
      info: {
        color: colors.interactive.text,
        backgroundColor: `${colors.interactive.text}10`,
        borderColor: `${colors.interactive.text}20`,
        icon: 'ⓘ',
        intensity: 'low',
      },
      success: {
        color: colors.semantic.success,
        backgroundColor: `${colors.semantic.success}15`,
        borderColor: `${colors.semantic.success}30`,
        icon: '✓',
        intensity: 'low',
      },
    };
    
    return configs[variant];
  }, [variant, colors]);
  
  // ========================================================================================
  // STYLE COMPUTATION - SIZE & VARIANT RESPONSIVE
  // ========================================================================================
  
  const sizeConfig = useMemo(() => {
    const configs = {
      small: {
        fontSize: typography.scale.caption.fontSize || 12,
        lineHeight: typography.scale.caption.lineHeight || 16,
        padding: spacing.xs,
        iconSize: 12,
      },
      medium: {
        fontSize: typography.scale.bodySmall.fontSize || 14,
        lineHeight: typography.scale.bodySmall.lineHeight || 20,
        padding: spacing.sm,
        iconSize: 16,
      },
      large: {
        fontSize: typography.scale.body.fontSize || 16,
        lineHeight: typography.scale.body.lineHeight || 24,
        padding: spacing.md,
        iconSize: 20,
      },
    };
    
    return configs[size];
  }, [size, typography, spacing]);
  
  const containerStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: variantConfig.backgroundColor,
      borderLeftWidth: rtl ? 0 : 3,
      borderRightWidth: rtl ? 3 : 0,
      borderLeftColor: rtl ? 'transparent' : variantConfig.borderColor,
      borderRightColor: rtl ? variantConfig.borderColor : 'transparent',
      borderRadius: radius.sm,
      padding: sizeConfig.padding,
      marginTop: spacing.xs,
      overflow: 'hidden',
    };
    
    return baseStyle;
  }, [rtl, multiline, variantConfig, radius, sizeConfig, spacing]);
  
  const textStyles = useMemo(() => {
    const baseStyle: TextStyle = {
      fontSize: sizeConfig.fontSize,
      lineHeight: sizeConfig.lineHeight,
      fontFamily: persianText ? typography.families.persian : typography.families.primary,
      color: variantConfig.color,
      textAlign: rtl ? 'right' : 'left',
      flex: 1,
      ...(rtl ? typography.rtl.persian : {}),
    };
    
    return baseStyle;
  }, [sizeConfig, persianText, variantConfig, rtl, typography]);
  
  // ========================================================================================
  // ANIMATION SYSTEM - TESLA-INSPIRED FEEDBACK
  // ========================================================================================
  
  const showAnimation = useCallback(() => {
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(-20);
    scaleAnim.setValue(0.8);
    heightAnim.setValue(0);
    
    const baseAnimations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: false,
      }),
    ];
    
    // Animation type specific
    switch (animation) {
      case 'slide':
        baseAnimations.push(
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 400,
            friction: 12,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'fade':
        // Only fade animation (already included in base)
        break;
        
      case 'shake':
        // Slide in first, then shake
        baseAnimations.push(
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 400,
            friction: 12,
            useNativeDriver: true,
          })
        );
        
        // Shake effect after slide
        setTimeout(() => {
          const shakeSequence = Array.from({ length: 4 }, (_, i) => 
            Animated.timing(shakeAnim, {
              toValue: i % 2 === 0 ? 3 : -3,
              duration: 50,
              useNativeDriver: true,
            })
          );
          
          Animated.sequence([
            ...shakeSequence,
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ]).start();
        }, animationDuration);
        break;
        
      case 'bounce':
        baseAnimations.push(
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 400,
            friction: 8,
            useNativeDriver: true,
          })
        );
        break;
    }
    
    Animated.parallel(baseAnimations).start(() => {
      onShow?.();
    });
    
    // Haptic feedback with proper error handling
    if (hapticFeedback && Platform.OS !== 'web') {
      try {
        const { Vibration } = require('react-native');
        const patterns = {
          error: [0, 100, 50, 100],
          warning: [0, 50],
          critical: [0, 100, 50, 100, 50, 100],
          info: [0, 30],
          success: [0, 50],
        };
        Vibration.vibrate(patterns[variant] || [0, 50]);
      } catch (error) {
        console.warn('FieldError haptic feedback error:', error);
      }
    }
  }, [
    animation,
    animationDuration,
    variant,
    hapticFeedback,
    fadeAnim,
    slideAnim,
    scaleAnim,
    shakeAnim,
    heightAnim,
    onShow,
  ]);
  
  const hideAnimation = useCallback(() => {
    const hideAnimations = [
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: animationDuration * 0.8,
        useNativeDriver: false,
      }),
    ];
    
    // Animation type specific hide
    switch (animation) {
      case 'slide':
        hideAnimations.push(
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: animationDuration * 0.8,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'bounce':
        hideAnimations.push(
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: animationDuration * 0.8,
            useNativeDriver: true,
          })
        );
        break;
    }
    
    Animated.parallel(hideAnimations).start(() => {
      onHide?.();
    });
  }, [animation, animationDuration, fadeAnim, slideAnim, scaleAnim, heightAnim, onHide]);
  
  // ========================================================================================
  // EFFECTS - VISIBILITY & AUTO-HIDE CONTROL
  // ========================================================================================
  
  useEffect(() => {
    if (visible && message) {
      showAnimation();
      
      // Auto-hide timer
      if (autoHide) {
        if (autoHideTimer.current) {
          clearTimeout(autoHideTimer.current);
        }
        
        autoHideTimer.current = setTimeout(() => {
          hideAnimation();
        }, autoHideDuration);
      }
    } else {
      hideAnimation();
    }
    
    return () => {
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
    };
  }, [visible, message, autoHide, autoHideDuration, showAnimation, hideAnimation]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - USER FEEDBACK
  // ========================================================================================
  
  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);
  
  const handleActionPress = useCallback(() => {
    action?.onPress();
  }, [action]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderIcon = () => {
    if (!showIcon) return null;
    
    const iconElement = icon || (
      <Text style={{
        fontSize: sizeConfig.iconSize,
        color: variantConfig.color,
        lineHeight: sizeConfig.iconSize + 2,
      }}>
        {variantConfig.icon}
      </Text>
    );
    
    return (
      <View style={{
        marginRight: rtl ? 0 : spacing.xs,
        marginLeft: rtl ? spacing.xs : 0,
        marginTop: multiline ? 2 : 0,
      }}>
        {iconElement}
      </View>
    );
  };
  
  const renderMessage = () => {
    if (!message) return null;
    
    return (
      <Text
        style={[textStyles, textStyle]}
        numberOfLines={multiline ? maxLines : 1}
        ellipsizeMode="tail"
      >
        {message}
      </Text>
    );
  };
  
  const renderAction = () => {
    if (!action) return null;
    
    return (
      <TouchableOpacity
        onPress={handleActionPress}
        style={{
          marginLeft: rtl ? 0 : spacing.sm,
          marginRight: rtl ? spacing.sm : 0,
          paddingVertical: spacing.xs / 2,
          paddingHorizontal: spacing.xs,
          borderRadius: radius.xs,
          backgroundColor: variantConfig.color,
        }}
        accessibilityRole="button"
        accessibilityLabel={action.text}
      >
        <Text
          style={{
            fontSize: (sizeConfig.fontSize || 14) * 0.9,
            fontWeight: '600',
            color: colors.foundation.white,
            textAlign: 'center',
          }}
        >
          {action.text}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // ========================================================================================
  // DYNAMIC STYLES - ANIMATION INTEGRATION
  // ========================================================================================
  
  const animatedStyles = useMemo(() => {
    const baseAnimatedStyle = {
      opacity: fadeAnim,
      maxHeight: heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200], // Max height for smooth collapse
      }),
    };
    
    const transforms = [];
    
    // Animation type specific transforms
    switch (animation) {
      case 'slide':
        transforms.push({ translateY: slideAnim });
        break;
        
      case 'shake':
        transforms.push(
          { translateY: slideAnim },
          { translateX: shakeAnim }
        );
        break;
        
      case 'bounce':
        transforms.push({ scale: scaleAnim });
        break;
    }
    
    return {
      ...baseAnimatedStyle,
      transform: transforms.length > 0 ? transforms : undefined,
    };
  }, [animation, fadeAnim, slideAnim, scaleAnim, shakeAnim, heightAnim]);
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  if (!visible && (fadeAnim as any)._value === 0) return null;
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Animated.View style={[animatedStyles, style]}>
      <Container
        style={[containerStyles, containerStyle]}
        onPress={onPress ? handlePress : undefined}
        activeOpacity={onPress ? 0.8 : 1}
        accessibilityLabel={accessibilityLabel || `${variant}: ${message}`}
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityState={{
          expanded: visible,
        }}
        testID={testID}
      >
        {renderIcon()}
        {renderMessage()}
        {renderAction()}
      </Container>
    </Animated.View>
  );
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const ErrorMessage: React.FC<Omit<FieldErrorProps, 'variant'>> = (props) => (
  <FieldError {...props} variant="error" />
);

export const WarningMessage: React.FC<Omit<FieldErrorProps, 'variant'>> = (props) => (
  <FieldError {...props} variant="warning" />
);

export const CriticalMessage: React.FC<Omit<FieldErrorProps, 'variant'>> = (props) => (
  <FieldError {...props} variant="critical" />
);

export const InfoMessage: React.FC<Omit<FieldErrorProps, 'variant'>> = (props) => (
  <FieldError {...props} variant="info" />
);

export const SuccessMessage: React.FC<Omit<FieldErrorProps, 'variant'>> = (props) => (
  <FieldError {...props} variant="success" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default FieldError;