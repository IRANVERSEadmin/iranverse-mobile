// src/components/ui/PasswordInput.tsx
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  Vibration,
  Text,
  AccessibilityInfo,
  Dimensions,
} from 'react-native';
import type { TextInput as TextInputType } from 'react-native';

// Enterprise Configuration Constants
const CONFIG = {
  ANIMATION: {
    FOCUS_DURATION: 200,
    VALIDATION_DURATION: 300,
    SECURITY_FADE_DURATION: 150,
    HAPTIC_DELAY: 50,
  },
  SECURITY: {
    MAX_LENGTH: 128,
    MIN_LENGTH: 3,
    VALIDATION_DEBOUNCE: 300,
    AUTO_HIDE_DELAY: 3000,
  },
  DESIGN: {
    BORDER_WIDTH: 1.5,
    BORDER_RADIUS: 12,
    GLOW_RADIUS: 8,
    INPUT_HEIGHT: 56,
  }
};

// Enterprise Password Validation Types
export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'ultra';
  errors: string[];
  suggestions: string[];
}

export interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidationChange?: (validation: PasswordValidation) => void;
  placeholder?: string;
  placeholderRTL?: string;
  language?: 'english' | 'farsi';
  securityLevel?: 'basic' | 'enterprise' | 'quantum';
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  customValidation?: (password: string) => PasswordValidation;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  testID?: string;
}

export interface PasswordInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  validate: () => PasswordValidation;
  getStrength: () => number;
}

const { width: screenWidth } = Dimensions.get('window');

