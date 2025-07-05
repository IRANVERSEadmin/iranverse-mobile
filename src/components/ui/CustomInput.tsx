// src/components/ui/CustomInput.tsx
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
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import type { TextInput as TextInputType } from 'react-native';
import type { SupportedLanguage } from '../../hooks/useLanguage';

// Enterprise Configuration Constants
const CONFIG = {
  ANIMATION: {
    FOCUS_DURATION: 200,
    VALIDATION_DURATION: 300,
    LABEL_DURATION: 250,
    COUNTER_DURATION: 150,
    HAPTIC_DELAY: 30,
  },
  DESIGN: {
    BORDER_WIDTH: 1.5,
    BORDER_RADIUS: 12,
    GLOW_RADIUS: 8,
    MIN_HEIGHT: 56,
    PADDING_HORIZONTAL: 16,
    PADDING_VERTICAL: 18,
  },
  VALIDATION: {
    DEBOUNCE_DELAY: 300,
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  }
};

// Enterprise Input Types and Validation
export type InputType = 'text' | 'email' | 'phone' | 'username' | 'url' | 'search' | 'multiline';
export type InputVariant = 'default' | 'outlined' | 'filled' | 'quantum' | 'minimal';
export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'warning';

export interface ValidationResult {
  isValid: boolean;
  state: ValidationState;
  message?: string;
  suggestions?: string[];
}

export interface CustomInputProps {
  // Core Props
  value: string;
  onChangeText: (text: string) => void;
  
  // Configuration
  inputType?: InputType;
  variant?: InputVariant;
  language?: SupportedLanguage;
  
  // Labels and Placeholders
  label?: string;
  labelRTL?: string;
  placeholder?: string;
  placeholderRTL?: string;
  helperText?: string;
  helperTextRTL?: string;
  
  // Validation
  required?: boolean;
    validationState?: ValidationState;
  customValidation?: (value: string) => ValidationResult;
  realTimeValidation?: boolean;
  
  // Behavior
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  clearable?: boolean;
  
  // Constraints
  maxLength?: number;
  minLength?: number;
  showCharacterCount?: boolean;
  
  // Visual Features
  leftIcon?: string;
  rightIcon?: string;
  animatedLabel?: boolean;
  glowEffect?: boolean;
  
  // Styling
  style?: any;
  inputStyle?: any;
  
  // Callbacks
  onFocus?: () => void;
  onBlur?: () => void;
  onValidationChange?: (result: ValidationResult) => void;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Enterprise Features
  securityLevel?: 'standard' | 'enterprise' | 'quantum';
  auditLog?: boolean;
  encryptValue?: boolean;
}

