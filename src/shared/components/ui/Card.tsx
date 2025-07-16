// src/components/ui/Card.tsx
// IRANVERSE Enterprise Card - Modular Surface Foundation
// Tesla-inspired minimalism with composable architecture and enterprise-grade interactions
// Built for 90M users - Revolutionary surface component system

import React, {
  memo,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
  createContext,
  useContext,
} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Animated,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ScrollView,
  Platform,
  Vibration,
  ImageSourcePropType,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
} from 'react-native';
import Text from './Text';
import { useTheme } from '../../theme/ThemeProvider';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const CARD_SECURITY = {
  GESTURE_DEBOUNCING: true,
  SAFE_PRESS_AREAS: true,
  XSS_PREVENTION: true,
  ACCESSIBILITY_COMPLIANCE: true,
  PERFORMANCE_MONITORING: true,
} as const;

const CARD_PERFORMANCE = {
  ANIMATION_FRAME_RATE: 60,
  GESTURE_RESPONSE_TIME: 100,
  LOADING_TIMEOUT: 5000,
  MEMORY_LEAK_PREVENTION: true,
  DEBOUNCE_DELAY: 300,
} as const;

const CARD_ANIMATIONS = {
  hover: {
    scale: 1.02,
    duration: 200,
    easing: 'ease-out',
  },
  press: {
    scale: 0.98,
    duration: 100,
    easing: 'ease-in',
  },
  entrance: {
    fade: {
      opacity: [0, 1],
      duration: 400,
    },
    slide: {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 400,
    },
    scale: {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 350,
    },
  },
  selection: {
    borderColor: ['transparent', '#EC602A'],
    borderWidth: [1, 2],
    duration: 250,
  },
  loading: {
    shimmer: {
      opacity: [0.3, 0.7, 0.3],
      duration: 1500,
      repeat: -1,
    },
  },
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type CardVariant = 'default' | 'glass' | 'elevated' | 'outlined' | 'interactive' | 'minimal' | 'grok-dark';
export type CardSize = 'small' | 'medium' | 'large';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';
export type CardBorderRadius = 'small' | 'medium' | 'large' | 'xlarge';
export type CardElevation = 'none' | 'small' | 'medium' | 'large';
export type EntranceAnimation = 'fade' | 'slide' | 'scale' | 'none';
export type HapticFeedback = 'light' | 'medium' | 'heavy';

export interface CardProps {
  // Core
  children?: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  fullWidth?: boolean;
  
  // Design
  padding?: CardPadding;
  borderRadius?: CardBorderRadius;
  elevation?: CardElevation;
  
  // Interaction
  onPress?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
  loading?: boolean;
  
  // State
  selected?: boolean;
  focused?: boolean;
  error?: boolean;
  
  // Styling
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  
  // Advanced
  as?: React.ComponentType<any>;
  rippleEffect?: boolean;
  hapticFeedback?: HapticFeedback;
  
  // Animation
  disableAnimations?: boolean;
  entranceAnimation?: EntranceAnimation;
  entranceDelay?: number;
  
  // Accessibility
  accessibilityRole?: 'button' | 'article' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Enterprise
  analytics?: {
    cardName?: string;
    category?: string;
    trackInteractions?: boolean;
  };
  
  // Persian/RTL
  rtl?: boolean;
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onTitlePress?: () => void;
  style?: ViewStyle;
  rtl?: boolean;
}

export interface CardBodyProps {
  children: React.ReactNode;
  padding?: CardPadding;
  scrollable?: boolean;
  style?: ViewStyle;
}

export interface CardFooterProps {
  children?: React.ReactNode;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  centered?: boolean;
  style?: ViewStyle;
  rtl?: boolean;
}

export interface CardImageProps {
  source: ImageSourcePropType;
  height?: number;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  style?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  onPress?: () => void;
}

export interface CardSkeletonProps {
  lines?: number;
  showImage?: boolean;
  imageHeight?: number;
  style?: ViewStyle;
}

export interface CardRef {
  focus: () => void;
  blur: () => void;
  animate: (animation: 'bounce' | 'shake' | 'pulse') => void;
  getMetrics: () => { width: number; height: number; x: number; y: number };
}

// ========================================================================================
// CARD CONTEXT
// ========================================================================================

interface CardContextValue {
  variant: CardVariant;
  padding: CardPadding;
  loading: boolean;
  rtl: boolean;
}

const CardContext = createContext<CardContextValue>({
  variant: 'default',
  padding: 'medium',
  loading: false,
  rtl: false,
});

const useCardContext = () => useContext(CardContext);

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useCardAnimations = (
  entranceAnimation: EntranceAnimation,
  entranceDelay: number,
  disableAnimations: boolean
) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(entranceAnimation === 'none' ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(entranceAnimation === 'slide' ? 20 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const borderWidthAnim = useRef(new Animated.Value(1)).current;
  
  // Entrance animation
  useEffect(() => {
    if (disableAnimations || entranceAnimation === 'none') return;
    
    const animations: Animated.CompositeAnimation[] = [];
    
    switch (entranceAnimation) {
      case 'fade':
        animations.push(
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: CARD_ANIMATIONS.entrance.fade.duration,
            delay: entranceDelay,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'slide':
        animations.push(
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: CARD_ANIMATIONS.entrance.slide.duration,
              delay: entranceDelay,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 0,
              duration: CARD_ANIMATIONS.entrance.slide.duration,
              delay: entranceDelay,
              useNativeDriver: true,
            }),
          ])
        );
        break;
        
      case 'scale':
        animations.push(
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: CARD_ANIMATIONS.entrance.scale.duration,
              delay: entranceDelay,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 8,
              tension: 40,
              delay: entranceDelay,
              useNativeDriver: true,
            }),
          ])
        );
        break;
    }
    
    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [entranceAnimation, entranceDelay, disableAnimations]);
  
  const animatePress = useCallback(() => {
    if (disableAnimations) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: CARD_ANIMATIONS.press.scale,
        duration: CARD_ANIMATIONS.press.duration,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disableAnimations, scaleAnim]);
  
  const animateSelection = useCallback((selected: boolean) => {
    if (disableAnimations) return;
    
    // Use setValue instead of stopAnimation to avoid frozen object mutations
    borderColorAnim.setValue(selected ? 1 : 0);
    borderWidthAnim.setValue(selected ? 2 : 1);
  }, [disableAnimations, borderColorAnim, borderWidthAnim]);
  
  const animateBounce = useCallback(() => {
    if (disableAnimations) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disableAnimations, scaleAnim]);
  
  const animateShake = useCallback(() => {
    if (disableAnimations) return;
    
    const shakeAnim = new Animated.Value(0);
    
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    
    return shakeAnim;
  }, [disableAnimations]);
  
  return {
    scaleAnim,
    opacityAnim,
    translateYAnim,
    borderColorAnim,
    borderWidthAnim,
    animatePress,
    animateSelection,
    animateBounce,
    animateShake,
  };
};

