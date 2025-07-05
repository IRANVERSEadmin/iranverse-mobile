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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

// Enterprise UI Components (existing)
import GradientBackground from '../components/ui/GradientBackground';
import Button from '../components/ui/Button';
import CustomInput from '../components/ui/CustomInput';
import PasswordInput from '../components/ui/PasswordInput';
import Card from '../components/ui/Card';

// Auth Context and Services
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ValidationResult } from '../types/auth.types';
import { useLanguage } from '../hooks/useLanguage';
import { authMessages } from '../i18n/authMessages';

// Types
import { RegisterDto, ApiErrorResponse } from '../types/auth.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Step Configuration
const STEPS = {
  PERSONAL_INFO: 1,
  ACCOUNT_PREFERENCES: 2,
  EMAIL_VERIFICATION: 3,
  AVATAR_CREATION: 4,
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
  const { language, setLanguage, isRTL, t } = useLanguage();
  
  // Animation References
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isAnimatingRef = useRef(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Animation cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all animations on unmount
      slideAnim.stopAnimation();
      progressAnim.stopAnimation();
      fadeAnim.stopAnimation();
      isAnimatingRef.current = false;
    };
  }, []);

  // State Management
  const [signUpState, setSignUpState] = useState<SignUpState>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    username: '',
    phone_number: '',
    date_of_birth: '',
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
  const lastNameRef = useRef(null);
  const usernameRef = useRef(null);
  const phoneRef = useRef(null);

  // Back Handler for Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (signUpState.currentStep === STEPS.PERSONAL_INFO) {
          // Allow normal back navigation on first step
          return false;
        } else {
          // Go to previous step
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
        [field]: '', // Clear field error on change
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
          errors.email = t('validation.email.required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpState.email)) {
          errors.email = t('validation.email.invalid');
        }

        if (!signUpState.password) {
          errors.password = t('validation.password.required');
        } else if (signUpState.password.length < 8) {
          errors.password = t('validation.password.minLength');
        }

        if (signUpState.password !== signUpState.confirmPassword) {
          errors.confirmPassword = t('validation.password.noMatch');
        }

        if (!signUpState.first_name.trim()) {
          errors.first_name = t('validation.firstName.required');
        } else if (signUpState.first_name.length < 2) {
          errors.first_name = t('validation.firstName.minLength');
        }

        if (!signUpState.last_name.trim()) {
          errors.last_name = t('validation.lastName.required');
        } else if (signUpState.last_name.length < 2) {
          errors.last_name = t('validation.lastName.minLength');
        }

        if ((signUpState.phone_number ?? '') && !/^\+?[1-9]\d{1,14}$/.test((signUpState.phone_number ?? '').replace(/\s/g, ''))) {
          errors.phone_number = t('validation.phone.invalid');
        }
        break;

      case STEPS.ACCOUNT_PREFERENCES:
        if ((signUpState.username ?? '') && (signUpState.username ?? '').length < 3) {
          errors.username = t('validation.username.minLength');
        } else if ((signUpState.username ?? '') && !/^[a-zA-Z0-9_]{3,30}$/.test((signUpState.username ?? ''))) {
          errors.username = t('validation.username.invalid');
        }

        if (signUpState.date_of_birth) {
          const birthDate = new Date(signUpState.date_of_birth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 13) {
            errors.date_of_birth = t('validation.age.minimum');
          }
        }

        if (!signUpState.terms_accepted) {
          errors.terms_accepted = t('validation.terms.required');
        }

        if (!signUpState.privacy_policy_accepted) {
          errors.privacy_policy_accepted = t('validation.privacy.required');
        }
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [signUpState, t]);

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

    if (signUpState.currentStep === STEPS.ACCOUNT_PREFERENCES) {
      // Submit registration
      await handleSubmitRegistration();
    } else {
      // Animate to next step
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: signUpState.currentStep * SCREEN_WIDTH,
          duration: 300,
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
      Animated.timing(slideAnim, {
        toValue: (signUpState.currentStep - 2) * SCREEN_WIDTH,
        duration: 300,
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
        last_name: signUpState.last_name.trim(),
        username: (signUpState.username ?? '').trim() || undefined,
        phone_number: (signUpState.phone_number ?? '').trim() || undefined,
        date_of_birth: signUpState.date_of_birth || undefined,
        terms_accepted: signUpState.terms_accepted,
        privacy_policy_accepted: signUpState.privacy_policy_accepted,
        marketing_consent: signUpState.marketing_consent,
      };

      const response = await authService.register(registrationData);

      if (response.success) {
        triggerHaptic('success');
        
        // Move to email verification step
        setSignUpState(prev => ({
          ...prev,
          currentStep: STEPS.EMAIL_VERIFICATION,
          isSubmitting: false,
        }));

        // Start email verification countdown
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
        
        // Handle field-specific errors
        if (apiError.error.details?.field_errors) {
          const fieldErrors: Record<string, string> = {};
          apiError.error.details.field_errors.forEach(fieldError => {
            fieldErrors[fieldError.field] = isRTL ? 
              (fieldError.message_fa || fieldError.message) : 
              fieldError.message;
          });
          
          setSignUpState(prev => ({
            ...prev,
            validationErrors: fieldErrors,
            isSubmitting: false,
          }));
        } else {
          // General error
          Alert.alert(
            t('error.registrationFailed'),
            isRTL ? (apiError.error.message_fa || apiError.error.message) : apiError.error.message,
            [{ text: t('common.ok'), style: 'default' }]
          );
          
          setSignUpState(prev => ({ ...prev, isSubmitting: false }));
        }
      } else {
        // Network or unexpected error
        Alert.alert(
          t('error.networkError'),
          t('error.tryAgainLater'),
          [{ text: t('common.ok'), style: 'default' }]
        );
        
        setSignUpState(prev => ({ ...prev, isSubmitting: false }));
      }
    }
  }, [signUpState, isRTL, t, triggerHaptic]);

  // Email Verification
  const handleEmailVerification = useCallback(async () => {
    setEmailVerificationState(prev => ({ ...prev, isVerifying: true }));

    try {
      const response = await authService.verifyEmail(signUpState.email);
      
      if (response.success) {
        triggerHaptic('success');
        
        // Navigate to avatar creation (mandatory step)
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
        t('error.verificationFailed'),
        t('error.checkEmail'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    }
  }, [signUpState.email, navigation, t, triggerHaptic]);

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
        t('verification.resent'),
        t('verification.checkEmail'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    } catch (error) {
      triggerHaptic('error');
      
      Alert.alert(
        t('error.resendFailed'),
        t('error.tryAgainLater'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    }
  }, [signUpState.email, t, triggerHaptic]);

  // Render Step Content
  const renderStepContent = () => {
    switch (signUpState.currentStep) {
      case STEPS.PERSONAL_INFO:
        return renderPersonalInfoStep();
      case STEPS.ACCOUNT_PREFERENCES:
        return renderAccountPreferencesStep();
      case STEPS.EMAIL_VERIFICATION:
        return renderEmailVerificationStep();
      default:
        return null;
    }
  };

  const renderPersonalInfoStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Card variant="elevated" style={styles.formCard}>
        <Text style={[styles.stepTitle, isRTL && styles.rtlText]}>
          {t('signup.personalInfo.title')}
        </Text>
        <Text style={[styles.stepDescription, isRTL && styles.rtlText]}>
          {t('signup.personalInfo.description')}
        </Text>

        <View style={styles.formFields}>
          <CustomInput
            ref={emailRef}
            value={signUpState.email}
            onChangeText={(text) => updateField('email', text)}
            inputType="email"
            label={t('form.email.label')}
            labelRTL={t('form.email.labelRTL')}
            placeholder={t('form.email.placeholder')}
            placeholderRTL={t('form.email.placeholderRTL')}
            language={language}
            required
            // autoFocus (temporarily disabled)
            validationState={signUpState.validationErrors.email ? 'invalid' : 'idle'}
            helperText={signUpState.validationErrors.email}
            testID="signup-email-input"
          />

          <PasswordInput
            ref={passwordRef}
            value={signUpState.password}
            onChangeText={(text) => updateField('password', text)}
            placeholder={t('form.password.placeholder')}
            placeholderRTL={t('form.password.placeholderRTL')}
            language={language}
            securityLevel="enterprise"
            onValidationChange={(validation) => {
              if (!validation.isValid && validation.errors.length > 0) {
                updateField('password', signUpState.password);
              }
            }}
            testID="signup-password-input"
          />

          <CustomInput
            ref={confirmPasswordRef}
            value={signUpState.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            inputType="text"
            label={t('form.confirmPassword.label')}
            labelRTL={t('form.confirmPassword.labelRTL')}
            placeholder={t('form.confirmPassword.placeholder')}
            placeholderRTL={t('form.confirmPassword.placeholderRTL')}
            language={language}
            required
            validationState={signUpState.validationErrors.confirmPassword ? 'invalid' : 'idle'}
            helperText={signUpState.validationErrors.confirmPassword}
            testID="signup-confirm-password-input"
          />

          <View style={styles.nameRow}>
            <CustomInput
              ref={firstNameRef}
              value={signUpState.first_name}
              onChangeText={(text) => updateField('first_name', text)}
              inputType="text"
              label={t('form.firstName.label')}
              labelRTL={t('form.firstName.labelRTL')}
              placeholder={t('form.firstName.placeholder')}
              placeholderRTL={t('form.firstName.placeholderRTL')}
              language={language}
              required
              style={[styles.nameInput, isRTL && styles.nameInputRTL]}
              validationState={signUpState.validationErrors.first_name ? 'invalid' : 'idle'}
              helperText={signUpState.validationErrors.first_name}
              testID="signup-first-name-input"
            />

            <CustomInput
              ref={lastNameRef}
              value={signUpState.last_name}
              onChangeText={(text) => updateField('last_name', text)}
              inputType="text"
              label={t('form.lastName.label')}
              labelRTL={t('form.lastName.labelRTL')}
              placeholder={t('form.lastName.placeholder')}
              placeholderRTL={t('form.lastName.placeholderRTL')}
              language={language}
              required
              style={[styles.nameInput, isRTL && styles.nameInputRTL]}
              validationState={signUpState.validationErrors.last_name ? 'invalid' : 'idle'}
              helperText={signUpState.validationErrors.last_name}
              testID="signup-last-name-input"
            />
          </View>

          <CustomInput
            ref={phoneRef}
            value={signUpState.phone_number! || ''}
            onChangeText={(text) => updateField('phone_number', text)}
            inputType="phone"
            label={t('form.phone.label')}
            labelRTL={t('form.phone.labelRTL')}
            placeholder={t('form.phone.placeholder')}
            placeholderRTL={t('form.phone.placeholderRTL')}
            language={language}
            validationState={signUpState.validationErrors.phone_number ? 'invalid' : 'idle'}
            helperText={signUpState.validationErrors.phone_number || t('form.phone.optional')}
            testID="signup-phone-input"
          />
        </View>
      </Card>
    </Animated.View>
  );

  const renderAccountPreferencesStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Card variant="elevated" style={styles.formCard}>
        <Text style={[styles.stepTitle, isRTL && styles.rtlText]}>
          {t('signup.preferences.title')}
        </Text>
        <Text style={[styles.stepDescription, isRTL && styles.rtlText]}>
          {t('signup.preferences.description')}
        </Text>

        <View style={styles.formFields}>
          <CustomInput
            ref={usernameRef}
            value={(signUpState.username ?? '')}
            onChangeText={(text) => updateField('username', text)}
            inputType="username"
            label={t('form.username.label')}
            labelRTL={t('form.username.labelRTL')}
            placeholder={t('form.username.placeholder')}
            placeholderRTL={t('form.username.placeholderRTL')}
            language={language}
            validationState={signUpState.validationErrors.username ? 'invalid' : 'idle'}
            helperText={signUpState.validationErrors.username || t('form.username.optional')}
            testID="signup-username-input"
          />

          <CustomInput
            value={signUpState.date_of_birth ?? ''}
            onChangeText={(text) => updateField('date_of_birth', text)}
            inputType="text"
            label={t('form.dateOfBirth.label')}
            labelRTL={t('form.dateOfBirth.labelRTL')}
            placeholder={t('form.dateOfBirth.placeholder')}
            placeholderRTL={t('form.dateOfBirth.placeholderRTL')}
            language={language}
            validationState={signUpState.validationErrors.date_of_birth ? 'invalid' : 'idle'}
            helperText={signUpState.validationErrors.date_of_birth || t('form.dateOfBirth.optional')}
            testID="signup-dob-input"
          />

          {/* Consent Checkboxes */}
          <View style={styles.consentSection}>
            <TouchableOpacity
              style={[styles.checkboxRow, isRTL && styles.checkboxRowRTL]}
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
              <Text style={[styles.checkboxText, isRTL && styles.rtlText]}>
                {t('form.marketing.label')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkboxRow, isRTL && styles.checkboxRowRTL]}
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
              <Text style={[styles.checkboxText, isRTL && styles.rtlText]}>
                {t('form.terms.label')} <Text style={styles.required}>*</Text>
              </Text>
            </TouchableOpacity>
            {signUpState.validationErrors.terms_accepted && (
              <Text style={[styles.errorText, isRTL && styles.rtlText]}>
                {signUpState.validationErrors.terms_accepted}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.checkboxRow, isRTL && styles.checkboxRowRTL]}
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
              <Text style={[styles.checkboxText, isRTL && styles.rtlText]}>
                {t('form.privacy.label')} <Text style={styles.required}>*</Text>
              </Text>
            </TouchableOpacity>
            {signUpState.validationErrors.privacy_policy_accepted && (
              <Text style={[styles.errorText, isRTL && styles.rtlText]}>
                {signUpState.validationErrors.privacy_policy_accepted}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderEmailVerificationStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Card variant="elevated" style={styles.formCard}>
        <View style={styles.verificationHeader}>
          <Feather name="mail" size={48} color="#8A5CF6" />
          <Text style={[styles.stepTitle, isRTL && styles.rtlText]}>
            {t('verification.title')}
          </Text>
          <Text style={[styles.stepDescription, isRTL && styles.rtlText]}>
            {t('verification.description', { email: signUpState.email })}
          </Text>
        </View>

        <View style={styles.verificationActions}>
          <Button
            title={t('verification.checkEmail')}
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
                <Text style={[styles.resendText, isRTL && styles.rtlText]}>
                  {t('verification.resend')}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.resendCountdown, isRTL && styles.rtlText]}>
                {t('verification.resendIn', { seconds: emailVerificationState.resendCountdown })}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
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

      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handlePreviousStep}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          testID="signup-back-button"
        >
          <Feather 
            name={isRTL ? "arrow-right" : "arrow-left"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>
          {t('signup.title')}
        </Text>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setLanguage(language === 'english' ? 'farsi' : 'english')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('common.changeLanguage')}
          testID="language-toggle-button"
        >
          <Text style={styles.languageButtonText}>
            {language === 'english' ? 'فا' : 'EN'}
          </Text>
        </TouchableOpacity>
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
        <Text style={[styles.progressText, isRTL && styles.rtlText]}>
          {t('signup.step', { current: signUpState.currentStep, total: Object.keys(STEPS).length })}
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      {signUpState.currentStep !== STEPS.EMAIL_VERIFICATION && (
        <View style={[styles.navigationButtons, isRTL && styles.navigationButtonsRTL]}>
          <Button
            title={
              signUpState.currentStep === STEPS.ACCOUNT_PREFERENCES 
                ? t('signup.createAccount')
                : t('common.next')
            }
            onPress={handleNextStep}
            variant="quantum"
            size="large"
            loading={signUpState.isSubmitting}
            disabled={signUpState.isSubmitting}
            style={styles.nextButton}
            accessibilityHint={
              signUpState.currentStep === STEPS.ACCOUNT_PREFERENCES
                ? t('signup.createAccountHint')
                : t('common.nextHint')
            }
            testID="signup-next-button"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 20,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  languageButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(138, 92, 246, 0.2)',
    minWidth: 40,
    alignItems: 'center',
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8A5CF6',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    width: '100%',
  },
  formCard: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  formFields: {
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  nameInputRTL: {
    textAlign: 'right',
  },
  consentSection: {
    marginTop: 8,
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxRowRTL: {
    flexDirection: 'row-reverse',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#00FF85',
    borderColor: '#00FF85',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  required: {
    color: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  verificationActions: {
    gap: 20,
  },
  verificationButton: {
    width: '100%',
  },
  resendSection: {
    alignItems: 'center',
  },
  resendText: {
    color: '#8A5CF6',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendCountdown: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  navigationButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  navigationButtonsRTL: {
    flexDirection: 'row-reverse',
  },
  nextButton: {
    width: '100%',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default SignUpScreen;









