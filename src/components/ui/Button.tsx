// src/components/ui/Button.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  StyleSheet,
  Platform,
  Vibration,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';

// Enterprise Configuration Constants
const CONFIG = {
  ANIMATION: {
    PRESS_DURATION: 150,
    RELEASE_DURATION: 200,
    LOADING_DURATION: 1200,
    GLOW_PULSE_DURATION: 2000,
    HAPTIC_DELAY: 20,
  },
  DESIGN: {
    BORDER_RADIUS: 12,
    GLOW_RADIUS: 12,
    MIN_HEIGHT: 56,
    HORIZONTAL_PADDING: 24,
    PRESS_SCALE: 0.95,
  },
  ACCESSIBILITY: {
    MIN_TARGET_SIZE: 44,
    ANNOUNCEMENT_DELAY: 100,
  }
};

// Enterprise Button Variant System
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'quantum' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large' | 'xl';
export type ButtonState = 'idle' | 'loading' | 'success' | 'error' | 'disabled';

export interface ButtonProps {
  // Core Props
  title: string;
  onPress: () => void | Promise<void>;
  
  // Visual Configuration
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  
  // Behavior
  disabled?: boolean;
  loading?: boolean;
  hapticFeedback?: boolean;
  asyncOperation?: boolean;
  
  // Visual Features
  glowEffect?: boolean;
  pulseAnimation?: boolean;
  iconLeft?: string;
  iconRight?: string;
  