// ========================================================================================
// GESTURE HANDLING
// ========================================================================================

const useSwipeGestures = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  disabled?: boolean
) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastPressTime = useRef(0);
  
  const panResponder = useMemo(() => {
    if (disabled || (!onSwipeLeft && !onSwipeRight)) {
      return null;
    }
    
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: Animated.event([null, { dx: translateX }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 100;
        
        if (gestureState.dx > swipeThreshold && onSwipeRight) {
          onSwipeRight();
        } else if (gestureState.dx < -swipeThreshold && onSwipeLeft) {
          onSwipeLeft();
        }
        
        Animated.spring(translateX, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: false,
        }).start();
      },
    });
  }, [disabled, onSwipeLeft, onSwipeRight, translateX]);
  
  const handlePress = useCallback((onPress?: () => void) => {
    if (!onPress || !CARD_SECURITY.GESTURE_DEBOUNCING) {
      onPress?.();
      return;
    }
    
    const now = Date.now();
    if (now - lastPressTime.current < CARD_PERFORMANCE.DEBOUNCE_DELAY) {
      return;
    }
    
    lastPressTime.current = now;
    onPress();
  }, []);
  
  return { panResponder, translateX, handlePress };
};

// ========================================================================================
// MAIN CARD COMPONENT
// ========================================================================================

