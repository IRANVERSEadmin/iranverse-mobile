// src/screens/SignupScreen.tsx
// IRANVERSE Enterprise Registration - Revolutionary User Onboarding
// Tesla-inspired signup flow with OAuth integration and enterprise security standards
// Built for 90M users - Enterprise Performance & Accessibility
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  BackHandler,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// IRANVERSE Components - Using verified components
import SafeArea from '../components/ui/SafeArea';
import GradientBackground from '../components/ui/GradientBackground';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import KeyboardAvoidingView from '../components/ui/KeyboardAvoidingView';
import AuthHeader from '../components/auth/AuthHeader';
import AuthFooter from '../components/auth/AuthFooter';

// Import the centralized type definitions from App.tsx
import { RootStackParamList } from '../../App';

// ========================================================================================
// ENTERPRISE API CONFIGURATION - PRODUCTION DEPLOYMENT
// ========================================================================================

const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development mode - use production API for testing
    return 'https://api.iranverse.io/api/v1';
  } else {
    // Production mode
    return 'https://api.iranverse.io/api/v1';
  }
};

const IRANVERSE_API = {
  baseURL: getApiBaseUrl(),
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    verifyEmail: '/auth/verify-email',
    health: '/health'
  },
  timeout: 30000, // 30 seconds for auth operations
  headers: {
    'Content-Type': 'application/json',
    'X-Iranian-Verified': 'true', // Higher rate limits (2000 requests per 15 min)
  }
};

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE SIGNUP SYSTEM
// ========================================================================================

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

interface SignupState {
  // Personal Information
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  
  // Consent & Agreements
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  marketingConsent: boolean;
  
  // Form Management
  currentStep: 'personal' | 'account' | 'verification';
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
  
  // Progress & UX
  stepProgress: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    timezone?: string;
    language?: string;
    locale?: string;
    userId?: string;
  };
  error?: string;
}

// ========================================================================================
// OAUTH BUTTON COMPONENT - ENTERPRISE COMPLIANT
// ========================================================================================

