// src/components/auth/OAuthButton.tsx
// IRANVERSE Enterprise OAuth Button - Production Ready Authentication
// Grok-inspired minimal dark aesthetic with Brand Compliance & Security
// Built for 90M users - Google/Apple Brand Guidelines Compliant
import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
  GestureResponderEvent,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import { useTheme } from '../../../shared/theme/ThemeProvider';

// LinearGradient for subtle depth
let LinearGradient: any = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  console.log('IRANVERSE: expo-linear-gradient not installed, using fallback');
  LinearGradient = ({ children, colors, style }: any) => (
    <View style={[style, { backgroundColor: colors ? colors[0] : '#1a1a1a' }]}>
      {children}
    </View>
  );
}

// ========================================================================================
// OAUTH TYPES & INTERFACES - ENTERPRISE AUTHENTICATION
// ========================================================================================

export type OAuthProvider = 'google' | 'apple';

export type OAuthButtonState = 'idle' | 'loading' | 'success' | 'error' | 'disabled';

export interface OAuthButtonProps {
  // Core Props
  provider: OAuthProvider;
  onPress?: (event: GestureResponderEvent) => Promise<void> | void;
  
  // State Props
  state?: OAuthButtonState;
  disabled?: boolean;
  loading?: boolean;
  comingSoon?: boolean;
  
  // OAuth Configuration
  scopes?: string[];
  locale?: 'en' | 'fa';
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconStyle?: ViewStyle;
  
  // Security & Analytics
  onAnalyticsEvent?: (event: string, provider: string) => void;
  onSecurityEvent?: (event: string, details: any) => void;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  
  // Advanced Features
  hapticFeedback?: boolean;
  preventDoublePress?: boolean;
  pressDelayMs?: number;
}

// ========================================================================================
// GROK-INSPIRED DESIGN CONFIGURATION
// ========================================================================================

const DESIGN_CONFIG = {
  // Core appearance
  borderRadius: 12,  // Clean rounded corners
  
  // Subtle inset effect - like the button is pressed into the surface
  insetShadow: {
    // Inner gradient for depth
    innerGradient: [
      'rgba(0, 0, 0, 0.5)',   // Darker at top (shadow)
      'rgba(0, 0, 0, 0.2)',   // Mid
      'rgba(0, 0, 0, 0)',     // Center - fully transparent
      'rgba(0, 0, 0, 0.2)',   // Mid
      'rgba(0, 0, 0, 0.5)',   // Darker at bottom (shadow)
    ],
  },
  
  // Press effect
  pressScale: 0.98,
  pressOpacity: 0.9,
} as const;

// ========================================================================================
// OAUTH PROVIDER CONFIGURATION - BRAND GUIDELINES COMPLIANT
// ========================================================================================

interface OAuthProviderConfig {
  colors: {
    background: string;
    gradient: string[];  // Added gradient colors
    backgroundHover: string;
    backgroundPressed: string;
    backgroundDisabled: string;
    text: string;
    textDisabled: string;
    border: string;
    icon: string;
  };
  branding: {
    name: string;
    displayName: string;
    icon: string;
    logoComponent: React.ComponentType<{ size: number; color?: string }>;
  };
  text: {
    en: {
      default: string;
      loading: string;
      success: string;
      error: string;
      comingSoon: string;
    };
    fa: {
      default: string;
      loading: string;
      success: string;
      error: string;
      comingSoon: string;
    };
  };
  security: {
    defaultScopes: string[];
    requiredFeatures: string[];
  };
}

// Google Logo Component - Brand Compliant
const GoogleLogo: React.FC<{ size: number; color?: string }> = ({ size, color = '#4285F4' }) => (
  <View style={{
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  }}>
    <Text style={{
      fontSize: size * 0.6,
      fontWeight: '600',
      color,
      fontFamily: Platform.select({
        ios: 'SF Pro Display',
        android: 'Roboto',
        default: 'system',
      }),
    }}>
      G
    </Text>
  </View>
);