const CardComponent = memo(forwardRef<CardRef, CardProps>((props, ref) => {
  const {
    children,
    variant = 'default',
    fullWidth = false,
    padding = 'medium',
    borderRadius = 'medium',
    elevation = variant === 'elevated' ? 'medium' : 'none',
    onPress,
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    disabled = false,
    loading = false,
    selected = false,
    focused = false,
    error = false,
    style,
    contentStyle,
    as: Component = onPress ? TouchableOpacity : View,
    hapticFeedback = 'medium',
    disableAnimations = false,
    entranceAnimation = 'fade',
    entranceDelay = 0,
    accessibilityRole = onPress ? 'button' : 'none',
    accessibilityLabel,
    accessibilityHint,
    testID = 'card',
    analytics,
    rtl = false,
  } = props;
  
  const theme = useTheme();
  const viewRef = useRef<View>(null);
  const [metrics, setMetrics] = useState({ width: 0, height: 0, x: 0, y: 0 });
  
  // Animations
  const animations = useCardAnimations(entranceAnimation, entranceDelay, disableAnimations);
  const { panResponder, translateX, handlePress } = useSwipeGestures(onSwipeLeft, onSwipeRight, disabled);
  
  // Handle selection animation - disabled to prevent frozen object mutations
  // useEffect(() => {
  //   animations.animateSelection(selected);
  // }, [selected, animations]);
  
  // Imperative API
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (accessibilityRole === 'button') {
        viewRef.current?.focus?.();
      }
    },
    blur: () => {
      viewRef.current?.blur?.();
    },
    animate: (animation: 'bounce' | 'shake' | 'pulse') => {
      switch (animation) {
        case 'bounce':
          animations.animateBounce();
          break;
        case 'shake':
          animations.animateShake();
          break;
        case 'pulse':
          // Pulse animation implementation
          break;
      }
    },
    getMetrics: () => metrics,
  }), [metrics, animations]);
  
  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if (!hapticFeedback || Platform.OS === 'web') return;
    
    const patterns = {
      light: 30,
      medium: 50,
      heavy: 100,
    };
    
    Vibration.vibrate(patterns[hapticFeedback]);
  }, [hapticFeedback]);
  
  // Event handlers
  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    animations.animatePress();
    triggerHaptic();
  }, [disabled, loading, animations, triggerHaptic]);
  
  const handlePressEvent = useCallback(() => {
    if (disabled || loading) return;
    
    handlePress(onPress);
    
    if (analytics?.trackInteractions) {
      console.log('Card interaction:', analytics.cardName);
    }
  }, [disabled, loading, onPress, analytics, handlePress]);
  
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setMetrics({ width, height, x, y });
  }, []);
  
  // Styles
  const borderRadiusValues = {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
  };
  
  const containerStyle = useMemo((): any => {
    const paddingValues = {
      none: 0,
      small: 12,
      medium: 16,
      large: 20,
    };
    
    const baseStyle: ViewStyle = {
      padding: paddingValues[padding],
      borderRadius: borderRadiusValues[borderRadius],
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.6 : 1,
      overflow: 'hidden',
    };
    
    // Variant styles
    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: theme.colors.foundation.darkest,
        borderWidth: 1,
        borderColor: theme.colors.interactive.border.medium,
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        // Note: backdropFilter would be applied via platform-specific implementation
      },
      elevated: {
        backgroundColor: theme.colors.foundation.darker,
        borderWidth: 0,
        ...theme.shadows.medium,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.interactive.border.strong,
      },
      interactive: {
        backgroundColor: theme.colors.foundation.darkest,
        borderWidth: 1,
        borderColor: theme.colors.interactive.border.medium,
      },
      minimal: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      // NEW: Add grok-dark variant
      'grok-dark': {
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        
        // Multi-layer shadow system
        shadowColor: 'rgba(0, 0, 0, 1)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 24,
        elevation: 16,
      },
    };
    
    // Elevation shadows
    const elevationStyles = {
      none: {},
      small: theme.shadows.subtle,
      medium: theme.shadows.medium,
      large: theme.shadows.strong,
    };
    
    // Selection/focus border styling (static, no animation to prevent frozen object errors)
    const variantStyle = variantStyles[variant];
    
    return {
      ...baseStyle,
      ...variantStyle,
      ...elevationStyles[elevation],
      ...(selected && { borderColor: '#EC602A', borderWidth: 2 }),
      ...(error && { borderColor: theme.colors.accent.critical }),
      ...(focused && { borderColor: theme.colors.accent.primary }),
    };
  }, [variant, padding, borderRadius, fullWidth, disabled, elevation, selected, focused, error, theme, animations]);
  
  const animatedStyle = useMemo(() => ({
    transform: [
      { scale: animations.scaleAnim },
      { translateY: animations.translateYAnim },
      { translateX: panResponder ? translateX : 0 },
    ],
    opacity: animations.opacityAnim,
  }), [animations, panResponder, translateX]);
  
  // Context value
  const contextValue = useMemo(() => ({
    variant,
    padding,
    loading,
    rtl,
  }), [variant, padding, loading, rtl]);
  
  return (
    <CardContext.Provider value={contextValue}>
      <Animated.View
        style={[animatedStyle, style]}
        {...(panResponder?.panHandlers || {})}
      >
        <Component
          ref={viewRef}
          style={[containerStyle, contentStyle]}
          onPress={handlePressEvent}
          onPressIn={handlePressIn}
          onLongPress={onLongPress}
          onLayout={handleLayout}
          disabled={disabled || loading}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled, selected }}
          testID={testID}
        >
          {/* Add multi-layer background for grok-dark variant */}
          {variant === 'grok-dark' && (
            <>
              {/* Primary dark surface */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(12, 12, 12, 1)',
                borderRadius: borderRadiusValues[borderRadius],
              }} />
              
              {/* Edge lighting */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderTopLeftRadius: borderRadiusValues[borderRadius],
                borderTopRightRadius: borderRadiusValues[borderRadius],
              }} />
            </>
          )}
          {loading ? <CardSkeleton /> : children}
        </Component>
      </Animated.View>
    </CardContext.Provider>
  );
}));