  // Styling
  style?: any;
  textStyle?: any;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Enterprise Features
  securityLevel?: 'standard' | 'enterprise' | 'quantum';
  biometricAuth?: boolean;
  auditLog?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  state = 'idle',
  disabled = false,
  loading = false,
  hapticFeedback = true,
  asyncOperation = false,
  glowEffect = false,
  pulseAnimation = false,
  iconLeft,
  iconRight,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID = 'enterprise-button',
  securityLevel = 'standard',
  biometricAuth = false,
  auditLog = false,
}) => {

  // Enterprise State Management
  const [internalState, setInternalState] = useState<ButtonState>(state);
  const [isPressed, setIsPressed] = useState(false);
  const [asyncInProgress, setAsyncInProgress] = useState(false);

  // Animation References
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;
  const borderGlowAnim = useRef(new Animated.Value(0)).current;

  // Computed Properties
  const isDisabled = disabled || internalState === 'disabled' || internalState === 'loading' || asyncInProgress;
  const isLoading = loading || internalState === 'loading' || asyncInProgress;

  // Enterprise Color System
  const getColorScheme = () => {
    const schemes = {
      primary: {
        background: {
          idle: 'rgba(18, 18, 18, 0.95)',
          pressed: 'rgba(12, 12, 12, 0.98)',
          disabled: 'rgba(40, 40, 40, 0.5)',
          loading: 'rgba(18, 18, 18, 0.95)',
          success: 'rgba(0, 255, 136, 0.2)',
          error: 'rgba(244, 67, 54, 0.2)',
        },
        border: {
          idle: 'rgba(80, 80, 80, 0.6)',
          pressed: 'rgba(60, 60, 60, 0.6)',
          disabled: 'rgba(60, 60, 60, 0.3)',
          loading: 'rgba(120, 120, 120, 0.8)',
          success: '#00ff88',
          error: '#f44336',
        },
        text: {
          idle: 'rgba(220, 220, 220, 0.9)',
          pressed: 'rgba(160, 160, 160, 0.8)',
          disabled: 'rgba(120, 120, 120, 0.5)',
          loading: 'rgba(200, 200, 200, 0.8)',
          success: '#00ff88',
          error: '#f44336',
        },
        glow: {
          idle: 'rgba(255, 255, 255, 0.1)',
          pressed: 'rgba(255, 255, 255, 0.2)',
          disabled: 'transparent',
          loading: 'rgba(120, 120, 120, 0.4)',
          success: '#00ff88',
          error: '#f44336',
        }
      },
      secondary: {
        background: {
          idle: 'rgba(60, 60, 60, 0.8)',
          pressed: 'rgba(80, 80, 80, 0.9)',
          disabled: 'rgba(40, 40, 40, 0.4)',
          loading: 'rgba(60, 60, 60, 0.8)',
          success: 'rgba(0, 255, 136, 0.15)',
          error: 'rgba(244, 67, 54, 0.15)',
        },
        border: {
          idle: 'rgba(120, 120, 120, 0.6)',
          pressed: 'rgba(140, 140, 140, 0.8)',
          disabled: 'rgba(80, 80, 80, 0.3)',
          loading: 'rgba(140, 140, 140, 0.8)',
          success: '#00ff88',
          error: '#f44336',
        },
        text: {
          idle: 'rgba(255, 255, 255, 0.9)',
          pressed: 'rgba(255, 255, 255, 0.7)',
          disabled: 'rgba(140, 140, 140, 0.5)',
          loading: 'rgba(255, 255, 255, 0.8)',
          success: '#00ff88',
          error: '#f44336',
        },
        glow: {
          idle: 'rgba(255, 255, 255, 0.1)',
          pressed: 'rgba(255, 255, 255, 0.2)',
          disabled: 'transparent',
          loading: 'rgba(140, 140, 140, 0.4)',
          success: '#00ff88',
          error: '#f44336',
        }
      },
      tertiary: {
        background: {
          idle: 'transparent',
          pressed: 'rgba(255, 255, 255, 0.1)',
          disabled: 'transparent',
          loading: 'transparent',
          success: 'rgba(0, 255, 136, 0.1)',
          error: 'rgba(244, 67, 54, 0.1)',
        },
        border: {
          idle: 'rgba(255, 255, 255, 0.3)',
          pressed: 'rgba(255, 255, 255, 0.5)',
          disabled: 'rgba(60, 60, 60, 0.2)',
          loading: 'rgba(255, 255, 255, 0.4)',
          success: '#00ff88',
          error: '#f44336',
        },
        text: {
          idle: 'rgba(255, 255, 255, 0.9)',
          pressed: 'rgba(255, 255, 255, 0.7)',
          disabled: 'rgba(120, 120, 120, 0.4)',
          loading: 'rgba(255, 255, 255, 0.8)',
          success: '#00ff88',
          error: '#f44336',
        },
        glow: {
          idle: 'rgba(255, 255, 255, 0.1)',
          pressed: 'rgba(255, 255, 255, 0.2)',
          disabled: 'transparent',
          loading: 'rgba(255, 255, 255, 0.1)',
          success: '#00ff88',
          error: '#f44336',
        }
      },
      quantum: {
        background: {
          idle: 'rgba(0, 255, 136, 0.1)',
          pressed: 'rgba(0, 255, 136, 0.2)',
          disabled: 'rgba(40, 40, 40, 0.4)',
          loading: 'rgba(0, 255, 136, 0.15)',
          success: 'rgba(0, 255, 136, 0.3)',
          error: 'rgba(244, 67, 54, 0.2)',
        },
        border: {
          idle: '#00ff88',
          pressed: '#00ff88',
          disabled: 'rgba(80, 80, 80, 0.3)',
          loading: '#00ff88',
          success: '#00ff88',
          error: '#f44336',
        },
        text: {
          idle: '#00ff88',
          pressed: '#00ff88',
          disabled: 'rgba(120, 120, 120, 0.5)',
          loading: '#00ff88',
          success: '#00ff88',
          error: '#f44336',
        },
        glow: {
          idle: '#00ff88',
          pressed: '#00ff88',
          disabled: 'transparent',
          loading: '#00ff88',
          success: '#00ff88',
          error: '#f44336',
        }
      },
      danger: {
        background: {
          idle: 'rgba(244, 67, 54, 0.1)',
          pressed: 'rgba(244, 67, 54, 0.2)',
          disabled: 'rgba(40, 40, 40, 0.4)',
          loading: 'rgba(244, 67, 54, 0.15)',
          success: 'rgba(0, 255, 136, 0.2)',
          error: 'rgba(244, 67, 54, 0.3)',
        },
        border: {
          idle: '#f44336',
          pressed: '#f44336',
          disabled: 'rgba(80, 80, 80, 0.3)',
          loading: '#f44336',
          success: '#00ff88',
          error: '#f44336',
        },
        text: {
          idle: '#f44336',
          pressed: '#f44336',
          disabled: 'rgba(120, 120, 120, 0.5)',
          loading: '#f44336',
          success: '#00ff88',
          error: '#f44336',
        },
        glow: {
          idle: '#f44336',
          pressed: '#f44336',
          disabled: 'transparent',
          loading: '#f44336',
          success: '#00ff88',
          error: '#f44336',
        }
      },
      ghost: {
        background: {
          idle: 'transparent',
          pressed: 'rgba(255, 255, 255, 0.05)',
          disabled: 'transparent',
          loading: 'transparent',
          success: 'rgba(0, 255, 136, 0.1)',
          error: 'rgba(244, 67, 54, 0.1)',
        },
        border: {
          idle: 'transparent',
          pressed: 'rgba(255, 255, 255, 0.2)',
          disabled: 'transparent',
          loading: 'transparent',
          success: '#00ff88',
          error: '#f44336',
        },
        text: {
          idle: 'rgba(255, 255, 255, 0.8)',
          pressed: 'rgba(255, 255, 255, 0.6)',
          disabled: 'rgba(120, 120, 120, 0.4)',
          loading: 'rgba(255, 255, 255, 0.7)',
          success: '#00ff88',
          error: '#f44336',
        },
        glow: {
          idle: 'transparent',
          pressed: 'rgba(255, 255, 255, 0.1)',
          disabled: 'transparent',
          loading: 'rgba(255, 255, 255, 0.1)',
          success: '#00ff88',
          error: '#f44336',
        }
      }
    };

    return schemes[variant] || schemes.primary;
  };

  // Size Configuration
  const getSizeConfig = () => {
    const configs = {
      small: {
        height: 44,
        paddingHorizontal: 16,
        fontSize: 14,
        iconSize: 14,
      },
      medium: {
        height: CONFIG.DESIGN.MIN_HEIGHT,
        paddingHorizontal: CONFIG.DESIGN.HORIZONTAL_PADDING,
        fontSize: 16,
        iconSize: 16,
      },
      large: {
        height: 64,
        paddingHorizontal: 32,
        fontSize: 18,
        iconSize: 18,
      },
      xl: {
        height: 72,
        paddingHorizontal: 40,
        fontSize: 20,
        iconSize: 20,
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

  // Enterprise Press Animation System
  const animatePress = () => {
    setIsPressed(true);
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: CONFIG.DESIGN.PRESS_SCALE,
        duration: CONFIG.ANIMATION.PRESS_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundColorAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION.PRESS_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animateRelease = () => {
    setIsPressed(false);
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION.RELEASE_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundColorAnim, {
        toValue: 0,
        duration: CONFIG.ANIMATION.RELEASE_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Enterprise Press Handler
  const handlePress = async () => {
    if (isDisabled) return;

    triggerHaptic('medium');

    // Biometric Authentication Check
    if (biometricAuth && securityLevel === 'quantum') {
      try {
        // Implement biometric check here
        // const biometricResult = await checkBiometric();
        // if (!biometricResult.success) return;
      } catch (error) {
        setInternalState('error');
        triggerHaptic('error');
        return;
      }
    }

    // Audit Logging
    if (auditLog) {
      console.log(`[AUDIT] Button pressed: ${title} - Security Level: ${securityLevel}`);
    }

    // Handle Async Operations
    if (asyncOperation) {
      setAsyncInProgress(true);
      setInternalState('loading');
      
      try {
        await onPress();
        setInternalState('success');
        triggerHaptic('success');
        
        // Auto-reset after success
        setTimeout(() => {
          setInternalState('idle');
          setAsyncInProgress(false);
        }, 1500);
      } catch (error) {
        setInternalState('error');
        triggerHaptic('error');
        
        // Auto-reset after error
        setTimeout(() => {
          setInternalState('idle');
          setAsyncInProgress(false);
        }, 2000);
      }
    } else {
      onPress();
    }
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

  // Pulse Animation Setup
  useEffect(() => {
    if (pulseAnimation) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    }
  }, [pulseAnimation]);

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
  const currentState = internalState;

  const buttonStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    backgroundColor: colorScheme.background[currentState],
    borderColor: colorScheme.border[currentState],
    shadowColor: colorScheme.glow[currentState],
  };

  const textColor = colorScheme.text[currentState];

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleAnim }, { scale: pulseAnim }] }
    ]}>
      <TouchableOpacity
        style={[
          styles.button,
          buttonStyle,
          style,
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        onPressIn={animatePress}
        onPressOut={animateRelease}
        disabled={isDisabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint || `${variant} button - ${title}`}
        accessibilityState={{
          disabled: isDisabled,
          busy: isLoading,
        }}
        testID={testID}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {/* Left Icon */}
          {iconLeft && !isLoading && (
            <Text style={[
              styles.icon,
              { fontSize: sizeConfig.iconSize, color: textColor }
            ]}>
              {iconLeft}
            </Text>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <Animated.Text style={[
              styles.loadingSpinner,
              {
                fontSize: sizeConfig.iconSize,
                color: textColor,
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
          )}

          {/* Button Text */}
          <Text style={[
            styles.buttonText,
            {
              fontSize: sizeConfig.fontSize,
              color: textColor,
            },
            textStyle,
            isDisabled && styles.buttonTextDisabled,
          ]}>
            {isLoading ? 'PROCESSING...' : title.toUpperCase()}
          </Text>

          {/* Right Icon */}
          {iconRight && !isLoading && (
            <Text style={[
              styles.icon,
              { fontSize: sizeConfig.iconSize, color: textColor }
            ]}>
              {iconRight}
            </Text>
          )}

          {/* State Indicator */}
          {currentState === 'success' && (
            <Text style={[styles.stateIcon, { color: textColor }]}>✓</Text>
          )}
          {currentState === 'error' && (
            <Text style={[styles.stateIcon, { color: textColor }]}>✗</Text>
          )}
        </View>

        {/* Quantum Glow Effect */}
        {(glowEffect || variant === 'quantum') && (
          <Animated.View style={[
            styles.glowOverlay,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
              backgroundColor: colorScheme.glow[currentState],
            }
          ]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: CONFIG.DESIGN.GLOW_RADIUS,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
    minHeight: CONFIG.ACCESSIBILITY.MIN_TARGET_SIZE,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '600',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  buttonTextDisabled: {
    opacity: 0.6,
  },
  icon: {
    textAlign: 'center',
  },
  loadingSpinner: {
    textAlign: 'center',
  },
  stateIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS,
  },
});

export default Button;