// src/components/ui/FieldError.tsx
// IRANVERSE FieldError - Grok iOS Revolution
// Minimal Validation Feedback with Essential Features
// Optimized for 90M users

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// ========================================================================================
// TYPES - SIMPLIFIED & FOCUSED
// ========================================================================================

export type FieldErrorVariant = 'error' | 'warning' | 'info' | 'critical';
export type FieldErrorSize = 'small' | 'medium' | 'large';

export interface FieldErrorProps {
  // Core
  visible?: boolean;
  message?: string;
  variant?: FieldErrorVariant;
  size?: FieldErrorSize;
  
  // Features
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDuration?: number;
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
  
  // Callbacks
  onDismiss?: () => void;
  onShow?: () => void;
  onHide?: () => void;
}

export interface FieldErrorRef {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

// ========================================================================================
// FIELD ERROR COMPONENT - GROK IOS MINIMALISM
// ========================================================================================

export const FieldError = forwardRef<FieldErrorRef, FieldErrorProps>((props, ref) => {
  const {
    visible = false,
    message = '',
    variant = 'error',
    size = 'medium',
    dismissible = false,
    autoHide = false,
    autoHideDuration = 5000,
    style,
    textStyle,
    accessibilityLabel,
    testID = 'field-error',
    onDismiss,
    onShow,
    onHide,
  } = props;
  
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState<boolean>(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const autoHideTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Sync with prop
  useEffect(() => {
    if (visible !== isVisible) {
      if (visible) {
        showError();
      } else {
        hideError();
      }
    }
  }, [visible]);
  
  // Auto-hide timer
  useEffect(() => {
    if (isVisible && autoHide && autoHideDuration > 0) {
      autoHideTimer.current = setTimeout(() => {
        hideError();
      }, autoHideDuration);
    }
    
    return () => {
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
      }
    };
  }, [isVisible, autoHide, autoHideDuration]);
  
  // Animation methods
  const showError = useCallback(() => {
    setIsVisible(true);
    onShow?.();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, onShow]);
  
  const hideError = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onHide?.();
    });
  }, [fadeAnim, slideAnim, onHide]);
  
  const handleDismiss = useCallback(() => {
    onDismiss?.();
    hideError();
  }, [onDismiss, hideError]);
  
  // Imperative API
  useImperativeHandle(ref, () => ({
    show: showError,
    hide: hideError,
    toggle: () => {
      if (isVisible) {
        hideError();
      } else {
        showError();
      }
    },
  }), [isVisible, showError, hideError]);
  
  // Styles
  const containerStyles = useCallback((): ViewStyle => {
    const variantStyles = {
      error: {
        backgroundColor: theme.colors.glass.subtle,
        borderColor: theme.colors.accent.critical,
      },
      warning: {
        backgroundColor: theme.colors.glass.subtle,
        borderColor: theme.colors.accent.warning,
      },
      info: {
        backgroundColor: theme.colors.glass.subtle,
        borderColor: theme.colors.accent.primary,
      },
      critical: {
        backgroundColor: theme.colors.glass.subtle,
        borderColor: theme.colors.accent.critical,
      },
    };
    
    const sizeStyles = {
      small: { padding: theme.spacing.xs },
      medium: { padding: theme.spacing.sm },
      large: { padding: theme.spacing.md },
    };
    
    return {
      borderRadius: theme.radius.standard,
      borderWidth: 1,
      marginTop: theme.spacing.xs,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  }, [theme, variant, size]);
  
  const textStyles = useCallback((): TextStyle => {
    const variantTextStyles = {
      error: { color: theme.colors.accent.critical },
      warning: { color: theme.colors.accent.warning },
      info: { color: theme.colors.accent.primary },
      critical: { color: theme.colors.accent.critical },
    };
    
    const sizeTextStyles = {
      small: { fontSize: 12 },
      medium: { fontSize: 14 },
      large: { fontSize: 16 },
    };
    
    return {
      ...theme.typography.scale.caption,
      ...variantTextStyles[variant],
      ...sizeTextStyles[size],
    };
  }, [theme, variant, size]);
  
  if (!isVisible || !message) {
    return null;
  }
  
  return (
    <Animated.View
      style={[
        containerStyles(),
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel || message}
      accessibilityRole="alert"
      testID={testID}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[textStyles(), textStyle, { flex: 1 }]}>
          {message}
        </Text>
        
        {dismissible && (
          <TouchableOpacity
            onPress={handleDismiss}
            style={{
              marginLeft: theme.spacing.sm,
              padding: theme.spacing.xs,
            }}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <Text style={{
              color: theme.colors.interactive.text.secondary,
              fontSize: 16,
              fontWeight: '500',
            }}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
});

FieldError.displayName = 'FieldError';

export default FieldError;