// Apple Logo Component - Brand Compliant
const AppleLogo: React.FC<{ size: number; color?: string }> = ({ size, color = '#ffffff' }) => (
  <View style={{
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Text style={{
      fontSize: size * 0.9,
      color,
      fontFamily: Platform.select({
        ios: 'SF Pro Display',
        android: 'Roboto',
        default: 'system',
      }),
    }}>
      
    </Text>
  </View>
);

const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  google: {
    colors: {
      background: '#1a1a1a',  // Very dark gray matching grok-auth
      gradient: [
        'rgba(35, 35, 35, 1)',  // Lighter at top
        'rgba(18, 18, 18, 1)',  // Darker at bottom
      ],
      backgroundHover: '#252525',
      backgroundPressed: '#2a2a2a',
      backgroundDisabled: '#1a1a1a',
      text: '#ffffff',
      textDisabled: '#666666',
      border: 'rgba(255, 255, 255, 0.1)',  // Thin light border
      icon: '#4285F4',  // Keep Google brand color for icon
    },
    branding: {
      name: 'google',
      displayName: 'Google',
      icon: '🇬',
      logoComponent: GoogleLogo,
    },
    text: {
      en: {
        default: 'Continue with Google',
        loading: 'Connecting to Google...',
        success: 'Connected to Google',
        error: 'Google connection failed',
        comingSoon: 'Google Sign-In Coming Soon',
      },
      fa: {
        default: 'ورود با گوگل',
        loading: 'در حال اتصال به گوگل...',
        success: 'اتصال به گوگل برقرار شد',
        error: 'اتصال به گوگل ناموفق',
        comingSoon: 'ورود با گوگل (به زودی)',
      },
    },
    security: {
      defaultScopes: ['email', 'profile', 'openid'],
      requiredFeatures: ['oauth2', 'secure_storage'],
    },
  },
  apple: {
    colors: {
      background: '#1a1a1a',  // Very dark gray matching grok-auth
      gradient: [
        'rgba(35, 35, 35, 1)',  // Lighter at top
        'rgba(18, 18, 18, 1)',  // Darker at bottom
      ],
      backgroundHover: '#252525',
      backgroundPressed: '#2a2a2a',
      backgroundDisabled: '#1a1a1a',
      text: '#ffffff',
      textDisabled: '#666666',
      border: 'rgba(255, 255, 255, 0.1)',  // Thin light border
      icon: '#ffffff',  // Keep Apple white icon
    },
    branding: {
      name: 'apple',
      displayName: 'Apple',
      icon: '',
      logoComponent: AppleLogo,
    },
    text: {
      en: {
        default: 'Continue with Apple',
        loading: 'Connecting to Apple...',
        success: 'Connected to Apple',
        error: 'Apple connection failed',
        comingSoon: 'Apple Sign-In Coming Soon',
      },
      fa: {
        default: 'ورود با اپل',
        loading: 'در حال اتصال به اپل...',
        success: 'اتصال به اپل برقرار شد',
        error: 'اتصال به اپل ناموفق',
        comingSoon: 'ورود با اپل (به زودی)',
      },
    },
    security: {
      defaultScopes: ['email', 'name'],
      requiredFeatures: ['oauth2', 'secure_storage', 'keychain'],
    },
  },
};

// ========================================================================================
// OAUTH BUTTON IMPLEMENTATION - ENTERPRISE PRODUCTION
// ========================================================================================

export const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  onPress,
  state = 'idle',
  disabled = false,
  loading = false,
  comingSoon = false,
  scopes,
  locale = 'en',
  style,
  textStyle,
  iconStyle,
  onAnalyticsEvent,
  onSecurityEvent,
  accessibilityLabel,
  accessibilityHint,
  testID,
  rtl = false,
  persianText = false,
  hapticFeedback = true,
  preventDoublePress = true,
  pressDelayMs = 300,
}) => {
  
  // Theme System
  const theme = useTheme();
  const colors = theme.colors;
  const typography = theme.typography;
  const spacing = theme.spacing;
  const radius = theme.radius;
  const shadows = theme.shadows;
  const animations = theme.animations;
  
  // Provider Configuration
  const providerConfig = OAUTH_PROVIDERS[provider];
  const effectiveLocale = persianText ? 'fa' : locale;
  
  // Animation Values with proper cleanup
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;
  
  // State Management
  const [internalState, setInternalState] = React.useState<OAuthButtonState>(state);
  const [lastPressTime, setLastPressTime] = React.useState(0);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup animations and timers
  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
        pressTimeoutRef.current = null;
      }
      
      scaleAnim.stopAnimation();
      opacityAnim.stopAnimation();
      glowAnim.stopAnimation();
      loadingRotation.stopAnimation();
      scaleAnim.removeAllListeners();
      opacityAnim.removeAllListeners();
      glowAnim.removeAllListeners();
      loadingRotation.removeAllListeners();
    };
  }, [scaleAnim, opacityAnim, glowAnim, loadingRotation]);
  
  // Determine effective state
  const effectiveState: OAuthButtonState = useMemo(() => {
    if (disabled || comingSoon) return 'disabled';
    if (loading) return 'loading';
    return internalState;
  }, [disabled, comingSoon, loading, internalState]);
  
  const isInteractive = effectiveState !== 'disabled' && effectiveState !== 'loading';
  
  // ========================================================================================
  // ANIMATION SYSTEM - TESLA-INSPIRED INTERACTIONS
  // ========================================================================================
  
  const startLoadingAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [loadingRotation]);
  
  const stopLoadingAnimation = useCallback(() => {
    loadingRotation.stopAnimation();
    loadingRotation.setValue(0);
  }, [loadingRotation]);
  
  const animatePress = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: DESIGN_CONFIG.pressScale,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: DESIGN_CONFIG.pressOpacity,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, animations]);
  
  const animateRelease = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 400,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, animations]);
  
  const animateSuccess = useCallback(() => {
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [glowAnim]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - ENTERPRISE SECURITY
  // ========================================================================================
  
  const handlePressIn = useCallback(() => {
    if (!isInteractive) return;
    
    // Analytics tracking
    onAnalyticsEvent?.('oauth_button_press_start', provider);
    
    // Haptic feedback with error handling
    if (hapticFeedback && Platform.OS !== 'web') {
      try {
        const { HapticFeedback } = require('expo-haptics');
        HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.warn('IRANVERSE OAuth Button: Haptic feedback error:', error);
      }
    }
    
    animatePress();
  }, [isInteractive, hapticFeedback, provider, onAnalyticsEvent, animatePress]);
  
  const handlePressOut = useCallback(() => {
    if (!isInteractive) return;
    animateRelease();
  }, [isInteractive, animateRelease]);
  
  const handlePress = useCallback(async (event: GestureResponderEvent) => {
    if (!isInteractive || !onPress) return;
    
    // Double-press prevention
    if (preventDoublePress) {
      const currentTime = Date.now();
      if (currentTime - lastPressTime < pressDelayMs) {
        onSecurityEvent?.('oauth_double_press_prevented', {
          provider,
          timeDiff: currentTime - lastPressTime,
        });
        return;
      }
      setLastPressTime(currentTime);
    }
    
    try {
      setInternalState('loading');
      
      // Security event logging
      onSecurityEvent?.('oauth_authentication_started', {
        provider,
        scopes: scopes || providerConfig.security.defaultScopes,
        timestamp: new Date().toISOString(),
      });
      
      // Analytics tracking
      onAnalyticsEvent?.('oauth_authentication_attempt', provider);
      
      // Start loading animation
      startLoadingAnimation();
      
      // Execute OAuth flow
      await onPress(event);
      
      // Success state
      setInternalState('success');
      animateSuccess();
      
      // Analytics tracking
      onAnalyticsEvent?.('oauth_authentication_success', provider);
      
      // Accessibility announcement
      if (Platform.OS !== 'web') {
        AccessibilityInfo.announceForAccessibility(
          `Successfully connected to ${providerConfig.branding.displayName}`
        );
      }
      
      // Reset state after success animation
      setTimeout(() => {
        setInternalState('idle');
        stopLoadingAnimation();
      }, 1000);
      
    } catch (error) {
      console.error('IRANVERSE OAuth Button: Authentication error:', error);
      
      setInternalState('error');
      stopLoadingAnimation();
      
      // Security event logging
      onSecurityEvent?.('oauth_authentication_failed', {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      
      // Analytics tracking
      onAnalyticsEvent?.('oauth_authentication_error', provider);
      
      // Accessibility announcement
      if (Platform.OS !== 'web') {
        AccessibilityInfo.announceForAccessibility(
          `Failed to connect to ${providerConfig.branding.displayName}`
        );
      }
      
      // Reset to idle state after error display
      setTimeout(() => {
        setInternalState('idle');
      }, 2000);
    }
  }, [
    isInteractive,
    onPress,
    preventDoublePress,
    pressDelayMs,
    lastPressTime,
    provider,
    scopes,
    providerConfig,
    onSecurityEvent,
    onAnalyticsEvent,
    startLoadingAnimation,
    animateSuccess,
    stopLoadingAnimation,
  ]);
  
  // ========================================================================================
  // STYLE COMPUTATION - BRAND GUIDELINES COMPLIANT
  // ========================================================================================
  
  const buttonStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      borderRadius: DESIGN_CONFIG.borderRadius,  // Use Grok-inspired radius
      paddingHorizontal: spacing.lg,
      position: 'relative',
      overflow: 'hidden',
      minWidth: 280,
      // Subtle shadow for depth
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    };
    
    // State-based colors
    const getBackgroundColor = () => {
      switch (effectiveState) {
        case 'loading':
          return providerConfig.colors.backgroundHover;
        case 'success':
          return colors.accent.success;
        case 'error':
          return colors.accent.critical;
        case 'disabled':
          return providerConfig.colors.backgroundDisabled;
        default:
          return providerConfig.colors.background;
      }
    };
    
    return {
      ...baseStyle,
      backgroundColor: getBackgroundColor(),
      // Remove provider-specific borders - we'll use uniform border overlay
      borderWidth: 0,
      borderColor: 'transparent',
    };
  }, [
    effectiveState,
    rtl,
    providerConfig,
    colors,
    spacing,
  ]);
  
  const textStyles = useMemo(() => {
    const getTextColor = () => {
      switch (effectiveState) {
        case 'success':
        case 'error':
          return colors.foundation.white;
        case 'disabled':
          return providerConfig.colors.textDisabled;
        default:
          return providerConfig.colors.text;
      }
    };
    
    return {
      ...typography.scale.body,
      fontFamily: persianText ? typography.families.primary : typography.families.primary,
      fontWeight: Platform.select({
        ios: '500',
        android: '500',
        default: '500',
      }) as TextStyle['fontWeight'],
      color: getTextColor(),
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center' as TextStyle['textAlign'],
      flex: 1,
      ...(rtl ? { writingDirection: 'rtl' as const } : {}),
    };
  }, [
    effectiveState,
    providerConfig,
    colors,
    typography,
    persianText,
    rtl,
  ]);
  
  // ========================================================================================
  // CONTENT RENDERING - BRAND COMPLIANCE
  // ========================================================================================
  
  const renderIcon = () => {
    const iconSize = 20;
    const LogoComponent = providerConfig.branding.logoComponent;
    
    if (effectiveState === 'loading') {
      return (
        <Animated.View
          style={[
            {
              marginRight: rtl ? 0 : spacing.sm,
              marginLeft: rtl ? spacing.sm : 0,
              transform: [{
                rotate: loadingRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              }],
            },
            iconStyle,
          ]}
        >
          <ActivityIndicator
            size="small"
            color={textStyles.color}
          />
        </Animated.View>
      );
    }
    
    if (effectiveState === 'success') {
      return (
        <View
          style={{
            marginRight: rtl ? 0 : spacing.sm,
            marginLeft: rtl ? spacing.sm : 0,
            width: iconSize,
            height: iconSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.foundation.white, fontSize: 16 }}>✓</Text>
        </View>
      );
    }
    
    if (effectiveState === 'error') {
      return (
        <View
          style={{
            marginRight: rtl ? 0 : spacing.sm,
            marginLeft: rtl ? spacing.sm : 0,
            width: iconSize,
            height: iconSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.foundation.white, fontSize: 16 }}>✕</Text>
        </View>
      );
    }
    
    return (
      <View
        style={[
          {
            marginRight: rtl ? 0 : spacing.sm,
            marginLeft: rtl ? spacing.sm : 0,
          },
          iconStyle,
        ]}
      >
        <LogoComponent
          size={iconSize}
          color={effectiveState === 'disabled' ? providerConfig.colors.textDisabled : providerConfig.colors.icon}
        />
      </View>
    );
  };
  
  const renderText = () => {
    const getText = () => {
      const textConfig = providerConfig.text[effectiveLocale];
      
      if (comingSoon) return textConfig.comingSoon;
      
      switch (effectiveState) {
        case 'loading':
          return textConfig.loading;
        case 'success':
          return textConfig.success;
        case 'error':
          return textConfig.error;
        default:
          return textConfig.default;
      }
    };
    
    return (
      <Text
        style={[textStyles, textStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {getText()}
      </Text>
    );
  };
  
  const renderComingSoonBadge = () => {
    if (!comingSoon) return null;
    
    return (
      <View
        style={{
          position: 'absolute',
          top: -8,
          right: rtl ? undefined : -8,
          left: rtl ? -8 : undefined,
          backgroundColor: colors.accent.critical,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xs / 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text
          style={{
            color: colors.foundation.white,
            fontSize: 10,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          {persianText ? 'به زودی' : 'SOON'}
        </Text>
      </View>
    );
  };
  
  const renderGlowEffect = () => {
    if (effectiveState !== 'success') return null;
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: DESIGN_CONFIG.borderRadius,
          backgroundColor: colors.accent.success,
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          }),
        }}
        pointerEvents="none"
      />
    );
  };
  
  // ========================================================================================
  // ACCESSIBILITY CONFIGURATION - ENTERPRISE STANDARDS
  // ========================================================================================
  
  const accessibilityProps = useMemo(() => {
    const getAccessibilityLabel = () => {
      if (accessibilityLabel) return accessibilityLabel;
      
      const baseLabel = `${providerConfig.branding.displayName} authentication`;
      
      switch (effectiveState) {
        case 'loading':
          return `${baseLabel} in progress`;
        case 'success':
          return `${baseLabel} successful`;
        case 'error':
          return `${baseLabel} failed`;
        case 'disabled':
          return comingSoon ? `${baseLabel} coming soon` : `${baseLabel} disabled`;
        default:
          return baseLabel;
      }
    };
    
    const getAccessibilityHint = () => {
      if (accessibilityHint) return accessibilityHint;
      
      switch (effectiveState) {
        case 'loading':
          return 'Please wait while connecting';
        case 'disabled':
          return comingSoon ? 'This feature will be available soon' : 'Button is disabled';
        default:
          return `Tap to sign in with ${providerConfig.branding.displayName}`;
      }
    };
    
    return {
      accessibilityLabel: getAccessibilityLabel(),
      accessibilityHint: getAccessibilityHint(),
      accessibilityRole: 'button' as const,
      accessibilityState: {
        disabled: !isInteractive,
        busy: effectiveState === 'loading',
      },
      accessibilityLanguage: persianText ? 'fa' : 'en',
    };
  }, [
    accessibilityLabel,
    accessibilityHint,
    effectiveState,
    isInteractive,
    comingSoon,
    persianText,
    providerConfig,
  ]);
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE PRODUCTION
  // ========================================================================================
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!isInteractive}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive }}
      testID={testID || `oauth-button-${provider}`}
    >
      <Animated.View
        style={[
          buttonStyles,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Main gradient background - very subtle */}
        <LinearGradient
          colors={providerConfig.colors.gradient}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: DESIGN_CONFIG.borderRadius,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {/* Simple thin border */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: DESIGN_CONFIG.borderRadius,
          borderWidth: 1,
          borderColor: providerConfig.colors.border,
        }} />
        
        {/* Very subtle inner gradient for depth */}
        <LinearGradient
          colors={DESIGN_CONFIG.insetShadow.innerGradient}
          locations={[0, 0.3, 0.5, 0.7, 1]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: DESIGN_CONFIG.borderRadius,
            opacity: 0.4,  // Increased opacity for more visible depth
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {renderGlowEffect()}
        
        {/* Content layer */}
        <View style={{ 
          flex: 1,
          flexDirection: rtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}>
          {renderIcon()}
          {renderText()}
        </View>
        
        {renderComingSoonBadge()}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const GoogleOAuthButton: React.FC<Omit<OAuthButtonProps, 'provider'>> = (props) => (
  <OAuthButton {...props} provider="google" />
);

export const AppleOAuthButton: React.FC<Omit<OAuthButtonProps, 'provider'>> = (props) => (
  <OAuthButton {...props} provider="apple" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default OAuthButton;