interface OAuthButtonProps {
  provider: 'google' | 'apple' | 'github' | 'microsoft';
  onPress: () => void;
  disabled?: boolean;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, onPress, disabled = true }) => {
  const configs = {
    google: {
      icon: '🇬',
      text: 'Google Sign-In (Coming Soon)',
      bgColor: disabled ? '#2a2a2a' : '#ffffff',
      textColor: disabled ? '#8a8a8a' : '#1f1f1f',
      borderColor: disabled ? '#3a3a3a' : '#dadce0',
    },
    apple: {
      icon: '🍎',
      text: 'Apple Sign-In (Coming Soon)',
      bgColor: disabled ? '#2a2a2a' : '#000000',
      textColor: disabled ? '#8a8a8a' : '#ffffff',
      borderColor: disabled ? '#3a3a3a' : '#000000',
    },
    github: {
      icon: '📱',
      text: 'GitHub Sign-In (Coming Soon)',
      bgColor: disabled ? '#2a2a2a' : '#24292e',
      textColor: disabled ? '#8a8a8a' : '#ffffff',
      borderColor: disabled ? '#3a3a3a' : '#24292e',
    },
    microsoft: {
      icon: '🏢',
      text: 'Microsoft Sign-In (Coming Soon)',
      bgColor: disabled ? '#2a2a2a' : '#0078d4',
      textColor: disabled ? '#8a8a8a' : '#ffffff',
      borderColor: disabled ? '#3a3a3a' : '#0078d4',
    },
  };

  const config = configs[provider];

  return (
    <TouchableOpacity
      style={[
        styles.oauthButton,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={config.text}
      testID={`oauth-${provider}-button`}
    >
      <Text style={{ fontSize: 20, marginRight: 12, color: config.textColor }}>
        {config.icon}
      </Text>
      <Text style={{ color: config.textColor, fontSize: 16, fontWeight: '500' }}>
        {config.text}
      </Text>
    </TouchableOpacity>
  );
};

// ========================================================================================
// SIGNUP SCREEN - REVOLUTIONARY REGISTRATION
// ========================================================================================

const SignupScreen: React.FC = () => {
  // Navigation
  const navigation = useNavigation<SignupScreenNavigationProp>();

  // Component State
  const [state, setState] = useState<SignupState>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    termsAccepted: false,
    privacyPolicyAccepted: false,
    marketingConsent: false,
    currentStep: 'personal',
    isSubmitting: false,
    validationErrors: {},
    stepProgress: 0,
  });

  // Animation Values with cleanup - CONSISTENT DRIVER USAGE
  const fadeAnim = useRef(new Animated.Value(0)).current; // Native driver ✅
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Native driver ✅
  const slideAnim = useRef(new Animated.Value(50)).current; // Native driver ✅
  const progressAnim = useRef(new Animated.Value(0)).current; // Non-native driver ✅
  const shakeAnim = useRef(new Animated.Value(0)).current; // Native driver ✅

  // Simple input refs - no complex typing
  const emailInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      slideAnim.stopAnimation();
      progressAnim.stopAnimation();
      shakeAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      scaleAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      progressAnim.removeAllListeners();
      shakeAnim.removeAllListeners();
    };
  }, [fadeAnim, scaleAnim, slideAnim, progressAnim, shakeAnim]);

  // ========================================================================================
  // ENTERPRISE API HANDLERS - PRODUCTION AUTHENTICATION
  // ========================================================================================

  const handleAuthResponse = useCallback((response: ApiResponse) => {
    if (response.success) {
      // Registration successful - user will receive Persian email
      return { status: 'success', data: response.data };
    } else {
      // Handle Persian error messages
      return { status: 'error', message: response.error || response.message };
    }
  }, []);

  const checkSystemHealth = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Use the main health endpoint for production
      const response = await fetch('https://api.iranverse.io/health', {
        method: 'GET',
        headers: IRANVERSE_API.headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Production health check - expect 200 for healthy system
      return response.status === 200;
    } catch (error) {
      console.warn('Health check failed - proceeding with authentication attempt:', error);
      // Enterprise fallback: Attempt authentication even if health check fails
      return true;
    }
  }, []);

  // ========================================================================================
  // FORM FIELD MANAGEMENT - ENTERPRISE DATA HANDLING
  // ========================================================================================

  const updateField = useCallback((field: keyof SignupState, value: any) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      validationErrors: {
        ...prev.validationErrors,
        [field]: '', // Clear field error on change
      },
    }));
  }, []);

  // ========================================================================================
  // VALIDATION SYSTEM - ENTERPRISE SECURITY
  // ========================================================================================

  const validatePersonalStep = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!state.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!state.firstName.trim()) {
      errors.firstName = 'Full name is required';
    } else if (state.firstName.length < 2) {
      errors.firstName = 'Name must be at least 2 characters';
    }

    // Password validation
    if (!state.password) {
      errors.password = 'Password is required';
    } else if (state.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(state.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!state.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (state.password !== state.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, validationErrors: errors }));
      triggerShakeAnimation();
      return false;
    }

    return true;
  }, [state]);

  const validateAccountStep = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Terms acceptance validation
    if (!state.termsAccepted) {
      errors.termsAccepted = 'You must accept the Terms of Service';
    }

    // Privacy policy validation
    if (!state.privacyPolicyAccepted) {
      errors.privacyPolicyAccepted = 'You must accept the Privacy Policy';
    }

    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, validationErrors: errors }));
      triggerShakeAnimation();
      return false;
    }

    return true;
  }, [state]);

  // ========================================================================================
  // ANIMATIONS & FEEDBACK - TESLA-INSPIRED UX
  // ========================================================================================

  const triggerShakeAnimation = useCallback(() => {
    // ✅ FIXED: Use consistent native driver for shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true, // ✅ SAFE: translateX uses native driver
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        const { Vibration } = require('react-native');
        Vibration.vibrate(50);
      } catch (error) {
        console.warn('Haptic feedback error:', error);
      }
    }
  }, []);

  // ========================================================================================
  // OAUTH HANDLERS - COMING SOON MESSAGES
  // ========================================================================================

  const handleOAuthSignup = useCallback((provider: string) => {
    setState(prev => ({
      ...prev,
      validationErrors: {
        general: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-In is coming soon! Use manual registration for now.`,
      },
    }));
    
    // Clear error after 3 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          general: '',
        },
      }));
    }, 3000);
  }, []);

  // ========================================================================================
  // STEP NAVIGATION - ENTERPRISE FLOW CONTROL
  // ========================================================================================

  const handleNextStep = useCallback(() => {
    let isValid = false;

    if (state.currentStep === 'personal') {
      isValid = validatePersonalStep();
      if (isValid) {
        setState(prev => ({ ...prev, currentStep: 'account', stepProgress: 1 }));
        triggerHaptic();
      }
    } else if (state.currentStep === 'account') {
      isValid = validateAccountStep();
      if (isValid) {
        handleSubmitRegistration();
      }
    }
  }, [state.currentStep, validatePersonalStep, validateAccountStep]);

  const handlePreviousStep = useCallback(() => {
    if (state.currentStep === 'account') {
      setState(prev => ({ ...prev, currentStep: 'personal', stepProgress: 0 }));
      triggerHaptic();
    } else {
      navigation.goBack();
    }
  }, [state.currentStep, navigation]);

  // ========================================================================================
  // REGISTRATION SUBMISSION - ENTERPRISE API GATEWAY
  // ========================================================================================

  const handleSubmitRegistration = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Enterprise health check - proceed even if degraded
      const isSystemHealthy = await checkSystemHealth();
      
      if (!isSystemHealthy) {
        console.warn('System health check failed - attempting registration anyway');
      }

      // Enterprise API Gateway call with production configuration
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), IRANVERSE_API.timeout);

      const requestBody = {
        email: state.email.trim().toLowerCase(),
        password: state.password,
        firstName: state.firstName.trim(),
        lastName: state.lastName.trim() || '',
      };

      console.log('IRANVERSE Registration Request:', {
        url: `${IRANVERSE_API.baseURL}${IRANVERSE_API.auth.register}`,
        headers: IRANVERSE_API.headers,
        body: { ...requestBody, password: '[REDACTED]' }
      });

      const response = await fetch(`${IRANVERSE_API.baseURL}${IRANVERSE_API.auth.register}`, {
        method: 'POST',
        headers: IRANVERSE_API.headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: ApiResponse = await response.json();

      console.log('IRANVERSE Registration Response:', {
        status: response.status,
        success: data.success,
        message: data.message,
        data: data.data
      });

      const result = handleAuthResponse(data);

      if (result.status === 'success') {
        // Enterprise success - Navigate to email verification screen
        navigation.navigate('EmailSent', {
          email: state.email,
          tempUserId: data.data?.userId || `temp_${Date.now()}`,
          verificationType: 'signup',
        });

        setState(prev => ({ ...prev, isSubmitting: false, validationErrors: {} }));
        triggerHaptic();

        console.log('✅ IRANVERSE Registration Success - Persian email verification sent');
      } else {
        throw new Error(result.message || 'Registration failed');
      }

    } catch (error) {
      console.error('IRANVERSE Registration Error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        errorMessage = 'Enterprise API Gateway not reachable. Please ensure:\n• Backend server is running on localhost:3000\n• API Gateway is operational\n• Network configuration is correct';
      } else if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = 'Request timed out after 30 seconds. Please check your connection and try again.';
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        validationErrors: {
          general: errorMessage,
        },
      }));
      triggerShakeAnimation();
    }
  }, [state, navigation, triggerShakeAnimation, checkSystemHealth, handleAuthResponse]);

  // ========================================================================================
  // NAVIGATION HANDLERS - ENTERPRISE PATTERNS
  // ========================================================================================

  const handleLoginPress = useCallback(() => {
    navigation.navigate('Login', { email: state.email });
  }, [navigation, state.email]);

  // Android back button handling
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handlePreviousStep();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [handlePreviousStep])
  );

  // ========================================================================================
  // LIFECYCLE EFFECTS - ENTERPRISE INITIALIZATION
  // ========================================================================================

  // Entrance animation - SEPARATE NATIVE AND NON-NATIVE DRIVERS
  useEffect(() => {
    // Native driver animations (transform-only)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true, // ✅ SAFE: opacity uses native driver
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 400,
        friction: 10,
        useNativeDriver: true, // ✅ SAFE: scale uses native driver
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true, // ✅ SAFE: translateY uses native driver
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  // Progress animation - USE NON-NATIVE DRIVER for consistency
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: state.stepProgress,
      duration: 400,
      useNativeDriver: false, // ✅ FIXED: Changed to false for consistency
    }).start();
  }, [state.stepProgress, progressAnim]);

  // ========================================================================================
  // RENDER HELPERS - ENTERPRISE UI COMPONENTS
  // ========================================================================================

  const renderHeader = () => (
    <AuthHeader 
      showBackButton
      onBackPress={handlePreviousStep}
      title="Join IRANVERSE"
      subtitle="Create your account to access the revolutionary platform"
      style={{ marginBottom: 24 }}
    />
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              // ✅ FIXED: Width interpolation requires non-native driver
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text
        variant="caption"
        align="center"
        color="secondary"
        style={styles.progressText}
      >
        Step {state.currentStep === 'personal' ? '1' : '2'} of 2
      </Text>
    </View>
  );

  const renderOAuthSection = () => (
    <Card
      variant="glass"
      style={styles.oauthCard}
      padding="large"
      animatedEntrance
      entranceDelay={200}
    >
      <Text
        variant="h3"
        align="center"
        weight="600"
        style={styles.oauthTitle}
      >
        Quick Sign Up
      </Text>
      
      <Text
        variant="body"
        align="center"
        color="secondary"
        style={styles.oauthSubtitle}
      >
        OAuth providers coming soon - use manual registration below
      </Text>

      <View style={styles.oauthGrid}>
        {['google', 'apple', 'github', 'microsoft'].map((provider) => (
          <OAuthButton
            key={provider}
            provider={provider as any}
            onPress={() => handleOAuthSignup(provider)}
            disabled={true}
          />
        ))}
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text variant="caption" color="secondary" style={styles.dividerText}>
          create account manually
        </Text>
        <View style={styles.dividerLine} />
      </View>
    </Card>
  );

  const renderPersonalStep = () => (
    <Card
      variant="glass"
      style={styles.formCard}
      padding="large"
      animatedEntrance
      entranceDelay={400}
    >
      <Text
        variant="h3"
        align="center"
        weight="600"
        style={styles.stepTitle}
      >
        Personal Information
      </Text>
      
      <Text
        variant="body"
        align="center"
        color="secondary"
        style={styles.stepSubtitle}
      >
        Enter your details to get started
      </Text>

      <View style={styles.formFields}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <View style={[styles.inputWrapper, state.validationErrors.email && styles.inputError]}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              ref={emailInputRef}
              style={styles.textInput}
              value={state.email}
              onChangeText={(text) => updateField('email', text.trim().toLowerCase())}
              placeholder="Enter your email address"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              onSubmitEditing={() => nameInputRef.current?.focus()}
              returnKeyType="next"
            />
          </View>
          {state.validationErrors.email && (
            <Text style={styles.errorText}>{state.validationErrors.email}</Text>
          )}
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <View style={[styles.inputWrapper, state.validationErrors.firstName && styles.inputError]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              ref={nameInputRef}
              style={styles.textInput}
              value={state.firstName}
              onChangeText={(text) => updateField('firstName', text)}
              placeholder="Enter your full name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              onSubmitEditing={() => {/* Focus password field */}}
              returnKeyType="next"
            />
          </View>
          {state.validationErrors.firstName && (
            <Text style={styles.errorText}>{state.validationErrors.firstName}</Text>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password *</Text>
          <View style={[styles.inputWrapper, state.validationErrors.password && styles.inputError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              value={state.password}
              onChangeText={(text) => updateField('password', text)}
              placeholder="Create a secure password"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              onSubmitEditing={() => {/* Focus confirm password field */}}
              returnKeyType="next"
            />
          </View>
          {state.validationErrors.password && (
            <Text style={styles.errorText}>{state.validationErrors.password}</Text>
          )}
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password *</Text>
          <View style={[styles.inputWrapper, state.validationErrors.confirmPassword && styles.inputError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              value={state.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              placeholder="Confirm your password"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              onSubmitEditing={handleNextStep}
              returnKeyType="done"
            />
          </View>
          {state.validationErrors.confirmPassword && (
            <Text style={styles.errorText}>{state.validationErrors.confirmPassword}</Text>
          )}
        </View>
      </View>
    </Card>
  );

  const renderAccountStep = () => (
    <Card
      variant="glass"
      style={styles.formCard}
      padding="large"
      animatedEntrance
      entranceDelay={400}
    >
      <Text
        variant="h3"
        align="center"
        weight="600"
        style={styles.stepTitle}
      >
        Account Setup
      </Text>
      
      <Text
        variant="body"
        align="center"
        color="secondary"
        style={styles.stepSubtitle}
      >
        Finalize your account preferences
      </Text>

      <View style={styles.formFields}>
        {/* Consent Section */}
        <View style={styles.consentSection}>
          <Text style={styles.consentTitle}>Account Preferences</Text>

          {/* Marketing Consent */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('marketingConsent', !state.marketingConsent)}
          >
            <View style={[styles.checkbox, state.marketingConsent && styles.checkboxChecked]}>
              {state.marketingConsent && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Send me product updates and news
            </Text>
          </TouchableOpacity>

          {/* Terms Acceptance */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('termsAccepted', !state.termsAccepted)}
          >
            <View style={[styles.checkbox, state.termsAccepted && styles.checkboxChecked]}>
              {state.termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I accept the <Text style={styles.linkText}>Terms of Service</Text> *
            </Text>
          </TouchableOpacity>
          {state.validationErrors.termsAccepted && (
            <Text style={styles.errorText}>{state.validationErrors.termsAccepted}</Text>
          )}

          {/* Privacy Policy Acceptance */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('privacyPolicyAccepted', !state.privacyPolicyAccepted)}
          >
            <View style={[styles.checkbox, state.privacyPolicyAccepted && styles.checkboxChecked]}>
              {state.privacyPolicyAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I accept the <Text style={styles.linkText}>Privacy Policy</Text> *
            </Text>
          </TouchableOpacity>
          {state.validationErrors.privacyPolicyAccepted && (
            <Text style={styles.errorText}>{state.validationErrors.privacyPolicyAccepted}</Text>
          )}
        </View>
      </View>
    </Card>
  );

  const renderActionButton = () => (
    <Button
      variant="primary"
      size="large"
      fullWidth
      onPress={handleNextStep}
      disabled={state.isSubmitting}
      loading={state.isSubmitting}
      style={styles.actionButton}
      accessibilityLabel={
        state.isSubmitting
          ? 'Creating account, please wait'
          : state.currentStep === 'personal'
          ? 'Continue to next step'
          : 'Create account'
      }
      testID="action-button"
    >
      {state.isSubmitting
        ? 'Creating Account...'
        : state.currentStep === 'personal'
        ? 'Continue'
        : 'Create Account'
      }
    </Button>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text variant="body" color="secondary" style={styles.footerText}>
        Already have an account?
      </Text>
      <TouchableOpacity onPress={handleLoginPress}>
        <Text style={styles.footerLink}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGeneralError = () => {
    if (!state.validationErrors.general) return null;
    
    return (
      <View style={styles.generalError}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorMessage}>{state.validationErrors.general}</Text>
        </View>
      </View>
    );
  };

  // ========================================================================================
  // MAIN RENDER - ENTERPRISE LAYOUT
  // ========================================================================================

  return (
    <SafeArea edges={['top', 'bottom']} style={styles.container}>
      <GradientBackground animated particleField>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          {renderHeader()}

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim },
                    { translateX: shakeAnim },
                  ],
                },
              ]}
            >
              {/* OAuth Section */}
              {renderOAuthSection()}

              {/* General Error Display */}
              {renderGeneralError()}

              {/* Step Content */}
              {state.currentStep === 'personal' ? renderPersonalStep() : renderAccountStep()}

              {/* Action Button */}
              {renderActionButton()}

              {/* Footer */}
              {renderFooter()}

              {/* Legal Footer */}
              <AuthFooter variant="signup" style={{ marginTop: 32 }} />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </GradientBackground>
    </SafeArea>
  );
};

// ========================================================================================
// STYLES - TESLA-INSPIRED DESIGN
// ========================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF85',
    borderRadius: 2,
  },
  progressText: {
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  
  // OAuth Section
  oauthCard: {
    marginBottom: 24,
  },
  oauthTitle: {
    marginBottom: 8,
  },
  oauthSubtitle: {
    marginBottom: 24,
    opacity: 0.8,
  },
  oauthGrid: {
    gap: 12,
    marginBottom: 24,
  },
  oauthButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  
  // Form Section
  formCard: {
    marginBottom: 24,
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepSubtitle: {
    marginBottom: 32,
    opacity: 0.8,
  },
  formFields: {
    gap: 20,
  },
  
  // Input Styling
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#FF5252',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  
  // Consent Section
  consentSection: {
    marginTop: 20,
    gap: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#00FF85',
    borderColor: '#00FF85',
  },
  checkmark: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  linkText: {
    color: '#00FF85',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // Action Button
  actionButton: {
    height: 56,
    borderRadius: 12,
    marginVertical: 24,
    shadowColor: '#8A5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  footerText: {
    fontSize: 16,
  },
  footerLink: {
    fontSize: 16,
    color: '#8A5CF6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // Error Handling
  generalError: {
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: '#FF5252',
    borderRadius: 8,
    padding: 12,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorMessage: {
    flex: 1,
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SignupScreen;