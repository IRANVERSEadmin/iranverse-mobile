// src/components/ui/PasswordField.tsx
// IRANVERSE Enterprise PasswordField - Advanced Security with Tesla Aesthetics
// Real-time strength validation with biometric integration and enterprise security
// Built for 90M users - Revolutionary password experience

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
  TouchableOpacity,
  Platform,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import Input, { InputProps, InputRef } from './Input';
import { useTheme } from '../../theme/ThemeProvider';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const SECURITY_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  ENTROPY_THRESHOLD: {
    WEAK: 25,
    FAIR: 50,
    GOOD: 75,
    STRONG: 100,
  },
  PATTERN_SCORES: {
    LOWERCASE: 26,
    UPPERCASE: 26,
    NUMBERS: 10,
    SPECIAL: 32,
    EXTENDED: 94,
  },
  COMMON_PATTERNS: [
    '123456', 'password', 'qwerty', 'abc123', 'letmein',
    'welcome', 'admin', 'login', 'master', 'dragon',
  ],
  DEBOUNCE_VALIDATION: 300,
  BIOMETRIC_TIMEOUT: 30000, // 30 seconds
} as const;

const ANIMATION_CONFIG = {
  STRENGTH_METER: {
    DURATION: 400,
    SEGMENTS: 4,
    GLOW_INTENSITY: 0.8,
  },
  ERROR_SHAKE: {
    DURATION: 500,
    INTENSITY: 10,
  },
  SUCCESS_PULSE: {
    DURATION: 600,
    SCALE: 1.05,
  },
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  weight?: number;
}

export interface PasswordStrengthInfo {
  strength: PasswordStrength;
  score: number;
  entropy: number;
  feedback: string[];
  requirements: {
    met: string[];
    unmet: string[];
  };
}

export interface PasswordFieldProps extends Omit<InputProps, 'secureTextEntry' | 'rightIcon'> {
  // Strength meter
  strengthMeter?: boolean;
  strengthRequirements?: PasswordRequirement[];
  showStrengthText?: boolean;
  minStrength?: PasswordStrength;
  onStrengthChange?: (strength: PasswordStrengthInfo) => void;
  
  // Security
  passwordBlacklist?: string[];
  preventCopy?: boolean;
  biometricAuth?: boolean;
  generatePassword?: boolean;
  passwordGenerator?: () => string;
  
  // Visual
  showRequirements?: boolean;
  requirementsPosition?: 'below' | 'tooltip';
  strengthMeterPosition?: 'below' | 'inside';
  
  // Enterprise
  enforcePolicy?: boolean;
  policyName?: string;
  onPolicyViolation?: (violations: string[]) => void;
  
  // Analytics
  trackStrength?: boolean;
  trackGeneratedPasswords?: boolean;
}

export interface PasswordFieldRef extends InputRef {
  generatePassword: () => void;
  validatePassword: () => PasswordStrengthInfo;
  toggleVisibility: () => void;
  checkBiometric: () => Promise<boolean>;
  getStrength: () => PasswordStrength;
}

// ========================================================================================
// PASSWORD STRENGTH CALCULATION
// ========================================================================================

const calculateEntropy = (password: string): number => {
  if (!password) return 0;
  
  const charSpace = {
    lowercase: /[a-z]/.test(password) ? SECURITY_CONFIG.PATTERN_SCORES.LOWERCASE : 0,
    uppercase: /[A-Z]/.test(password) ? SECURITY_CONFIG.PATTERN_SCORES.UPPERCASE : 0,
    numbers: /[0-9]/.test(password) ? SECURITY_CONFIG.PATTERN_SCORES.NUMBERS : 0,
    special: /[^a-zA-Z0-9]/.test(password) ? SECURITY_CONFIG.PATTERN_SCORES.SPECIAL : 0,
  };
  
  const totalCharSpace = Object.values(charSpace).reduce((sum, val) => sum + val, 0);
  const entropy = password.length * Math.log2(totalCharSpace || 1);
  
  return Math.min(entropy, 128); // Cap at 128 bits
};

