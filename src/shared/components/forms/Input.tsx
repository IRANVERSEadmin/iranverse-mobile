// src/components/ui/Input.tsx
// IRANVERSE Enterprise Input - Security-First Tesla Minimalism
// Enterprise-grade input component with XSS prevention and glassmorphism
// Built for 90M users - Priority: Security & Tesla aesthetics

import React, { 
  memo, 
  forwardRef, 
  useCallback, 
  useMemo, 
  useRef, 
  useImperativeHandle,
  useEffect,
  useState 
} from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import SmartIcon, { SmartSearchIcon, SmartCloseIcon, SmartMailIcon, SmartPhoneIcon, SmartEyeIcon } from './SmartIcon';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const SECURITY_CONFIG = {
  XSS_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<[^>]*>/g  // Only block actual HTML tags, not isolated < or >
  ],
  MAX_INPUT_LENGTH: 10000,
  DEBOUNCE_SECURITY_CHECK: 300,
  RATE_LIMIT_ATTEMPTS: 5,
  SANITIZATION_ENABLED: true,
} as const;

const SIZE_CONFIG = {
  small: { height: 40, fontSize: 14, paddingH: 12, paddingV: 8 },
  medium: { height: 48, fontSize: 16, paddingH: 16, paddingV: 12 },
  large: { height: 56, fontSize: 18, paddingH: 20, paddingV: 16 },
} as const;

const DESIGN_CONFIG = {
  borderRadius: 12,
  borderWidth: 1,
  focusBorderWidth: 2,
  glass: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  focusShimmer: {
    duration: 2000,
    colors: ['transparent', '#EC602A', 'transparent'],
    width: '150%',
  },
  errorShake: {
    translateX: [-10, 10, -8, 8, -6, 6, -4, 4, 0],
    duration: 500,
  },
} as const;

