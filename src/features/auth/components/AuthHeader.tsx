// src/components/auth/AuthHeader.tsx
// IRANVERSE Enterprise Auth Header - Revolutionary Authentication Navigation
// Tesla-inspired auth navigation with advanced features and animations
// Built for 90M users - Enterprise authentication header system

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
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
  Animated,
  ScrollView,
  ActivityIndicator,
  LayoutChangeEvent,
} from 'react-native';
import Text from '../ui/Text';
import { useTheme } from '../theme/ThemeProvider';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const AUTH_HEADER_CONFIG = {
  ANIMATION_DURATION: 300,
  PROGRESS_STEP_WIDTH: 60,
  BREADCRUMB_MAX_WIDTH: 120,
  ACTION_BUTTON_SIZE: 40,
  LOGO_HEIGHT: 32,
  BADGE_SIZE: 20,
  HAPTIC_ENABLED: true,
  SAFE_AREA_TOP: Platform.select({
    ios: 44,
    android: 24,
    default: 24,
  }),
} as const;

const PROGRESS_ANIMATIONS = {
  FILL_DURATION: 400,
  PULSE_DURATION: 1500,
  CHECKMARK_DURATION: 300,
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type AuthHeaderVariant = 'default' | 'minimal' | 'progress' | 'branded';
export type AuthHeaderSize = 'compact' | 'standard' | 'large';

export interface AuthHeaderAction {
  id: string;
  icon: React.ReactNode;
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  badge?: number | string;
  testID?: string;
}

export interface AuthHeaderBreadcrumb {
  id: string;
  label: string;
  onPress?: () => void;
}

export interface AuthHeaderProgress {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  showLabels?: boolean;
  animated?: boolean;
}

export interface AuthHeaderNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface AuthHeaderProps {
  // Core
  title?: string;
  subtitle?: string;
  description?: string;
  
  // Navigation
  showBackButton?: boolean;
  backButtonIcon?: React.ReactNode;
  onBackPress?: () => void;
  breadcrumbs?: AuthHeaderBreadcrumb[];
  
  // Progress
  progress?: AuthHeaderProgress;
  
  // Actions
  actions?: AuthHeaderAction[];
  primaryAction?: AuthHeaderAction;
  
  // Branding
  logo?: React.ReactNode;
  brandName?: string;
  showBrand?: boolean;
  
  // Notifications
  notification?: AuthHeaderNotification;
  
  // Design
  variant?: AuthHeaderVariant;
  size?: AuthHeaderSize;
  elevated?: boolean;
  transparent?: boolean;
  
  // Styling
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  
  // Animations
  animated?: boolean;
  animationDelay?: number;
  parallaxOffset?: Animated.Value;
  
  // Loading
  loading?: boolean;
  loadingMessage?: string;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Enterprise
  analytics?: {
    screenName?: string;
    flowName?: string;
    trackInteractions?: boolean;
  };
  
  // Persian/RTL
  rtl?: boolean;
  persianText?: boolean;
}

export interface AuthHeaderRef {
  animateIn: () => void;
  animateOut: () => void;
  showNotification: (notification: AuthHeaderNotification) => void;
  hideNotification: () => void;
  updateProgress: (step: number) => void;
  getHeight: () => number;
}

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useAuthHeaderAnimations = (
  animated: boolean,
  animationDelay: number = 0
) => {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animated ? -20 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(animated ? 0.95 : 1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const notificationAnim = useRef(new Animated.Value(0)).current;
  
  const animateIn = useCallback(() => {
    if (!animated) return;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: AUTH_HEADER_CONFIG.ANIMATION_DURATION,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: AUTH_HEADER_CONFIG.ANIMATION_DURATION,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, animationDelay, fadeAnim, slideAnim, scaleAnim]);
  
  const animateOut = useCallback(() => {
    if (!animated) return;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: AUTH_HEADER_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: AUTH_HEADER_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, fadeAnim, slideAnim]);
  
  const animateProgress = useCallback((toValue: number) => {
    Animated.timing(progressAnim, {
      toValue,
      duration: PROGRESS_ANIMATIONS.FILL_DURATION,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);
  
  const showNotification = useCallback(() => {
    Animated.spring(notificationAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [notificationAnim]);
  
  const hideNotification = useCallback(() => {
    Animated.timing(notificationAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [notificationAnim]);
  
  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    progressAnim,
    notificationAnim,
    animateIn,
    animateOut,
    animateProgress,
    showNotification,
    hideNotification,
  };
};

// ========================================================================================
// PROGRESS COMPONENT
// ========================================================================================

const ProgressIndicator = memo<{
  progress: AuthHeaderProgress;
  theme: any;
  progressAnim: Animated.Value;
  rtl: boolean;
}>(({ progress, theme, progressAnim, rtl }) => {
  const { currentStep, totalSteps, stepLabels, showLabels } = progress;
  
  const progressPercentage = useMemo(() => {
    return Math.min(100, (currentStep / totalSteps) * 100);
  }, [currentStep, totalSteps]);
  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: PROGRESS_ANIMATIONS.FILL_DURATION,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage, progressAnim]);
  
  return (
    <View style={{ marginTop: theme.spacing.md }}>
      {/* Progress Bar */}
      <View style={{
        height: 4,
        backgroundColor: theme.colors.glass.subtle,
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: theme.colors.accent.primary,
            borderRadius: 2,
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
      
      {/* Step Indicators */}
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
      }}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <View
              key={index}
              style={{
                alignItems: 'center',
                flex: 1,
              }}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: isCompleted ? theme.colors.accent.success : 
                               isActive ? theme.colors.accent.primary : 
                               theme.colors.glass.subtle,
                borderWidth: isActive ? 2 : 0,
                borderColor: theme.colors.accent.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {isCompleted ? (
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>✓</Text>
                ) : (
                  <Text style={{
                    color: isActive ? '#FFFFFF' : theme.colors.interactive.text.secondary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    {stepNumber}
                  </Text>
                )}
              </View>
              
              {showLabels && stepLabels?.[index] && (
                <Text style={{
                  fontSize: 10,
                  color: theme.colors.interactive.text.secondary,
                  marginTop: 4,
                  textAlign: 'center',
                }}>
                  {stepLabels[index]}
                </Text>
              )}
            </View>
          );
        })}
      </View>
      
      {/* Progress Text */}
      <Text style={{
        fontSize: 12,
        color: theme.colors.interactive.text.secondary,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
      }}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

// ========================================================================================
// NOTIFICATION COMPONENT
// ========================================================================================

const NotificationBanner = memo<{
  notification: AuthHeaderNotification;
  theme: any;
  notificationAnim: Animated.Value;
  onDismiss: () => void;
}>(({ notification, theme, notificationAnim, onDismiss }) => {
  const getNotificationStyle = useCallback(() => {
    const styles = {
      info: {
        backgroundColor: theme.colors.accent.primary + '20',
        borderColor: theme.colors.accent.primary,
        iconColor: theme.colors.accent.primary,
      },
      warning: {
        backgroundColor: theme.colors.accent.warning + '20',
        borderColor: theme.colors.accent.warning,
        iconColor: theme.colors.accent.warning,
      },
      error: {
        backgroundColor: theme.colors.accent.critical + '20',
        borderColor: theme.colors.accent.critical,
        iconColor: theme.colors.accent.critical,
      },
      success: {
        backgroundColor: theme.colors.accent.success + '20',
        borderColor: theme.colors.accent.success,
        iconColor: theme.colors.accent.success,
      },
    };
    
    return styles[notification.type];
  }, [notification.type, theme]);
  
  const notificationStyle = getNotificationStyle();
  
  return (
    <Animated.View
      style={{
        opacity: notificationAnim,
        transform: [{
          translateY: notificationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          }),
        }],
        backgroundColor: notificationStyle.backgroundColor,
        borderWidth: 1,
        borderColor: notificationStyle.borderColor,
        borderRadius: theme.radius.standard,
        padding: theme.spacing.sm,
        marginTop: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text style={{
        fontSize: 14,
        color: notificationStyle.iconColor,
        marginRight: theme.spacing.xs,
      }}>
        {notification.type === 'info' && 'ℹ'}
        {notification.type === 'warning' && '⚠'}
        {notification.type === 'error' && '✕'}
        {notification.type === 'success' && '✓'}
      </Text>
      
      <Text style={{
        flex: 1,
        fontSize: 12,
        color: theme.colors.interactive.text.primary,
      }}>
        {notification.message}
      </Text>
      
      {notification.dismissible && (
        <TouchableOpacity
          onPress={() => {
            onDismiss();
            notification.onDismiss?.();
          }}
          style={{ padding: theme.spacing.xs }}
        >
          <Text style={{
            fontSize: 16,
            color: theme.colors.interactive.text.secondary,
          }}>
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

NotificationBanner.displayName = 'NotificationBanner';

// ========================================================================================
// MAIN AUTH HEADER COMPONENT
// ========================================================================================

export const AuthHeader = memo(forwardRef<AuthHeaderRef, AuthHeaderProps>((props, ref) => {
  const {
    title,
    subtitle,
    description,
    showBackButton = false,
    backButtonIcon,
    onBackPress,
    breadcrumbs,
    progress,
    actions,
    primaryAction,
    logo,
    brandName,
    showBrand = false,
    notification: initialNotification,
    variant = 'default',
    size = 'standard',
    elevated = false,
    transparent = false,
    style,
    containerStyle,
    titleStyle,
    subtitleStyle,
    animated = false,
    animationDelay = 0,
    parallaxOffset,
    loading = false,
    loadingMessage,
    accessibilityLabel,
    accessibilityHint,
    testID = 'auth-header',
    analytics,
    rtl = false,
    persianText = false,
  } = props;
  
  const theme = useTheme();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [notification, setNotification] = useState(initialNotification);
  
  // Animations
  const {
    fadeAnim,
    slideAnim,
    scaleAnim,
    progressAnim,
    notificationAnim,
    animateIn,
    animateOut,
    showNotification,
    hideNotification,
  } = useAuthHeaderAnimations(animated, animationDelay);
  
  // Update notification when prop changes
  useEffect(() => {
    if (initialNotification) {
      setNotification(initialNotification);
      showNotification();
    }
  }, [initialNotification, showNotification]);
  
  // Handle layout
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);
  
  // Analytics tracking
  const trackInteraction = useCallback((action: string, details?: any) => {
    if (analytics?.trackInteractions) {
      console.log('AuthHeader interaction:', {
        screen: analytics.screenName,
        flow: analytics.flowName,
        action,
        ...details,
      });
    }
  }, [analytics]);
  
  // Imperative API
  useImperativeHandle(ref, () => ({
    animateIn,
    animateOut,
    showNotification: (newNotification: AuthHeaderNotification) => {
      setNotification(newNotification);
      showNotification();
    },
    hideNotification: () => {
      hideNotification();
      setTimeout(() => setNotification(undefined), 200);
    },
    updateProgress: (_step: number) => {
      // Progress update logic
    },
    getHeight: () => headerHeight,
  }), [animateIn, animateOut, showNotification, hideNotification, headerHeight]);
  
  // Start animation on mount
  useEffect(() => {
    if (animated) {
      animateIn();
    }
  }, [animated, animateIn]);
  
  // Container styles
  const containerStyles = useMemo((): ViewStyle => {
    const sizeStyles = {
      compact: { paddingVertical: theme.spacing.sm },
      standard: { paddingVertical: theme.spacing.md },
      large: { paddingVertical: theme.spacing.lg },
    };
    
    return {
      backgroundColor: transparent ? 'transparent' : theme.colors.foundation.darker,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: AUTH_HEADER_CONFIG.SAFE_AREA_TOP,
      ...sizeStyles[size],
      ...(elevated && theme.shadows.subtle),
    };
  }, [size, transparent, elevated, theme]);
  
  // Render helpers
  const renderBackButton = () => {
    if (!showBackButton) return null;
    
    const handlePress = () => {
      trackInteraction('back_button_pressed');
      onBackPress?.();
    };
    
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={{
          width: AUTH_HEADER_CONFIG.ACTION_BUTTON_SIZE,
          height: AUTH_HEADER_CONFIG.ACTION_BUTTON_SIZE,
          borderRadius: AUTH_HEADER_CONFIG.ACTION_BUTTON_SIZE / 2,
          backgroundColor: theme.colors.glass.subtle,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: rtl ? 0 : theme.spacing.md,
          marginLeft: rtl ? theme.spacing.md : 0,
        }}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        testID="auth-header-back-button"
      >
        {backButtonIcon || (
          <Text style={{
            fontSize: 20,
            color: theme.colors.interactive.text.primary,
            transform: [{ scaleX: rtl ? -1 : 1 }],
          }}>
            ←
          </Text>
        )}
      </TouchableOpacity>
    );
  };
  
  const renderBreadcrumbs = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: theme.spacing.sm }}
      >
        {breadcrumbs.map((crumb, index) => (
          <View
            key={crumb.id}
            style={{
              flexDirection: rtl ? 'row-reverse' : 'row',
              alignItems: 'center',
            }}
          >
            {index > 0 && (
              <Text style={{
                marginHorizontal: theme.spacing.xs,
                color: theme.colors.interactive.text.tertiary,
              }}>
                /
              </Text>
            )}
            <TouchableOpacity
              onPress={() => {
                if (crumb.onPress) {
                  trackInteraction('breadcrumb_pressed', { breadcrumb: crumb.label });
                  crumb.onPress();
                }
              }}
              disabled={!crumb.onPress}
            >
              <Text style={{
                fontSize: 12,
                color: crumb.onPress ? theme.colors.accent.primary : theme.colors.interactive.text.secondary,
                maxWidth: AUTH_HEADER_CONFIG.BREADCRUMB_MAX_WIDTH,
              }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {crumb.label}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };
  
  const renderBrand = () => {
    if (!showBrand) return null;
    
    return (
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
      }}>
        {logo && (
          <View style={{
            height: AUTH_HEADER_CONFIG.LOGO_HEIGHT,
            marginRight: rtl ? 0 : theme.spacing.sm,
            marginLeft: rtl ? theme.spacing.sm : 0,
          }}>
            {logo}
          </View>
        )}
        {brandName && (
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.interactive.text.primary,
            letterSpacing: -0.5,
          }}>
            {brandName}
          </Text>
        )}
      </View>
    );
  };
  
  const renderTitle = () => {
    if (!title) return null;
    
    const variantStyles = {
      default: theme.typography.scale.h2,
      minimal: theme.typography.scale.h1,
      progress: theme.typography.scale.h2,
      branded: theme.typography.scale.h1,
    };
    
    return (
      <Text
        style={[
          variantStyles[variant],
          {
            color: theme.colors.interactive.text.primary,
            fontWeight: '600',
            marginBottom: subtitle || description ? theme.spacing.xs : 0,
          },
          ...(titleStyle ? [titleStyle] : []),
        ]}
        numberOfLines={2}
        persianText={persianText}
        rtl={rtl}
      >
        {title}
      </Text>
    );
  };
  
  const renderSubtitle = () => {
    if (!subtitle) return null;
    
    return (
      <Text
        style={[
          theme.typography.scale.body,
          {
            color: theme.colors.interactive.text.secondary,
            marginBottom: description ? theme.spacing.xs : 0,
          },
          ...(subtitleStyle ? [subtitleStyle] : []),
        ]}
        numberOfLines={2}
        persianText={persianText}
        rtl={rtl}
      >
        {subtitle}
      </Text>
    );
  };
  
  const renderDescription = () => {
    if (!description) return null;
    
    return (
      <Text
        style={{
          ...theme.typography.scale.caption,
          color: theme.colors.interactive.text.tertiary,
          lineHeight: 20,
        }}
        numberOfLines={3}
        persianText={persianText}
        rtl={rtl}
      >
        {description}
      </Text>
    );
  };
  
  const renderActions = () => {
    if (!actions || actions.length === 0) return null;
    
    return (
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
      }}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => {
              trackInteraction('action_pressed', { action: action.label || action.id });
              action.onPress();
            }}
            disabled={action.disabled}
            style={{
              padding: theme.spacing.sm,
              opacity: action.disabled ? 0.5 : 1,
              position: 'relative',
              marginRight: theme.spacing.xs,
            }}
            testID={action.testID}
          >
            {action.icon}
            {action.badge !== undefined && (
              <View style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: AUTH_HEADER_CONFIG.BADGE_SIZE,
                height: AUTH_HEADER_CONFIG.BADGE_SIZE,
                borderRadius: AUTH_HEADER_CONFIG.BADGE_SIZE / 2,
                backgroundColor: theme.colors.accent.critical,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 10,
                  color: '#FFFFFF',
                  fontWeight: '600',
                }}>
                  {action.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderPrimaryAction = () => {
    if (!primaryAction) return null;
    
    return (
      <TouchableOpacity
        onPress={() => {
          trackInteraction('primary_action_pressed', { action: primaryAction.label });
          primaryAction.onPress();
        }}
        disabled={primaryAction.disabled}
        style={{
          backgroundColor: theme.colors.accent.primary,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.standard,
          opacity: primaryAction.disabled ? 0.5 : 1,
          marginTop: theme.spacing.md,
        }}
        testID={primaryAction.testID}
      >
        <Text style={{
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '600',
          textAlign: 'center',
        }}>
          {primaryAction.label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <View style={{
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
      }}>
        <ActivityIndicator size="small" color={theme.colors.accent.primary} />
        {loadingMessage && (
          <Text style={{
            fontSize: 12,
            color: theme.colors.interactive.text.secondary,
            marginTop: theme.spacing.xs,
          }}>
            {loadingMessage}
          </Text>
        )}
      </View>
    );
  };
  
  // Animated container
  const animatedStyle = animated ? {
    opacity: fadeAnim,
    transform: [
      { translateY: slideAnim },
      { scale: scaleAnim },
    ],
  } : {};
  
  // Parallax effect
  const parallaxStyle = parallaxOffset ? {
    transform: [{
      translateY: parallaxOffset.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [50, 0, -50],
        extrapolate: 'clamp',
      }),
    }],
  } : {};
  
  return (
    <Animated.View
      style={[
        containerStyles,
        animatedStyle,
        parallaxStyle,
        containerStyle,
      ]}
      onLayout={handleLayout}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
    >
      {/* Brand Section */}
      {renderBrand()}
      
      {/* Breadcrumbs */}
      {renderBreadcrumbs()}
      
      {/* Main Content */}
      <View style={[{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
      }, style]}>
        {renderBackButton()}
        
        <View style={{ flex: 1 }}>
          {renderTitle()}
          {renderSubtitle()}
          {renderDescription()}
          
          {/* Actions Row */}
          <View style={{
            flexDirection: rtl ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {renderActions()}
            {primaryAction && !actions && renderPrimaryAction()}
          </View>
        </View>
      </View>
      
      {/* Progress Indicator */}
      {progress && (
        <ProgressIndicator
          progress={progress}
          theme={theme}
          progressAnim={progressAnim}
          rtl={rtl}
        />
      )}
      
      {/* Notification Banner */}
      {notification && (
        <NotificationBanner
          notification={notification}
          theme={theme}
          notificationAnim={notificationAnim}
          onDismiss={() => {
            hideNotification();
            setTimeout(() => setNotification(undefined), 200);
          }}
        />
      )}
      
      {/* Loading State */}
      {renderLoading()}
    </Animated.View>
  );
}));

AuthHeader.displayName = 'AuthHeader';

// ========================================================================================
// PRESET COMPONENTS
// ========================================================================================

export const MinimalAuthHeader = memo<Omit<AuthHeaderProps, 'variant'>>((props) => (
  <AuthHeader {...props} variant="minimal" />
));
MinimalAuthHeader.displayName = 'MinimalAuthHeader';

export const ProgressAuthHeader = memo<Omit<AuthHeaderProps, 'variant'>>((props) => (
  <AuthHeader {...props} variant="progress" />
));
ProgressAuthHeader.displayName = 'ProgressAuthHeader';

export const BrandedAuthHeader = memo<Omit<AuthHeaderProps, 'variant'>>((props) => (
  <AuthHeader {...props} variant="branded" showBrand />
));
BrandedAuthHeader.displayName = 'BrandedAuthHeader';

// ========================================================================================
// EXPORTS
// ========================================================================================

export default AuthHeader;