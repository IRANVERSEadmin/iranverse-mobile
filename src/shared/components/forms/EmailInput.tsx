// src/components/ui/EmailInput.tsx
// IRANVERSE Enterprise EmailInput - Intelligent Email Validation & Domain Suggestions
// Security-first email input with Tesla-inspired aesthetics and RFC 5322 compliance
// Built for 90M users - Extends Input.tsx foundation

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
  FlatList,
  Pressable,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  Platform,
  UIManager,
} from 'react-native';
import Input, { InputProps, InputRef } from './Input';
import { useTheme } from '../theme/ThemeProvider';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ========================================================================================
// EMAIL SECURITY CONFIGURATION
// ========================================================================================

// Email security configuration (for documentation)
// const EMAIL_SECURITY = {
//   RFC5322_COMPLIANCE: true,
//   XSS_PREVENTION: true, // Inherit from Input.tsx
//   DOMAIN_VALIDATION: true,
//   DISPOSABLE_EMAIL_DETECTION: true,
//   MX_RECORD_CHECK: false, // Optional enterprise feature
//   SANITIZATION: true, // Inherit security patterns
// } as const;

const DOMAIN_INTELLIGENCE = {
  POPULAR_DOMAINS: [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'protonmail.com', 'iran.ir', 'yahoo.ir'
  ],
  SUGGESTION_THRESHOLD: 3, // Characters before showing suggestions
  MAX_SUGGESTIONS: 5,
  AUTOCOMPLETE_ON_TAB: true,
  KEYBOARD_NAVIGATION: true,
} as const;

// Disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 
  'mailinator.com', 'throwaway.email', 'yopmail.com',
];

// RFC 5322 compliant email validation regex
const RFC5322_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export interface EmailInputProps extends Omit<InputProps, 'keyboardType' | 'autoComplete'> {
  // Email-specific
  enableDomainSuggestions?: boolean;
  popularDomains?: string[];
  allowDisposableEmails?: boolean;
  validateMXRecord?: boolean;
  
  // Auto-complete
  enableAutofill?: boolean;
  suggestOnFocus?: boolean;
  maxSuggestions?: number;
  
  // Validation
  strictValidation?: boolean;
  customValidation?: (email: string) => Promise<boolean>;
  onValidationComplete?: (isValid: boolean, email: string) => void;
  
  // Enterprise
  domainWhitelist?: string[];
  domainBlacklist?: string[];
  blockDisposableEmails?: boolean;
  
  // Analytics
  trackDomainUsage?: boolean;
  trackValidationEvents?: boolean;
}

export interface EmailInputRef extends InputRef {
  validateEmail(): Promise<boolean>;
  getDomainSuggestions(): string[];
  selectSuggestion(domain: string): void;
  clearSuggestions(): void;
  getEmailParts(): { local: string; domain: string };
}

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useSuggestionAnimation = () => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const showSuggestions = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, scaleAnim]);

  const hideSuggestions = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, scaleAnim]);

  return {
    slideAnim,
    fadeAnim,
    scaleAnim,
    showSuggestions,
    hideSuggestions,
  };
};

// ========================================================================================
// EMAIL VALIDATION UTILITIES
// ========================================================================================

const validateEmailFormat = (email: string): boolean => {
  return RFC5322_EMAIL_REGEX.test(email);
};

const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

const getEmailParts = (email: string): { local: string; domain: string } => {
  const parts = email.split('@');
  return {
    local: parts[0] || '',
    domain: parts[1] || '',
  };
};

const generateDomainSuggestions = (
  partialEmail: string,
  popularDomains: readonly string[] | string[],
  maxSuggestions: number
): string[] => {
  const { local } = getEmailParts(partialEmail);
  
  if (!local || local.length < DOMAIN_INTELLIGENCE.SUGGESTION_THRESHOLD) {
    return [];
  }

  // If user has started typing domain
  if (partialEmail.includes('@')) {
    const typedDomain = partialEmail.split('@')[1]?.toLowerCase() || '';
    
    if (!typedDomain) {
      // Show all popular domains
      return popularDomains.slice(0, maxSuggestions).map(domain => `${local}@${domain}`);
    }

    // Filter domains based on typed characters
    const filteredDomains = [...popularDomains]
      .filter(domain => domain.toLowerCase().startsWith(typedDomain))
      .slice(0, maxSuggestions)
      .map(domain => `${local}@${domain}`);
    
    return filteredDomains;
  }

  return [];
};

