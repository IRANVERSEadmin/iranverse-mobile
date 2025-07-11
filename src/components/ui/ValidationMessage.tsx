import { TouchableOpacity } from 'react-native';
// src/components/ui/ValidationMessage.tsx
// IRANVERSE Enterprise ValidationMessage - Revolutionary Form Guidance
// Tesla-inspired validation feedback with Agent Identity Flow
// Built for 90M users - Real-time Validation & Accessibility Excellence
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme, useColors, useTypography, useSpacing, useRadius, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// VALIDATION MESSAGE TYPES - ENTERPRISE FORM SYSTEM
// ========================================================================================

export type ValidationState = 
  | 'idle'         // No validation state
  | 'validating'   // Real-time validation in progress
  | 'valid'        // Field passes validation
  | 'invalid'      // Field fails validation
  | 'warning'      // Field has warning
  | 'required';    // Required field indicator

export type ValidationMessageType = 
  | 'error'        // Validation error message
  | 'success'      // Success confirmation
  | 'warning'      // Warning message
  | 'info'         // Helpful information
  | 'requirement'; // Field requirement details

export type ValidationTiming = 
  | 'onBlur'       // Show on field blur
  | 'onChange'     // Show on value change
  | 'onSubmit'     // Show on form submission
  | 'immediate'    // Show immediately
  | 'delayed';     // Show with delay

export interface ValidationRule {
  id: string;
  label: string;
  valid: boolean;
  required?: boolean;
  description?: string;
}

export interface ValidationMessageProps {
  // Core Props
  state?: ValidationState;
  message?: string;
  type?: ValidationMessageType;
  
  // Validation Rules Display
  rules?: ValidationRule[];
  showRules?: boolean;
  rulesCollapsible?: boolean;
  
  // Timing & Animation
  timing?: ValidationTiming;
  delay?: number;
  animationDuration?: number;
  
  // Visual Design
  showIcon?: boolean;
  icon?: React.ReactNode;
  compact?: boolean;
  inline?: boolean;
  
  // Styling
  style?: ViewStyle;
  messageStyle?: TextStyle;
  rulesStyle?: ViewStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  
  // Advanced Features
  persistOnValid?: boolean;
  fadeOnValid?: boolean;
  showProgress?: boolean;
  progress?: number; // 0-100 for validation progress
  
  // Callbacks
  onStateChange?: (state: ValidationState) => void;
  onRulesToggle?: (expanded: boolean) => void;
}

