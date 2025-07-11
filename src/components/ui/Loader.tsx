// src/components/ui/Loader.tsx
// IRANVERSE Enterprise Loader - Revolutionary Loading Experience
// Tesla-inspired animations with Agent Identity Progress
// Built for 90M users - Performance Optimized & Accessible
import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Animated,
  ViewStyle,
  TextStyle,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme, useColors, useTypography, useSpacing, useAnimations } from '../theme/ThemeProvider';
import { Easing } from 'react-native-reanimated';

// ========================================================================================
// LOADER VARIANTS & TYPES - ENTERPRISE LOADING SYSTEM
// ========================================================================================

export type LoaderVariant = 
  | 'spinner'      // Standard React Native spinner
  | 'dots'         // Animated dot sequence
  | 'pulse'        // Pulsing circle
  | 'bars'         // Loading bars animation
  | 'orbital'      // 3D-inspired orbital motion
  | 'quantum';     // Quantum particle effect

export type LoaderSize = 'small' | 'medium' | 'large';

export type LoaderPosition = 'center' | 'top' | 'bottom' | 'inline';

export interface LoaderProps {
  // Core Props
  visible?: boolean;
  
  // Design Variants
  variant?: LoaderVariant;
  size?: LoaderSize;
  position?: LoaderPosition;
  
  // Content
  text?: string;
  subtext?: string;
  
  // Styling
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  subtextStyle?: TextStyle;
  
  // Overlay
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  
  // Animation
  animationDuration?: number;
  animationDelay?: number;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  
  // Progress Indicator
  progress?: number; // 0-100
  showProgress?: boolean;
}

// ========================================================================================
// LOADER IMPLEMENTATION - REVOLUTIONARY WAITING EXPERIENCE
// ========================================================================================