CardComponent.displayName = 'Card';

// ========================================================================================
// CARD HEADER COMPONENT
// ========================================================================================

const CardHeader = memo<CardHeaderProps>(({
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  leftComponent,
  rightComponent,
  onTitlePress,
  style,
  rtl: propRtl,
}) => {
  const theme = useTheme();
  const { rtl: contextRtl } = useCardContext();
  const isRtl = propRtl ?? contextRtl;
  
  const containerStyle = useMemo((): ViewStyle => ({
    flexDirection: isRtl ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  }), [isRtl, theme]);
  
  const textContainerStyle = useMemo((): ViewStyle => ({
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  }), [theme]);
  
  const defaultTitleStyle = useMemo((): TextStyle => ({
    fontSize: 18,
    fontWeight: '600',
    fontFamily: theme.typography.families.primary,
    color: theme.colors.interactive.text.primary,
    textAlign: isRtl ? 'right' : 'left',
  }), [theme, isRtl]);
  
  const defaultSubtitleStyle = useMemo((): TextStyle => ({
    fontSize: 14,
    fontWeight: '400',
    fontFamily: theme.typography.families.primary,
    color: theme.colors.interactive.text.secondary,
    marginTop: 4,
    textAlign: isRtl ? 'right' : 'left',
  }), [theme, isRtl]);
  
  const TitleComponent = onTitlePress ? TouchableOpacity : View;
  
  return (
    <View style={[containerStyle, style]}>
      {leftComponent}
      <TitleComponent style={textContainerStyle} onPress={onTitlePress}>
        {title && (
          <Text style={[defaultTitleStyle, ...(titleStyle ? [titleStyle] : [])]}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[defaultSubtitleStyle, ...(subtitleStyle ? [subtitleStyle] : [])]}>
            {subtitle}
          </Text>
        )}
      </TitleComponent>
      {rightComponent}
    </View>
  );
});

CardHeader.displayName = 'CardHeader';

// ========================================================================================
// CARD BODY COMPONENT
// ========================================================================================

const CardBody = memo<CardBodyProps>(({
  children,
  padding: propPadding,
  scrollable = false,
  style,
}) => {
  const { padding: contextPadding } = useCardContext();
  const finalPadding = propPadding ?? contextPadding;
  
  const paddingValues = {
    none: 0,
    small: 8,
    medium: 12,
    large: 16,
  };
  
  const bodyStyle = useMemo((): ViewStyle => ({
    padding: paddingValues[finalPadding],
  }), [finalPadding]);
  
  const Container = scrollable ? ScrollView : View;
  
  return (
    <Container
      style={[bodyStyle, style]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {children}
    </Container>
  );
});

CardBody.displayName = 'CardBody';

// ========================================================================================
// CARD FOOTER COMPONENT
// ========================================================================================

const CardFooter = memo<CardFooterProps>(({
  children,
  leftComponent,
  rightComponent,
  centered = false,
  style,
  rtl: propRtl,
}) => {
  const theme = useTheme();
  const { rtl: contextRtl } = useCardContext();
  const isRtl = propRtl ?? contextRtl;
  
  const containerStyle = useMemo((): ViewStyle => ({
    flexDirection: isRtl ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: centered ? 'center' : 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.interactive.border.subtle,
  }), [isRtl, centered, theme]);
  
  if (children) {
    return (
      <View style={[containerStyle, style]}>
        {children}
      </View>
    );
  }
  
  return (
    <View style={[containerStyle, style]}>
      <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
        {leftComponent}
      </View>
      <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
        {rightComponent}
      </View>
    </View>
  );
});

CardFooter.displayName = 'CardFooter';

// ========================================================================================
// CARD IMAGE COMPONENT
// ========================================================================================

const CardImage = memo<CardImageProps>(({
  source,
  height = 200,
  overlay = false,
  overlayColor = 'rgba(0, 0, 0, 0.4)',
  overlayOpacity = 0.4,
  style,
  resizeMode = 'cover',
  onPress,
}) => {
  const imageStyle = useMemo((): ImageStyle => ({
    width: '100%',
    height,
    resizeMode,
  }), [height, resizeMode]);
  
  const overlayStyle = useMemo((): ViewStyle => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: overlayColor,
    opacity: overlayOpacity,
  }), [overlayColor, overlayOpacity]);
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container onPress={onPress} activeOpacity={0.8}>
      <Image source={source} style={[imageStyle, style]} />
      {overlay && <View style={overlayStyle} />}
    </Container>
  );
});

