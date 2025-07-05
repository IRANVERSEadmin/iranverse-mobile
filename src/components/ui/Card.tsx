// src/components/ui/Card.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  Vibration,
  Dimensions,
  Text,
} from 'react-native';

// Note: Install expo-linear-gradient for gradient support
// expo install expo-linear-gradient
// For now, we'll use a fallback gradient implementation
const LinearGradient = ({ colors, locations, style, start, end, children, ...props }: any) => {
  // Fallback implementation - use the first color as background
  const backgroundColor = colors && colors.length > 0 ? colors[0] : 'transparent';
  return (
    <View style={[style, { backgroundColor }]} {...props}>
      {children}
    </View>
  );
};

// Enterprise Configuration Constants
const CONFIG = {
  ANIMATION: {
    HOVER_DURATION: 200,
    PRESS_DURATION: 150,
    GLOW_PULSE_DURATION: 3000,
    LOADING_DURATION: 1200,
    HAPTIC_DELAY: 20,
  },
  DESIGN: {
    BORDER_RADIUS: 16,
    BORDER_WIDTH: 1.5,
    GLOW_RADIUS: 12,
    MIN_HEIGHT: 80,
    PADDING: 20,
    PRESS_SCALE: 0.98,
    HOVER_SCALE: 1.02,
  },
  ELEVATION: {
    REST: 8,
    HOVER: 16,
    PRESSED: 4,
  }
};

// Enterprise Card Variant System
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'quantum' | 'glass' | 'minimal' | 'gradient';
export type CardSize = 'small' | 'medium' | 'large' | 'full';
export type CardState = 'idle' | 'loading' | 'success' | 'error' | 'warning' | 'disabled';

export interface CardProps {
  // Core Props
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  
  // Visual Configuration
  variant?: CardVariant;
  size?: CardSize;
  state?: CardState;
  
  // Interaction
  pressable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  hapticFeedback?: boolean;
  
  // Visual Effects
  glowEffect?: boolean;
  holographicEdge?: boolean;
  animatedBorder?: boolean;
  particleEffect?: boolean;
  
  // Layout
  fullWidth?: boolean;
  aspectRatio?: number;
  minHeight?: number;
  
  // Styling
  style?: any;
  contentStyle?: any;
  
  // Gradient (for gradient variant)
  gradientColors?: string[];
  gradientLocations?: number[];
  gradientAngle?: number;
  