export interface CustomInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  validate: () => ValidationResult;
  getValue: () => string;
  setValue: (value: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const CustomInput = forwardRef<CustomInputRef, CustomInputProps>(({
  value,
  onChangeText,
  inputType = 'text',
  variant = 'default',
  language = 'auto',
  label,
  labelRTL,
  placeholder,
  placeholderRTL,
  helperText,
  helperTextRTL,
  required = false,
  customValidation,
  realTimeValidation = true,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  clearable = false,
  maxLength = CONFIG.VALIDATION.MAX_LENGTH,
  minLength = CONFIG.VALIDATION.MIN_LENGTH,
  showCharacterCount = false,
  leftIcon,
  rightIcon,
  animatedLabel = true,
  glowEffect = false,
  style,
  inputStyle,
  onFocus,
  onBlur,
  onValidationChange,
  onRightIconPress,
  onLeftIconPress,
  accessibilityLabel,
  accessibilityHint,
  testID = 'custom-input',
  securityLevel = 'standard',
  auditLog = false,
  encryptValue = false,
}, ref) => {

  // Enterprise State Management
  const [isFocused, setIsFocused] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    state: 'idle'
  });
  const [detectedLanguage, setDetectedLanguage] = useState<'english' | 'farsi'>('english');
  const [isValidating, setIsValidating] = useState(false);

  // Animation References
  const focusAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const validationAnim = useRef(new Animated.Value(0)).current;
  const characterCountAnim = useRef(new Animated.Value(0)).current;

  // Input Reference
  const inputRef = useRef<TextInputType>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track label animation state for conditional rendering
  const [shouldShowPlaceholder, setShouldShowPlaceholder] = useState(!value);

  // Update placeholder visibility based on label state
  useEffect(() => {
    if (animatedLabel) {
      setShouldShowPlaceholder(!value && !isFocused);
    } else {
      setShouldShowPlaceholder(true);
    }
  }, [value, isFocused, animatedLabel]);

  // Current Language Detection
  const currentLanguage = language === 'auto' ? detectedLanguage : language;
  const isRTL = currentLanguage === 'farsi';

  // Imperative Handle
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      onChangeText('');
      setValidation({ isValid: true, state: 'idle' });
    },
    validate: () => validateInput(value),
    getValue: () => value,
    setValue: (newValue: string) => onChangeText(newValue),
  }));

  // Language Detection Algorithm
  const detectLanguage = (text: string): 'english' | 'farsi' => {
    if (!text) return 'english';
    
    // Persian Unicode range: \u0600-\u06FF
    const persianChars = text.match(/[\u0600-\u06FF]/g);
    const englishChars = text.match(/[A-Za-z]/g);
    
    const persianCount = persianChars ? persianChars.length : 0;
    const englishCount = englishChars ? englishChars.length : 0;
    
    return persianCount > englishCount ? 'farsi' : 'english';
  };

  // Enterprise Input Validation Engine
  const validateInput = (inputValue: string): ValidationResult => {
    if (customValidation) {
      return customValidation(inputValue);
    }

    const errors: string[] = [];
    let state: ValidationState = 'valid';

    // Required field validation
    if (required && !inputValue.trim()) {
      errors.push(isRTL ? 'این فیلد اجباری است' : 'This field is required');
      state = 'invalid';
    }

    // Length validation
    if (inputValue.length < minLength && inputValue.length > 0) {
      errors.push(isRTL ? 
        `حداقل ${minLength} کاراکتر لازم است` : 
        `Minimum ${minLength} characters required`
      );
      state = 'invalid';
    }

    if (inputValue.length > maxLength) {
      errors.push(isRTL ? 
        `حداکثر ${maxLength} کاراکتر مجاز است` : 
        `Maximum ${maxLength} characters allowed`
      );
      state = 'invalid';
    }

    // Type-specific validation
    switch (inputType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (inputValue && !emailRegex.test(inputValue)) {
          errors.push(isRTL ? 'فرمت ایمیل معتبر نیست' : 'Invalid email format');
          state = 'invalid';
        }
        break;

      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (inputValue && !phoneRegex.test(inputValue.replace(/\s/g, ''))) {
          errors.push(isRTL ? 'شماره تلفن معتبر نیست' : 'Invalid phone number');
          state = 'invalid';
        }
        break;

      case 'username':
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (inputValue && !usernameRegex.test(inputValue)) {
          errors.push(isRTL ? 
            'نام کاربری باید شامل حروف، اعداد و _ باشد' : 
            'Username must contain only letters, numbers, and underscores'
          );
          state = 'invalid';
        }
        break;

      case 'url':
        const urlRegex = /^https?:\/\/.+\..+/;
        if (inputValue && !urlRegex.test(inputValue)) {
          errors.push(isRTL ? 'آدرس وب معتبر نیست' : 'Invalid URL format');
          state = 'invalid';
        }
        break;
    }

    // Security Level Validation
    if (securityLevel === 'enterprise' || securityLevel === 'quantum') {
      // Check for potential security issues
      const securityPatterns = [
        { pattern: /<script|javascript:|onload=/i, message: 'Security: Script injection detected' },
        { pattern: /\'\s*OR\s*\'/i, message: 'Security: SQL injection pattern detected' },
        { pattern: /\.\.\//g, message: 'Security: Path traversal detected' },
      ];

      securityPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(inputValue)) {
          errors.push(message);
          state = 'invalid';
        }
      });
    }

    return {
      isValid: state === 'valid',
      state: errors.length > 0 ? 'invalid' : (inputValue ? 'valid' : 'idle'),
      message: errors[0],
      suggestions: errors.slice(1),
    };
  };

  // Haptic Feedback System
  const triggerHaptic = (type: 'light' | 'medium' | 'error' | 'success') => {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const patterns = {
          light: [0, 30],
          medium: [0, 60],
          error: [0, 100],
          success: [0, 30, 50, 30],
        };
        
        setTimeout(() => {
          Vibration.vibrate(patterns[type]);
        }, CONFIG.ANIMATION.HAPTIC_DELAY);
      }
    } catch (error) {
      // Silent fallback
    }
  };

  // Text Change Handler
  const handleTextChange = (text: string) => {
    // Audit logging
    if (auditLog) {
      console.log(`[AUDIT] Input changed - Type: ${inputType}, Length: ${text.length}`);
    }

    // Auto-detect language
    if (language === 'auto') {
      const detected = detectLanguage(text);
      if (detected !== detectedLanguage) {
        setDetectedLanguage(detected);
      }
    }

    onChangeText(text);

    // Real-time validation
    if (realTimeValidation) {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      setIsValidating(true);
      setValidation(prev => ({ ...prev, state: 'validating' }));

      validationTimeoutRef.current = setTimeout(() => {
        const result = validateInput(text);
        setValidation(result);
        setIsValidating(false);
        onValidationChange?.(result);

        // Trigger haptic feedback for validation state
        if (result.state === 'valid' && text.length > 0) {
          triggerHaptic('success');
        } else if (result.state === 'invalid') {
          triggerHaptic('error');
        }
      }, CONFIG.VALIDATION.DEBOUNCE_DELAY);
    }
  };

  // Focus Handlers
  const handleFocus = () => {
    setIsFocused(true);
    triggerHaptic('light');
    onFocus?.();

    // Focus animations
    const focusAnimations = [
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION.FOCUS_DURATION,
        useNativeDriver: false,
      }),
    ];

    if (animatedLabel) {
      focusAnimations.push(
        Animated.timing(labelAnim, {
          toValue: 1,
          duration: CONFIG.ANIMATION.LABEL_DURATION,
          useNativeDriver: false,
        })
      );
    }

    if (glowEffect) {
      focusAnimations.push(
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: CONFIG.ANIMATION.FOCUS_DURATION,
          useNativeDriver: false,
        })
      );
    }

    Animated.parallel(focusAnimations).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();

    // Blur animations
    const blurAnimations = [
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
    ];

    if (animatedLabel && !value) {
      blurAnimations.push(
        Animated.timing(labelAnim, {
          toValue: 0,
          duration: CONFIG.ANIMATION.LABEL_DURATION,
          useNativeDriver: false,
        })
      );
    }

    Animated.parallel(blurAnimations).start();
  };

  // Character count animation
  useEffect(() => {
    if (showCharacterCount) {
      Animated.timing(characterCountAnim, {
        toValue: value.length / maxLength,
        duration: CONFIG.ANIMATION.COUNTER_DURATION,
        useNativeDriver: false,
      }).start();
    }
  }, [value.length, maxLength, showCharacterCount]);

  // Validation animation
  useEffect(() => {
    Animated.timing(validationAnim, {
      toValue: validation.state === 'invalid' ? 1 : 0,
      duration: CONFIG.ANIMATION.VALIDATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [validation.state]);

  // Dynamic Styling
  const getBorderColor = () => {
    if (disabled) return 'rgba(100, 100, 100, 0.3)';
    if (validation.state === 'invalid') return '#f44336';
    if (validation.state === 'valid' && value.length > 0) return '#00ff88';
    if (isFocused) return 'rgba(120, 120, 120, 0.9)';
    return 'rgba(80, 80, 80, 0.6)';
  };

  const getGlowColor = () => {
    if (validation.state === 'invalid') return '#f44336';
    if (validation.state === 'valid' && value.length > 0) return '#00ff88';
    return 'rgba(255, 255, 255, 0.3)';
  };

  const getVariantStyles = () => {
    const variants = {
      default: {
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
        borderWidth: CONFIG.DESIGN.BORDER_WIDTH,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: CONFIG.DESIGN.BORDER_WIDTH,
      },
      filled: {
        backgroundColor: 'rgba(40, 40, 40, 0.8)',
        borderWidth: 0,
      },
      quantum: {
        backgroundColor: 'rgba(0, 255, 136, 0.05)',
        borderWidth: CONFIG.DESIGN.BORDER_WIDTH,
        borderColor: '#00ff88',
      },
      minimal: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottomWidth: 1.5,
        borderRadius: 0,
      },
    };

    return variants[variant] || variants.default;
  };

  // Keyboard Configuration
  const getKeyboardProps = () => {
    const configs = {
      text: {
        keyboardType: 'default' as const,
        autoCapitalize: 'sentences' as const,
        autoCorrect: true,
      },
      email: {
        keyboardType: 'email-address' as const,
        autoCapitalize: 'none' as const,
        autoCorrect: false,
      },
      phone: {
        keyboardType: 'phone-pad' as const,
        autoCapitalize: 'none' as const,
        autoCorrect: false,
      },
      username: {
        keyboardType: 'default' as const,
        autoCapitalize: 'none' as const,
        autoCorrect: false,
      },
      url: {
        keyboardType: 'url' as const,
        autoCapitalize: 'none' as const,
        autoCorrect: false,
      },
      search: {
        keyboardType: 'web-search' as const,
        autoCapitalize: 'none' as const,
        autoCorrect: true,
      },
      multiline: {
        keyboardType: 'default' as const,
        autoCapitalize: 'sentences' as const,
        autoCorrect: true,
        multiline: true,
      },
    };

    return configs[inputType] || configs.text;
  };

  const variantStyles = getVariantStyles();
  const keyboardProps = getKeyboardProps();

  return (
    <View style={[styles.container, style]}>
      {/* Animated Label */}
      {animatedLabel && (label || labelRTL) && (
        <Animated.View style={[
          styles.labelContainer,
          isRTL && styles.labelContainerRTL,
          {
            transform: [{
              translateY: labelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [CONFIG.DESIGN.MIN_HEIGHT / 2 - 8, -10],
              })
            }],
            opacity: labelAnim,
          }
        ]}>
          <Text style={[
            styles.label,
            isRTL && styles.labelRTL,
            isFocused && styles.labelFocused,
            validation.state === 'invalid' && styles.labelError,
            validation.state === 'valid' && value.length > 0 && styles.labelValid,
          ]}>
            {isRTL ? labelRTL : label}
            {required && <Text style={styles.requiredStar}> *</Text>}
          </Text>
        </Animated.View>
      )}

      {/* Main Input Container */}
      <Animated.View style={[
        styles.inputContainer,
        variantStyles,
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
        },
        disabled && styles.inputContainerDisabled,
      ]}>
        {/* Left Icon */}
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            style={styles.iconContainer}
            disabled={!onLeftIconPress || disabled}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Left icon"
            testID={`${testID}-left-icon`}
          >
            <Text style={[
              styles.icon,
              disabled && styles.iconDisabled,
            ]}>
              {leftIcon}
            </Text>
          </TouchableOpacity>
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            isRTL && styles.textInputRTL,
            inputType === 'multiline' && styles.textInputMultiline,
            leftIcon && styles.textInputWithLeftIcon,
            (rightIcon || clearable) && styles.textInputWithRightIcon,
            disabled && styles.textInputDisabled,
            readOnly && styles.textInputReadOnly,
            inputStyle,
          ]}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={shouldShowPlaceholder ? 
            (isRTL ? placeholderRTL : placeholder) : ''
          }
          placeholderTextColor="rgba(140, 140, 140, 0.7)"
          maxLength={maxLength}
          editable={!disabled && !readOnly}
          autoFocus={autoFocus}
          selectionColor="rgba(255, 255, 255, 0.8)"
          accessible={true}
          accessibilityLabel={accessibilityLabel || (isRTL ? labelRTL : label)}
          accessibilityHint={accessibilityHint || `${inputType} input field`}
          accessibilityState={{
            disabled,
            selected: isFocused,
          }}
          testID={testID}
          {...keyboardProps}
          {...Platform.select({
            ios: {
              clearButtonMode: 'never', // We handle clearing manually
              returnKeyType: inputType === 'search' ? 'search' : 'done',
              textContentType: inputType === 'email' ? 'emailAddress' : 
                              inputType === 'phone' ? 'telephoneNumber' : 
                              inputType === 'username' ? 'username' : 'none',
            },
            android: {
              importantForAutofill: inputType === 'email' ? 'yes' : 
                                   inputType === 'phone' ? 'yes' : 'no',
              autoComplete: inputType === 'email' ? 'email' : 
                           inputType === 'phone' ? 'tel' : 
                           inputType === 'username' ? 'username' : 'off',
            }
          })}
        />

        {/* Right Side Icons/Actions */}
        <View style={styles.rightContainer}>
          {/* Clear Button */}
          {clearable && value.length > 0 && !disabled && (
            <TouchableOpacity
              onPress={() => {
                onChangeText('');
                triggerHaptic('light');
              }}
              style={styles.clearButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear text"
              testID={`${testID}-clear`}
            >
              <Text style={styles.clearIcon}>×</Text>
            </TouchableOpacity>
          )}

          {/* Validation Indicator */}
          {validation.state !== 'idle' && (
            <Animated.View style={[
              styles.validationIndicator,
              { opacity: validationAnim }
            ]}>
              <Text style={[
                styles.validationIcon,
                validation.state === 'valid' && styles.validationIconValid,
                validation.state === 'invalid' && styles.validationIconInvalid,
                validation.state === 'validating' && styles.validationIconValidating,
              ]}>
                {validation.state === 'valid' ? '✓' : 
                 validation.state === 'invalid' ? '⚠' : 
                 validation.state === 'validating' ? '⟳' : ''}
              </Text>
            </Animated.View>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.iconContainer}
              disabled={!onRightIconPress || disabled}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Right icon"
              testID={`${testID}-right-icon`}
            >
              <Text style={[
                styles.icon,
                disabled && styles.iconDisabled,
              ]}>
                {rightIcon}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Character Count */}
      {showCharacterCount && (
        <View style={styles.characterCountContainer}>
          <Animated.Text style={[
            styles.characterCount,
            {
              color: characterCountAnim.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: ['rgba(140, 140, 140, 0.7)', '#FF9800', '#f44336'],
              })
            }
          ]}>
            {value.length} / {maxLength}
          </Animated.Text>
        </View>
      )}

      {/* Helper Text */}
      {(helperText || helperTextRTL) && validation.state !== 'invalid' && (
        <View style={styles.helperContainer}>
          <Text style={[
            styles.helperText,
            isRTL && styles.helperTextRTL,
          ]}>
            {isRTL ? helperTextRTL : helperText}
          </Text>
        </View>
      )}

      {/* Validation Message */}
      {validation.message && validation.state === 'invalid' && (
        <Animated.View style={[
          styles.validationMessageContainer,
          { opacity: validationAnim }
        ]}>
          <Text style={[
            styles.validationMessage,
            isRTL && styles.validationMessageRTL,
          ]}>
            {validation.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: CONFIG.DESIGN.PADDING_HORIZONTAL,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 4,
  },
  labelContainerRTL: {
    left: undefined,
    right: CONFIG.DESIGN.PADDING_HORIZONTAL,
  },
  label: {
    fontSize: 14,
    color: 'rgba(140, 140, 140, 0.9)',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '500',
  },
  labelRTL: {
    textAlign: 'right',
  },
  labelFocused: {
    color: 'rgba(120, 120, 120, 0.9)',
  },
  labelError: {
    color: '#f44336',
  },
  labelValid: {
    color: '#00ff88',
  },
  requiredStar: {
    color: '#f44336',
    fontSize: 14,
  },
  inputContainer: {
    minHeight: CONFIG.DESIGN.MIN_HEIGHT,
    borderRadius: CONFIG.DESIGN.BORDER_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CONFIG.DESIGN.PADDING_HORIZONTAL,
    paddingVertical: CONFIG.DESIGN.PADDING_VERTICAL,
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
  inputContainerDisabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(40, 40, 40, 0.3)',
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
    textAlignVertical: 'center',
  },
  textInputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  textInputWithLeftIcon: {
    marginLeft: 8,
  },
  textInputWithRightIcon: {
    marginRight: 8,
  },
  textInputDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  textInputReadOnly: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  iconDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  validationIndicator: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  validationIconValid: {
    color: '#00ff88',
  },
  validationIconInvalid: {
    color: '#f44336',
  },
  validationIconValidating: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  characterCountContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '500',
  },
  helperContainer: {
    marginTop: 8,
  },
  helperText: {
    fontSize: 13,
    color: 'rgba(140, 140, 140, 0.8)',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '400',
  },
  helperTextRTL: {
    textAlign: 'right',
  },
  validationMessageContainer: {
    marginTop: 8,
  },
  validationMessage: {
    fontSize: 13,
    color: '#f44336',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '500',
  },
  validationMessageRTL: {
    textAlign: 'right',
  },
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;