const PasswordInput = forwardRef<PasswordInputRef, PasswordInputProps>(({
  value,
  onChangeText,
  onValidationChange,
  placeholder = "Enter secure password...",
  placeholderRTL = "رمز عبور امن وارد کنید...",
  language = 'english',
  securityLevel = 'enterprise',
  disabled = false,
  autoFocus = false,
  maxLength = CONFIG.SECURITY.MAX_LENGTH,
  customValidation,
  onFocus,
  onBlur,
  style,
  testID = 'password-input',
}, ref) => {

  // Enterprise State Management
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const [validation, setValidation] = useState<PasswordValidation>({
    isValid: false,
    strength: 'weak',
    errors: [],
    suggestions: []
  });
  const [isValidating, setIsValidating] = useState(false);

  // Animation References
  const focusAnim = useRef(new Animated.Value(0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;
  const securityIconAnim = useRef(new Animated.Value(1)).current;
  
  // Input Reference
  const inputRef = useRef<TextInputType>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Imperative Handle for Parent Components
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      onChangeText('');
      setValidation({
        isValid: false,
        strength: 'weak',
        errors: [],
        suggestions: []
      });
    },
    validate: () => validation,
    getStrength: () => getStrengthScore(value),
  }));

  // Enterprise Password Strength Calculation
  const getStrengthScore = (password: string): number => {
    if (!password) return 0;
    
    let score = 0;
    const length = password.length;
    
    // Length scoring (0-40 points)
    if (length >= 8) score += 10;
    if (length >= 12) score += 10;
    if (length >= 16) score += 10;
    if (length >= 20) score += 10;
    
    // Character variety (0-40 points)
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    if (/[\u0600-\u06FF]/.test(password)) score += 5; // Persian characters
    
    // Pattern complexity (0-20 points)
    const patterns = [
      /(.)\1{2,}/, // Repeated characters
      /123|234|345|456|567|678|789|890/, // Sequential numbers
      /abc|bcd|cde|def|efg|fgh|ghi|hij/, // Sequential letters
    ];
    
    let patternPenalty = 0;
    patterns.forEach(pattern => {
      if (pattern.test(password.toLowerCase())) patternPenalty += 5;
    });
    
    score = Math.max(0, score - patternPenalty);
    
    // Bonus for mixed scripts (English + Persian)
    if (/[A-Za-z]/.test(password) && /[\u0600-\u06FF]/.test(password)) {
      score += 10;
    }
    
    return Math.min(100, score);
  };

  // Enterprise Password Validation Engine
  const validatePassword = (password: string): PasswordValidation => {
    if (customValidation) {
      return customValidation(password);
    }

    const errors: string[] = [];
    const suggestions: string[] = [];
    const score = getStrengthScore(password);
    
    let strength: PasswordValidation['strength'] = 'weak';
    if (score >= 80) strength = 'ultra';
    else if (score >= 60) strength = 'strong';
    else if (score >= 40) strength = 'medium';

    // Security Level Specific Validation
    if (securityLevel === 'quantum') {
      if (password.length < 16) {
        errors.push('Quantum security requires minimum 16 characters');
        suggestions.push('Add more characters for quantum-grade security');
      }
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        errors.push('Must include uppercase, lowercase, numbers, and symbols');
        suggestions.push('Mix character types for quantum entropy');
      }
    } else if (securityLevel === 'enterprise') {
      if (password.length < 12) {
        errors.push('Enterprise security requires minimum 12 characters');
        suggestions.push('Increase length for enterprise compliance');
      }
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        errors.push('Must include uppercase letters and numbers');
        suggestions.push('Add uppercase letters and numbers');
      }
    } else {
      if (password.length < CONFIG.SECURITY.MIN_LENGTH) {
        errors.push(`Minimum ${CONFIG.SECURITY.MIN_LENGTH} characters required`);
        suggestions.push('Password too short');
      }
    }

    // Common password patterns
    const commonPatterns = [
      { pattern: /password|123456|qwerty/i, message: 'Avoid common passwords' },
      { pattern: /(.)\1{3,}/, message: 'Avoid repeated characters' },
      { pattern: /^[a-zA-Z]+$/, message: 'Add numbers and symbols' },
      { pattern: /^[0-9]+$/, message: 'Add letters and symbols' },
    ];

    commonPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(password)) {
        errors.push(message);
        suggestions.push(`Consider: ${message.toLowerCase()}`);
      }
    });

    const isValid = errors.length === 0 && password.length >= CONFIG.SECURITY.MIN_LENGTH;

    return {
      isValid,
      strength,
      errors: [...new Set(errors)], // Remove duplicates
      suggestions: [...new Set(suggestions)]
    };
  };

  // Debounced Validation Effect
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    setIsValidating(true);

    validationTimeoutRef.current = setTimeout(() => {
      const newValidation = validatePassword(value);
      setValidation(newValidation);
      setIsValidating(false);
      onValidationChange?.(newValidation);

      // Update strength animation
      const strengthValue = getStrengthScore(value) / 100;
      Animated.timing(strengthAnim, {
        toValue: strengthValue,
        duration: CONFIG.ANIMATION.VALIDATION_DURATION,
        useNativeDriver: false,
      }).start();
    }, CONFIG.SECURITY.VALIDATION_DEBOUNCE);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [value, securityLevel]);

  // Haptic Feedback Utility
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const patterns = {
          light: [0, 30],
          medium: [0, 60],
          heavy: [0, 100]
        };
        Vibration.vibrate(patterns[type]);
      }
    } catch (error) {
      // Silent fallback
    }
  };

  // Focus Handlers
  const handleFocus = () => {
    setIsFocused(true);
    triggerHaptic('light');
    onFocus?.();

    // Focus animations
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION.FOCUS_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION.FOCUS_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();

    // Blur animations
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: CONFIG.ANIMATION.FOCUS_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: CONFIG.ANIMATION.FOCUS_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Security Toggle Handler
  const toggleSecurity = () => {
    setIsSecure(!isSecure);
    triggerHaptic('medium');

    // Security icon animation
    Animated.sequence([
      Animated.timing(securityIconAnim, {
        toValue: 0.6,
        duration: CONFIG.ANIMATION.SECURITY_FADE_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(securityIconAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION.SECURITY_FADE_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Dynamic Styling Calculations
  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'ultra': return '#00ff88';
      case 'strong': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'weak': return '#f44336';
      default: return '#666666';
    }
  };

  const getBorderColor = () => {
    if (disabled) return 'rgba(100, 100, 100, 0.3)';
    if (validation.errors.length > 0 && value.length > 0) return '#f44336';
    if (validation.isValid) return '#00ff88';
    if (isFocused) return 'rgba(120, 120, 120, 0.9)';
    return 'rgba(80, 80, 80, 0.6)';
  };

  const getGlowColor = () => {
    if (validation.errors.length > 0 && value.length > 0) return '#f44336';
    if (validation.isValid) return '#00ff88';
    return 'rgba(255, 255, 255, 0.3)';
  };

  return (
    <View style={[styles.container, style]}>
      {/* Main Input Container */}
      <Animated.View style={[
        styles.inputContainer,
        {
          borderColor: getBorderColor(),
          shadowColor: getGlowColor(),
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.6],
          }),
          shadowRadius: CONFIG.DESIGN.GLOW_RADIUS,
          elevation: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [4, 12],
          }),
        }
      ]}>
        {/* Password Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            language === 'farsi' && styles.textInputRTL,
            disabled && styles.textInputDisabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={language === 'farsi' ? placeholderRTL : placeholder}
          placeholderTextColor="rgba(140, 140, 140, 0.7)"
          secureTextEntry={isSecure}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          textContentType="password"
          maxLength={maxLength}
          editable={!disabled}
          autoFocus={autoFocus}
          selectionColor="rgba(255, 255, 255, 0.8)"
          accessible={true}
          accessibilityLabel={`Password input - ${validation.strength} strength`}
          accessibilityHint="Enter your secure password"
          accessibilityState={{
            disabled,
            selected: isFocused,
          }}
          testID={testID}
          {...Platform.select({
            ios: {
              keyboardType: 'default',
              returnKeyType: 'done',
            },
            android: {
              importantForAutofill: 'yes',
              autoComplete: 'password',
            }
          })}
        />

        {/* Security Toggle Button */}
        <Animated.View style={[
          styles.securityButton,
          { opacity: securityIconAnim }
        ]}>
          <TouchableOpacity
            onPress={toggleSecurity}
            style={styles.securityButtonTouch}
            disabled={disabled}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? "Show password" : "Hide password"}
            accessibilityHint="Toggle password visibility"
            testID={`${testID}-visibility-toggle`}
          >
            <Text style={[
              styles.securityIcon,
              disabled && styles.securityIconDisabled
            ]}>
              {isSecure ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Password Strength Indicator */}
      {value.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            <Animated.View style={[
              styles.strengthFill,
              {
                width: strengthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: getStrengthColor(),
              }
            ]} />
          </View>
          <Text style={[
            styles.strengthText,
            { color: getStrengthColor() }
          ]}>
            {validation.strength.toUpperCase()}
            {isValidating && ' • VALIDATING...'}
          </Text>
        </View>
      )}

      {/* Validation Feedback */}
      {validation.errors.length > 0 && value.length > 0 && (
        <View style={styles.validationContainer}>
          {validation.errors.slice(0, 2).map((error, index) => (
            <Text key={index} style={styles.errorText}>
              ⚠️ {error}
            </Text>
          ))}
        </View>
      )}

      {/* Success Indicator */}
      {validation.isValid && value.length > 0 && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            ✅ Password meets {securityLevel} security requirements
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    height: CONFIG.DESIGN.INPUT_HEIGHT,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderWidth: CONFIG.DESIGN.BORDER_WIDTH,
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({
      ios: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.03,
        shadowRadius: 1,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '400',
    letterSpacing: 0.5,
    paddingVertical: 0, // Remove default padding
  },
  textInputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textInputDisabled: {
    opacity: 0.5,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  securityButton: {
    marginLeft: 12,
  },
  securityButtonTouch: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  securityIcon: {
    fontSize: 16,
    textAlign: 'center',
  },
  securityIconDisabled: {
    opacity: 0.3,
  },
  strengthContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
  },
  validationContainer: {
    marginTop: 8,
    gap: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#f44336',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '400',
  },
  successContainer: {
    marginTop: 8,
  },
  successText: {
    fontSize: 13,
    color: '#00ff88',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '500',
  },
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;