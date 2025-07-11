import { TouchableOpacity } from 'react-native';
// src/components/ui/Toast.tsx
// IRANVERSE Enterprise Toast - Revolutionary Notification System
// Tesla-inspired feedback with Agent Identity Communication
// Built for 90M users - Performance Optimized & Accessible
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useTheme, useColors, useTypography, useSpacing, useRadius, useShadows, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// TOAST VARIANTS & TYPES - ENTERPRISE NOTIFICATION SYSTEM
// ========================================================================================

export type ToastVariant = 
  | 'success'      // Success feedback - Agent achievement
  | 'error'        // Error feedback - System issues
  | 'warning'      // Warning feedback - User attention
  | 'info'         // Information - System updates
  | 'critical';    // Critical - Urgent user action (vibrant orange)

export type ToastPosition = 'top' | 'bottom' | 'center';

export type ToastDuration = 'short' | 'long' | 'persistent';

export interface ToastAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'primary' | 'critical';
}

export interface ToastProps {
  // Core Props
  visible: boolean;
  onHide?: () => void;
  
  // Content
  title?: string;
  message: string;
  
  // Design Variants
  variant?: ToastVariant;
  position?: ToastPosition;
  duration?: ToastDuration;
  
  // Actions
  action?: ToastAction;
  dismissible?: boolean;
  
  // Icons
  icon?: React.ReactNode;
  showIcon?: boolean;
  
  // Styling
  style?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  
  // Animation
  animationType?: 'slide' | 'fade' | 'scale';
  animationDuration?: number;
  
  // Interaction
  swipeToClose?: boolean;
  tapToClose?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  
  // Advanced Features
  hapticFeedback?: boolean;
  blurBackground?: boolean;
}

// ========================================================================================
// TOAST MANAGER - GLOBAL STATE MANAGEMENT (Thread-safe)
// ========================================================================================

interface ToastState extends ToastProps {
  id: string;
  timestamp: number;
}

class ToastManager {
  private static instance: ToastManager;
  private toasts: ToastState[] = [];
  private listeners: ((toasts: readonly ToastState[]) => void)[] = [];
  private autoHideTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private isUpdating = false; // Prevent race conditions
  
  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }
  
  show = (props: Omit<ToastProps, 'visible'> & { id?: string }): string => {
    const id = props.id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prevent race conditions with mutex-like behavior
    if (this.isUpdating) {
      setTimeout(() => this.show(props), 10);
      return id;
    }
    
    this.isUpdating = true;
    
    try {
      const toast: ToastState = {
        ...props,
        id,
        visible: true,
        timestamp: Date.now(),
      };
      
      this.toasts = [...this.toasts, toast]; // Immutable update
      this.notifyListeners();
      
      // Auto-hide timer
      if (props.duration !== 'persistent') {
        const timeout = props.duration === 'long' ? 5000 : 3000;
        const timer = setTimeout(() => {
          this.hide(id);
        }, timeout);
        this.autoHideTimers.set(id, timer);
      }
    } finally {
      this.isUpdating = false;
    }
    
    return id;
  };
  
  hide = (id: string): void => {
    if (this.isUpdating) {
      setTimeout(() => this.hide(id), 10);
      return;
    }
    
    this.isUpdating = true;
    
    try {
      this.toasts = this.toasts.map(toast => 
        toast.id === id ? { ...toast, visible: false } : toast
      );
      this.notifyListeners();
      
      // Clear auto-hide timer
      const timer = this.autoHideTimers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.autoHideTimers.delete(id);
      }
      
      // Remove from array after animation
      setTimeout(() => {
        if (!this.isUpdating) {
          this.isUpdating = true;
          try {
            this.toasts = this.toasts.filter(toast => toast.id !== id);
            this.notifyListeners();
          } finally {
            this.isUpdating = false;
          }
        }
      }, 300);
    } finally {
      this.isUpdating = false;
    }
  };
  
  hideAll = (): void => {
    if (this.isUpdating) {
      setTimeout(() => this.hideAll(), 10);
      return;
    }
    
    const toastIds = [...this.toasts.map(toast => toast.id)]; // Copy IDs
    toastIds.forEach(id => this.hide(id));
  };
  
  subscribe = (listener: (toasts: readonly ToastState[]) => void): (() => void) => {
    this.listeners = [...this.listeners, listener]; // Immutable update
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  };
  
  private notifyListeners = (): void => {
    // Use readonly array for type safety
    const readonlyToasts: readonly ToastState[] = Object.freeze([...this.toasts]);
    this.listeners.forEach(listener => {
      try {
        listener(readonlyToasts);
      } catch (error) {
        console.warn('Toast listener error:', error);
      }
    });
  };
  
  // Cleanup method for proper disposal
  destroy = (): void => {
    this.autoHideTimers.forEach(timer => clearTimeout(timer));
    this.autoHideTimers.clear();
    this.listeners = [];
    this.toasts = [];
    this.isUpdating = false;
  };
}