// ========================================================================================
// VALIDATION MESSAGE IMPLEMENTATION - REVOLUTIONARY FORM GUIDANCE
// ========================================================================================

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  state = 'idle',
  message = '',
  type = 'error',
  rules = [],
  showRules = false,
  rulesCollapsible = true,
  timing = 'onBlur',
  delay = 0,
  animationDuration = 300,
  showIcon = true,
  icon,
  compact = false,
  inline = false,
  style,
  messageStyle,
  rulesStyle,
  accessibilityLabel,
  testID,
  rtl = false,
  persianText = false,
  persistOnValid = false,
  fadeOnValid = true,
  showProgress = false,
  progress = 0,
  onStateChange,
  onRulesToggle,
}) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const radius = useRadius();
  const animations = useAnimations();
  
  // Animation Values with cleanup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const rulesAnim = useRef(new Animated.Value(showRules ? 1 : 0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Internal State
  const [rulesExpanded, setRulesExpanded] = React.useState(showRules);
  const [isVisible, setIsVisible] = React.useState(false);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cleanup animations and timers
  useEffect(() => {
    return () => {
      if (delayTimer.current) {
        clearTimeout(delayTimer.current);
        delayTimer.current = null;
      }
      
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      rulesAnim.stopAnimation();
      progressAnim.stopAnimation();
      pulseAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      rulesAnim.removeAllListeners();
      progressAnim.removeAllListeners();
      pulseAnim.removeAllListeners();
    };
  }, [fadeAnim, slideAnim, rulesAnim, progressAnim, pulseAnim]);
  
  // ========================================================================================
  // STATE CONFIGURATION - ENTERPRISE VALIDATION TAXONOMY
  // ========================================================================================
  
  const stateConfig = useMemo(() => {
    const configs = {
      idle: {
        show: false,
        color: colors.interactive.textSecondary,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        icon: '',
        animation: false,
      },
      validating: {
        show: true,
        color: colors.interactive.text,
        backgroundColor: `${colors.interactive.text}08`,
        borderColor: `${colors.interactive.text}20`,
        icon: '⏳',
        animation: true,
      },
      valid: {
        show: persistOnValid,
        color: colors.semantic.success,
        backgroundColor: `${colors.semantic.success}10`,
        borderColor: `${colors.semantic.success}30`,
        icon: '✅',
        animation: false,
      },
      invalid: {
        show: true,
        color: colors.semantic.error,
        backgroundColor: `${colors.semantic.error}10`,
        borderColor: `${colors.semantic.error}30`,
        icon: '❌',
        animation: false,
      },
      warning: {
        show: true,
        color: colors.semantic.warning,
        backgroundColor: `${colors.semantic.warning}10`,
        borderColor: `${colors.semantic.warning}30`,
        icon: '⚠️',
        animation: false,
      },
      required: {
        show: true,
        color: colors.interactive.textSecondary,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        icon: '*',
        animation: false,
      },
    };
    
    return configs[state];
  }, [state, colors, persistOnValid]);
  
  const typeConfig = useMemo(() => {
    const configs = {
      error: {
        color: colors.semantic.error,
        icon: '❌',
      },
      success: {
        color: colors.semantic.success,
        icon: '✅',
      },
      warning: {
        color: colors.semantic.warning,
        icon: '⚠️',
      },
      info: {
        color: colors.interactive.text,
        icon: 'ℹ️',
      },
      requirement: {
        color: colors.interactive.textSecondary,
        icon: '📋',
      },
    };
    
    return configs[type];
  }, [type, colors]);
  
  // ========================================================================================
  // STYLE COMPUTATION - RESPONSIVE & CONTEXTUAL
  // ========================================================================================
  
  const containerStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      marginTop: inline ? 0 : spacing.xs,
      marginLeft: inline && !rtl ? spacing.sm : 0,
      marginRight: inline && rtl ? spacing.sm : 0,
    };
    
    if (!compact && stateConfig.backgroundColor !== 'transparent') {
      Object.assign(baseStyle, {
        backgroundColor: stateConfig.backgroundColor,
        borderLeftWidth: rtl ? 0 : 2,
        borderRightWidth: rtl ? 2 : 0,
        borderLeftColor: rtl ? 'transparent' : stateConfig.borderColor,
        borderRightColor: rtl ? stateConfig.borderColor : 'transparent',
        borderRadius: radius.xs,
        padding: spacing.xs,
      });
    }
    
    return baseStyle;
  }, [inline, compact, stateConfig, spacing, radius, rtl]);
  
  const messageContainerStyles = useMemo(() => {
    return {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      flex: inline ? 0 : 1,
    } as ViewStyle;
  }, [rtl, inline]);
  
  const textStyles = useMemo(() => {
    const baseStyle: TextStyle = {
      fontSize: compact ? typography.scale.caption.fontSize : typography.scale.bodySmall.fontSize,
      lineHeight: compact ? typography.scale.caption.lineHeight : typography.scale.bodySmall.lineHeight,
      fontFamily: persianText ? typography.families.persian : typography.families.primary,
      color: typeConfig.color,
      textAlign: rtl ? 'right' : 'left',
      flex: 1,
      ...(rtl ? typography.rtl.persian : {}),
    };
    
    return baseStyle;
  }, [compact, persianText, typeConfig, rtl, typography]);
  
  // ========================================================================================
  // ANIMATION SYSTEM - TESLA-INSPIRED VALIDATION FEEDBACK
  // ========================================================================================
  
  const showMessage = useCallback(() => {
    setIsVisible(true);
    
    const showAnimations = [
      Animated.timing(fadeAnim, {
        toValue: fadeOnValid && state === 'valid' ? 0.7 : 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 400,
        friction: 12,
        useNativeDriver: true,
      }),
    ];
    
    // Progress animation for validation state
    if (showProgress) {
      showAnimations.push(
        Animated.timing(progressAnim, {
          toValue: progress / 100,
          duration: animationDuration * 2,
          useNativeDriver: false,
        })
      );
    }
    
    Animated.parallel(showAnimations).start();
    
    // Validating pulse animation
    if (stateConfig.animation) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [
    fadeOnValid,
    state,
    animationDuration,
    showProgress,
    progress,
    stateConfig.animation,
    fadeAnim,
    slideAnim,
    progressAnim,
    pulseAnim,
  ]);
  
  const hideMessage = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: animationDuration * 0.8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
    
    // Stop pulse animation
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [animationDuration, fadeAnim, slideAnim, pulseAnim]);
  
  const toggleRules = useCallback(() => {
    const newExpanded = !rulesExpanded;
    setRulesExpanded(newExpanded);
    
    Animated.timing(rulesAnim, {
      toValue: newExpanded ? 1 : 0,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
    
    onRulesToggle?.(newExpanded);
  }, [rulesExpanded, rulesAnim, animationDuration, onRulesToggle]);
  
  // ========================================================================================
  // EFFECTS - VISIBILITY & TIMING CONTROL
  // ========================================================================================
  
  useEffect(() => {
    // Clear any existing timer
    if (delayTimer.current) {
      clearTimeout(delayTimer.current);
      delayTimer.current = null;
    }
    
    const shouldShow = stateConfig.show && (message || rules.length > 0);
    
    if (shouldShow) {
      if (delay > 0 && timing === 'delayed') {
        delayTimer.current = setTimeout(() => {
          showMessage();
          delayTimer.current = null; // Clear reference
        }, delay);
      } else {
        showMessage();
      }
    } else {
      hideMessage();
    }
    
    return () => {
      if (delayTimer.current) {
        clearTimeout(delayTimer.current);
        delayTimer.current = null;
      }
    };
  }, [stateConfig.show, message, rules.length, delay, timing, showMessage, hideMessage]);
  
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);
  
  useEffect(() => {
    if (showProgress) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: animations.duration.normal,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, showProgress, animations, progressAnim]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderIcon = () => {
    if (!showIcon) return null;
    
    const iconToShow = icon || stateConfig.icon || typeConfig.icon;
    if (!iconToShow) return null;
    
    return (
      <Animated.View
        style={{
          marginRight: rtl ? 0 : spacing.xs,
          marginLeft: rtl ? spacing.xs : 0,
          marginTop: 1,
          opacity: pulseAnim,
        }}
      >
        {typeof iconToShow === 'string' ? (
          <Text
            style={{
              fontSize: compact ? 12 : 14,
              color: typeConfig.color,
              lineHeight: compact ? 12 : 14,
            }}
          >
            {iconToShow}
          </Text>
        ) : (
          iconToShow
        )}
      </Animated.View>
    );
  };
  
  const renderMessage = () => {
    if (!message) return null;
    
    return (
      <Text
        style={[textStyles, messageStyle]}
        numberOfLines={compact ? 1 : 3}
        ellipsizeMode="tail"
      >
        {message}
      </Text>
    );
  };
  
  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <View
        style={{
          height: 2,
          backgroundColor: `${typeConfig.color}30`,
          borderRadius: 1,
          marginTop: spacing.xs,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: typeConfig.color,
            borderRadius: 1,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    );
  };
  
  const renderRules = () => {
    if (!rules.length) return null;
    
    return (
      <Animated.View
        style={[
          {
            marginTop: spacing.xs,
            opacity: rulesAnim,
            maxHeight: rulesAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
            overflow: 'hidden',
          },
          rulesStyle,
        ]}
      >
        {rulesCollapsible && (
          <TouchableOpacity
            onPress={toggleRules}
            style={{
              marginBottom: spacing.xs,
            }}
            accessibilityRole="button"
            accessibilityLabel={`${rulesExpanded ? 'Hide' : 'Show'} validation rules`}
          >
            <Text
              style={{
                ...typography.scale.caption,
                color: colors.interactive.textSecondary,
                fontWeight: '500',
                textAlign: rtl ? 'right' : 'left',
              }}
            >
              {persianText ? 'قوانین اعتبارسنجی' : 'Validation Rules'} {rulesExpanded ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rules.map((rule) => (
          <View
            key={rule.id}
            style={{
              flexDirection: rtl ? 'row-reverse' : 'row',
              alignItems: 'center',
              marginBottom: spacing.xs / 2,
            }}
          >
            <Text
              style={{
                color: rule.valid ? colors.semantic.success : colors.interactive.textSecondary,
                fontSize: 12,
                marginRight: rtl ? 0 : spacing.xs,
                marginLeft: rtl ? spacing.xs : 0,
              }}
            >
              {rule.valid ? '✓' : '○'}
            </Text>
            <Text
              style={{
                ...typography.scale.caption,
                color: rule.valid ? colors.interactive.text : colors.interactive.textSecondary,
                textAlign: rtl ? 'right' : 'left',
                flex: 1,
              }}
            >
              {rule.label}
            </Text>
            {rule.required && (
              <Text
                style={{
                  color: colors.semantic.error,
                  fontSize: 12,
                  marginLeft: rtl ? 0 : spacing.xs,
                  marginRight: rtl ? spacing.xs : 0,
                }}
              >
                *
              </Text>
            )}
          </View>
        ))}
      </Animated.View>
    );
  };
  
  // ========================================================================================
  // DYNAMIC STYLES - ANIMATION INTEGRATION
  // ========================================================================================
  
  const animatedStyles = useMemo(() => {
    return {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    };
  }, [fadeAnim, slideAnim]);
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  // FIX: Safe visibility check without relying on private animation values
  if (!isVisible) return null;
  
  return (
    <Animated.View
      style={[containerStyles, animatedStyles, style]}
      accessibilityLabel={accessibilityLabel || `Validation ${state}: ${message}`}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <View style={messageContainerStyles}>
        {renderIcon()}
        {renderMessage()}
      </View>
      
      {renderProgress()}
      {renderRules()}
    </Animated.View>
  );
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const ErrorValidation: React.FC<Omit<ValidationMessageProps, 'type'>> = (props) => (
  <ValidationMessage {...props} type="error" />
);

export const SuccessValidation: React.FC<Omit<ValidationMessageProps, 'type'>> = (props) => (
  <ValidationMessage {...props} type="success" />
);

export const WarningValidation: React.FC<Omit<ValidationMessageProps, 'type'>> = (props) => (
  <ValidationMessage {...props} type="warning" />
);

export const InfoValidation: React.FC<Omit<ValidationMessageProps, 'type'>> = (props) => (
  <ValidationMessage {...props} type="info" />
);

export const RequirementValidation: React.FC<Omit<ValidationMessageProps, 'type'>> = (props) => (
  <ValidationMessage {...props} type="requirement" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default ValidationMessage;