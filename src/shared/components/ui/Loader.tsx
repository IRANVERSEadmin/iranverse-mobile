// src/components/ui/Loader.tsx
// IRANVERSE Enterprise Loader - Revolutionary Loading States
// Tesla-inspired minimalism with multiple variants and quantum effects
// Built for 90M users - Performance-optimized loading experience

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
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
  Easing,
  ActivityIndicator,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Logo from './Logo';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const LOADER_CONFIG = {
  ANIMATION_DURATION: {
    SPINNER: 1000,
    SKELETON: 1500,
    PULSE: 2000,
    QUANTUM: 3000,
    LOGO: 1200,
  },
  SIZES: {
    small: 24,
    medium: 36,
    large: 48,
    xlarge: 64,
  },
  SKELETON_LINES: {
    small: 2,
    medium: 3,
    large: 4,
    xlarge: 5,
  },
  QUANTUM_PARTICLES: 12,
  LOGO_SCALE_RANGE: [0.8, 1.2],
  PERFORMANCE_THRESHOLD: 60,
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type LoaderVariant = 'spinner' | 'skeleton' | 'pulse' | 'quantum' | 'logo';
export type LoaderSize = 'small' | 'medium' | 'large' | 'xlarge' | number;
export type LoaderSpeed = 'slow' | 'normal' | 'fast';

export interface LoaderProps {
  // Core
  variant?: LoaderVariant;
  size?: LoaderSize;
  color?: string;
  speed?: LoaderSpeed;
  
  // Progress
  progress?: number;
  showProgress?: boolean;
  progressColor?: string;
  
  // Text
  text?: string;
  textStyle?: TextStyle;
  textPosition?: 'below' | 'center' | 'above';
  
  // Visual
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  blur?: boolean;
  
  // Container
  fullScreen?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  
  // Animation
  animated?: boolean;
  delay?: number;
  
  // Callbacks
  onTimeout?: () => void;
  timeout?: number;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Enterprise
  analytics?: {
    loaderName?: string;
    category?: string;
    trackPerformance?: boolean;
  };
  
  // Persian/RTL
  rtl?: boolean;
}

export interface LoaderRef {
  start: () => void;
  stop: () => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useLoaderAnimation = (
  variant: LoaderVariant,
  speed: LoaderSpeed,
  animated: boolean
) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const quantumValues = useRef(
    Array.from({ length: LOADER_CONFIG.QUANTUM_PARTICLES }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;
  const logoScaleValue = useRef(new Animated.Value(1)).current;
  const logoOpacityValue = useRef(new Animated.Value(0.7)).current;
  
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Speed multiplier
  const speedMultiplier = useMemo(() => {
    switch (speed) {
      case 'slow': return 1.5;
      case 'fast': return 0.7;
      default: return 1;
    }
  }, [speed]);
  
  // Start animations
  const startAnimation = useCallback(() => {
    if (!animated) return;
    
    const duration = LOADER_CONFIG.ANIMATION_DURATION[variant.toUpperCase() as keyof typeof LOADER_CONFIG.ANIMATION_DURATION] * speedMultiplier;
    
    switch (variant) {
      case 'spinner':
        animationRef.current = Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'skeleton':
        animationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerValue, {
              toValue: 1,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(shimmerValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
        break;
        
      case 'pulse':
        animationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseValue, {
              toValue: 1,
              duration: duration * 0.5,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseValue, {
              toValue: 0,
              duration: duration * 0.5,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
        
      case 'quantum':
        const quantumAnimations = quantumValues.map((particle, index) => {
          const angle = (index / LOADER_CONFIG.QUANTUM_PARTICLES) * Math.PI * 2;
          const radius = 30;
          
          return Animated.loop(
            Animated.parallel([
              Animated.sequence([
                Animated.timing(particle.x, {
                  toValue: Math.cos(angle) * radius,
                  duration,
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                  useNativeDriver: true,
                }),
                Animated.timing(particle.x, {
                  toValue: 0,
                  duration,
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle.y, {
                  toValue: Math.sin(angle) * radius,
                  duration,
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                  useNativeDriver: true,
                }),
                Animated.timing(particle.y, {
                  toValue: 0,
                  duration,
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle.opacity, {
                  toValue: 1,
                  duration: duration * 0.3,
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                  useNativeDriver: true,
                }),
                Animated.timing(particle.opacity, {
                  toValue: 0,
                  duration: duration * 0.7,
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                  useNativeDriver: true,
                }),
              ]),
            ])
          );
        });
        
        animationRef.current = Animated.parallel(quantumAnimations);
        break;
        
      case 'logo':
        animationRef.current = Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(logoScaleValue, {
                toValue: LOADER_CONFIG.LOGO_SCALE_RANGE[1],
                duration: duration * 0.5,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(logoScaleValue, {
                toValue: LOADER_CONFIG.LOGO_SCALE_RANGE[0],
                duration: duration * 0.5,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(logoOpacityValue, {
                toValue: 1,
                duration: duration * 0.5,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(logoOpacityValue, {
                toValue: 0.7,
                duration: duration * 0.5,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        break;
    }
    
    animationRef.current?.start();
  }, [variant, speed, speedMultiplier, animated, spinValue, shimmerValue, pulseValue, quantumValues, logoScaleValue, logoOpacityValue]);
  
  // Stop animation
  const stopAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);
  
  // Reset animation
  const resetAnimation = useCallback(() => {
    stopAnimation();
    spinValue.setValue(0);
    pulseValue.setValue(0);
    shimmerValue.setValue(0);
    quantumValues.forEach(particle => {
      particle.x.setValue(0);
      particle.y.setValue(0);
      particle.opacity.setValue(0);
    });
    logoScaleValue.setValue(1);
    logoOpacityValue.setValue(0.7);
  }, [stopAnimation, spinValue, pulseValue, shimmerValue, quantumValues, logoScaleValue, logoOpacityValue]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);
  
  return {
    spinValue,
    pulseValue,
    shimmerValue,
    quantumValues,
    logoScaleValue,
    logoOpacityValue,
    startAnimation,
    stopAnimation,
    resetAnimation,
  };
};

// ========================================================================================
// VARIANT COMPONENTS
// ========================================================================================

const SpinnerLoader = memo<{
  size: number;
  color: string;
  spinValue: Animated.Value;
}>(({ size, color, spinValue }) => {
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [{ rotate: spin }],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: size / 10,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: color,
        }}
      />
    </Animated.View>
  );
});

SpinnerLoader.displayName = 'SpinnerLoader';

const SkeletonLoader = memo<{
  lines: number;
  lineHeight: number;
  spacing: number;
  animated: boolean;
  shimmerValue: Animated.Value;
  theme: any;
}>(({ lines, lineHeight, spacing, animated, shimmerValue, theme }) => {
  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });
  
  return (
    <View style={{ width: '100%' }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Animated.View
          key={index}
          style={{
            height: lineHeight,
            backgroundColor: theme.colors.glass.medium,
            borderRadius: lineHeight / 2,
            marginBottom: index < lines - 1 ? spacing : 0,
            width: index === lines - 1 ? '60%' : '100%',
            opacity: animated ? shimmerOpacity : 0.5,
          }}
        />
      ))}
    </View>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

const PulseLoader = memo<{
  size: number;
  color: string;
  pulseValue: Animated.Value;
}>(({ size, color, pulseValue }) => {
  const scale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  
  const opacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });
  
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
      <View
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: size * 0.3,
          backgroundColor: color,
        }}
      />
    </View>
  );
});

PulseLoader.displayName = 'PulseLoader';

const QuantumLoader = memo<{
  size: number;
  color: string;
  quantumValues: Array<{ x: Animated.Value; y: Animated.Value; opacity: Animated.Value }>;
}>(({ size, color, quantumValues }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {quantumValues.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            width: size / 8,
            height: size / 8,
            borderRadius: size / 16,
            backgroundColor: color,
            opacity: particle.opacity,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
            ],
          }}
        />
      ))}
    </View>
  );
});

QuantumLoader.displayName = 'QuantumLoader';

const LogoLoader = memo<{
  size: number;
  color: string;
  logoScaleValue: Animated.Value;
  logoOpacityValue: Animated.Value;
}>(({ size, color, logoScaleValue, logoOpacityValue }) => {
  const logoSize = size <= 40 ? 'button' : size <= 80 ? 'small' : size <= 120 ? 'medium' : 'large';
  
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: logoOpacityValue,
        transform: [{ scale: logoScaleValue }],
      }}
    >
      <Logo
        variant="auto"
        size={logoSize}
        style={{
          maxWidth: size * 0.8,
          maxHeight: size * 0.8,
        }}
      />
    </Animated.View>
  );
});