// ========================================================================================
// EMAIL INPUT COMPONENT
// ========================================================================================

export const EmailInput = memo(forwardRef<EmailInputRef, EmailInputProps>((props, ref) => {
  const {
    enableDomainSuggestions = true,
    popularDomains = DOMAIN_INTELLIGENCE.POPULAR_DOMAINS,
    allowDisposableEmails = true,
    validateMXRecord = false,
    enableAutofill = true,
    suggestOnFocus = false,
    maxSuggestions = DOMAIN_INTELLIGENCE.MAX_SUGGESTIONS,
    strictValidation = true,
    customValidation,
    onValidationComplete,
    domainWhitelist,
    domainBlacklist,
    blockDisposableEmails = false,
    trackDomainUsage = false,
    trackValidationEvents = false,
    value,
    onChangeText,
    onFocus,
    onBlur,
    onSubmitEditing,
    placeholder = 'Enter your email',
    leftIcon,
    error,
    success,
    style,
    ...restProps
  } = props;

  const theme = useTheme();
  const inputRef = useRef<InputRef>(null);
  const [localValue, setLocalValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  
  const suggestionAnimation = useSuggestionAnimation();
  const validationIconAnim = useRef(new Animated.Value(0)).current;
  const validationColorAnim = useRef(new Animated.Value(0)).current;
  
  // Additional enterprise hooks
  const { errorMessages, persianErrorMessages } = useEmailValidationErrors();
  const { biometricAvailable: _biometricAvailable, requestBiometricAutofill: _requestBiometricAutofill } = useBiometricAutofill(enableAutofill);
  const { startPerformanceMeasure } = usePerformanceMonitoring();
  const { announceValidation, announceSuggestion } = useAccessibilityAnnouncements();
  const validationStateAnim = useValidationStateAnimation();

  // Generate suggestions based on input
  const updateSuggestions = useCallback((text: string) => {
    if (!enableDomainSuggestions) return;

    const measurePerformance = startPerformanceMeasure('suggestionGenerationTime');
    const newSuggestions = generateDomainSuggestions(text, popularDomains, maxSuggestions);
    measurePerformance();
    
    setSuggestions(newSuggestions);
    
    if (newSuggestions.length > 0) {
      setShowSuggestions(true);
      suggestionAnimation.showSuggestions();
    } else {
      setShowSuggestions(false);
      suggestionAnimation.hideSuggestions();
    }
  }, [enableDomainSuggestions, popularDomains, maxSuggestions, suggestionAnimation, startPerformanceMeasure]);

  // Validate email
  const validateEmail = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    const measurePerformance = startPerformanceMeasure('validationTime');
    
    try {
      const messages = props.rtl ? persianErrorMessages : errorMessages;
      
      // Basic format validation
      if (!validateEmailFormat(localValue)) {
        setValidationState('invalid');
        inputRef.current?.showError(messages.invalid_format);
        validationStateAnim.animateError();
        announceValidation(false, localValue);
        return false;
      }

      const { domain } = getEmailParts(localValue);

      // Domain whitelist check
      if (domainWhitelist && domainWhitelist.length > 0) {
        if (!domainWhitelist.includes(domain)) {
          setValidationState('invalid');
          inputRef.current?.showError(messages.domain_not_whitelisted);
          validationStateAnim.animateError();
          return false;
        }
      }

      // Domain blacklist check
      if (domainBlacklist && domainBlacklist.includes(domain)) {
        setValidationState('invalid');
        inputRef.current?.showError(messages.domain_blacklisted);
        validationStateAnim.animateError();
        return false;
      }

      // Disposable email check
      if (blockDisposableEmails && isDisposableEmail(localValue)) {
        setValidationState('invalid');
        inputRef.current?.showError(messages.disposable_email);
        validationStateAnim.animateError();
        return false;
      }

      // Custom validation
      if (customValidation) {
        const customResult = await customValidation(localValue);
        if (!customResult) {
          setValidationState('invalid');
          inputRef.current?.showError(messages.custom_validation_failed);
          validationStateAnim.animateError();
          return false;
        }
      }

      // MX record validation (placeholder - would require backend)
      if (validateMXRecord) {
        console.log('MX record validation would be performed here');
        // Simulate MX check failure for demo
        // setValidationState('invalid');
        // inputRef.current?.showError(messages.mx_record_invalid);
        // return false;
      }

      setValidationState('valid');
      
      // Success animation
      validationStateAnim.animateSuccess();
      Animated.sequence([
        Animated.timing(validationIconAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(validationColorAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      // Accessibility announcement
      announceValidation(true, localValue);

      // Analytics
      if (trackValidationEvents) {
        console.log('Email validation successful:', domain);
      }

      onValidationComplete?.(true, localValue);
      return true;
    } catch (error) {
      setValidationState('invalid');
      onValidationComplete?.(false, localValue);
      return false;
    } finally {
      setIsValidating(false);
      measurePerformance();
    }
  }, [
    localValue,
    domainWhitelist,
    domainBlacklist,
    blockDisposableEmails,
    customValidation,
    validateMXRecord,
    trackValidationEvents,
    onValidationComplete,
    validationIconAnim,
    validationColorAnim,
    errorMessages,
    persianErrorMessages,
    props.rtl,
    validationStateAnim,
    announceValidation,
    startPerformanceMeasure,
  ]);

  // Handle text change
  const handleChangeText = useCallback((text: string) => {
    const lowercaseText = text.toLowerCase().trim();
    setLocalValue(lowercaseText);
    setValidationState('idle');
    updateSuggestions(lowercaseText);
    onChangeText?.(lowercaseText);
  }, [updateSuggestions, onChangeText]);

  // Handle focus
  const handleFocus = useCallback((event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (suggestOnFocus && localValue) {
      updateSuggestions(localValue);
    }
    onFocus?.(event);
  }, [suggestOnFocus, localValue, updateSuggestions, onFocus]);

  // Handle blur
  const handleBlur = useCallback((event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    // Hide suggestions on blur
    setTimeout(() => {
      setShowSuggestions(false);
      suggestionAnimation.hideSuggestions();
    }, 150);

    // Validate on blur if email is complete
    if (localValue && localValue.includes('@')) {
      validateEmail();
    }

    onBlur?.(event);
  }, [localValue, validateEmail, suggestionAnimation, onBlur]);

  // Select suggestion
  const selectSuggestion = useCallback((suggestion: string) => {
    setLocalValue(suggestion);
    onChangeText?.(suggestion);
    setShowSuggestions(false);
    suggestionAnimation.hideSuggestions();
    inputRef.current?.blur();
    
    // Accessibility announcement
    announceSuggestion(suggestion);
    
    // Analytics
    if (trackDomainUsage) {
      const { domain } = getEmailParts(suggestion);
      console.log('Domain selected:', domain);
    }

    // Validate immediately after selection
    setTimeout(() => validateEmail(), 100);
  }, [onChangeText, suggestionAnimation, trackDomainUsage, validateEmail, announceSuggestion]);

  // Keyboard navigation
  const handleKeyPress = useCallback((key: string) => {
    if (!showSuggestions || !DOMAIN_INTELLIGENCE.KEYBOARD_NAVIGATION) return;

    switch (key) {
      case 'ArrowDown':
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        suggestionAnimation.hideSuggestions();
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, selectSuggestion, suggestionAnimation]);

  // Enhanced keyboard event handling for web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: any) => {
      if (!showSuggestions) return;
      
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
        event.preventDefault();
        handleKeyPress(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, handleKeyPress]);

  // Imperative API
  useImperativeHandle(ref, () => ({
    ...inputRef.current!,
    validateEmail,
    getDomainSuggestions: () => suggestions,
    selectSuggestion,
    clearSuggestions: () => {
      setSuggestions([]);
      setShowSuggestions(false);
    },
    getEmailParts: () => getEmailParts(localValue),
  }), [suggestions, selectSuggestion, localValue, validateEmail]);

  // Sync with prop value
  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
      updateSuggestions(value);
    }
  }, [value, localValue, updateSuggestions]);

  // Styles
  const containerStyle = useMemo((): ViewStyle => ({
    position: 'relative',
    ...style as ViewStyle,
  }), [style]);

  const suggestionContainerStyle = useMemo((): any => ({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxHeight: 200,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    opacity: suggestionAnimation.fadeAnim,
    transform: [
      {
        translateY: suggestionAnimation.slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 0],
        }),
      },
      { scale: suggestionAnimation.scaleAnim },
    ],
    zIndex: 1000,
  }), [suggestionAnimation]);

  const suggestionItemStyle = useCallback((index: number): ViewStyle => ({
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: selectedIndex === index ? 'rgba(236, 96, 42, 0.2)' : 'transparent',
  }), [suggestions.length, selectedIndex]);

  const suggestionTextStyle = useMemo((): TextStyle => ({
    fontSize: 14,
    fontFamily: theme.typography.families.primary,
    color: theme.colors.interactive.text.primary,
  }), [theme]);

  // Email icon with validation state
  const renderEmailIcon = useCallback(() => {
    const iconScale = validationIconAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.2, 1],
    });

    return (
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <Text style={{ 
          fontSize: 20, 
          opacity: validationState === 'valid' ? 1 : 0.6,
          color: validationState === 'valid' ? '#10B981' : undefined,
        }}>
          {validationState === 'valid' ? '✓' : '📧'}
        </Text>
      </Animated.View>
    );
  }, [validationIconAnim, validationState]);

  // Render suggestions
  const renderSuggestion = useCallback(({ item, index }: { item: string; index: number }) => (
    <Pressable
      onPress={() => selectSuggestion(item)}
      style={suggestionItemStyle(index)}
      accessibilityRole="button"
      accessibilityLabel={`Select ${item}`}
    >
      <Text style={suggestionTextStyle}>{item}</Text>
    </Pressable>
  ), [selectSuggestion, suggestionItemStyle, suggestionTextStyle]);

  return (
    <View style={containerStyle}>
      <Input
        ref={inputRef}
        value={localValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        leftIcon={leftIcon || renderEmailIcon()}
        keyboardType="email-address"
        autoComplete={enableAutofill ? "email" : "off"}
        error={error || (validationState === 'invalid' ? 'Please enter a valid email address' : undefined)}
        success={success || (validationState === 'valid' ? 'Email is valid' : undefined)}
        loading={isValidating}
        {...restProps}
      />

      {showSuggestions && suggestions.length > 0 && (
        <Animated.View 
          style={suggestionContainerStyle}
          pointerEvents={showSuggestions ? 'auto' : 'none'}
        >
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={suggestions.length > 5}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
    </View>
  );
}));