export const Loader: React.FC<LoaderProps> = ({
  visible = true,
  variant = 'spinner',
  size = 'medium',
  position = 'center',
  text,
  subtext,
  color,
  backgroundColor,
  style,
  textStyle,
  subtextStyle,
  overlay = false,
  overlayColor,
  overlayOpacity = 0.7,
  animationDuration = 1000,
  animationDelay = 0,
  accessibilityLabel,
  testID,
  rtl = false,
  persianText = false,
  progress,
  showProgress = false,
}) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const animations = useAnimations();
  
  // Animation Values with cleanup management
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Dots animation values
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  
  // Bars animation values
  const bar1Anim = useRef(new Animated.Value(0.3)).current;
  const bar2Anim = useRef(new Animated.Value(0.3)).current;
  const bar3Anim = useRef(new Animated.Value(0.3)).current;
  const bar4Anim = useRef(new Animated.Value(0.3)).current;
  
  // Orbital animation values
  const orbital1Anim = useRef(new Animated.Value(0)).current;
  const orbital2Anim = useRef(new Animated.Value(0)).current;
  
  // Store active animations for cleanup
  const activeAnimations = useRef<Animated.CompositeAnimation[]>([]);
  
  // Comprehensive animation cleanup
  useEffect(() => {
    return () => {
      // Stop all active animations
      activeAnimations.current.forEach(animation => {
        animation.stop();
      });
      activeAnimations.current = [];
      
      // Stop and cleanup all animation values
      const allAnimations = [
        fadeAnim, rotateAnim, scaleAnim, progressAnim,
        dot1Anim, dot2Anim, dot3Anim,
        bar1Anim, bar2Anim, bar3Anim, bar4Anim,
        orbital1Anim, orbital2Anim
      ];
      
      allAnimations.forEach(anim => {
        anim.stopAnimation();
        anim.removeAllListeners();
      });
    };
  }, [
    fadeAnim, rotateAnim, scaleAnim, progressAnim,
    dot1Anim, dot2Anim, dot3Anim,
    bar1Anim, bar2Anim, bar3Anim, bar4Anim,
    orbital1Anim, orbital2Anim
  ]);
  
  // ========================================================================================
  // ANIMATION SYSTEM - ENTERPRISE PERFORMANCE
  // ========================================================================================
  
  const startAnimations = () => {
    // Clear any existing animations
    activeAnimations.current.forEach(animation => animation.stop());
    activeAnimations.current = [];
    
    // Fade in animation
    const fadeAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: animations.duration.fast,
      delay: animationDelay,
      useNativeDriver: true,
    });
    
    // Scale in animation
    const scaleAnimation = Animated.spring(scaleAnim, {
      toValue: 1,
      delay: animationDelay,
      useNativeDriver: true,
    });
    
    activeAnimations.current.push(fadeAnimation, scaleAnimation);
    fadeAnimation.start();
    scaleAnimation.start();
    
    // Variant-specific animations
    switch (variant) {
      case 'spinner':
        // Continuous rotation
        const spinnerAnimation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
          })
        );
        activeAnimations.current.push(spinnerAnimation);
        spinnerAnimation.start();
        break;
        
      case 'dots':
        // Staggered dot animation with proper cleanup tracking
        const createDotAnimation = (animValue: Animated.Value, delay: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: animationDuration / 3,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0,
                duration: animationDuration / 3,
                useNativeDriver: true,
              }),
            ])
          );
        };
        
        const dot1Animation = createDotAnimation(dot1Anim, 0);
        const dot2Animation = createDotAnimation(dot2Anim, animationDuration / 6);
        const dot3Animation = createDotAnimation(dot3Anim, animationDuration / 3);
        
        activeAnimations.current.push(dot1Animation, dot2Animation, dot3Animation);
        dot1Animation.start();
        dot2Animation.start();
        dot3Animation.start();
        break;
        
      case 'pulse':
        // Pulsing animation
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: animationDuration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: animationDuration / 2,
              useNativeDriver: true,
            }),
          ])
        );
        activeAnimations.current.push(pulseAnimation);
        pulseAnimation.start();
        break;
        
      case 'bars':
        // Animated bars with proper cleanup tracking
        const createBarAnimation = (animValue: Animated.Value, delay: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: animationDuration / 4,
                delay,
                useNativeDriver: false,
              }),
              Animated.timing(animValue, {
                toValue: 0.3,
                duration: animationDuration / 4,
                useNativeDriver: false,
              }),
            ])
          );
        };
        
        const bar1Animation = createBarAnimation(bar1Anim, 0);
        const bar2Animation = createBarAnimation(bar2Anim, animationDuration / 8);
        const bar3Animation = createBarAnimation(bar3Anim, animationDuration / 6);
        const bar4Animation = createBarAnimation(bar4Anim, animationDuration / 4);
        
        activeAnimations.current.push(bar1Animation, bar2Animation, bar3Animation, bar4Animation);
        bar1Animation.start();
        bar2Animation.start();
        bar3Animation.start();
        bar4Animation.start();
        break;
        
      case 'orbital':
        // Orbital motion with proper cleanup
        const orbital1Animation = Animated.loop(
          Animated.timing(orbital1Anim, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
          })
        );
        
        const orbital2Animation = Animated.loop(
          Animated.timing(orbital2Anim, {
            toValue: 1,
            duration: animationDuration * 1.5,
            useNativeDriver: true,
          })
        );
        
        activeAnimations.current.push(orbital1Animation, orbital2Animation);
        orbital1Animation.start();
        orbital2Animation.start();
        break;
        
      case 'quantum':
        // Quantum particle effect with proper cleanup
        const quantumAnimation = Animated.loop(
          Animated.parallel([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: animationDuration * 2,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: animationDuration / 3,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: animationDuration / 3,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: animationDuration / 3,
                useNativeDriver: true,
              }),
            ])
          ])
        );
        activeAnimations.current.push(quantumAnimation);
        quantumAnimation.start();
        break;
    }
  };
  
  const stopAnimations = () => {
    // Stop all active animations
    activeAnimations.current.forEach(animation => {
      animation.stop();
    });
    activeAnimations.current = [];
    
    // Fade out animation
    const fadeOutAnimation = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: animations.duration.fast,
      useNativeDriver: true,
    });
    
    fadeOutAnimation.start();
  };
  
  // EFFECTS - VISIBILITY CONTROL with proper cleanup
  useEffect(() => {
    if (visible) {
      startAnimations();
    } else {
      stopAnimations();
    }
    
    // Cleanup function
    return () => {
      activeAnimations.current.forEach(animation => animation.stop());
      activeAnimations.current = [];
    };
  }, [visible]); // Removed all animation dependencies to prevent recreation
  
  // Progress animation
  useEffect(() => {
    if (progress !== undefined) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: animations.duration.normal,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, animations]);
  
  // ========================================================================================
  // STYLE COMPUTATION - SIZE & POSITION VARIANTS
  // ========================================================================================
  
  const sizeConfig = useMemo(() => {
    const configs = {
      small: { container: 32, element: 16, spacing: 8 },
      medium: { container: 48, element: 24, spacing: 12 },
      large: { container: 64, element: 32, spacing: 16 },
    };
    return configs[size];
  }, [size]);
  
  const loaderColor = color || colors.interactive.text;
  
  const containerStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
    };
    
    const positionStyles: Record<LoaderPosition, ViewStyle> = {
      center: {
        position: overlay ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      },
      top: {
        paddingTop: spacing.xl,
      },
      bottom: {
        paddingBottom: spacing.xl,
      },
      inline: {
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
      },
    };
    
    return {
      ...baseStyle,
      ...positionStyles[position],
    };
  }, [position, overlay, spacing, rtl]);
  
  const overlayStyles = useMemo(() => {
    if (!overlay) return {};
    
    return {
      backgroundColor: overlayColor || `rgba(0, 0, 0, ${overlayOpacity})`,
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    };
  }, [overlay, overlayColor, overlayOpacity]);
  
  // ========================================================================================
  // RENDER HELPERS - VARIANT IMPLEMENTATIONS
  // ========================================================================================
  
  const renderSpinner = () => (
    <ActivityIndicator
      size={size === 'small' ? 'small' : 'large'}
      color={loaderColor}
    />
  );
  
  const renderDots = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: sizeConfig.spacing }}>
      {[dot1Anim, dot2Anim, dot3Anim].map((anim, index) => (
        <Animated.View
          key={index}
          style={{
            width: sizeConfig.element / 2,
            height: sizeConfig.element / 2,
            borderRadius: sizeConfig.element / 4,
            backgroundColor: loaderColor,
            opacity: anim,
          }}
        />
      ))}
    </View>
  );
  
  const renderPulse = () => (
    <Animated.View
      style={{
        width: sizeConfig.container,
        height: sizeConfig.container,
        borderRadius: sizeConfig.container / 2,
        backgroundColor: loaderColor,
        transform: [{ scale: scaleAnim }],
      }}
    />
  );
  
  const renderBars = () => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: sizeConfig.spacing / 2 }}>
      {[bar1Anim, bar2Anim, bar3Anim, bar4Anim].map((anim, index) => (
        <Animated.View
          key={index}
          style={{
            width: sizeConfig.element / 3,
            backgroundColor: loaderColor,
            borderRadius: sizeConfig.element / 6,
            height: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [sizeConfig.element / 2, sizeConfig.container],
            }),
          }}
        />
      ))}
    </View>
  );
  
  const renderOrbital = () => (
    <View style={{ width: sizeConfig.container, height: sizeConfig.container }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: sizeConfig.element / 3,
          height: sizeConfig.element / 3,
          borderRadius: sizeConfig.element / 6,
          backgroundColor: loaderColor,
          transform: [
            {
              translateX: orbital1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, sizeConfig.container - sizeConfig.element / 3],
              }),
            },
            {
              translateY: orbital1Anim.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [
                  sizeConfig.container / 2,
                  0,
                  sizeConfig.container / 2,
                  sizeConfig.container - sizeConfig.element / 3,
                  sizeConfig.container / 2,
                ],
              }),
            },
          ],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: sizeConfig.element / 4,
          height: sizeConfig.element / 4,
          borderRadius: sizeConfig.element / 8,
          backgroundColor: loaderColor,
          opacity: 0.7,
          transform: [
            {
              translateX: orbital2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [sizeConfig.container - sizeConfig.element / 4, 0],
              }),
            },
            {
              translateY: orbital2Anim.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [
                  sizeConfig.container / 2,
                  sizeConfig.container - sizeConfig.element / 4,
                  sizeConfig.container / 2,
                  0,
                  sizeConfig.container / 2,
                ],
              }),
            },
          ],
        }}
      />
    </View>
  );
  
  const renderQuantum = () => (
    <Animated.View
      style={{
        width: sizeConfig.container,
        height: sizeConfig.container,
        transform: [
          { rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }) },
          { scale: scaleAnim },
        ],
      }}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            width: sizeConfig.element / 4,
            height: sizeConfig.element / 4,
            borderRadius: sizeConfig.element / 8,
            backgroundColor: loaderColor,
            opacity: 0.3 + (index * 0.1),
            transform: [
              { rotate: `${index * 60}deg` },
              { translateY: -sizeConfig.container / 3 },
            ],
          }}
        />
      ))}
    </Animated.View>
  );
  
  const renderLoader = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'bars': return renderBars();
      case 'orbital': return renderOrbital();
      case 'quantum': return renderQuantum();
      default: return renderSpinner();
    }
  };
  
  const renderText = () => {
    if (!text && !subtext) return null;
    
    return (
      <View style={{ 
        marginTop: position === 'inline' ? 0 : spacing.md,
        marginLeft: position === 'inline' && !rtl ? spacing.md : 0,
        marginRight: position === 'inline' && rtl ? spacing.md : 0,
        alignItems: position === 'inline' ? 'flex-start' : 'center',
      }}>
        {text && (
          <Text
            style={[
              {
                ...typography.scale.body,
                fontFamily: persianText ? typography.families.persian : typography.families.primary,
                color: colors.interactive.text,
                textAlign: rtl ? 'right' : 'left',
              },
              textStyle,
            ]}
          >
            {text}
          </Text>
        )}
        {subtext && (
          <Text
            style={[
              {
                ...typography.scale.caption,
                fontFamily: persianText ? typography.families.persian : typography.families.primary,
                color: colors.interactive.textSecondary,
                textAlign: rtl ? 'right' : 'left',
                marginTop: spacing.xs,
              },
              subtextStyle,
            ]}
          >
            {subtext}
          </Text>
        )}
      </View>
    );
  };
  
  const renderProgress = () => {
    if (!showProgress || progress === undefined) return null;
    
    return (
      <View style={{
        width: '80%',
        height: 4,
        backgroundColor: colors.interactive.border,
        borderRadius: 2,
        marginTop: spacing.md,
        overflow: 'hidden',
      }}>
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: loaderColor,
            borderRadius: 2,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  if (!visible) return null;
  
  return (
    <>
      {overlay && <View style={overlayStyles} />}
      <Animated.View
        style={[
          containerStyles,
          {
            opacity: fadeAnim,
            backgroundColor: backgroundColor,
          },
          style,
        ]}
        accessibilityLabel={accessibilityLabel || `Loading ${text || ''}`}
        accessibilityRole="progressbar"
        testID={testID}
      >
        {renderLoader()}
        {renderText()}
        {renderProgress()}
      </Animated.View>
    </>
  );
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const SpinnerLoader: React.FC<Omit<LoaderProps, 'variant'>> = (props) => (
  <Loader {...props} variant="spinner" />
);

export const DotsLoader: React.FC<Omit<LoaderProps, 'variant'>> = (props) => (
  <Loader {...props} variant="dots" />
);

export const PulseLoader: React.FC<Omit<LoaderProps, 'variant'>> = (props) => (
  <Loader {...props} variant="pulse" />
);

export const BarsLoader: React.FC<Omit<LoaderProps, 'variant'>> = (props) => (
  <Loader {...props} variant="bars" />
);

export const OrbitalLoader: React.FC<Omit<LoaderProps, 'variant'>> = (props) => (
  <Loader {...props} variant="orbital" />
);

export const QuantumLoader: React.FC<Omit<LoaderProps, 'variant'>> = (props) => (
  <Loader {...props} variant="quantum" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Loader;