  // Header/Footer
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  
  // Enterprise Features
  securityLevel?: 'standard' | 'enterprise' | 'quantum';
  auditLog?: boolean;
  encryptedContent?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'none';
  testID?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  onLongPress,
  variant = 'default',
  size = 'medium',
  state = 'idle',
  pressable = !!onPress,
  disabled = false,
  loading = false,
  hapticFeedback = true,
  glowEffect = false,
  holographicEdge = false,
  animatedBorder = false,
  particleEffect = false,
  fullWidth = false,
  aspectRatio,
  minHeight,
  style,
  contentStyle,
  gradientColors,
  gradientLocations,
  gradientAngle = 135,
  header,
  footer,
  title,
  subtitle,
  securityLevel = 'standard',
  auditLog = false,
  encryptedContent = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = onPress ? 'button' : 'none',
  testID = 'enterprise-card',
}) => {

  // Enterprise State Management
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [internalState, setInternalState] = useState<CardState>(state);

  // Animation References
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(CONFIG.ELEVATION.REST)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const holographicAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  // Computed Properties
  const isDisabled = disabled || internalState === 'disabled';
  const isLoading = loading || internalState === 'loading';
  const isInteractive = pressable && !isDisabled && !isLoading;

  // Enterprise Color System
  const getColorScheme = () => {
    const schemes = {
      default: {
        background: 'rgba(18, 18, 18, 0.95)',
        border: 'rgba(80, 80, 80, 0.6)',
        glow: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff',
        overlay: 'transparent',
      },
      elevated: {
        background: 'rgba(25, 25, 25, 0.98)',
        border: 'rgba(100, 100, 100, 0.7)',
        glow: 'rgba(255, 255, 255, 0.2)',
        text: '#ffffff',
        overlay: 'rgba(255, 255, 255, 0.02)',
      },
      outlined: {
        background: 'transparent',
        border: 'rgba(120, 120, 120, 0.8)',
        glow: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff',
        overlay: 'rgba(255, 255, 255, 0.05)',
      },
      quantum: {
        background: 'rgba(0, 255, 136, 0.05)',
        border: '#00ff88',
        glow: '#00ff88',
        text: '#00ff88',
        overlay: 'rgba(0, 255, 136, 0.1)',
      },
      glass: {
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.2)',
        glow: 'rgba(255, 255, 255, 0.3)',
        text: '#ffffff',
        overlay: 'rgba(255, 255, 255, 0.05)',
      },
      minimal: {
        background: 'rgba(40, 40, 40, 0.6)',
        border: 'rgba(60, 60, 60, 0.4)',
        glow: 'rgba(255, 255, 255, 0.05)',
        text: '#ffffff',
        overlay: 'transparent',
      },
      gradient: {
        background: 'transparent',
        border: 'rgba(255, 255, 255, 0.3)',
        glow: 'rgba(255, 255, 255, 0.2)',
        text: '#ffffff',
        overlay: 'rgba(255, 255, 255, 0.1)',
      },
    };

    const baseScheme = schemes[variant] || schemes.default;

    // State-based color modifications
    switch (internalState) {
      case 'success':
        return {
          ...baseScheme,
          border: '#00ff88',
          glow: '#00ff88',
        };
      case 'error':
        return {
          ...baseScheme,
          border: '#f44336',
          glow: '#f44336',
        };
      case 'warning':
        return {
          ...baseScheme,
          border: '#FF9800',
          glow: '#FF9800',
        };
      case 'disabled':
        return {
          ...baseScheme,
          background: 'rgba(40, 40, 40, 0.3)',
          border: 'rgba(60, 60, 60, 0.2)',
          glow: 'transparent',
          text: 'rgba(255, 255, 255, 0.3)',
        };
      default:
        return baseScheme;
    }
  };

  // Size Configuration
  const getSizeConfig = () => {
    const configs = {
      small: {
        padding: 12,
        minHeight: 60,
        titleSize: 14,
        subtitleSize: 12,
      },
      medium: {
        padding: CONFIG.DESIGN.PADDING,
        minHeight: CONFIG.DESIGN.MIN_HEIGHT,
        titleSize: 16,
        subtitleSize: 14,
      },
      large: {
        padding: 24,
        minHeight: 120,
        titleSize: 18,
        subtitleSize: 16,
      },
      full: {
        padding: CONFIG.DESIGN.PADDING,
        minHeight: 150,
        titleSize: 20,
        subtitleSize: 18,
      },
    };

    return configs[size];
  };

  // Haptic Feedback System
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    if (!hapticFeedback) return;

    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const patterns = {
          light: [0, 30],
          medium: [0, 60],
          heavy: [0, 100],
          success: [0, 30, 100, 30],
          error: [0, 100, 50, 100],
        };
        
        setTimeout(() => {
          Vibration.vibrate(patterns[type]);
        }, CONFIG.ANIMATION.HAPTIC_DELAY);
      }
    } catch (error) {
      // Silent fallback
    }
  };

  // Animation Handlers
  const animatePress = () => {
    setIsPressed(true);
    triggerHaptic('medium');

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: CONFIG.DESIGN.PRESS_SCALE,
        duration: CONFIG.ANIMATION.PRESS_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(elevationAnim, {
        toValue: CONFIG.ELEVATION.PRESSED,
        duration: CONFIG.ANIMATION.PRESS_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animateRelease = () => {
    setIsPressed(false);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: isHovered ? CONFIG.DESIGN.HOVER_SCALE : 1,
        duration: CONFIG.ANIMATION.HOVER_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(elevationAnim, {
        toValue: isHovered ? CONFIG.ELEVATION.HOVER : CONFIG.ELEVATION.REST,
        duration: CONFIG.ANIMATION.HOVER_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Press Handlers
  const handlePress = () => {
    if (!isInteractive) return;

    // Audit logging
    if (auditLog) {
      console.log(`[AUDIT] Card pressed - Variant: ${variant}, Security Level: ${securityLevel}`);
    }

    onPress?.();
  };

  const handleLongPress = () => {
    if (!isInteractive) return;
    
    triggerHaptic('heavy');
    onLongPress?.();
  };

  // Glow Effect Setup
  useEffect(() => {
    if (glowEffect || variant === 'quantum') {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: CONFIG.ANIMATION.GLOW_PULSE_DURATION,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: CONFIG.ANIMATION.GLOW_PULSE_DURATION,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();
      
      return () => glowAnimation.stop();
    }
  }, [glowEffect, variant]);

  // Animated Border Setup
  useEffect(() => {
    if (animatedBorder) {
      const borderAnimation = Animated.loop(
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: CONFIG.ANIMATION.GLOW_PULSE_DURATION * 1.5,
          useNativeDriver: false,
        })
      );
      borderAnimation.start();
      
      return () => borderAnimation.stop();
    }
  }, [animatedBorder]);

  // Holographic Edge Setup
  useEffect(() => {
    if (holographicEdge) {
      const holographicAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(holographicAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(holographicAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );
      holographicAnimation.start();
      
      return () => holographicAnimation.stop();
    }
  }, [holographicEdge]);

  // Loading Animation
  useEffect(() => {
    if (isLoading) {
      const loadingAnimation = Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: CONFIG.ANIMATION.LOADING_DURATION,
          useNativeDriver: true,
        })
      );
      loadingAnimation.start();
      
      return () => loadingAnimation.stop();
    } else {
      loadingRotation.setValue(0);
    }
  }, [isLoading]);

  // Dynamic Styling
  const colorScheme = getColorScheme();
  const sizeConfig = getSizeConfig();

  const cardStyle = {
    backgroundColor: colorScheme.background,
    borderColor: colorScheme.border,
    shadowColor: colorScheme.glow,
    minHeight: minHeight || sizeConfig.minHeight,
    padding: sizeConfig.padding,
  };

  // Gradient Configuration
  const getGradientColors = () => {
    if (gradientColors) return gradientColors;
    
    return [
      'rgba(0, 0, 0, 0.8)',
      'rgba(40, 40, 40, 0.6)',
      'rgba(80, 80, 80, 0.4)',
      'rgba(40, 40, 40, 0.6)',
      'rgba(0, 0, 0, 0.8)',
    ];
  };

  const CardContent = () => (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Animated.Text style={[
            styles.loadingSpinner,
            {
              transform: [{
                rotate: loadingRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }
          ]}>
            ⚡
          </Animated.Text>
        </View>
      )}

      {/* Header */}
      {(header || title || subtitle) && (
        <View style={styles.headerContainer}>
          {header}
          {title && (
            <Text style={[
              styles.title,
              { 
                fontSize: sizeConfig.titleSize,
                color: colorScheme.text 
              }
            ]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[
              styles.subtitle,
              { 
                fontSize: sizeConfig.subtitleSize,
                color: colorScheme.text 
              }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Main Content */}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>

      {/* Footer */}
      {footer && (
        <View style={styles.footerContainer}>
          {footer}
        </View>
      )}

      {/* Security Indicator */}
      {securityLevel !== 'standard' && (
        <View style={styles.securityIndicator}>
          <Text style={styles.securityText}>
            {securityLevel === 'quantum' ? '🔐' : '🔒'}
          </Text>
        </View>
      )}
    </>
  );

  const CardContainer = ({ children: cardChildren }: { children: React.ReactNode }) => {
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={getGradientColors()}
          locations={gradientLocations}
          style={[
            styles.card,
            cardStyle,
            fullWidth && styles.fullWidth,
            aspectRatio && { aspectRatio },
            style,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ 
            x: Math.cos((gradientAngle * Math.PI) / 180),
            y: Math.sin((gradientAngle * Math.PI) / 180)
          }}
        >
          {cardChildren}
        </LinearGradient>
      );
    }

    return (
      <View style={[
        styles.card,
        cardStyle,
        fullWidth && styles.fullWidth,
        aspectRatio && { aspectRatio },
        style,
      ]}>
        {cardChildren}
      </View>
    );
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ scale: scaleAnim }],
        shadowRadius: elevationAnim,
        elevation: elevationAnim,
      }
    ]}>
      {isInteractive ? (
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={animatePress}
          onPressOut={animateRelease}
          disabled={isDisabled}
          activeOpacity={0.9}
          accessible={true}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel || title}
          accessibilityHint={accessibilityHint}
          accessibilityState={{
            disabled: isDisabled,
            busy: isLoading,
          }}
          testID={testID}
        >
          <CardContainer>
            <CardContent />
          </CardContainer>
        </TouchableOpacity>
      ) : (
        <CardContainer>
          <CardContent />
        </CardContainer>
      )}

      {/* Glow Effect */}
      {(glowEffect || variant === 'quantum') && (
        <Animated.View style={[
          styles.glowEffect,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.4],
            }),
            shadowColor: colorScheme.glow,
          }
        ]} />
      )}

      {/* Holographic Edge */}
      {holographicEdge && (
        <Animated.View style={[
          styles.holographicEdge,
          {
            opacity: holographicAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.6, 0],
            }),
            transform: [{
              translateX: holographicAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-200, 200],
              })
            }]
          }
        ]}>
          <View style={[styles.holographicGradient, {
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
          }]} />
        </Animated.View>
      )}

      {/* Animated Border */}
      {animatedBorder && (
        <Animated.View style={[
          styles.animatedBorder,
          {
            borderColor: borderAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [
                colorScheme.border,
                colorScheme.glow,
                colorScheme.border,
              ],
            }),
            shadowColor: borderAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [
                'transparent',
                colorScheme.glow,
                'transparent',
              ],
            }),
          }
        ]} />
      )}

      {/* Particle Effect */}
      {particleEffect && (
        <View style={styles.particleContainer} pointerEvents="none">
          {Array.from({ length: 6 }).map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: `${20 + index * 12}%`,
                  top: `${30 + (index % 2) * 40}%`,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.8],
                  }),
                  transform: [{
                    translateY: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10 - index * 2],
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  card: {
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS,
    borderWidth: CONFIG.DESIGN.BORDER_WIDTH,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: CONFIG.ELEVATION.REST,
      }
    }),
  },
  fullWidth: {
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS,
  },
  loadingSpinner: {
    fontSize: 24,
    color: '#00ff88',
    textAlign: 'center',
  },
  headerContainer: {
    marginBottom: 12,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '400',
    opacity: 0.8,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  footerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(80, 80, 80, 0.3)',
  },
  securityIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  securityText: {
    fontSize: 12,
    textAlign: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS + 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: CONFIG.DESIGN.GLOW_RADIUS,
    elevation: 0,
  },
  holographicEdge: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    bottom: 0,
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS,
  },
  holographicGradient: {
    flex: 1,
    transform: [{ skewX: '-20deg' }],
  },
  animatedBorder: {
    position: 'absolute',
    top: -CONFIG.DESIGN.BORDER_WIDTH,
    left: -CONFIG.DESIGN.BORDER_WIDTH,
    right: -CONFIG.DESIGN.BORDER_WIDTH,
    bottom: -CONFIG.DESIGN.BORDER_WIDTH,
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS + CONFIG.DESIGN.BORDER_WIDTH,
    borderWidth: CONFIG.DESIGN.BORDER_WIDTH,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 0,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(0, 255, 136, 0.8)',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default Card;