const COLORS = {
  focusBorder: '#EC602A',
  focusShimmer: '#EC602A',
  successBorder: '#10B981',
  successBackground: 'rgba(16, 185, 129, 0.1)',
  errorBorder: '#EF4444',
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  errorShake: '#EF4444',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassBackground: 'rgba(255, 255, 255, 0.08)',
  glassFocus: 'rgba(236, 96, 42, 0.2)',
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type InputVariant = 'default' | 'filled' | 'outlined' | 'underlined' | 'glass';
export type InputState = 'default' | 'focused' | 'error' | 'success' | 'disabled' | 'loading';
export type InputSize = 'small' | 'medium' | 'large';

export interface InputProps {
  // Core
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  
  // Design
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  
  // Labels
  label?: string;
  placeholder?: string;
  helperText?: string;
  
  // State
  disabled?: boolean;
  loading?: boolean;
  readOnly?: boolean;
  error?: string;
  success?: string;
  required?: boolean;
  
  // Input Types
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  
  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  showPasswordToggle?: boolean;
  
  // Styling
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Animation
  animateLabel?: boolean;
  shimmerOnFocus?: boolean;
  disableAnimations?: boolean;
  
  // Security
  enableSanitization?: boolean;
  maxSecurityLength?: number;
  preventPaste?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // RTL
  rtl?: boolean;
  persianText?: boolean;
  persianNumbers?: boolean;
  
  // Advanced
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  autoComplete?: AutoCompleteType;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  showCharacterCount?: boolean;
  characterCountPosition?: 'bottom-right' | 'bottom-left';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  
  // Analytics
  analytics?: {
    fieldName?: string;
    category?: string;
    trackFocus?: boolean;
    trackValidation?: boolean;
  };
  
  // Callbacks
  onSubmitEditing?: () => void;
  onClear?: () => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

type AutoCompleteType = "url" | "email" | "tel" | "additional-name" | "address-line1" | "address-line2" | "birthdate-day" | "birthdate-full" | "birthdate-month" | "birthdate-year" | "cc-csc" | "cc-exp" | "cc-exp-month" | "cc-exp-year" | "cc-family-name" | "cc-given-name" | "cc-middle-name" | "cc-name" | "cc-number" | "cc-type" | "country" | "current-password" | "email" | "family-name" | "gender" | "given-name" | "honorific-prefix" | "honorific-suffix" | "name" | "name-family" | "name-given" | "name-middle" | "name-middle-initial" | "name-prefix" | "name-suffix" | "new-password" | "nickname" | "off" | "one-time-code" | "organization" | "organization-title" | "password" | "password-new" | "postal-address" | "postal-address-country" | "postal-address-extended" | "postal-address-extended-postal-code" | "postal-address-locality" | "postal-address-region" | "postal-code" | "sex" | "sms-otp" | "street-address" | "tel" | "tel-country-code" | "tel-device" | "tel-national" | "url" | "username" | "username-new" | undefined;

export interface InputRef {
  focus(): void;
  blur(): void;
  clear(): void;
  getValue(): string;
  getValidationState(): { isValid: boolean; error?: string };
  showError(message: string): void;
  showSuccess(message?: string): void;
  clearValidation(): void;
}

// ========================================================================================
// SECURITY UTILITIES
// ========================================================================================

const sanitizeInput = (input: string): string => {
  if (!input) return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, ''); // Remove HTML tags but preserve isolated < or >
};

const validateSecurityPatterns = (input: string): boolean => {
  return !SECURITY_CONFIG.XSS_PATTERNS.some(pattern => pattern.test(input));
};

// Persian number utilities
const convertToPersianNumbers = (text: string): string => {
  const englishNumbers = '0123456789';
  const persianNumbers = '۰۱۲۳۴۵۶۷۸۹';
  
  return text.replace(/[0-9]/g, (match) => {
    const index = englishNumbers.indexOf(match);
    return persianNumbers[index] || match;
  });
};

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useFloatingLabel = (hasValue: boolean, isFocused: boolean, animateLabel: boolean) => {
  const labelPositionAnim = useRef(new Animated.Value(hasValue ? 1 : 0)).current;
  const labelScaleAnim = useRef(new Animated.Value(hasValue ? 0.8 : 1)).current;
  const labelColorAnim = useRef(new Animated.Value(0)).current;

  const animateToFloating = useCallback(() => {
    if (!animateLabel) return;
    
    Animated.parallel([
      Animated.timing(labelPositionAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(labelScaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(labelColorAnim, {
        toValue: isFocused ? 1 : 0.5,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [animateLabel, isFocused, labelPositionAnim, labelScaleAnim, labelColorAnim]);

  const animateToPlaceholder = useCallback(() => {
    if (!animateLabel || hasValue) return;
    
    Animated.parallel([
      Animated.timing(labelPositionAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(labelScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(labelColorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [animateLabel, hasValue, labelPositionAnim, labelScaleAnim, labelColorAnim]);

  return {
    labelPositionAnim,
    labelScaleAnim,
    labelColorAnim,
    animateToFloating,
    animateToPlaceholder,
  };
};

const useFocusShimmer = (isFocused: boolean, shimmerOnFocus: boolean) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isFocused && shimmerOnFocus) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: DESIGN_CONFIG.focusShimmer.duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: DESIGN_CONFIG.focusShimmer.duration / 2,
            useNativeDriver: true,
          }),
        ])
      );
      
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [isFocused, shimmerOnFocus, shimmerAnim]);
  
  return shimmerAnim;
};

// ========================================================================================
// INPUT COMPONENT
// ========================================================================================

export const Input = memo(forwardRef<InputRef, InputProps>((props, ref) => {
  const {
    value: propValue,
    onChangeText,
    onFocus,
    onBlur,
    variant = 'default',
    size = 'medium',
    fullWidth = false,
    label,
    placeholder,
    helperText,
    disabled = false,
    loading = false,
    readOnly = false,
    error,
    success,
    required = false,
    secureTextEntry = false,
    multiline = false,
    numberOfLines = 1,
    maxLength,
    leftIcon,
    rightIcon,
    clearable = false,
    showPasswordToggle = false,
    style,
    inputStyle,
    labelStyle,
    animateLabel = true,
    shimmerOnFocus = true,
    disableAnimations = false,
    enableSanitization = true,
    maxSecurityLength,
    preventPaste = false, // eslint-disable-line @typescript-eslint/no-unused-vars
    accessibilityLabel,
    accessibilityHint,
    testID = 'input',
    rtl = false,
    persianText = false, // eslint-disable-line @typescript-eslint/no-unused-vars
    persianNumbers = false,
    debounceMs = 300, // eslint-disable-line @typescript-eslint/no-unused-vars
    validateOnChange = false,
    validateOnBlur = true,
    autoComplete,
    keyboardType,
    returnKeyType,
    showCharacterCount = false,
    characterCountPosition = 'bottom-right',
    analytics,
    onSubmitEditing,
    onClear,
    onValidationChange,
  } = props;

  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [localValue, setLocalValue] = useState(propValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const hasValue = Boolean(localValue);
  const showError = Boolean(validationError || error);
  const showSuccess = Boolean(successMessage || success);
  const sizeConfig = SIZE_CONFIG[size];
  
  // Animation hooks
  const floatingLabel = useFloatingLabel(hasValue, isFocused, animateLabel && !disableAnimations);
  const shimmerAnim = useFocusShimmer(isFocused, shimmerOnFocus && !disableAnimations);
  const errorShakeAnim = useRef(new Animated.Value(0)).current;
  const successGlowAnim = useRef(new Animated.Value(0)).current;
  const focusBorderAnim = useRef(new Animated.Value(0)).current;

  // Security & validation
  const sanitizeAndValidate = useCallback((text: string): string => {
    let processedText = text;
    
    if (enableSanitization) {
      if (!validateSecurityPatterns(text)) {
        console.warn('Input contains potentially unsafe patterns');
        return localValue;
      }
      processedText = sanitizeInput(text);
    }
    
    if (maxSecurityLength && processedText.length > maxSecurityLength) {
      processedText = processedText.substring(0, maxSecurityLength);
    }
    
    if (persianNumbers) {
      processedText = convertToPersianNumbers(processedText);
    }
    
    return processedText;
  }, [enableSanitization, maxSecurityLength, persianNumbers, localValue]);

  const validateInput = useCallback((text: string): { isValid: boolean; error?: string } => {
    if (required && !text.trim()) {
      return { isValid: false, error: 'This field is required' };
    }
    
    if (maxLength && text.length > maxLength) {
      return { isValid: false, error: `Maximum length is ${maxLength} characters` };
    }
    
    return { isValid: true };
  }, [required, maxLength]);

  // Event handlers
  const handleChangeText = useCallback((text: string) => {
    const sanitizedText = sanitizeAndValidate(text);
    setLocalValue(sanitizedText);
    
    if (validateOnChange) {
      const validation = validateInput(sanitizedText);
      setValidationError(validation.error || '');
      onValidationChange?.(validation.isValid, validation.error);
    }
    
    onChangeText?.(sanitizedText);
  }, [sanitizeAndValidate, validateOnChange, validateInput, onValidationChange, onChangeText]);

  const handleFocus = useCallback((event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    
    if (!disableAnimations) {
      Animated.timing(focusBorderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      
      floatingLabel.animateToFloating();
    }
    
    if (analytics?.trackFocus) {
      console.log('Input focused:', analytics.fieldName);
    }
    
    onFocus?.(event);
  }, [disableAnimations, focusBorderAnim, floatingLabel, analytics, onFocus]);

  const handleBlur = useCallback((event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    
    if (!disableAnimations) {
      Animated.timing(focusBorderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      
      floatingLabel.animateToPlaceholder();
    }
    
    if (validateOnBlur) {
      const validation = validateInput(localValue);
      setValidationError(validation.error || '');
      onValidationChange?.(validation.isValid, validation.error);
      
      if (!validation.isValid && !disableAnimations) {
        Animated.sequence([
          Animated.timing(errorShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(errorShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(errorShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(errorShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    }
    
    onBlur?.(event);
  }, [disableAnimations, focusBorderAnim, floatingLabel, validateOnBlur, validateInput, localValue, onValidationChange, errorShakeAnim, onBlur]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    setValidationError('');
    setSuccessMessage('');
    onChangeText?.('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChangeText, onClear]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Imperative API
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: handleClear,
    getValue: () => localValue,
    getValidationState: () => ({ 
      isValid: !validationError, 
      error: validationError 
    }),
    showError: (message: string) => {
      setValidationError(message);
      if (!disableAnimations) {
        Animated.sequence([
          Animated.timing(errorShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(errorShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(errorShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(errorShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    },
    showSuccess: (message?: string) => {
      setSuccessMessage(message || 'Success');
      if (!disableAnimations) {
        Animated.timing(successGlowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setTimeout(() => {
            Animated.timing(successGlowAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }).start();
          }, 2000);
        });
      }
    },
    clearValidation: () => {
      setValidationError('');
      setSuccessMessage('');
    },
  }), [localValue, validationError, handleClear, disableAnimations, errorShakeAnim, successGlowAnim]);

  // Sync with prop value
  useEffect(() => {
    if (propValue !== undefined && propValue !== localValue) {
      const sanitizedValue = sanitizeAndValidate(propValue);
      setLocalValue(sanitizedValue);
    }
  }, [propValue, sanitizeAndValidate]);

  // Effect for error state
  useEffect(() => {
    if (error) {
      setValidationError(typeof error === 'string' ? error : 'Invalid input');
    }
  }, [error]);

  // Effect for success state
  useEffect(() => {
    if (success) {
      setSuccessMessage(typeof success === 'string' ? success : 'Success');
    }
  }, [success]);

  // Styles
  const containerStyle = useMemo((): ViewStyle => ({
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.6 : 1,
  }), [fullWidth, disabled]);

  const inputContainerStyle = useMemo((): any => {
    const baseStyle: ViewStyle = {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingH,
      paddingVertical: sizeConfig.paddingV,
      borderRadius: DESIGN_CONFIG.borderRadius,
      borderWidth: DESIGN_CONFIG.borderWidth,
      position: 'relative',
      overflow: 'hidden',
    };

    const variantStyles = {
      default: {
        backgroundColor: theme.colors.foundation.darker,
        borderColor: focusBorderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [theme.colors.interactive.border.medium, COLORS.focusBorder],
        }),
      },
      filled: {
        backgroundColor: theme.colors.foundation.dark,
        borderColor: focusBorderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['transparent', COLORS.focusBorder],
        }),
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: focusBorderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [theme.colors.interactive.border.medium, COLORS.focusBorder],
        }),
        borderWidth: DESIGN_CONFIG.focusBorderWidth,
      },
      underlined: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottomWidth: DESIGN_CONFIG.borderWidth,
        borderRadius: 0,
        borderBottomColor: focusBorderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [theme.colors.interactive.border.medium, COLORS.focusBorder],
        }),
      },
      glass: {
        backgroundColor: DESIGN_CONFIG.glass.background,
        borderColor: focusBorderAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [DESIGN_CONFIG.glass.borderColor, COLORS.glassFocus],
        }),
        shadowColor: DESIGN_CONFIG.glass.shadowColor,
        shadowOffset: DESIGN_CONFIG.glass.shadowOffset,
        shadowRadius: DESIGN_CONFIG.glass.shadowRadius,
        elevation: DESIGN_CONFIG.glass.elevation,
      },
    };

    const stateStyles = {
      error: {
        borderColor: COLORS.errorBorder,
        backgroundColor: showError ? COLORS.errorBackground : undefined,
      },
      success: {
        borderColor: COLORS.successBorder,
        backgroundColor: showSuccess ? COLORS.successBackground : undefined,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...(showError && stateStyles.error),
      ...(showSuccess && stateStyles.success),
    };
  }, [variant, rtl, theme, focusBorderAnim, showError, showSuccess, sizeConfig]);

  const textInputStyle = useMemo((): TextStyle => ({
    flex: 1,
    fontSize: sizeConfig.fontSize,
    fontFamily: theme.typography.families.primary,
    color: theme.colors.interactive.text.primary,
    textAlign: rtl ? 'right' : 'left',
    paddingVertical: 0,
    ...inputStyle,
  }), [sizeConfig, theme, rtl, inputStyle]);

  const floatingLabelStyle = useMemo((): any => {
    if (!animateLabel || !label) return null;

    const labelColor = floatingLabel.labelColorAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        theme.colors.interactive.text.tertiary,
        theme.colors.interactive.text.secondary,
        showError ? COLORS.errorBorder : COLORS.focusBorder,
      ],
    });

    return {
      position: 'absolute',
      left: rtl ? undefined : sizeConfig.paddingH,
      right: rtl ? sizeConfig.paddingH : undefined,
      fontSize: sizeConfig.fontSize * 0.85,
      color: labelColor,
      backgroundColor: theme.colors.foundation.darkest,
      paddingHorizontal: 4,
      transform: [
        {
          translateY: floatingLabel.labelPositionAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(sizeConfig.height / 2) - 8],
          }),
        },
        { scale: floatingLabel.labelScaleAnim },
      ],
      zIndex: 1,
    };
  }, [animateLabel, label, floatingLabel, theme, rtl, sizeConfig, showError]);

  const staticLabelStyle = useMemo((): TextStyle => ({
    fontSize: sizeConfig.fontSize * 0.85,
    fontFamily: theme.typography.families.primary,
    color: showError ? COLORS.errorBorder : theme.colors.interactive.text.secondary,
    marginBottom: theme.spacing.xs,
    textAlign: rtl ? 'right' : 'left',
    ...labelStyle,
  }), [sizeConfig, theme, showError, rtl, labelStyle]);

  const helperTextStyle = useMemo((): TextStyle => ({
    fontSize: sizeConfig.fontSize * 0.8,
    fontFamily: theme.typography.families.primary,
    color: showError
      ? COLORS.errorBorder
      : showSuccess
      ? COLORS.successBorder
      : theme.colors.interactive.text.tertiary,
    marginTop: theme.spacing.xs,
    textAlign: rtl ? 'right' : 'left',
  }), [sizeConfig, theme, showError, showSuccess, rtl]);

  // Render helpers
  const renderShimmerEffect = useCallback(() => {
    if (!shimmerOnFocus || !isFocused || disableAnimations) return null;

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: DESIGN_CONFIG.focusShimmer.width,
          height: '100%',
          backgroundColor: COLORS.focusShimmer,
          opacity: 0.3,
          transform: [
            { skewX: '45deg' },
            {
              translateX: shimmerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['-150%', '150%'],
              }),
            },
          ],
        }}
        pointerEvents="none"
      />
    );
  }, [shimmerOnFocus, isFocused, disableAnimations, shimmerAnim]);

  const renderLeftIcon = useCallback(() => {
    if (!leftIcon) return null;

    return (
      <View style={{
        marginRight: rtl ? 0 : theme.spacing.sm,
        marginLeft: rtl ? theme.spacing.sm : 0,
      }}>
        {leftIcon}
      </View>
    );
  }, [leftIcon, rtl, theme.spacing.sm]);

  const renderRightActions = useCallback(() => {
    const actions = [];

    if (loading) {
      actions.push(
        <ActivityIndicator
          key="loading"
          size="small"
          color={theme.colors.interactive.text.secondary}
          style={{ marginLeft: rtl ? 0 : theme.spacing.sm, marginRight: rtl ? theme.spacing.sm : 0 }}
        />
      );
    }

    if (showPasswordToggle && secureTextEntry && !loading) {
      actions.push(
        <Pressable
          key="password-toggle"
          onPress={togglePasswordVisibility}
          style={{
            marginLeft: rtl ? 0 : theme.spacing.sm,
            marginRight: rtl ? theme.spacing.sm : 0,
            padding: 4,
          }}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
        >
          <SmartIcon 
            name={showPassword ? 'eye' : 'eye-off'} 
            size={sizeConfig.fontSize} 
            color={theme.colors.interactive.text.secondary} 
          />
        </Pressable>
      );
    }

    if (clearable && hasValue && !loading && !showPasswordToggle) {
      actions.push(
        <Pressable
          key="clear"
          onPress={handleClear}
          style={{
            marginLeft: rtl ? 0 : theme.spacing.sm,
            marginRight: rtl ? theme.spacing.sm : 0,
            padding: 4,
          }}
          accessibilityLabel="Clear input"
          accessibilityRole="button"
        >
          <SmartCloseIcon 
            size={sizeConfig.fontSize} 
            color={theme.colors.interactive.text.secondary} 
          />
        </Pressable>
      );
    }

    if (rightIcon && !loading && !clearable && !showPasswordToggle) {
      actions.push(
        <View
          key="right-icon"
          style={{
            marginLeft: rtl ? 0 : theme.spacing.sm,
            marginRight: rtl ? theme.spacing.sm : 0,
          }}
        >
          {rightIcon}
        </View>
      );
    }

    return actions.length > 0 ? actions : null;
  }, [
    loading,
    showPasswordToggle,
    secureTextEntry,
    clearable,
    hasValue,
    rightIcon,
    rtl,
    theme,
    sizeConfig,
    showPassword,
    togglePasswordVisibility,
    handleClear,
  ]);

  return (
    <View style={[containerStyle, style]}>
      {/* Static Label */}
      {label && !animateLabel && (
        <Text style={staticLabelStyle}>
          {label}
          {required && <Text style={{ color: COLORS.errorBorder }}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          inputContainerStyle,
          {
            transform: [{ translateX: errorShakeAnim }],
            shadowOpacity: successGlowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            shadowColor: COLORS.successBorder,
            shadowRadius: successGlowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            }),
            elevation: successGlowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 5],
            }),
          },
        ]}
      >
        {/* Focus Shimmer */}
        {renderShimmerEffect()}

        {/* Floating Label */}
        {label && animateLabel && (
          <Animated.Text style={floatingLabelStyle}>
            {label}
            {required && <Text style={{ color: COLORS.errorBorder }}> *</Text>}
          </Animated.Text>
        )}

        {/* Left Icon */}
        {renderLeftIcon()}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          value={localValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={animateLabel && isFocused ? undefined : placeholder}
          placeholderTextColor={theme.colors.interactive.text.tertiary}
          editable={!disabled && !loading && !readOnly}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          autoComplete={autoComplete as any}
          style={textInputStyle}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          testID={testID}
          onSubmitEditing={onSubmitEditing}
        />

        {/* Right Actions */}
        {renderRightActions()}
      </Animated.View>

      {/* Helper Text */}
      {(helperText || validationError || successMessage) && (
        <Text style={helperTextStyle}>
          {validationError || successMessage || helperText}
        </Text>
      )}

      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <View style={{
          flexDirection: 'row',
          justifyContent: characterCountPosition === 'bottom-right' ? 'flex-end' : 'flex-start',
          marginTop: theme.spacing.xs,
        }}>
          <Text style={{
            fontSize: sizeConfig.fontSize * 0.75,
            fontFamily: theme.typography.families.primary,
            color: maxLength && localValue.length > maxLength * 0.9
              ? COLORS.errorBorder
              : theme.colors.interactive.text.tertiary,
            textAlign: characterCountPosition === 'bottom-right' ? 'right' : 'left',
          }}>
            {localValue.length}/{maxLength}
          </Text>
        </View>
      )}
    </View>
  );
}));