LogoLoader.displayName = 'LogoLoader';

// ========================================================================================
// MAIN LOADER COMPONENT
// ========================================================================================

export const Loader = memo(forwardRef<LoaderRef, LoaderProps>((props, ref) => {
  const {
    variant = 'spinner',
    size = 'medium',
    color,
    speed = 'normal',
    progress,
    showProgress = false,
    progressColor,
    text,
    textStyle,
    textPosition = 'below',
    overlay = false,
    overlayColor = 'rgba(0, 0, 0, 0.8)',
    overlayOpacity = 0.8,
    blur = false,
    fullScreen = false,
    style,
    containerStyle,
    animated = true,
    delay = 0,
    onTimeout,
    timeout,
    accessibilityLabel = 'Loading',
    accessibilityHint = 'Please wait while content is loading',
    testID = 'loader',
    analytics,
    rtl = false,
  } = props;
  
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(delay === 0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const performanceRef = useRef({ startTime: Date.now(), frameCount: 0 });
  
  // Resolve size
  const resolvedSize = useMemo(() => {
    if (typeof size === 'number') return size;
    return LOADER_CONFIG.SIZES[size];
  }, [size]);
  
  // Resolve color
  const resolvedColor = useMemo(() => {
    return color || theme.colors.accent.primary;
  }, [color, theme]);
  
  // Animations
  const animations = useLoaderAnimation(variant, speed, animated);
  
  // Start animation
  useEffect(() => {
    if (isVisible && animated) {
      animations.startAnimation();
    }
    
    return () => {
      animations.stopAnimation();
    };
  }, [isVisible, animated, animations]);
  
  // Delay handling
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay]);
  
  // Timeout handling
  useEffect(() => {
    if (timeout && onTimeout) {
      timeoutRef.current = setTimeout(() => {
        onTimeout();
      }, timeout);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [timeout, onTimeout]);
  
  // Performance monitoring
  useEffect(() => {
    if (analytics?.trackPerformance) {
      const frameInterval = setInterval(() => {
        performanceRef.current.frameCount++;
        const elapsed = Date.now() - performanceRef.current.startTime;
        const fps = (performanceRef.current.frameCount / elapsed) * 1000;
        
        if (fps < LOADER_CONFIG.PERFORMANCE_THRESHOLD) {
          console.warn(`Loader performance warning: ${fps.toFixed(2)} FPS`);
        }
      }, 1000);
      
      return () => clearInterval(frameInterval);
    }
  }, [analytics?.trackPerformance]);
  
  // Announce to screen readers
  useEffect(() => {
    if (isVisible && Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(accessibilityLabel);
    }
  }, [isVisible, accessibilityLabel]);
  
  // Imperative API
  useImperativeHandle(ref, () => ({
    start: () => {
      setIsVisible(true);
      animations.startAnimation();
    },
    stop: () => {
      setIsVisible(false);
      animations.stopAnimation();
    },
    setProgress: (_newProgress: number) => {
      // Progress update logic would go here
    },
    reset: () => {
      setIsVisible(false);
      animations.resetAnimation();
    },
  }), [animations]);
  
  // Render loader variant
  const renderLoader = useMemo(() => {
    switch (variant) {
      case 'spinner':
        return (
          <SpinnerLoader
            size={resolvedSize}
            color={resolvedColor}
            spinValue={animations.spinValue}
          />
        );
        
      case 'skeleton':
        return (
          <SkeletonLoader
            lines={LOADER_CONFIG.SKELETON_LINES[typeof size === 'string' ? size : 'medium']}
            lineHeight={resolvedSize / 3}
            spacing={resolvedSize / 6}
            animated={animated}
            shimmerValue={animations.shimmerValue}
            theme={theme}
          />
        );
        
      case 'pulse':
        return (
          <PulseLoader
            size={resolvedSize}
            color={resolvedColor}
            pulseValue={animations.pulseValue}
          />
        );
        
      case 'quantum':
        return (
          <QuantumLoader
            size={resolvedSize}
            color={resolvedColor}
            quantumValues={animations.quantumValues}
          />
        );
        
      case 'logo':
        return (
          <LogoLoader
            size={resolvedSize}
            color={resolvedColor}
            logoScaleValue={animations.logoScaleValue}
            logoOpacityValue={animations.logoOpacityValue}
          />
        );
        
      default:
        return (
          <ActivityIndicator
            size={resolvedSize > 36 ? 'large' : 'small'}
            color={resolvedColor}
          />
        );
    }
  }, [variant, resolvedSize, resolvedColor, animated, size, animations, theme]);
  
  // Progress bar
  const renderProgress = useMemo(() => {
    if (!showProgress || progress === undefined) return null;
    
    return (
      <View
        style={{
          width: '100%',
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          marginTop: theme.spacing.sm,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            backgroundColor: progressColor || resolvedColor,
            borderRadius: 2,
          }}
        />
      </View>
    );
  }, [showProgress, progress, progressColor, resolvedColor, theme]);
  
  // Text
  const renderText = useMemo(() => {
    if (!text) return null;
    
    return (
      <Text
        style={[
          {
            fontSize: 14,
            fontFamily: theme.typography.families.primary,
            color: theme.colors.interactive.text.primary,
            textAlign: rtl ? 'right' : 'center',
            marginTop: textPosition === 'below' ? theme.spacing.md : 0,
            marginBottom: textPosition === 'above' ? theme.spacing.md : 0,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    );
  }, [text, textStyle, textPosition, theme, rtl]);
  
  // Container styles
  const getContainerStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
    };
    
    if (fullScreen) {
      const { width, height } = Dimensions.get('window');
      return {
        ...baseStyle,
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        zIndex: 9999,
      };
    }
    
    if (overlay) {
      return {
        ...baseStyle,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: overlayColor,
        opacity: overlayOpacity,
        ...(blur && Platform.OS === 'ios' && { backdropFilter: 'blur(10px)' }),
      };
    }
    
    return baseStyle;
  }, [fullScreen, overlay, overlayColor, overlayOpacity, blur]);
  
  // Content layout
  const contentLayout = useMemo(() => {
    const content = (
      <>
        {textPosition === 'above' && renderText}
        {renderLoader}
        {renderProgress}
        {textPosition === 'below' && renderText}
      </>
    );
    
    if (textPosition === 'center' && text) {
      return (
        <View style={{ alignItems: 'center' }}>
          <View style={{ position: 'absolute' }}>
            {renderLoader}
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center', height: resolvedSize }}>
            {renderText}
          </View>
          {renderProgress}
        </View>
      );
    }
    
    return content;
  }, [textPosition, text, renderText, renderLoader, renderProgress, resolvedSize]);
  
  if (!isVisible) return null;
  
  return (
    <View
      style={[getContainerStyle, containerStyle]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        busy: true,
      }}
      testID={testID}
    >
      <View style={[{ alignItems: 'center' }, style]}>
        {contentLayout}
      </View>
    </View>
  );
}));

Loader.displayName = 'Loader';

// ========================================================================================
// PRESET COMPONENTS
// ========================================================================================

export const PageLoader = memo<Omit<LoaderProps, 'fullScreen' | 'overlay'>>((props) => (
  <Loader {...props} fullScreen overlay />
));

PageLoader.displayName = 'PageLoader';

export const InlineLoader = memo<Omit<LoaderProps, 'size'>>((props) => (
  <Loader {...props} size="small" />
));

InlineLoader.displayName = 'InlineLoader';

export const SkeletonScreen = memo<{
  lines?: number;
  animated?: boolean;
  style?: ViewStyle;
}>((props) => (
  <Loader {...props} variant="skeleton" />
));

SkeletonScreen.displayName = 'SkeletonScreen';

export const QuantumFieldLoader = memo<Omit<LoaderProps, 'variant'>>((props) => (
  <Loader {...props} variant="quantum" />
));

QuantumFieldLoader.displayName = 'QuantumFieldLoader';

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Loader;