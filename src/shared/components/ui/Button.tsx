// src/components/ui/Button.tsx
// IRANVERSE Button Component - Grok-inspired minimal dark aesthetic
// Subtle inset appearance with refined shadows
// Built for 90M users with premium feel

import React, { memo, forwardRef, useCallback, useRef, useState, useEffect, useImperativeHandle } from 'react';
import {
  TouchableOpacity,
  View,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  Vibration,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import Text from './Text';

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

import { useTheme } from '../../theme/ThemeProvider';
import SmartIcon, { SmartGoogleIcon, SmartAppleIcon, SmartTwitterIcon } from './SmartIcon';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type ButtonVariant = 
  | 'primary'     
  | 'secondary'   
  | 'ghost'       
  | 'outline'     
  | 'glass'       
  | 'critical'    
  | 'grok-auth';  // Grok-style authentication buttons

export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ButtonState = 'default' | 'loading' | 'disabled' | 'pressed' | 'focused';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  loadingIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  pressedStyle?: ViewStyle;
  pressScale?: number;
  animationDuration?: number;
  disableAnimations?: boolean;
  shimmerEffect?: boolean;
  glowEffect?: boolean;
  hapticFeedback?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'heavy';
  debounceMs?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  analytics?: {
    category?: string;
    action?: string;
    label?: string;
  };
}

export interface ButtonRef {
  focus(): void;
  blur(): void;
  simulate(): void;
  getState(): ButtonState;
}

// ========================================================================================
// CONFIGURATION
// ========================================================================================