Input.displayName = 'Input';

// ========================================================================================
// PRESET COMPONENTS
// ========================================================================================

export const GlassInput: React.FC<Omit<InputProps, 'variant'>> = memo((props) => (
  <Input {...props} variant="glass" />
));

export const PasswordInput: React.FC<Omit<InputProps, 'secureTextEntry' | 'showPasswordToggle'>> = memo((props) => (
  <Input 
    {...props} 
    secureTextEntry={true} 
    showPasswordToggle={true}
    keyboardType="default"
    autoComplete="password"
  />
));

export const PersianInput: React.FC<Omit<InputProps, 'persianText' | 'rtl'>> = memo((props) => (
  <Input 
    {...props} 
    persianText={true} 
    rtl={true}
    persianNumbers={true}
  />
));

export const SearchInput: React.FC<Omit<InputProps, 'leftIcon' | 'clearable'>> = memo((props) => (
  <Input 
    {...props} 
    leftIcon={<SmartSearchIcon size={16} style={{ opacity: 0.6 }} />}
    clearable={true}
    placeholder={props.placeholder || 'Search...'}
    keyboardType="default"
    returnKeyType="search"
  />
));

export const TextArea: React.FC<Omit<InputProps, 'multiline' | 'numberOfLines'>> = memo((props) => (
  <Input 
    {...props} 
    multiline={true}
    numberOfLines={4}
    variant={props.variant || 'outlined'}
    animateLabel={false}
  />
));

export const EmailInput: React.FC<Omit<InputProps, 'keyboardType' | 'autoComplete'>> = memo((props) => (
  <Input 
    {...props}
    keyboardType="email-address"
    autoComplete="email"
    placeholder={props.placeholder || 'Enter your email'}
    leftIcon={<SmartMailIcon size={16} style={{ opacity: 0.6 }} />}
  />
));

export const PhoneInput: React.FC<Omit<InputProps, 'keyboardType' | 'autoComplete'>> = memo((props) => (
  <Input 
    {...props}
    keyboardType="phone-pad"
    autoComplete="tel"
    placeholder={props.placeholder || 'Enter phone number'}
    leftIcon={<SmartPhoneIcon size={16} style={{ opacity: 0.6 }} />}
  />
));

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Input;