EmailInput.displayName = 'EmailInput';

// ========================================================================================
// ADVANCED VALIDATION FEATURES
// ========================================================================================

const useEmailValidationErrors = () => {
  const [errorMessages] = useState({
    invalid_format: 'Please enter a valid email address',
    disposable_email: 'Disposable email addresses are not allowed',
    domain_blacklisted: 'This email domain is not allowed',
    domain_not_whitelisted: 'Please use an approved email domain',
    custom_validation_failed: 'Email validation failed',
    mx_record_invalid: 'Email domain appears to be invalid',
  });

  const [persianErrorMessages] = useState({
    invalid_format: 'لطفاً یک آدرس ایمیل معتبر وارد کنید',
    disposable_email: 'آدرس‌های ایمیل موقت مجاز نیستند',
    domain_blacklisted: 'این دامنه ایمیل مجاز نیست',
    domain_not_whitelisted: 'لطفاً از یک دامنه ایمیل تأیید شده استفاده کنید',
    custom_validation_failed: 'اعتبارسنجی ایمیل ناموفق بود',
    mx_record_invalid: 'دامنه ایمیل معتبر به نظر نمی‌رسد',
  });

  return { errorMessages, persianErrorMessages };
};

// ========================================================================================
// BIOMETRIC AUTOFILL HOOK
// ========================================================================================