// ========================================================================================
// TOAST IMPLEMENTATION - REVOLUTIONARY FEEDBACK
// ========================================================================================

export const Toast: React.FC<ToastProps> = ({
  visible,
  onHide,
  title,
  message,
  variant = 'info',
  position = 'top',
  duration = 'short',
  action,
  dismissible = true,
  icon,
  showIcon = true,
  style,
  titleStyle,
  messageStyle,
  animationType = 'slide',
  animationDuration = 300,
  swipeToClose = true,
  tapToClose = false,
  accessibilityLabel,
  testID,
  rtl = false,
  persianText = false,
  hapticFeedback = true,
  blurBackground = false,
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  
  // State for safe animation value tracking
  const [isAnimationActive, setIsAnimationActive] = React.useState(false);
  
  // Cleanup animations
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      scaleAnim.stopAnimation();
      swipeAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      scaleAnim.removeAllListeners();
      swipeAnim.removeAllListeners();
    };
  }, [fadeAnim, slideAnim, scaleAnim, swipeAnim]);
  
  // Screen Dimensions
  const { width: screenWidth } = Dimensions.get('window');
  
  // ========================================================================================
  // STYLE COMPUTATION - VARIANT-BASED DESIGN
  // ========================================================================================
  
  const variantConfig = useMemo(() => {
    const configs = {
      success: {
        backgroundColor: colors.semantic.success,
        borderColor: colors.semantic.success,
        textColor: colors.foundation.white,
        icon: '✅',
      },
      error: {
        backgroundColor: colors.semantic.error,
        borderColor: colors.semantic.error,
        textColor: colors.foundation.white,
        icon: '❌',
      },
      warning: {
        backgroundColor: colors.semantic.warning,
        borderColor: colors.semantic.warning,
        textColor: colors.foundation.black,
        icon: '⚠️',
      },
      info: {
        backgroundColor: colors.interactive.surface,
        borderColor: colors.interactive.border,
        textColor: colors.interactive.text,
        icon: 'ℹ️',
      },
      critical: {
        backgroundColor: colors.semantic.critical,
        borderColor: colors.semantic.critical,
        textColor: colors.foundation.white,
        icon: '🚨',
      },
    };
    
    return configs[variant];
  }, [variant, colors]);
  
  const containerStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      zIndex: 10000,
      borderRadius: radius.lg,
      backgroundColor: variantConfig.backgroundColor,
      borderWidth: 1,
      borderColor: variantConfig.borderColor,
      padding: spacing.lg,
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      ...shadows.strong,
      // Glass effect for blur background
      ...(blurBackground && Platform.select({
        ios: { backdropFilter: 'blur(20px)' },
        web: { backdropFilter: 'blur(20px)' },
      })),
    };
    
    // Position-specific styles
    const positionStyles: Record<ToastPosition, ViewStyle> = {
      top: {
        top: Platform.select({
          ios: 60,
          android: 80,
          default: 60,
        }),
      },
      bottom: {
        bottom: Platform.select({
          ios: 100,
          android: 80,
          default: 80,
        }),
      },
      center: {
        top: '50%',
        transform: [{ translateY: -50 }],
      },
    };
    
    return {
      ...baseStyle,
      ...positionStyles[position],
    };
  }, [position, variantConfig, spacing, radius, shadows, rtl, blurBackground]);
  
  // ========================================================================================
  // GESTURE HANDLING - SWIPE TO DISMISS
  // ========================================================================================
  
  const panResponder = useMemo(() => {
    if (!swipeToClose) return null;
    
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 100;
      },
      
      onPanResponderMove: (_, gestureState) => {
        swipeAnim.setValue(gestureState.dx);
      },
      
      onPanResponderRelease: (_, gestureState) => {
        const shouldDismiss = Math.abs(gestureState.dx) > screenWidth * 0.3;
        
        if (shouldDismiss) {
          // Animate out and dismiss
          Animated.timing(swipeAnim, {
            toValue: gestureState.dx > 0 ? screenWidth : -screenWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleHide();
          });
        } else {
          // Snap back
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  }, [swipeToClose, screenWidth, swipeAnim]);
  
  // ========================================================================================
  // ANIMATION SYSTEM - ENTERPRISE SMOOTHNESS
  // ========================================================================================
  
  const showToast = useCallback(() => {
    setIsAnimationActive(true);
    const animations: Animated.CompositeAnimation[] = [];
    
    // Fade animation
    animations.push(
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      })
    );
    
    // Animation type specific
    switch (animationType) {
      case 'slide':
        const slideDistance = position === 'top' ? -100 : position === 'bottom' ? 100 : 0;
        slideAnim.setValue(slideDistance);
        animations.push(
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'scale':
        animations.push(
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'fade':
      default:
        // Only fade animation
        break;
    }
    
    Animated.parallel(animations).start();
    
    // Haptic feedback with proper error handling
    if (hapticFeedback && Platform.OS !== 'web') {
      try {
        const { Vibration } = require('react-native');
        const pattern = variant === 'error' || variant === 'critical' ? [0, 100, 50, 100] : [0, 50];
        Vibration.vibrate(pattern);
      } catch (error) {
        console.warn('Toast haptic feedback error:', error);
      }
    }
  }, [
    animationType,
    animationDuration,
    position,
    variant,
    hapticFeedback,
    fadeAnim,
    slideAnim,
    scaleAnim,
  ]);
  
  const hideToast = useCallback(() => {
    const animations: Animated.CompositeAnimation[] = [];
    
    // Fade out
    animations.push(
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      })
    );
    
    // Animation type specific
    switch (animationType) {
      case 'slide':
        const slideDistance = position === 'top' ? -100 : position === 'bottom' ? 100 : 0;
        animations.push(
          Animated.timing(slideAnim, {
            toValue: slideDistance,
            duration: animationDuration,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'scale':
        animations.push(
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: animationDuration,
            useNativeDriver: true,
          })
        );
        break;
    }
    
    Animated.parallel(animations).start(() => {
      setIsAnimationActive(false);
      onHide?.();
    });
  }, [animationType, animationDuration, position, fadeAnim, slideAnim, scaleAnim, onHide]);
  
  const handleHide = useCallback(() => {
    if (dismissible) {
      hideToast();
    }
  }, [dismissible, hideToast]);
  
  const handlePress = useCallback(() => {
    if (tapToClose) {
      handleHide();
    }
  }, [tapToClose, handleHide]);
  
  // ========================================================================================
  // EFFECTS - VISIBILITY CONTROL
  // ========================================================================================
  
  useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast();
    }
  }, [visible, showToast, hideToast]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderIcon = () => {
    if (!showIcon) return null;
    
    const iconElement = icon || (
      <Text style={{
        fontSize: 20,
        color: variantConfig.textColor,
      }}>
        {variantConfig.icon}
      </Text>
    );
    
    return (
      <View style={{
        marginRight: rtl ? 0 : spacing.md,
        marginLeft: rtl ? spacing.md : 0,
        marginTop: 2,
      }}>
        {iconElement}
      </View>
    );
  };
  
  const renderContent = () => (
    <View style={{ flex: 1 }}>
      {title && (
        <Text
          style={[
            {
              ...typography.scale.button,
              fontFamily: persianText ? typography.families.persian : typography.families.primary,
              color: variantConfig.textColor,
              fontWeight: '600',
              marginBottom: spacing.xs,
              textAlign: rtl ? 'right' : 'left',
            },
            titleStyle,
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
      )}
      <Text
        style={[
          {
            ...typography.scale.body,
            fontFamily: persianText ? typography.families.persian : typography.families.primary,
            color: variantConfig.textColor,
            opacity: title ? 0.9 : 1,
            textAlign: rtl ? 'right' : 'left',
            lineHeight: (typography.scale.body.lineHeight || 24) * 1.2,
          },
          messageStyle,
        ]}
        numberOfLines={4}
      >
        {message}
      </Text>
    </View>
  );
  
  const renderAction = () => {
    if (!action) return null;
    
    return (
      <TouchableOpacity
        onPress={action.onPress}
        style={{
          marginLeft: rtl ? 0 : spacing.md,
          marginRight: rtl ? spacing.md : 0,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          borderRadius: radius.sm,
          backgroundColor: action.style === 'primary' ? colors.foundation.white :
                           action.style === 'critical' ? colors.semantic.critical :
                           'rgba(255, 255, 255, 0.2)',
        }}
        accessibilityRole="button"
        accessibilityLabel={action.text}
      >
        <Text
          style={{
            ...typography.scale.button,
            color: action.style === 'primary' ? variantConfig.backgroundColor :
                   action.style === 'critical' ? colors.foundation.white :
                   variantConfig.textColor,
            fontWeight: '600',
          }}
        >
          {action.text}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderDismissButton = () => {
    if (!dismissible) return null;
    
    return (
      <TouchableOpacity
        onPress={handleHide}
        style={{
          marginLeft: rtl ? 0 : spacing.sm,
          marginRight: rtl ? spacing.sm : 0,
          padding: spacing.xs,
        }}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
      >
        <Text
          style={{
            fontSize: 18,
            color: variantConfig.textColor,
            opacity: 0.7,
          }}
        >
          ✕
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
      transform: [
        { translateX: swipeAnim },
      ] as any[],
    };
    
    switch (animationType) {
      case 'slide':
        baseAnimatedStyle.transform.push({ translateY: slideAnim });
        break;
        
      case 'scale':
        baseAnimatedStyle.transform.push({ scale: scaleAnim });
        break;
    }
    
    return baseAnimatedStyle;
  }, [animationType, fadeAnim, slideAnim, scaleAnim, swipeAnim]);
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  // FIX: Safe visibility check without relying on private animation values
  if (!visible && !isAnimationActive) return null;
  
  return (
    <Animated.View
      style={[containerStyles, animatedStyles, style]}
      accessibilityLabel={accessibilityLabel || `${variant} notification: ${message}`}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
      {...(panResponder?.panHandlers || {})}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={{
          flex: 1,
          flexDirection: rtl ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
        }}
        activeOpacity={tapToClose ? 0.8 : 1}
        disabled={!tapToClose}
      >
        {renderIcon()}
        {renderContent()}
        {renderAction()}
        {renderDismissButton()}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ========================================================================================
// TOAST UTILITIES - GLOBAL METHODS
// ========================================================================================

export const toast = {
  show: (props: Omit<ToastProps, 'visible'>) => ToastManager.getInstance().show(props),
  success: (message: string, options?: Partial<ToastProps>) => 
    ToastManager.getInstance().show({ ...options, message, variant: 'success' }),
  error: (message: string, options?: Partial<ToastProps>) => 
    ToastManager.getInstance().show({ ...options, message, variant: 'error' }),
  warning: (message: string, options?: Partial<ToastProps>) => 
    ToastManager.getInstance().show({ ...options, message, variant: 'warning' }),
  info: (message: string, options?: Partial<ToastProps>) => 
    ToastManager.getInstance().show({ ...options, message, variant: 'info' }),
  critical: (message: string, options?: Partial<ToastProps>) => 
    ToastManager.getInstance().show({ ...options, message, variant: 'critical' }),
  hide: (id: string) => ToastManager.getInstance().hide(id),
  hideAll: () => ToastManager.getInstance().hideAll(),
};

// ========================================================================================
// TOAST CONTAINER - GLOBAL RENDERER
// ========================================================================================

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = React.useState<readonly ToastState[]>([]);
  
  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setToasts);
    return unsubscribe;
  }, []);
  
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onHide={() => ToastManager.getInstance().hide(toast.id)}
        />
      ))}
    </>
  );
};

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Toast;