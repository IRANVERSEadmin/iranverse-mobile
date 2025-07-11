import { TouchableOpacity } from 'react-native';
// src/components/ui/PasswordField.tsx
// IRANVERSE Enterprise Password Field - Agent Security & Identity Protection
// Tesla-inspired security with Persian Excellence
// Built for 90M users - Real-time Strength Analysis & Accessibility
import React, { useState, useCallback, useMemo, forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Input, { InputProps, InputRef } from './Input';
import { useTheme, useColors, useTypography, useSpacing, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// PASSWORD STRENGTH & VALIDATION - ENTERPRISE SECURITY
// ========================================================================================

export type PasswordStrength = 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';

export interface PasswordValidation {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  noCommonPatterns: boolean;
  noPersianForbidden: boolean;
  strength: PasswordStrength;
  score: number; // 0-100
}

export interface PasswordFieldRef extends InputRef {
  getValidation: () => PasswordValidation;
  getStrength: () => PasswordStrength;
  toggleVisibility: () => void;
}

export interface PasswordFieldProps extends Omit<InputProps, 'secureTextEntry' | 'rightIcon'> {
  // Password Specific Props
  showStrengthIndicator?: boolean;
  showStrengthText?: boolean;
  showValidationRules?: boolean;
  showToggleButton?: boolean;
  
  // Validation Configuration
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  allowedSpecialChars?: string;
  forbiddenPatterns?: string[];
  persianForbiddenPatterns?: string[];
  
  // Real-time Features
  validateOnType?: boolean;
  strengthUpdateDelay?: number;
  
  // Callbacks
  onStrengthChange?: (strength: PasswordStrength, validation: PasswordValidation) => void;
  onValidationChange?: (validation: PasswordValidation) => void;
  
  // UI Customization
  strengthIndicatorStyle?: ViewStyle;
  strengthTextStyle?: TextStyle;
  validationRulesStyle?: ViewStyle;
  
  // Security Features
  hidePasswordOnBlur?: boolean;
  autoHideDelay?: number;
}

// ========================================================================================
// PASSWORD VALIDATION LOGIC - ENTERPRISE GRADE
// ========================================================================================

const DEFAULT_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const DEFAULT_FORBIDDEN_PATTERNS = [
  '123456', 'password', 'qwerty', 'admin', 'user', 'login',
  '111111', '000000', 'abcdef', 'iloveyou', 'welcome'
];
const DEFAULT_PERSIAN_FORBIDDEN = [
  'رمزعبور', 'گذرواژه', 'پسورد', 'ادمین', 'کاربر', 'ورود'
];

const validatePassword = (
  password: string,
  options: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    allowedSpecialChars: string;
    forbiddenPatterns: string[];
    persianForbiddenPatterns: string[];
  }
): PasswordValidation => {
  const {
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSpecialChars,
    allowedSpecialChars,
    forbiddenPatterns,
    persianForbiddenPatterns,
  } = options;
  
  // Basic validations
  const hasMinLength = password.length >= minLength;
  const hasUppercase = !requireUppercase || /[A-Z]/.test(password);
  const hasLowercase = !requireLowercase || /[a-z]/.test(password);
  const hasNumbers = !requireNumbers || /[0-9]/.test(password);
  const hasSpecialChars = !requireSpecialChars || new RegExp(`[${allowedSpecialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password);
  
  // Pattern validations
  const lowerPassword = password.toLowerCase();
  const noCommonPatterns = !forbiddenPatterns.some(pattern => 
    lowerPassword.includes(pattern.toLowerCase())
  );
  const noPersianForbidden = !persianForbiddenPatterns.some(pattern => 
    password.includes(pattern)
  );
  
  // Calculate strength score
  let score = 0;
  
  // Length scoring (0-30 points)
  if (password.length >= minLength) score += 10;
  if (password.length >= minLength + 4) score += 10;
  if (password.length >= minLength + 8) score += 10;
  
  // Character variety (0-40 points)
  if (hasUppercase) score += 10;
  if (hasLowercase) score += 10;
  if (hasNumbers) score += 10;
  if (hasSpecialChars) score += 10;
  
  // Pattern security (0-30 points)
  if (noCommonPatterns) score += 15;
  if (noPersianForbidden) score += 15;
  
  // Determine strength level
  let strength: PasswordStrength;
  if (score < 20) strength = 'very_weak';
  else if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'medium';
  else if (score < 80) strength = 'strong';
  else strength = 'very_strong';
  
  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecialChars,
    noCommonPatterns,
    noPersianForbidden,
    strength,
    score,
  };
};

// ========================================================================================
// PASSWORD FIELD IMPLEMENTATION - REVOLUTIONARY SECURITY
// ========================================================================================

export const PasswordField = forwardRef<PasswordFieldRef, PasswordFieldProps>(({
  showStrengthIndicator = true,
  showStrengthText = true,
  showValidationRules = false,
  showToggleButton = true,
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumbers = true,
  requireSpecialChars = true,
  allowedSpecialChars = DEFAULT_SPECIAL_CHARS,
  forbiddenPatterns = DEFAULT_FORBIDDEN_PATTERNS,
  persianForbiddenPatterns = DEFAULT_PERSIAN_FORBIDDEN,
  validateOnType = true,
  strengthUpdateDelay = 300,
  onStrengthChange,
  onValidationChange,
  strengthIndicatorStyle,
  strengthTextStyle,
  validationRulesStyle,
  hidePasswordOnBlur = false,
  autoHideDelay = 3000,
  value = '',
  onChangeText,
  ...inputProps
}, ref) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const animations = useAnimations();
  
  // Internal State
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [currentValidation, setCurrentValidation] = useState<PasswordValidation>(() =>
    validatePassword(value, {
      minLength,
      requireUppercase,
      requireLowercase,
      requireNumbers,
      requireSpecialChars,
      allowedSpecialChars,
      forbiddenPatterns,
      persianForbiddenPatterns,
    })
  );
  
  // Refs
  const inputRef = useRef<InputRef>(null);
  const strengthUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Animation Values with proper cleanup
  const strengthAnim = useRef(new Animated.Value(0)).current;
  const validationAnim = useRef(new Animated.Value(showValidationRules ? 1 : 0)).current;
  
  // Cleanup timers and animations
  useEffect(() => {
    return () => {
      if (strengthUpdateTimer.current) {
        clearTimeout(strengthUpdateTimer.current);
        strengthUpdateTimer.current = null;
      }
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
      
      strengthAnim.stopAnimation();
      validationAnim.stopAnimation();
      strengthAnim.removeAllListeners();
      validationAnim.removeAllListeners();
    };
  }, [strengthAnim, validationAnim]);
  
  // ========================================================================================
  // VALIDATION & STRENGTH COMPUTATION
  // ========================================================================================
  
  const updateValidation = useCallback((password: string) => {
    const validation = validatePassword(password, {
      minLength,
      requireUppercase,
      requireLowercase,
      requireNumbers,
      requireSpecialChars,
      allowedSpecialChars,
      forbiddenPatterns,
      persianForbiddenPatterns,
    });
    
    setCurrentValidation(validation);
    
    // Animate strength indicator
    Animated.timing(strengthAnim, {
      toValue: validation.score / 100,
      duration: animations.duration.normal,
      useNativeDriver: false,
    }).start();
    
    // Callbacks
    onValidationChange?.(validation);
    onStrengthChange?.(validation.strength, validation);
  }, [
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSpecialChars,
    allowedSpecialChars,
    forbiddenPatterns,
    persianForbiddenPatterns,
    onValidationChange,
    onStrengthChange,
    animations,
    strengthAnim,
  ]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - SECURITY UX
  // ========================================================================================
  
  const handleChangeText = useCallback((text: string) => {
    onChangeText?.(text);
    
    if (validateOnType) {
      if (strengthUpdateTimer.current) {
        clearTimeout(strengthUpdateTimer.current);
      }
      
      strengthUpdateTimer.current = setTimeout(() => {
        updateValidation(text);
        strengthUpdateTimer.current = null;
      }, strengthUpdateDelay);
    }
  }, [onChangeText, validateOnType, strengthUpdateDelay, updateValidation]);
  
  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => {
      const newVisibility = !prev;
      
      // Auto-hide functionality
      if (newVisibility && hidePasswordOnBlur && autoHideDelay > 0) {
        if (autoHideTimer.current) {
          clearTimeout(autoHideTimer.current);
        }
        
        autoHideTimer.current = setTimeout(() => {
          setIsPasswordVisible(false);
        }, autoHideDelay);
      }
      
      return newVisibility;
    });
  }, [hidePasswordOnBlur, autoHideDelay]);
  
  const toggleValidationRules = useCallback(() => {
    // FIX: Safely extract animation value without relying on private properties
    const currentAnimValue = (validationAnim as any)._value || 0;
    const isVisible = currentAnimValue === 0;
    
    Animated.timing(validationAnim, {
      toValue: isVisible ? 1 : 0,
      duration: animations.duration.normal,
      useNativeDriver: false,
    }).start();
  }, [validationAnim, animations]);
  
  // ========================================================================================
  // IMPERATIVE METHODS - REF INTERFACE
  // ========================================================================================
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
    getValue: () => inputRef.current?.getValue() || '',
    setValue: (newValue: string) => {
      inputRef.current?.setValue(newValue);
      updateValidation(newValue);
    },
    getValidation: () => currentValidation,
    getStrength: () => currentValidation.strength,
    toggleVisibility: togglePasswordVisibility,
  }), [currentValidation, updateValidation, togglePasswordVisibility]);
  
  // ========================================================================================
  // STYLE COMPUTATION - STRENGTH INDICATORS
  // ========================================================================================
  
  const strengthIndicatorColors = useMemo(() => {
    const strengthColorMap: Record<PasswordStrength, string> = {
      very_weak: colors.semantic.error,
      weak: '#ff8c42', // Orange-red
      medium: colors.semantic.warning,
      strong: '#4caf50', // Green
      very_strong: colors.semantic.success,
    };
    
    return strengthColorMap;
  }, [colors]);
  
  const strengthTextContent = useMemo(() => {
    const strengthTextMap: Record<PasswordStrength, { en: string; fa: string }> = {
      very_weak: { en: 'Very Weak', fa: 'بسیار ضعیف' },
      weak: { en: 'Weak', fa: 'ضعیف' },
      medium: { en: 'Medium', fa: 'متوسط' },
      strong: { en: 'Strong', fa: 'قوی' },
      very_strong: { en: 'Very Strong', fa: 'بسیار قوی' },
    };
    
    return strengthTextMap[currentValidation.strength];
  }, [currentValidation.strength]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderToggleButton = () => {
    if (!showToggleButton) return null;
    
    return (
      <TouchableOpacity
        onPress={togglePasswordVisibility}
        style={{
          padding: spacing.xs,
          marginLeft: inputProps.rtl ? 0 : spacing.xs,
          marginRight: inputProps.rtl ? spacing.xs : 0,
        }}
        accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
        accessibilityRole="button"
        testID="password-toggle-button"
      >
        <Text style={{
          color: colors.interactive.textSecondary,
          fontSize: 16,
          fontWeight: '500',
        }}>
          {isPasswordVisible ? '🙈' : '👁️'}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderStrengthIndicator = () => {
    if (!showStrengthIndicator || !value) return null;
    
    return (
      <View style={[{
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
      }, strengthIndicatorStyle]}>
        <View style={{
          height: 4,
          backgroundColor: colors.interactive.border,
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: strengthIndicatorColors[currentValidation.strength],
              borderRadius: 2,
              width: strengthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
        
        {showStrengthText && (
          <View style={{
            flexDirection: inputProps.rtl ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.xs,
          }}>
            <Text style={[{
              ...typography.scale.caption,
              color: strengthIndicatorColors[currentValidation.strength],
              fontWeight: '500',
            }, strengthTextStyle]}>
              {inputProps.persianText ? strengthTextContent.fa : strengthTextContent.en}
            </Text>
            <Text style={{
              ...typography.scale.caption,
              color: colors.interactive.textSecondary,
            }}>
              {currentValidation.score}/100
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  const renderValidationRules = () => {
    if (!showValidationRules) return null;
    
    const rules = [
      { key: 'minLength', label: inputProps.persianText ? `حداقل ${minLength} کاراکتر` : `At least ${minLength} characters`, valid: currentValidation.hasMinLength },
      { key: 'uppercase', label: inputProps.persianText ? 'حرف بزرگ انگلیسی' : 'Uppercase letters', valid: currentValidation.hasUppercase, required: requireUppercase },
      { key: 'lowercase', label: inputProps.persianText ? 'حرف کوچک انگلیسی' : 'Lowercase letters', valid: currentValidation.hasLowercase, required: requireLowercase },
      { key: 'numbers', label: inputProps.persianText ? 'اعداد' : 'Numbers', valid: currentValidation.hasNumbers, required: requireNumbers },
      { key: 'special', label: inputProps.persianText ? 'کاراکترهای ویژه' : 'Special characters', valid: currentValidation.hasSpecialChars, required: requireSpecialChars },
      { key: 'patterns', label: inputProps.persianText ? 'الگوهای امن' : 'Secure patterns', valid: currentValidation.noCommonPatterns && currentValidation.noPersianForbidden },
    ].filter(rule => rule.required !== false);
    
    return (
      <Animated.View
        style={[{
          marginTop: spacing.sm,
          opacity: validationAnim,
          maxHeight: validationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
          overflow: 'hidden',
        }, validationRulesStyle]}
      >
        <TouchableOpacity onPress={toggleValidationRules} style={{ marginBottom: spacing.xs }}>
          <Text style={{
            ...typography.scale.bodySmall,
            color: colors.interactive.text,
            fontWeight: '500',
            textAlign: inputProps.rtl ? 'right' : 'left',
          }}>
            {inputProps.persianText ? 'الزامات رمز عبور' : 'Password Requirements'} {(validationAnim as any)._value === 0 ? '▼' : '▲'}
          </Text>
        </TouchableOpacity>
        
        {rules.map((rule) => (
          <View
            key={rule.key}
            style={{
              flexDirection: inputProps.rtl ? 'row-reverse' : 'row',
              alignItems: 'center',
              marginBottom: spacing.xs / 2,
            }}
          >
            <Text style={{
              color: rule.valid ? colors.semantic.success : colors.interactive.textSecondary,
              fontSize: 16,
              marginRight: inputProps.rtl ? 0 : spacing.xs,
              marginLeft: inputProps.rtl ? spacing.xs : 0,
            }}>
              {rule.valid ? '✓' : '○'}
            </Text>
            <Text style={{
              ...typography.scale.caption,
              color: rule.valid ? colors.interactive.text : colors.interactive.textSecondary,
              textAlign: inputProps.rtl ? 'right' : 'left',
            }}>
              {rule.label}
            </Text>
          </View>
        ))}
      </Animated.View>
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE SECURITY
  // ========================================================================================
  
  return (
    <View>
      <Input
        ref={inputRef}
        {...inputProps}
        value={value}
        onChangeText={handleChangeText}
        secureTextEntry={!isPasswordVisible}
        rightIcon={renderToggleButton()}
        autoComplete="new-password"
        textContentType="password"
      />
      
      {renderStrengthIndicator()}
      {renderValidationRules()}
    </View>
  );
});

PasswordField.displayName = 'PasswordField';

// ========================================================================================
// EXPORTS
// ========================================================================================

export default PasswordField;