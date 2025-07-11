// src/components/auth/OAuthButton.tsx
// IRANVERSE Enterprise OAuth Button - Future-Ready Authentication
// Tesla-inspired OAuth integration with Brand Compliance
// Built for 90M users - Google/Apple Brand Guidelines Compliant
import React, { useRef, useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { useTheme, useColors, useTypography, useSpacing, useRadius, useShadows, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// OAUTH TYPES & INTERFACES - ENTERPRISE AUTHENTICATION
// ========================================================================================

export type OAuthProvider = 'google' | 'apple';

export interface OAuthButtonProps {
  // Core Props
  provider: OAuthProvider;
  onPress?: (event: GestureResponderEvent) => void;
  
  // State Props
  disabled?: boolean;
  loading?: boolean;
  comingSoon?: boolean;
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
}

// ========================================================================================
// BRAND CONFIGURATION - OFFICIAL GUIDELINES COMPLIANCE
// ========================================================================================

const OAUTH_BRAND_CONFIG = {
  google: {
    colors: {
      background: '#ffffff',
      text: '#1f1f1f',
      border: '#dadce0',
      hoverBackground: '#f8f9fa',
      pressedBackground: '#f1f3f4',
      disabledBackground: '#f8f9fa',
      disabledText: '#9aa0a6',
    },
    logo: '🇬', // Placeholder - replace with actual Google logo component
    brandName: 'Google',
    officialText: 'Continue with Google',
    comingSoonText: 'Google Sign-In Coming Soon',
    persianText: 'ورود با گوگل',
    persianComingSoon: 'ورود با گوگل (به زودی)',
  },
  apple: {
    colors: {
      background: '#000000',
      text: '#ffffff',
      border: '#000000',
      hoverBackground: '#1c1c1e',
      pressedBackground: '#2c2c2e',
      disabledBackground: '#2c2c2e',
      disabledText: '#8e8e93',
    },
    logo: '', // Placeholder - replace with actual Apple logo component
    brandName: 'Apple',
    officialText: 'Continue with Apple',
    comingSoonText: 'Apple Sign-In Coming Soon',
    persianText: 'ورود با اپل',
    persianComingSoon: 'ورود با اپل (به زودی)',
  },
} as const;

// ========================================================================================
// OAUTH BUTTON IMPLEMENTATION - BRAND COMPLIANT
// ========================================================================================

export const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  onPress,
  disabled = false,
  loading = false,
  comingSoon = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
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
  
  // Animation Values with cleanup
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Brand Configuration
  const brandConfig = OAUTH_BRAND_CONFIG[provider];
  
  // Determine button state
  const isDisabled = disabled || loading || comingSoon;
  const isInteractive = !isDisabled;
  
  // ========================================================================================
  // STYLE COMPUTATION - BRAND GUIDELINES COMPLIANT
  // ========================================================================================
  
  const buttonStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 56, // Standard OAuth button height
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      position: 'relative',
      overflow: 'hidden',
    };
    
    // Brand-specific styling
    const brandStyle: ViewStyle = {
      backgroundColor: isDisabled 
        ? brandConfig.colors.disabledBackground 
        : brandConfig.colors.background,
      borderWidth: provider === 'google' ? 1.5 : 0,
      borderColor: isDisabled 
        ? brandConfig.colors.disabledBackground 
        : brandConfig.colors.border,
    };
    
    // Shadow styling (Google gets subtle shadow, Apple gets none per guidelines)
    const shadowStyle: ViewStyle = provider === 'google' && !isDisabled ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    } : {};
    
    return {
      ...baseStyle,
      ...brandStyle,
      ...shadowStyle,
    };
  }, [
    provider,
    isDisabled,
    rtl,
    brandConfig,
    radius,
    spacing,
  ]);
  
  const textStyles = useMemo(() => {
    const baseStyle: TextStyle = {
      ...typography.scale.button,
      fontFamily: typography.families.primary,
      fontWeight: Platform.select({
        ios: '500',
        android: '500',
        default: '500',
      }),
      textAlign: 'center',
      flex: 1,
    };
    
    // Brand-specific text styling
    const brandTextStyle: TextStyle = {
      color: isDisabled 
        ? brandConfig.colors.disabledText 
        : brandConfig.colors.text,
      fontSize: 16,
      lineHeight: 20,
    };
    
    // RTL text styling
    const rtlStyle: TextStyle = rtl ? {
      ...typography.rtl.persian,
      textAlign: rtl ? 'right' : 'left',
    } : {};
    
    return {
      ...baseStyle,
      ...brandTextStyle,
      ...rtlStyle,
    };
  }, [
    isDisabled,
    rtl,
    persianText,
    brandConfig,
    typography,
  ]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - ENTERPRISE UX
  // ========================================================================================
  
  const handlePressIn = useCallback(() => {
    if (!isInteractive) return;
    
    // Brand-compliant press animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isInteractive, animations, scaleAnim, opacityAnim]);
  
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
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isInteractive, animations, scaleAnim, opacityAnim]);
  
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (!isInteractive || !onPress) return;
    onPress(event);
  }, [isInteractive, onPress]);
  
  // ========================================================================================
  // CONTENT RENDERING - BRAND COMPLIANCE
  // ========================================================================================
  
  const renderLogo = () => {
    // Google Logo Component
    if (provider === 'google') {
      return (
        <View style={[styles.logoContainer, { marginRight: rtl ? 0 : spacing.sm, marginLeft: rtl ? spacing.sm : 0 }]}>
          <View style={styles.googleLogo}>
            <Text style={styles.googleLogoText}>G</Text>
          </View>
        </View>
      );
    }
    
    // Apple Logo Component
    if (provider === 'apple') {
      return (
        <View style={[styles.logoContainer, { marginRight: rtl ? 0 : spacing.sm, marginLeft: rtl ? spacing.sm : 0 }]}>
          <Text style={[styles.appleLogo, { color: brandConfig.colors.text }]}>
            
          </Text>
        </View>
      );
    }
    
    return null;
  };
  
  const renderText = () => {
    let displayText = '';
    
    if (comingSoon) {
      displayText = persianText ? brandConfig.persianComingSoon : brandConfig.comingSoonText;
    } else {
      displayText = persianText ? brandConfig.persianText : brandConfig.officialText;
    }
    
    return (
      <Text
        style={[textStyles, textStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {displayText}
      </Text>
    );
  };
  
  const renderComingSoonBadge = () => {
    if (!comingSoon) return null;
    
    return (
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonText}>
          {persianText ? 'به زودی' : 'Soon'}
        </Text>
      </View>
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  return (
    <Animated.View
      style={[
        buttonStyles,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={styles.touchableContent}
        accessibilityLabel={
          accessibilityLabel || 
          (comingSoon 
            ? `${brandConfig.brandName} sign-in coming soon` 
            : `Continue with ${brandConfig.brandName}`)
        }
        accessibilityHint={
          accessibilityHint || 
          (comingSoon 
            ? 'This feature will be available soon' 
            : `Sign in using your ${brandConfig.brandName} account`)
        }
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          busy: loading,
        }}
        testID={testID}
      >
        {renderLogo()}
        {renderText()}
        {renderComingSoonBadge()}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ========================================================================================
// STYLES - BRAND GUIDELINES COMPLIANT
// ========================================================================================

const styles = {
  touchableContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logoContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  googleLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285f4',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  googleLogoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600' as const,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  appleLogo: {
    fontSize: 18,
    fontWeight: '400' as const,
  },
  comingSoonBadge: {
    position: 'absolute' as const,
    top: -8,
    right: -8,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comingSoonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
};

export default OAuthButton;