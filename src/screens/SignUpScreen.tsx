// src/screens/SignUpScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Text,
  Alert,
  Vibration,
  Platform,
  Dimensions,
  Animated,
  TouchableOpacity,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

// Enterprise UI Components
import GradientBackground from '../components/ui/GradientBackground';
import Button from '../components/ui/Button';
import CustomInput from '../components/ui/CustomInput';
import PasswordInput from '../components/ui/PasswordInput';

// Auth Context and Services
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ValidationResult } from '../types/auth.types';

// Types
import { RegisterDto, ApiErrorResponse } from '../types/auth.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simplified Step Configuration
const STEPS = {
  PERSONAL_INFO: 1,
  ACCOUNT_SETUP: 2,
  EMAIL_VERIFICATION: 3,
} as const;

type Step = typeof STEPS[keyof typeof STEPS];

interface SignUpState extends RegisterDto {
  confirmPassword: string;
  currentStep: Step;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
}

interface StepValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

const SignUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Context and Hooks
  const { register, isLoading } = useAuth();
  
  // Animation References
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      slideAnim.stopAnimation();
      progressAnim.stopAnimation();
      fadeAnim.stopAnimation();
    };
  }, []);

  // Simplified State Management
  const [signUpState, setSignUpState] = useState<SignUpState>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '', // Will auto-generate or use first_name
    username: '',
    terms_accepted: false,
    privacy_policy_accepted: false,
    marketing_consent: false,
    currentStep: STEPS.PERSONAL_INFO,
    isSubmitting: false,
    validationErrors: {},
  });

  // Email verification state
  const [emailVerificationState, setEmailVerificationState] = useState({
    isVerifying: false,
    canResend: false,
    resendCountdown: 60,
    verificationAttempts: 0,
  });

  // Refs for form inputs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const firstNameRef = useRef(null);
  const usernameRef = useRef(null);

  // Back Handler for Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (signUpState.currentStep === STEPS.PERSONAL_INFO) {
          return false;
        } else {
          handlePreviousStep();
          return true;
        }
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [signUpState.currentStep])
  );

  // Progress Animation
  useEffect(() => {
    const progress = (signUpState.currentStep - 1) / (Object.keys(STEPS).length - 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [signUpState.currentStep]);

  // Email Verification Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (signUpState.currentStep === STEPS.EMAIL_VERIFICATION && !emailVerificationState.canResend) {
      interval = setInterval(() => {
        setEmailVerificationState(prev => {
          if (prev.resendCountdown <= 1) {
            return { ...prev, canResend: true, resendCountdown: 0 };
          }
          return { ...prev, resendCountdown: prev.resendCountdown - 1 };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [signUpState.currentStep, emailVerificationState.canResend]);

  // Form Field Updates
  const updateField = useCallback((field: keyof SignUpState, value: any) => {
    setSignUpState(prev => ({
      ...prev,
      [field]: value,
      validationErrors: {
        ...prev.validationErrors,
        [field]: '',
      },
    }));
  }, []);

  // Haptic Feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const patterns = {
          light: [0, 30],
          medium: [0, 60],
          heavy: [0, 100],
          success: [0, 30, 100, 30],
          error: [0, 100, 50, 100],
        };
        Vibration.vibrate(patterns[type]);
      }
    } catch (error) {
      // Silent fallback
    }
  }, []);

  // Step Validation
  const validateCurrentStep = useCallback((): StepValidationResult => {
    const errors: Record<string, string> = {};

    switch (signUpState.currentStep) {
      case STEPS.PERSONAL_INFO:
        if (!signUpState.email.trim()) {
          errors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpState.email)) {
          errors.email = 'Please enter a valid email address';
        }

        if (!signUpState.password) {
          errors.password = 'Password is required';
        } else if (signUpState.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }

        if (signUpState.password !== signUpState.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }

        if (!signUpState.first_name.trim()) {
          errors.first_name = 'Name is required';
        } else if (signUpState.first_name.length < 2) {
          errors.first_name = 'Name must be at least 2 characters';
        }
        break;

      case STEPS.ACCOUNT_SETUP:
        if (signUpState.username && signUpState.username.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else if (signUpState.username && !/^[a-zA-Z0-9_]{3,30}$/.test(signUpState.username)) {
          errors.username = 'Username can only contain letters, numbers, and underscores';
        }

        if (!signUpState.terms_accepted) {
          errors.terms_accepted = 'You must accept the Terms of Service';
        }

        if (!signUpState.privacy_policy_accepted) {
          errors.privacy_policy_accepted = 'You must accept the Privacy Policy';
        }
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [signUpState]);

  // Step Navigation
  const handleNextStep = useCallback(async () => {
    const validation = validateCurrentStep();
    
    if (!validation.isValid) {
      setSignUpState(prev => ({
        ...prev,
        validationErrors: validation.errors,
      }));
      triggerHaptic('error');
      return;
    }

    if (signUpState.currentStep === STEPS.ACCOUNT_SETUP) {
      await handleSubmitRegistration();
    } else {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setSignUpState(prev => ({
        ...prev,
        currentStep: (prev.currentStep + 1) as Step,
        validationErrors: {},
      }));

      triggerHaptic('light');
    }
  }, [signUpState, validateCurrentStep, triggerHaptic]);

  const handlePreviousStep = useCallback(() => {
    if (signUpState.currentStep === STEPS.PERSONAL_INFO) {
      navigation.goBack();
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSignUpState(prev => ({
      ...prev,
      currentStep: (prev.currentStep - 1) as Step,
      validationErrors: {},
    }));

    triggerHaptic('light');
  }, [signUpState.currentStep, navigation]);

  // Registration Submission
  const handleSubmitRegistration = useCallback(async () => {
    setSignUpState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const registrationData: RegisterDto = {
        email: signUpState.email.trim(),
        password: signUpState.password,
        first_name: signUpState.first_name.trim(),
        last_name: signUpState.first_name.trim(), // Use first name as last name
        username: signUpState.username?.trim() || undefined,
        terms_accepted: signUpState.terms_accepted,
        privacy_policy_accepted: signUpState.privacy_policy_accepted,
        marketing_consent: signUpState.marketing_consent,
      };

      const response = await authService.register(registrationData);

      if (response.success) {
        triggerHaptic('success');
        
        setSignUpState(prev => ({
          ...prev,
          currentStep: STEPS.EMAIL_VERIFICATION,
          isSubmitting: false,
        }));

        setEmailVerificationState(prev => ({
          ...prev,
          canResend: false,
          resendCountdown: 60,
        }));
      }
    } catch (error: any) {
      triggerHaptic('error');
      
      if (error.response?.data?.error) {
        const apiError = error.response.data as ApiErrorResponse;
        
        if (apiError.error.details?.field_errors) {
          const fieldErrors: Record<string, string> = {};
          apiError.error.details.field_errors.forEach(fieldError => {
            fieldErrors[fieldError.field] = fieldError.message;
          });
          
          setSignUpState(prev => ({
            ...prev,
            validationErrors: fieldErrors,
            isSubmitting: false,
          }));
        } else {
          Alert.alert(
            'Registration Failed',
            apiError.error.message,
            [{ text: 'OK', style: 'default' }]
          );
          
          setSignUpState(prev => ({ ...prev, isSubmitting: false }));
        }
      } else {
        Alert.alert(
          'Network Error',
          'Please check your connection and try again',
          [{ text: 'OK', style: 'default' }]
        );
        
        setSignUpState(prev => ({ ...prev, isSubmitting: false }));
      }
    }
  }, [signUpState, triggerHaptic]);

  // Email Verification
  const handleEmailVerification = useCallback(async () => {
    setEmailVerificationState(prev => ({ ...prev, isVerifying: true }));

    try {
      const response = await authService.verifyEmail(signUpState.email);
      
      if (response.success) {
        triggerHaptic('success');
        navigation.navigate('AvatarCreation');
      }
    } catch (error: any) {
      triggerHaptic('error');
      
      setEmailVerificationState(prev => ({
        ...prev,
        isVerifying: false,
        verificationAttempts: prev.verificationAttempts + 1,
      }));

      Alert.alert(
        'Verification Failed',
        'Please check your email and try again',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [signUpState.email, navigation, triggerHaptic]);

  const handleResendVerification = useCallback(async () => {
    try {
      await authService.resendVerificationEmail(signUpState.email);
      
      setEmailVerificationState(prev => ({
        ...prev,
        canResend: false,
        resendCountdown: 60,
      }));

      triggerHaptic('light');
      
      Alert.alert(
        'Email Sent',
        'Please check your email for verification instructions',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      triggerHaptic('error');
      
      Alert.alert(
        'Resend Failed',
        'Please try again later',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [signUpState.email, triggerHaptic]);

  // Render Step Content
  const renderStepContent = () => {
    switch (signUpState.currentStep) {
      case STEPS.PERSONAL_INFO:
        return renderPersonalInfoStep();
      case STEPS.ACCOUNT_SETUP:
        return renderAccountSetupStep();
      case STEPS.EMAIL_VERIFICATION:
        return renderEmailVerificationStep();
      default:
        return null;
    }
  };

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Create Your Account</Text>
        <Text style={styles.stepDescription}>
          Enter your details to get started with IRANVERSE
        </Text>
      </View>

      <View style={styles.formFields}>
        <View style={styles.inputGroup}>
          <CustomInput
            ref={emailRef}
            value={signUpState.email}
            onChangeText={(text) => updateField('email', text)}
            inputType="email"
            variant="minimal"
            label="Email Address"
            placeholder="Enter your email address"
            required
            autoFocus
            validationState={signUpState.validationErrors.email ? 'invalid' : 'idle'}
            helperText={signUpState.validationErrors.email}
            style={styles.transparentInput}
            testID="signup-email-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <CustomInput
            ref={firstNameRef}
            value={signUpState.first_name}
            onChangeText={(text) => updateField('first_name', text)}
            inputType="text"
            variant="minimal"
            label="Full Name"
            placeholder="Enter your full name"
            required
            validationState={signUpState.validationErrors.first_name ? 'invalid' : 'idle'}
            helperText={signUpState.validationErrors.first_name}
            style={styles.transparentInput}
            testID="signup-name-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <PasswordInput
            ref={passwordRef}
            value={signUpState.password}
            onChangeText={(text) => updateField('password', text)}
            placeholder="Create a secure password"
            securityLevel="enterprise"
            style={styles.transparentInput}
            onValidationChange={(validation) => {
              if (!validation.isValid && validation.errors.length > 0) {
                updateField('password', signUpState.password);
              }
            }}
            testID="signup-password-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <PasswordInput
            value={signUpState.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            placeholder="Confirm your password"
            securityLevel="basic"
            style={styles.transparentInput}
            testID="signup-confirm-password-input"
          />
          {signUpState.validationErrors.confirmPassword && (
            <Text style={styles.errorText}>
              {signUpState.validationErrors.confirmPassword}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderAccountSetupStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Account Preferences</Text>
        <Text style={styles.stepDescription}>
          Customize your account settings and accept our terms
        </Text>
      </View>

      <View style={styles.formFields}>
        <View style={styles.inputGroup}>
          <CustomInput
            ref={usernameRef}
            value={signUpState.username || ''}
            onChangeText={(text) => updateField('username', text)}
            inputType="username"
            variant="minimal"
            label="Username (Optional)"
            placeholder="Choose a unique username"
            validationState={signUpState.validationErrors.username ? 'invalid' : 'idle'}
            helperText={signUpState.validationErrors.username || 'Leave blank to use your email'}
            style={styles.transparentInput}
            testID="signup-username-input"
          />
        </View>

        <View style={styles.consentSection}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('marketing_consent', !signUpState.marketing_consent)}
            accessible
            accessibilityRole="checkbox"
            accessibilityState={{ checked: signUpState.marketing_consent }}
            testID="signup-marketing-checkbox"
          >
            <View style={[styles.checkbox, signUpState.marketing_consent && styles.checkboxChecked]}>
              {signUpState.marketing_consent && (
                <Feather name="check" size={16} color="#000000" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              Send me product updates and news
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('terms_accepted', !signUpState.terms_accepted)}
            accessible
            accessibilityRole="checkbox"
            accessibilityState={{ checked: signUpState.terms_accepted }}
            testID="signup-terms-checkbox"
          >
            <View style={[styles.checkbox, signUpState.terms_accepted && styles.checkboxChecked]}>
              {signUpState.terms_accepted && (
                <Feather name="check" size={16} color="#000000" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              I accept the <Text style={styles.linkText}>Terms of Service</Text> *
            </Text>
          </TouchableOpacity>
          {signUpState.validationErrors.terms_accepted && (
            <Text style={styles.errorText}>
              {signUpState.validationErrors.terms_accepted}
            </Text>
          )}

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('privacy_policy_accepted', !signUpState.privacy_policy_accepted)}
            accessible
            accessibilityRole="checkbox"
            accessibilityState={{ checked: signUpState.privacy_policy_accepted }}
            testID="signup-privacy-checkbox"
          >
            <View style={[styles.checkbox, signUpState.privacy_policy_accepted && styles.checkboxChecked]}>
              {signUpState.privacy_policy_accepted && (
                <Feather name="check" size={16} color="#000000" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              I accept the <Text style={styles.linkText}>Privacy Policy</Text> *
            </Text>
          </TouchableOpacity>
          {signUpState.validationErrors.privacy_policy_accepted && (
            <Text style={styles.errorText}>
              {signUpState.validationErrors.privacy_policy_accepted}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmailVerificationStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.verificationContainer}>
        <View style={styles.verificationIcon}>
          <Feather name="mail" size={64} color="#00FF85" />
        </View>
        
        <Text style={styles.stepTitle}>Verify Your Email</Text>
        <Text style={styles.stepDescription}>
          We've sent a verification link to{'\n'}
          <Text style={styles.emailText}>{signUpState.email}</Text>
        </Text>

        <Button
          title="I've Verified My Email"
          onPress={handleEmailVerification}
          variant="quantum"
          size="large"
          loading={emailVerificationState.isVerifying}
          disabled={emailVerificationState.isVerifying}
          style={styles.verificationButton}
          testID="verify-email-button"
        />

        <View style={styles.resendSection}>
          {emailVerificationState.canResend ? (
            <TouchableOpacity onPress={handleResendVerification}>
              <Text style={styles.resendText}>
                Didn't receive it? Resend email
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendCountdown}>
              Resend available in {emailVerificationState.resendCountdown}s
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <GradientBackground 
        preset="obsidian"
        archetype="organic"
        intensity="whisper"
        animated
        depthLayers
        particleField
        luminanceShifts
      />

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handlePreviousStep}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
            testID="signup-back-button"
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Sign Up</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {signUpState.currentStep} of {Object.keys(STEPS).length}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <Animated.View style={[styles.stepContentWrapper, { opacity: fadeAnim }]}>
              {renderStepContent()}
            </Animated.View>
          </View>
        </View>

        {/* Navigation Button */}
        {signUpState.currentStep !== STEPS.EMAIL_VERIFICATION && (
          <View style={styles.navigationContainer}>
            <Button
              title={
                signUpState.currentStep === STEPS.ACCOUNT_SETUP 
                  ? 'Create Account'
                  : 'Continue'
              }
              onPress={handleNextStep}
              variant="quantum"
              size="large"
              loading={signUpState.isSubmitting}
              disabled={signUpState.isSubmitting}
              style={styles.navigationButton}
              testID="signup-next-button"
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 30,
    zIndex: 10,
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 48, // Same width as back button for centering
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.7,
  },
  stepContentWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  stepContent: {
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  stepHeader: {
    marginBottom: 60,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  formFields: {
    gap: 32,
    width: '100%',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  consentSection: {
    marginTop: 40,
    gap: 24,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#00FF85',
    borderColor: '#00FF85',
  },
  checkboxText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '400',
  },
  linkText: {
    color: '#00FF85',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  verificationContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  verificationIcon: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: 'rgba(0, 255, 133, 0.1)',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 133, 0.3)',
  },
  emailText: {
    color: '#00FF85',
    fontWeight: '600',
  },
  verificationButton: {
    width: '100%',
    marginTop: 60,
  },
  resendSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  resendText: {
    color: '#00FF85',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendCountdown: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '500',
  },
  navigationContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  navigationButton: {
    width: '100%',
  },
  transparentInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
});

export default SignUpScreen;