// Grok-inspired minimal design system
const DESIGN_CONFIG = {
  // Core appearance
  borderRadius: 12,  // Smaller radius to match reference
  
  // Subtle inset effect - like the button is pressed into the surface
  insetShadow: {
    // Outer shadow (creates the inset illusion)
    outerDark: 'rgba(0, 0, 0, 0.7)',    // Darker shadow on top/left
    outerLight: 'rgba(0, 0, 0, 0.1)',   // Lighter shadow on bottom/right
    
    // Inner gradient for depth - more pronounced
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

// Size configurations
const SIZE_CONFIG = {
  small: { height: 44, paddingH: 20, fontSize: 15, iconSize: 18 },
  medium: { height: 52, paddingH: 24, fontSize: 16, iconSize: 20 },
  large: { height: 56, paddingH: 28, fontSize: 17, iconSize: 22 },
  xlarge: { height: 64, paddingH: 32, fontSize: 18, iconSize: 24 },
} as const;

// Variant colors - more pronounced gradients for better depth
const VARIANT_STYLES = {
  'grok-auth': {
    background: '#1a1a1a',              // Very dark gray
    gradient: [
      'rgba(35, 35, 35, 1)',           // Lighter at top
      'rgba(18, 18, 18, 1)',           // Darker at bottom - more contrast
    ],
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  primary: {
    background: '#1a1a1a',              // Black like Grok
    gradient: [
      'rgba(35, 35, 35, 1)',           // Lighter at top
      'rgba(18, 18, 18, 1)',           // Darker at bottom
    ],
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  secondary: {
    background: '#4a4a4a',              // Lighter gray
    gradient: [
      'rgba(85, 85, 85, 1)',           // Light gray at top
      'rgba(65, 65, 65, 1)',           // Darker gray at bottom
    ],
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  ghost: {
    background: 'rgba(26, 26, 26, 0.6)',
    gradient: [
      'rgba(35, 35, 35, 0.6)',
      'rgba(18, 18, 18, 0.6)',
    ],
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  outline: {
    background: 'transparent',
    gradient: [
      'rgba(35, 35, 35, 0.4)',
      'rgba(18, 18, 18, 0.4)',
    ],
    textColor: '#FFFFFF',
    borderColor: 'transparent',  // Using uniform border overlay instead
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.08)',
    gradient: [
      'rgba(255, 255, 255, 0.12)',     // More visible glass effect
      'rgba(255, 255, 255, 0.04)',
    ],
    textColor: '#FFFFFF',
    borderColor: 'transparent',  // Using uniform border overlay instead
  },
  critical: {
    background: '#EF4444',
    gradient: [
      'rgba(249, 88, 88, 1)',          // Lighter red at top
      'rgba(200, 28, 28, 1)',          // Darker red at bottom
    ],
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
} as const;

// ========================================================================================
// BUTTON COMPONENT
// ========================================================================================

const ButtonCore = forwardRef<ButtonRef, ButtonProps>(({
  children,
  onPress,
  onLongPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  iconOnly = false,
  loadingIcon,
  style,
  textStyle,
  pressedStyle,
  pressScale = DESIGN_CONFIG.pressScale,
  animationDuration = 150,
  disableAnimations = false,
  shimmerEffect = false,
  glowEffect = false,
  hapticFeedback = true,
  hapticIntensity = 'light',
  debounceMs = 300,
  accessibilityLabel,
  accessibilityHint,
  testID = 'button',
  analytics,
}, ref) => {
  const theme = useTheme();
  const [currentState, setCurrentState] = useState<ButtonState>('default');
  const [isPressed, setIsPressed] = useState(false);
  const lastPressTime = useRef(0);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Get variant styles
  const variantStyle = VARIANT_STYLES[variant];
  const sizeConfig = SIZE_CONFIG[size];
  
  // Shimmer animation
  useEffect(() => {
    if (shimmerEffect && !disabled && !loading) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerAnimation.start();
      
      return () => shimmerAnimation.stop();
    }
  }, [shimmerEffect, disabled, loading, shimmerAnim]);
  
  // Glow effect
  useEffect(() => {
    if (glowEffect && !disabled && !loading) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [glowEffect, disabled, loading, glowAnim]);
  
  // Handle press animations
  const handlePressIn = useCallback(() => {
    if (disabled || loading || disableAnimations) return;
    
    setIsPressed(true);
    setCurrentState('pressed');
    
    if (hapticFeedback && Platform.OS !== 'web') {
      const intensity = { light: 10, medium: 30, heavy: 50 };
      Vibration.vibrate(intensity[hapticIntensity]);
    }
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: pressScale,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: DESIGN_CONFIG.pressOpacity,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, loading, disableAnimations, hapticFeedback, hapticIntensity, scaleAnim, opacityAnim, pressScale, animationDuration]);
  
  const handlePressOut = useCallback(() => {
    if (disabled || loading || disableAnimations) return;
    
    setIsPressed(false);
    setCurrentState('default');
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, loading, disableAnimations, scaleAnim, opacityAnim, animationDuration]);
  
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (disabled || loading) return;
    
    const now = Date.now();
    if (now - lastPressTime.current < debounceMs) return;
    lastPressTime.current = now;
    
    // Analytics tracking
    if (analytics) {
      console.log('Button analytics:', analytics);
      // Analytics implementation would go here
    }
    
    // Accessibility announcement
    if (Platform.OS !== 'web' && accessibilityLabel) {
      AccessibilityInfo.announceForAccessibility(`${accessibilityLabel} pressed`);
    }
    
    onPress?.(event);
  }, [disabled, loading, debounceMs, onPress, analytics, accessibilityLabel]);
  
  // Imperative handle
  useImperativeHandle(ref, () => ({
    focus: () => setCurrentState('focused'),
    blur: () => setCurrentState('default'),
    simulate: () => handlePress({} as GestureResponderEvent),
    getState: () => currentState,
  }), [currentState, handlePress]);
  
  // Container styles
  const containerStyles: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingH,
    borderRadius: DESIGN_CONFIG.borderRadius,
    width: fullWidth ? '100%' : undefined,
    minWidth: 44,
    opacity: disabled ? 0.5 : 1,
    overflow: 'hidden',
    backgroundColor: variantStyle.background,
    // Remove variant-specific borders as we'll use the uniform border overlay
    borderWidth: 0,
    borderColor: 'transparent',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  };
  
  // Text styles
  const textStyles: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: '500',
    color: variantStyle.textColor,
    letterSpacing: 0.3,
    textAlign: 'center',
  };
  
  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {loadingIcon || (
            <ActivityIndicator 
              size="small" 
              color={variantStyle.textColor}
              style={{ marginRight: loadingText ? 8 : 0 }}
            />
          )}
          {loadingText && (
            <Text style={[textStyles, ...(textStyle ? [textStyle] : [])]}>
              {loadingText}
            </Text>
          )}
        </View>
      );
    }
    
    if (iconOnly && (leftIcon || rightIcon)) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {leftIcon || rightIcon}
        </View>
      );
    }
    
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
        <Text style={[textStyles, ...(textStyle ? [textStyle] : [])]} numberOfLines={1}>
          {children}
        </Text>
        {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
      </View>
    );
  };
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      disabled={disabled || loading}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    ><Animated.View style={[
        containerStyles,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        pressedStyle && isPressed ? pressedStyle : {},
      ]}>
        {/* Main gradient background - very subtle */}
        <LinearGradient
          colors={variantStyle.gradient}
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
          borderColor: 'rgba(255, 255, 255, 0.1)',  // Thin light border
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
        
        {/* Shimmer overlay */}
        {shimmerEffect && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: DESIGN_CONFIG.borderRadius,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            }}
          />
        )}
        
        {/* Glow effect */}
        {glowEffect && (
          <Animated.View
            style={{
              position: 'absolute',
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              borderRadius: DESIGN_CONFIG.borderRadius + 10,
              shadowColor: variantStyle.textColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: glowAnim,
              shadowRadius: 20,
              elevation: 15,
            }}
          />
        )}
        
        {/* Content layer */}
        <View style={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 10,
        }}>
          {renderContent()}
        </View>
      </Animated.View></TouchableOpacity>
  );
});