const useBiometricAutofill = (enableAutofill: boolean) => {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  // biometricAvailable will be used in future biometric integration
  const [savedEmails] = useState<string[]>([]);

  useEffect(() => {
    if (!enableAutofill) return;

    // Check biometric availability
    const checkBiometric = async () => {
      try {
        // Platform-specific biometric check would go here
        if (Platform.OS === 'ios') {
          // Face ID / Touch ID check
          setBiometricAvailable(true);
        } else if (Platform.OS === 'android') {
          // Fingerprint / Face unlock check
          setBiometricAvailable(true);
        }
      } catch (error) {
        console.log('Biometric check failed:', error);
      }
    };

    checkBiometric();
  }, [enableAutofill]);

  const requestBiometricAutofill = useCallback(async () => {
    if (!biometricAvailable) return [];

    try {
      // Simulate biometric authentication
      console.log('Biometric authentication requested');
      
      // In production, this would retrieve saved emails from secure storage
      return ['user@example.com', 'saved@email.com'];
    } catch (error) {
      console.log('Biometric autofill failed:', error);
      return [];
    }
  }, [biometricAvailable]);

  return { biometricAvailable: biometricAvailable, savedEmails, requestBiometricAutofill };
};

// ========================================================================================
// ADVANCED ANIMATION SYSTEM
// ========================================================================================