const getPasswordStrength = (entropy: number): PasswordStrength => {
  if (entropy < SECURITY_CONFIG.ENTROPY_THRESHOLD.WEAK) return 'weak';
  if (entropy < SECURITY_CONFIG.ENTROPY_THRESHOLD.FAIR) return 'fair';
  if (entropy < SECURITY_CONFIG.ENTROPY_THRESHOLD.GOOD) return 'good';
  return 'strong';
};

const generateSecurePassword = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one of each type
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 27)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ========================================================================================
// DEFAULT REQUIREMENTS
// ========================================================================================

const DEFAULT_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    validator: (pwd) => pwd.length >= SECURITY_CONFIG.MIN_LENGTH,
    weight: 2,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    validator: (pwd) => /[A-Z]/.test(pwd),
    weight: 1,
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    validator: (pwd) => /[a-z]/.test(pwd),
    weight: 1,
  },
  {
    id: 'number',
    label: 'One number',
    validator: (pwd) => /[0-9]/.test(pwd),
    weight: 1,
  },
  {
    id: 'special',
    label: 'One special character',
    validator: (pwd) => /[^a-zA-Z0-9]/.test(pwd),
    weight: 1,
  },
];

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useStrengthAnimation = (strength: PasswordStrength) => {
  const strengthAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const segmentAnims = useRef(
    Array.from({ length: ANIMATION_CONFIG.STRENGTH_METER.SEGMENTS }, () => new Animated.Value(0))
  ).current;
  
  useEffect(() => {
    const strengthMap = { weak: 0.25, fair: 0.5, good: 0.75, strong: 1 };
    const targetValue = strengthMap[strength] || 0;
    
    // Animate main strength bar
    Animated.spring(strengthAnim, {
      toValue: targetValue,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
    
    // Animate individual segments
    segmentAnims.forEach((anim, index) => {
      const segmentThreshold = (index + 1) / ANIMATION_CONFIG.STRENGTH_METER.SEGMENTS;
      Animated.timing(anim, {
        toValue: targetValue >= segmentThreshold ? 1 : 0,
        duration: ANIMATION_CONFIG.STRENGTH_METER.DURATION,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    });
    
    // Glow effect for strong passwords
    if (strength === 'strong') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: ANIMATION_CONFIG.STRENGTH_METER.GLOW_INTENSITY,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [strength, strengthAnim, glowAnim, segmentAnims]);
  
  return { strengthAnim, glowAnim, segmentAnims };
};

// ========================================================================================
// BIOMETRIC AUTHENTICATION HOOK - DISABLED FOR EXPO COMPATIBILITY
// ========================================================================================

const useBiometricAuth = (enabled: boolean) => {
  // Biometric authentication disabled to avoid RNPermissionsModule error in Expo
  // To enable biometric auth in the future, use expo-local-authentication instead
  return { 
    biometricAvailable: false, 
    biometricType: null as 'face' | 'fingerprint' | null, 
    authenticate: async () => false 
  };
};

// ========================================================================================
// PASSWORD FIELD COMPONENT
// ========================================================================================

export const PasswordField = memo(forwardRef<PasswordFieldRef, PasswordFieldProps>((props, ref) => {
  const {
    strengthMeter = true,
    strengthRequirements = DEFAULT_REQUIREMENTS,
    showStrengthText = true,
    minStrength = 'fair',
    onStrengthChange,
    passwordBlacklist = SECURITY_CONFIG.COMMON_PATTERNS,
    preventCopy = true,
    biometricAuth = false,
    generatePassword = true,
    passwordGenerator = generateSecurePassword,
    showRequirements = true,
    requirementsPosition = 'below',
    strengthMeterPosition = 'below',
    enforcePolicy = false,
    policyName = 'Default',
    onPolicyViolation,
    trackStrength = true,
    trackGeneratedPasswords = false,
    value,
    onChangeText,
    placeholder = 'Enter your password',
    error,
    disabled,
    loading,
    style,
    ...restProps
  } = props;
  
  const theme = useTheme();
  const inputRef = useRef<InputRef>(null);
  const [localValue, setLocalValue] = useState(value || '');
  const [isVisible, setIsVisible] = useState(false);
  const [strengthInfo, setStrengthInfo] = useState<PasswordStrengthInfo>({
    strength: 'weak',
    score: 0,
    entropy: 0,
    feedback: [],
    requirements: { met: [], unmet: [] },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  // const [showRequirementsTooltip, setShowRequirementsTooltip] = useState(false);
  
  // Biometric auth disabled for Expo compatibility
  const { biometricAvailable, biometricType, authenticate } = useBiometricAuth(false);
  const { segmentAnims } = useStrengthAnimation(strengthInfo.strength);
  
  // Validation timer for debouncing
  const validationTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Calculate password strength
  const calculateStrength = useCallback((password: string): PasswordStrengthInfo => {
    const entropy = calculateEntropy(password);
    const strength = getPasswordStrength(entropy);
    const score = Math.round((entropy / 128) * 100);
    
    // Check requirements
    const met: string[] = [];
    const unmet: string[] = [];
    const feedback: string[] = [];
    
    strengthRequirements.forEach((req) => {
      if (req.validator(password)) {
        met.push(req.id);
      } else {
        unmet.push(req.id);
        feedback.push(req.label);
      }
    });
    
    // Check blacklist
    const lowerPassword = password.toLowerCase();
    if (passwordBlacklist.some(blacklisted => lowerPassword.includes(blacklisted))) {
      feedback.push('Avoid common passwords');
    }
    
    // Additional feedback
    if (password.length < SECURITY_CONFIG.MIN_LENGTH) {
      feedback.push(`Use at least ${SECURITY_CONFIG.MIN_LENGTH} characters`);
    }
    
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      feedback.push('Mix uppercase and lowercase letters');
    }
    
    if (!/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('Include numbers and symbols');
    }
    
    return {
      strength,
      score,
      entropy,
      feedback,
      requirements: { met, unmet },
    };
  }, [strengthRequirements, passwordBlacklist]);
  
  // Handle password change with debounced validation
  const handlePasswordChange = useCallback((text: string) => {
    setLocalValue(text);
    onChangeText?.(text);
    
    // Clear existing timer
    if (validationTimer.current) {
      clearTimeout(validationTimer.current);
    }
    
    // Debounce validation
    validationTimer.current = setTimeout(() => {
      const info = calculateStrength(text);
      setStrengthInfo(info);
      onStrengthChange?.(info);
      
      // Check policy violations
      if (enforcePolicy && info.requirements.unmet.length > 0) {
        onPolicyViolation?.(info.requirements.unmet);
      }
      
      // Analytics
      if (trackStrength) {
        console.log('Password strength:', info.strength, 'Score:', info.score);
      }
    }, SECURITY_CONFIG.DEBOUNCE_VALIDATION);
  }, [calculateStrength, onChangeText, onStrengthChange, enforcePolicy, onPolicyViolation, trackStrength]);
  
  // Toggle password visibility
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }
  }, []);
  
  // Generate password
  const handleGeneratePassword = useCallback(() => {
    setIsGenerating(true);
    
    // Animate generation
    setTimeout(() => {
      const newPassword = passwordGenerator();
      setLocalValue(newPassword);
      onChangeText?.(newPassword);
      
      // Calculate strength immediately
      const info = calculateStrength(newPassword);
      setStrengthInfo(info);
      onStrengthChange?.(info);
      
      setIsGenerating(false);
      
      // Analytics
      if (trackGeneratedPasswords) {
        console.log('Generated password with strength:', info.strength);
      }
    }, 300);
  }, [passwordGenerator, onChangeText, calculateStrength, onStrengthChange, trackGeneratedPasswords]);
  
  // Biometric check
  const checkBiometric = useCallback(async (): Promise<boolean> => {
    if (!biometricAvailable) return false;
    
    const result = await authenticate();
    if (result) {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), SECURITY_CONFIG.BIOMETRIC_TIMEOUT);
    }
    
    return result;
  }, [biometricAvailable, authenticate]);
  
  // Imperative API
  useImperativeHandle(ref, () => ({
    ...inputRef.current!,
    generatePassword: handleGeneratePassword,
    validatePassword: () => calculateStrength(localValue),
    toggleVisibility,
    checkBiometric,
    getStrength: () => strengthInfo.strength,
  }), [handleGeneratePassword, calculateStrength, localValue, toggleVisibility, checkBiometric, strengthInfo.strength]);
  
  // Sync with prop value
  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
      const info = calculateStrength(value);
      setStrengthInfo(info);
    }
  }, [value, localValue, calculateStrength]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (validationTimer.current) {
        clearTimeout(validationTimer.current);
      }
    };
  }, []);
  
  // Styles
  const getStrengthColor = useCallback(() => {
    switch (strengthInfo.strength) {
      case 'weak': return theme.colors.accent.critical;
      case 'fair': return theme.colors.accent.warning;
      case 'good': return '#4CAF50';
      case 'strong': return theme.colors.accent.success;
      default: return theme.colors.interactive.text.tertiary;
    }
  }, [strengthInfo.strength, theme]);
  
  const getStrengthText = useCallback(() => {
    switch (strengthInfo.strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return '';
    }
  }, [strengthInfo.strength]);
  
  // Right icon component
  const renderRightIcon = useMemo(() => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {generatePassword && !loading && (
        <TouchableOpacity
          onPress={handleGeneratePassword}
          disabled={disabled || isGenerating}
          style={{
            padding: theme.spacing.xs,
            marginRight: theme.spacing.xs,
          }}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={theme.colors.interactive.text.secondary} />
          ) : (
            <Text style={{ fontSize: 18 }}>🎲</Text>
          )}
        </TouchableOpacity>
      )}
      
      {biometricAvailable && !loading && (
        <TouchableOpacity
          onPress={checkBiometric}
          disabled={disabled}
          style={{
            padding: theme.spacing.xs,
            marginRight: theme.spacing.xs,
          }}
        >
          <Text style={{ fontSize: 18 }}>
            {biometricType === 'face' ? '👤' : '👆'}
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        onPress={toggleVisibility}
        disabled={disabled || loading}
        style={{ padding: theme.spacing.xs }}
        accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
      >
        <Text style={{
          fontSize: 16,
          color: theme.colors.interactive.text.secondary,
        }}>
          {isVisible ? '👁️' : '🔒'}
        </Text>
      </TouchableOpacity>
    </View>
  ), [generatePassword, loading, handleGeneratePassword, disabled, isGenerating, biometricAvailable, checkBiometric, biometricType, toggleVisibility, isVisible, theme]);
  
  // Strength meter component
  const renderStrengthMeter = useMemo(() => {
    if (!strengthMeter || !localValue) return null;
    
    return (
      <View style={{ marginTop: theme.spacing.sm }}>
        {/* Segmented strength bar */}
        <View style={{
          flexDirection: 'row',
          height: 4,
          gap: 2,
        }}>
          {segmentAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={{
                flex: 1,
                backgroundColor: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [theme.colors.glass.subtle, getStrengthColor()],
                }),
                borderRadius: 2,
                opacity: anim,
                transform: [{
                  scaleY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                }],
              }}
            />
          ))}
        </View>
        
        {/* Strength text */}
        {showStrengthText && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing.xs,
          }}>
            <Text style={{
              fontSize: 12,
              fontFamily: theme.typography.families.primary,
              color: getStrengthColor(),
              fontWeight: '600',
            }}>
              {getStrengthText()}
            </Text>
            <Text style={{
              fontSize: 11,
              fontFamily: theme.typography.families.mono,
              color: theme.colors.interactive.text.tertiary,
            }}>
              {strengthInfo.score}% secure
            </Text>
          </View>
        )}
      </View>
    );
  }, [strengthMeter, localValue, segmentAnims, theme, getStrengthColor, showStrengthText, getStrengthText, strengthInfo.score]);
  
  // Requirements list component
  const renderRequirements = useMemo(() => {
    if (!showRequirements || !localValue) return null;
    
    return (
      <View style={{
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.glass.subtle,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
      }}>
        <Text style={{
          fontSize: 12,
          fontFamily: theme.typography.families.primary,
          color: theme.colors.interactive.text.secondary,
          marginBottom: theme.spacing.sm,
          fontWeight: '600',
        }}>
          Password Requirements
        </Text>
        {strengthRequirements.map((req) => {
          const isMet = strengthInfo.requirements.met.includes(req.id);
          return (
            <View
              key={req.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 2,
              }}
            >
              <Text style={{
                fontSize: 14,
                color: isMet ? theme.colors.accent.success : theme.colors.interactive.text.tertiary,
                marginRight: theme.spacing.xs,
              }}>
                {isMet ? '✓' : '○'}
              </Text>
              <Text style={{
                fontSize: 13,
                fontFamily: theme.typography.families.primary,
                color: isMet ? theme.colors.interactive.text.primary : theme.colors.interactive.text.tertiary,
                textDecorationLine: isMet ? 'none' : 'none',
              }}>
                {req.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }, [showRequirements, localValue, theme, strengthRequirements, strengthInfo.requirements.met]);
  
  return (
    <View style={style}>
      <Input
        ref={inputRef}
        value={localValue}
        onChangeText={handlePasswordChange}
        secureTextEntry={!isVisible}
        rightIcon={renderRightIcon}
        placeholder={placeholder}
        error={error || (enforcePolicy && strengthInfo.requirements.unmet.length > 0 ? 
          `Password does not meet ${policyName} policy requirements` : undefined)}
        disabled={disabled}
        loading={loading}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        // textContentType="password"
        {...restProps}
      />
      
      {strengthMeterPosition === 'below' && renderStrengthMeter}
      {requirementsPosition === 'below' && renderRequirements}
    </View>
  );
}));

PasswordField.displayName = 'PasswordField';

// ========================================================================================
// PRESET COMPONENTS
// ========================================================================================

export const EnterprisePasswordField = memo<Omit<PasswordFieldProps, 'enforcePolicy'>>((props) => (
  <PasswordField
    {...props}
    enforcePolicy={true}
    strengthRequirements={[
      ...DEFAULT_REQUIREMENTS,
      {
        id: 'no_spaces',
        label: 'No spaces allowed',
        validator: (pwd) => !/\s/.test(pwd),
      },
      {
        id: 'no_repeating',
        label: 'No repeating characters (aaa, 111)',
        validator: (pwd) => !/(.)\1{2,}/.test(pwd),
      },
    ]}
    minStrength="good"
  />
));

EnterprisePasswordField.displayName = 'EnterprisePasswordField';

export const BiometricPasswordField = memo<Omit<PasswordFieldProps, 'biometricAuth'>>((props) => (
  <PasswordField
    {...props}
    biometricAuth={true}
    preventCopy={true}
  />
));

BiometricPasswordField.displayName = 'BiometricPasswordField';

export const SimplePasswordField = memo<Omit<PasswordFieldProps, 'strengthMeter' | 'showRequirements'>>((props) => (
  <PasswordField
    {...props}
    strengthMeter={false}
    showRequirements={false}
    generatePassword={false}
  />
));

SimplePasswordField.displayName = 'SimplePasswordField';

// ========================================================================================
// EXPORTS
// ========================================================================================

export default PasswordField;