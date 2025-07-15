// src/components/ui/GrokButton.tsx
// IRANVERSE GROK Button - Authentic Obsidian Glass Implementation
// Ultra-premium dark aesthetic with carved depth layers
// Built from scratch for perfect GROK compliance

import React, { useRef, useCallback, useState, memo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

// ========================================================================================
// GROK CONFIGURATION - SLIT 3D CARVED AESTHETIC
// ========================================================================================

const GROK_CONFIG = {
  // Surface colors - carved slit with dimensional depth
  surface: {
    base: 'rgba(2, 2, 2, 1)', // Ultra dark base
    gradient: {
      // 3D slit effect - light at top, deep shadow at bottom
      top: 'rgba(18, 18, 18, 1)',      // Lighter top edge (catches light)
      upperMid: 'rgba(10, 10, 10, 1)', // Upper middle
      middle: 'rgba(5, 5, 5, 1)',      // Center of slit
      lowerMid: 'rgba(2, 2, 2, 1)',   // Lower middle
      bottom: 'rgba(0, 0, 0, 1)',      // Deep shadow at bottom
    },
    pressed: {
      top: 'rgba(8, 8, 8, 1)',         // Darker when pressed
      upperMid: 'rgba(4, 4, 4, 1)',
      middle: 'rgba(2, 2, 2, 1)',
      lowerMid: 'rgba(0, 0, 0, 1)',
      bottom: 'rgba(0, 0, 0, 1)',      // Pure black
    },
  },
  
  // Border system - creates the slit edge
  border: {
    width: 1,
    // Top edge highlight
    topColor: 'rgba(255, 255, 255, 0.08)',
    // Bottom edge shadow
    bottomColor: 'rgba(0, 0, 0, 0.9)',
    // Side edges
    sideColor: 'rgba(255, 255, 255, 0.02)',
  },
  
  // Shadow system - multi-layer for depth
  shadow: {
    // Outer shadow - button floating above surface
    outer: {
      color: '#000000',
      offset: { width: 0, height: 12 },
      opacity: 0.8,
      radius: 32,
      elevation: 20,
    },
    // Inner shadow - carved slit effect
    inner: {
      top: {
        color: 'rgba(0, 0, 0, 0.9)',
        offset: { width: 0, height: 3 },
        radius: 6,
      },
      bottom: {
        color: 'rgba(255, 255, 255, 0.05)',
        offset: { width: 0, height: -1 },
        radius: 2,
      },
    },
  },
  
  // 3D lighting effects
  lighting: {
    // Top bevel highlight
    topBevel: 'rgba(255, 255, 255, 0.06)',
    // Bottom bevel shadow
    bottomBevel: 'rgba(0, 0, 0, 0.8)',
    // Side lighting gradients
    leftGradient: 'rgba(255, 255, 255, 0.02)',
    rightGradient: 'rgba(0, 0, 0, 0.4)',
  },
  
  // Animation
  animation: {
    pressScale: 0.99,       // More noticeable press
    pressDuration: 120,
    releaseDuration: 180,
    translateY: 2,          // Push into surface
    shadowScale: 0.7,       // Shadow reduces on press
  },
  
  // Dimensions
  dimensions: {
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 28,
    iconSpacing: 12,
    slitDepth: 4,           // Visual depth of the slit
  },
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export interface GrokButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  testID?: string;
}

// ========================================================================================
// GROK BUTTON COMPONENT
// ========================================================================================

const GrokButton: React.FC<GrokButtonProps> = memo(({
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  hapticFeedback = true,
  testID = 'grok-button',
}) => {
  const theme = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;
  
  // Handle press in
  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    // Haptic feedback
    if (hapticFeedback && Platform.OS !== 'web') {
      Vibration.vibrate(40);
    }
    
    // Animate to pressed state
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: GROK_CONFIG.animation.pressScale,
        duration: GROK_CONFIG.animation.pressDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: GROK_CONFIG.animation.translateY,
        duration: GROK_CONFIG.animation.pressDuration,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0.6, // Reduce shadow when pressed
        duration: GROK_CONFIG.animation.pressDuration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [disabled, loading, hapticFeedback, scaleAnim, translateYAnim, shadowAnim]);
  
  // Handle press out
  const handlePressOut = useCallback(() => {
    if (disabled || loading) return;
    
    setIsPressed(false);
    
    // Animate back to normal state
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: GROK_CONFIG.animation.releaseDuration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [disabled, loading, scaleAnim, translateYAnim, shadowAnim]);
  
  // Container styles
  const containerStyle = StyleSheet.flatten([
    styles.container,
    {
      backgroundColor: GROK_CONFIG.surface.base,
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined,
      // Deep shadow system
      shadowColor: GROK_CONFIG.shadow.outer.color,
      shadowOffset: GROK_CONFIG.shadow.outer.offset,
      shadowOpacity: shadowAnim,
      shadowRadius: GROK_CONFIG.shadow.outer.radius,
      elevation: GROK_CONFIG.shadow.outer.elevation,
    },
    style,
  ]);
  
  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim },
    ],
  };
  
  // Text styles
  const textStyles = StyleSheet.flatten([
    styles.text,
    textStyle,
  ]);
  
  return (
    <TouchableOpacity
      activeOpacity={1} // We handle opacity ourselves
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      testID={testID}
    >
      <Animated.View style={[containerStyle as any, animatedStyle]}>
        {/* Layer 1: Main surface gradient - 5 color stops for slit effect */}
        <LinearGradient
          colors={isPressed ? [
            GROK_CONFIG.surface.pressed.top,
            GROK_CONFIG.surface.pressed.upperMid,
            GROK_CONFIG.surface.pressed.middle,
            GROK_CONFIG.surface.pressed.lowerMid,
            GROK_CONFIG.surface.pressed.bottom,
          ] : [
            GROK_CONFIG.surface.gradient.top,
            GROK_CONFIG.surface.gradient.upperMid,
            GROK_CONFIG.surface.gradient.middle,
            GROK_CONFIG.surface.gradient.lowerMid,
            GROK_CONFIG.surface.gradient.bottom,
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {/* Layer 2: Top bevel highlight */}
        <View style={styles.topBevel} />
        
        {/* Layer 3: Bottom bevel shadow */}
        <View style={styles.bottomBevel} />
        
        {/* Layer 4: Left side gradient (3D lighting) */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.03)', 'transparent']}
          style={styles.leftLighting}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        
        {/* Layer 5: Right side gradient (3D shadow) */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
          style={styles.rightLighting}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        
        {/* Layer 6: Inner top shadow (slit depth) */}
        <View style={styles.innerTopShadow} />
        
        {/* Layer 7: Inner bottom highlight (reflected light) */}
        <View style={styles.innerBottomHighlight} />
        
        {/* Layer 8: Press overlay */}
        {isPressed && <View style={styles.pressOverlay} />}
        
        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color="#FFFFFF"
              style={styles.loader}
            />
          ) : (
            <>
              {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
              <Text style={textStyles}>
                {children}
              </Text>
              {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
            </>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

GrokButton.displayName = 'GrokButton';

// ========================================================================================
// STYLES
// ========================================================================================

const styles = StyleSheet.create({
  container: {
    height: GROK_CONFIG.dimensions.height,
    borderRadius: GROK_CONFIG.dimensions.borderRadius,
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: GROK_CONFIG.lighting.topBevel,
    borderTopLeftRadius: GROK_CONFIG.dimensions.borderRadius,
    borderTopRightRadius: GROK_CONFIG.dimensions.borderRadius,
  },
  bottomBevel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: GROK_CONFIG.lighting.bottomBevel,
    borderBottomLeftRadius: GROK_CONFIG.dimensions.borderRadius,
    borderBottomRightRadius: GROK_CONFIG.dimensions.borderRadius,
  },
  leftLighting: {
    position: 'absolute',
    top: 2,
    left: 0,
    bottom: 3,
    width: 20,
    borderTopLeftRadius: GROK_CONFIG.dimensions.borderRadius,
    borderBottomLeftRadius: GROK_CONFIG.dimensions.borderRadius,
  },
  rightLighting: {
    position: 'absolute',
    top: 2,
    right: 0,
    bottom: 3,
    width: 20,
    borderTopRightRadius: GROK_CONFIG.dimensions.borderRadius,
    borderBottomRightRadius: GROK_CONFIG.dimensions.borderRadius,
  },
  innerTopShadow: {
    position: 'absolute',
    top: 8,
    left: 20,
    right: 20,
    height: GROK_CONFIG.dimensions.slitDepth,
    backgroundColor: GROK_CONFIG.shadow.inner.top.color,
    borderRadius: GROK_CONFIG.dimensions.slitDepth / 2,
    opacity: 0.6,
    // Blur effect
    shadowColor: GROK_CONFIG.shadow.inner.top.color,
    shadowOffset: GROK_CONFIG.shadow.inner.top.offset,
    shadowRadius: GROK_CONFIG.shadow.inner.top.radius,
    shadowOpacity: 1,
  },
  innerBottomHighlight: {
    position: 'absolute',
    bottom: 8,
    left: 40,
    right: 40,
    height: 1,
    backgroundColor: GROK_CONFIG.shadow.inner.bottom.color,
    opacity: 0.3,
  },
  pressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GROK_CONFIG.dimensions.paddingHorizontal,
    zIndex: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  iconLeft: {
    marginRight: GROK_CONFIG.dimensions.iconSpacing,
  },
  iconRight: {
    marginLeft: GROK_CONFIG.dimensions.iconSpacing,
  },
  loader: {
    marginHorizontal: 20,
  },
});

// ========================================================================================
// EXPORTS
// ========================================================================================

export default GrokButton;