ButtonCore.displayName = 'ButtonCore';

// ========================================================================================
// GROK AUTH BUTTON WRAPPER
// ========================================================================================

export const GrokAuthButton: React.FC<ButtonProps & {
  provider: 'x' | 'google' | 'apple' | 'iranverse';
  providerIcon?: React.ReactNode;
}> = memo(({ provider, providerIcon, children, ...props }) => {
  const providerTexts = {
    x: 'Continue with X',
    google: 'Continue with Google', 
    apple: 'Continue with Apple',
    iranverse: 'Continue with IRANVERSE',
  };
  
  return (
    <ButtonCore
      {...props}
      variant="grok-auth"
      size="large"
      leftIcon={providerIcon}
    >
      {children || providerTexts[provider]}
    </ButtonCore>
  );
});

// X Authentication Button
export const XAuthButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <GrokAuthButton
    {...props}
    provider="x"
    providerIcon={<SmartTwitterIcon size={20} color="#FFFFFF" />}
  />
));

// Google Authentication Button  
export const GoogleAuthButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <GrokAuthButton
    {...props}
    provider="google"
    providerIcon={<SmartGoogleIcon size={20} color="#FFFFFF" />}
  />
));

// Apple Authentication Button
export const AppleAuthButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <GrokAuthButton
    {...props}
    provider="apple"
    providerIcon={<SmartAppleIcon size={20} color="#FFFFFF" />}
  />
));

// IRANVERSE Authentication Button
export const IranverseAuthButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <GrokAuthButton
    {...props}
    provider="iranverse"
    providerIcon={<SmartIcon name="flag" size={20} color="#EC602A" />}
  />
));

// ========================================================================================
// EXPORTS
// ========================================================================================

export const Button = memo(ButtonCore);

// Preset variants
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <Button {...props} variant="primary" />
));

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <Button {...props} variant="secondary" />
));

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <Button {...props} variant="ghost" />
));

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <Button {...props} variant="outline" />
));

export const GlassButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <Button {...props} variant="glass" />
));

export const CriticalButton: React.FC<Omit<ButtonProps, 'variant'>> = memo((props) => (
  <Button {...props} variant="critical" />
));

export default Button;