CardImage.displayName = 'CardImage';

// ========================================================================================
// CARD SKELETON COMPONENT
// ========================================================================================

const CardSkeleton = memo<CardSkeletonProps>(({
  lines = 3,
  showImage = false,
  imageHeight = 150,
  style,
}) => {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);
  
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  
  const skeletonStyle = useMemo((): ViewStyle => ({
    backgroundColor: theme.colors.glass.subtle,
    borderRadius: 4,
  }), [theme]);
  
  return (
    <View style={style}>
      {showImage && (
        <Animated.View
          style={[
            skeletonStyle,
            {
              height: imageHeight,
              marginBottom: theme.spacing.md,
              opacity: shimmerOpacity,
            },
          ]}
        />
      )}
      {Array.from({ length: lines }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            skeletonStyle,
            {
              height: 16,
              marginBottom: theme.spacing.sm,
              width: index === lines - 1 ? '60%' : '100%',
              opacity: shimmerOpacity,
            },
          ]}
        />
      ))}
    </View>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

// ========================================================================================
// PRESET COMPONENTS
// ========================================================================================

// Hero Card - Large showcase card
export const HeroCard = memo<CardProps & { heroImage?: string }>(({
  heroImage,
  children,
  ...props
}) => (
  <Card {...props} variant="elevated" padding="none">
    {heroImage && <CardImage source={{ uri: heroImage }} height={300} overlay />}
    <View style={{ padding: 20 }}>
      {children}
    </View>
  </Card>
));

HeroCard.displayName = 'HeroCard';

// Interactive Card - Optimized for touch interactions
export const InteractiveCard = memo<CardProps & { ripple?: boolean }>(({
  ripple = true,
  ...props
}) => (
  <Card
    {...props}
    variant="interactive"
    rippleEffect={ripple}
    hapticFeedback="medium"
    entranceAnimation="scale"
  />
));

InteractiveCard.displayName = 'InteractiveCard';

// Glass Card - Glassmorphism variant preset
export const GlassCard = memo<Omit<CardProps, 'variant'>>(props => (
  <Card {...props} variant="glass" elevation="medium" />
));

GlassCard.displayName = 'GlassCard';

// Grok Dark Card - Premium dark surface with depth
export const GrokDarkCard = memo<Omit<CardProps, 'variant'>>(props => (
  <Card {...props} variant="grok-dark" elevation="large" />
));

GrokDarkCard.displayName = 'GrokDarkCard';

// Product Card - E-commerce optimized
export const ProductCard = memo<CardProps & {
  price?: string;
  rating?: number;
  badge?: string;
  image?: string;
}>(({ price, rating, badge, image, children, ...props }) => {
  const theme = useTheme();
  
  return (
    <Card {...props} variant="elevated">
      {image && (
        <CardImage
          source={{ uri: image }}
          height={180}
          resizeMode="cover"
        />
      )}
      {badge && (
        <View style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: '#EC602A',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
        }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
          }}>
            {badge}
          </Text>
        </View>
      )}
      <CardBody>
        {children}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.spacing.md,
        }}>
          {price && (
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.accent.primary,
            }}>
              {price}
            </Text>
          )}
          {rating && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#FFD700', marginRight: 4 }}>★</Text>
              <Text style={{
                color: theme.colors.interactive.text.secondary,
                fontSize: 14,
              }}>
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </CardBody>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

// Profile Card - User profile display
export const ProfileCard = memo<CardProps & {
  avatar?: string;
  name?: string;
  role?: string;
}>(({ avatar, name, role, children, ...props }) => {
  const theme = useTheme();
  
  return (
    <Card {...props} variant="glass">
      <CardHeader
        leftComponent={
          avatar && (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                marginRight: theme.spacing.md,
              }}
            />
          )
        }
        title={name}
        subtitle={role}
      />
      {children}
    </Card>
  );
});

ProfileCard.displayName = 'ProfileCard';

// ========================================================================================
// MAIN CARD EXPORT WITH COMPOSABLE COMPONENTS
// ========================================================================================

export const Card = Object.assign(CardComponent, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Image: CardImage,
  Skeleton: CardSkeleton,
});

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Card;