const useValidationStateAnimation = () => {
  const checkmarkPathAnim = useRef(new Animated.Value(0)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;
  const borderGlowAnim = useRef(new Animated.Value(0)).current;

  const animateSuccess = useCallback(() => {
    Animated.sequence([
      Animated.timing(borderGlowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(checkmarkPathAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [borderGlowAnim, checkmarkPathAnim]);

  const animateError = useCallback(() => {
    Animated.sequence([
      Animated.timing(errorShakeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [errorShakeAnim]);

  return {
    checkmarkPathAnim,
    errorShakeAnim,
    borderGlowAnim,
    animateSuccess,
    animateError,
  };
};

// ========================================================================================
// PERFORMANCE MONITORING
// ========================================================================================

const usePerformanceMonitoring = () => {
  const performanceMetrics = useRef({
    validationTime: 0,
    suggestionGenerationTime: 0,
    animationFrameRate: 60,
  });

  const startPerformanceMeasure = useCallback((metric: string) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      (performanceMetrics.current as any)[metric] = duration;
      
      if (duration > 200) {
        console.warn(`Performance warning: ${metric} took ${duration}ms`);
      }
    };
  }, []);

  return { performanceMetrics, startPerformanceMeasure };
};

// ========================================================================================
// ENTERPRISE EMAIL PRESET COMPONENTS
// ========================================================================================

// Corporate Email Input - Enforces corporate domain
export const CorporateEmailInput: React.FC<Omit<EmailInputProps, 'domainWhitelist'> & {
  corporateDomains: string[];
}> = memo(({ corporateDomains, ...props }) => (
  <EmailInput
    {...props}
    domainWhitelist={corporateDomains}
    placeholder={props.placeholder || 'Enter your corporate email'}
    error={props.error || 'Please use your corporate email address'}
  />
));

CorporateEmailInput.displayName = 'CorporateEmailInput';

// Secure Email Input - Enhanced security features
export const SecureEmailInput: React.FC<Omit<EmailInputProps, 'blockDisposableEmails' | 'strictValidation'>> = memo((props) => (
  <EmailInput
    {...props}
    blockDisposableEmails={true}
    strictValidation={true}
    enableSanitization={true}
    validateMXRecord={true}
  />
));

SecureEmailInput.displayName = 'SecureEmailInput';

// Persian Email Input - RTL optimized
export const PersianEmailInput: React.FC<Omit<EmailInputProps, 'rtl' | 'popularDomains'>> = memo((props) => (
  <EmailInput
    {...props}
    rtl={true}
    popularDomains={[
      'gmail.com', 'yahoo.com', 'outlook.com',
      'iran.ir', 'yahoo.ir', 'mail.ir',
      'chmail.ir', 'parsmail.ir'
    ]}
    placeholder={props.placeholder || 'ایمیل خود را وارد کنید'}
  />
));

PersianEmailInput.displayName = 'PersianEmailInput';

// Newsletter Email Input - Optimized for marketing
export const NewsletterEmailInput: React.FC<Omit<EmailInputProps, 'suggestOnFocus' | 'enableDomainSuggestions'>> = memo((props) => (
  <EmailInput
    {...props}
    suggestOnFocus={true}
    enableDomainSuggestions={true}
    placeholder={props.placeholder || 'Subscribe to our newsletter'}
    leftIcon={<Text style={{ fontSize: 20 }}>📮</Text>}
  />
));

NewsletterEmailInput.displayName = 'NewsletterEmailInput';

// ========================================================================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================================================================

const useAccessibilityAnnouncements = () => {
  const announceValidation = useCallback((isValid: boolean, email: string) => {
    if (Platform.OS === 'ios') {
      const message = isValid
        ? `Email ${email} is valid`
        : `Email ${email} is invalid`;
      
      // In production, use AccessibilityInfo.announceForAccessibility
      console.log('Accessibility announcement:', message);
    }
  }, []);

  const announceSuggestion = useCallback((suggestion: string) => {
    if (Platform.OS === 'ios') {
      const message = `Email suggestion: ${suggestion}`;
      console.log('Accessibility announcement:', message);
    }
  }, []);

  return { announceValidation, announceSuggestion };
};

// ========================================================================================
// EXPORTS
// ========================================================================================

export default EmailInput;