// src/screens/auth/ForgotPasswordScreen.tsx
// IRANVERSE Enterprise Password Reset Screen
// Revolutionary password recovery with Tesla-inspired security
// Built for 90M users - Secure Reset + Enterprise Validation
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../App';

// Enterprise Component Library
import SafeArea from '../../../shared/components/layout/SafeArea';
import GradientBackground from '../../../shared/components/layout/GradientBackground';
import Text from '../../../shared/components/ui/Text';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/forms/Input';
import FieldError from '../../../shared/components/forms/FieldError';
import Loader from '../../../shared/components/ui/Loader';
import { useTheme } from '../../../shared/theme/ThemeProvider';

// Auth Components
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';

// Enterprise Utilities
import { validateEmail } from '../../../core/utils/validation';
import { useAuth } from '../hooks/useAuth';

// ========================================================================================
// TYPES & INTERFACES - PASSWORD RESET
// ========================================================================================

type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========================================================================================
// FORGOT PASSWORD SCREEN IMPLEMENTATION - SECURE RECOVERY
// ========================================================================================

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation, route }) => {
  // Extract route params with proper type safety - handle case where params may not be defined in RootStackParamList
  const routeParams = route.params as { email?: string; returnUrl?: string } | undefined;
  const prefilledEmail = routeParams?.email || '';
  const returnUrl = routeParams?.returnUrl;
  
  // Theme System
  const theme = useTheme();
  const { colors, spacing, animations } = theme;
  
  // Authentication
  const { requestPasswordReset, isLoading, error, clearError } = useAuth();
  
  // Form State
  const [email, setEmail] = useState(prefilledEmail || '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  
  // Refs
  const emailInputRef = useRef<any>(null);
  
  // ========================================================================================
  // ENTRANCE ANIMATION SYSTEM
  // ========================================================================================
  
  useEffect(() => {
    const startEntranceAnimation = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animations.duration.medium,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 300,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    };
    
    const timer = setTimeout(startEntranceAnimation, 100);
    return () => clearTimeout(timer);
  }, [animations, fadeAnim, slideAnim]);
  
  // ========================================================================================
  // FORM VALIDATION - ENTERPRISE STANDARDS
  // ========================================================================================
  
  const validateForm = useCallback((emailValue: string, showErrors: boolean = false) => {
    const emailValidation = validateEmail(emailValue, { language: 'en' });
    
    if (showErrors) {
      setEmailError(!emailValidation.isValid ? emailValidation.errors[0]?.message || null : null);
    }
    
    return emailValidation.isValid;
  }, []);
  
  // Real-time validation
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    clearError();
    
    if (showValidation) {
      validateForm(value, true);
    }
  }, [showValidation, validateForm, clearError]);
  
  // ========================================================================================
  // FORM SUBMISSION - PASSWORD RESET REQUEST
  // ========================================================================================
  
  const handleSubmit = useCallback(async () => {
    setShowValidation(true);
    setIsSubmitted(true);
    
    // Validate form
    const isValid = validateForm(email, true);
    if (!isValid) {
      return;
    }
    
    try {
      // Request password reset
      await requestPasswordReset(email);
      
      // Show success state
      setIsSuccess(true);
      
      // Success animation
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 400,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Auto-navigate to email sent screen after delay
      setTimeout(() => {
        (navigation as any).navigate('EmailSent', {
          email,
          tempUserId: 'password_reset', // Placeholder ID for password reset
        });
      }, 2000);
      
    } catch (error) {
      console.error('Password reset request failed:', error);
      // Error is handled by auth context
    }
  }, [email, validateForm, requestPasswordReset, navigation, successAnim]);
  
  // ========================================================================================
  // NAVIGATION HANDLERS
  // ========================================================================================
  
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  const handleSignInPress = useCallback(() => {
    (navigation as any).navigate('Login');
  }, [navigation]);
  
  const handleSignUpPress = useCallback(() => {
    (navigation as any).navigate('Signup');
  }, [navigation]);
  
  // Android back button handling
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackPress();
      return true;
    });
    
    return () => backHandler.remove();
  }, [handleBackPress]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderSuccessState = () => {
    if (!isSuccess) return null;
    
    return (
      <Animated.View
        style={[
          styles.successContainer,
          {
            opacity: successAnim,
            transform: [{ scale: successAnim }],
          },
        ]}
      >
        <View style={[styles.successIcon, { backgroundColor: colors.accent.success }]}>
          <Text style={[styles.successIconText, { color: colors.interactive.surface }]}>
            ✓
          </Text>
        </View>
        
        <Text
          variant="h3"
          align="center"
          style={[styles.successTitle, { color: colors.interactive.text.primary }]}
        >
          Check Your Email
        </Text>
        
        <Text
          variant="body"
          align="center"
          style={[styles.successMessage, { color: colors.interactive.text.secondary }]}
        >
          We've sent password reset instructions to {email}
        </Text>
      </Animated.View>
    );
  };
  
  const renderFormContent = () => {
    if (isSuccess) return null;
    
    return (
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text
            variant="h2"
            align="center"
            style={[styles.title, { color: colors.interactive.text.primary }]}
          >
            Reset Your Password
          </Text>
          
          <Text
            variant="body"
            align="center"
            style={[styles.subtitle, { color: colors.interactive.text.secondary }]}
          >
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>
        
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Input
            ref={emailInputRef}
            label="Email Address"
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            error={emailError || undefined}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            accessibilityLabel="Email address input"
            testID="email-input"
          />
          
          {emailError && (
            <FieldError 
              message={emailError} 
              visible={!!emailError}
              testID="email-error"
            />
          )}
        </View>
        
        {/* Global Error */}
        {error && (
          <FieldError 
            message={error.userMessage || error.message}
            visible={!!error}
            style={styles.globalError}
            testID="global-error"
          />
        )}
        
        {/* Submit Button */}
        <Button
          variant="primary"
          size="large"
          fullWidth
          onPress={handleSubmit}
          disabled={isLoading || !email.trim()}
          style={styles.submitButton}
          accessibilityLabel="Send reset instructions"
          testID="submit-button"
        >
          {isLoading ? (
            <Loader size="small" color={colors.interactive.surface} />
          ) : (
            'Send Reset Instructions'
          )}
        </Button>
        
        {/* Alternative Actions */}
        <View style={styles.alternativeActions}>
          <Text
            variant="caption"
            align="center"
            style={[styles.alternativeText, { color: colors.interactive.text.secondary }]}
          >
            Remember your password?{' '}
          </Text>
          
          <Button
            variant="ghost"
            size="small"
            onPress={handleSignInPress}
            style={styles.alternativeButton}
            accessibilityLabel="Go to sign in"
            testID="signin-button"
          >
            Sign In
          </Button>
        </View>
        
        <View style={styles.alternativeActions}>
          <Text
            variant="caption"
            align="center"
            style={[styles.alternativeText, { color: colors.interactive.text.secondary }]}
          >
            Don't have an account?{' '}
          </Text>
          
          <Button
            variant="ghost"
            size="small"
            onPress={handleSignUpPress}
            style={styles.alternativeButton}
            accessibilityLabel="Create new account"
            testID="signup-button"
          >
            Sign Up
          </Button>
        </View>
      </Animated.View>
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - PASSWORD RESET INTERFACE
  // ========================================================================================
  
  return (
    <SafeArea edges={['top', 'bottom']} style={styles.container}>
      <GradientBackground animated style={styles.background}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <AuthHeader 
              showBackButton
              onBackPress={handleBackPress}
              style={styles.header}
            />
            
            {/* Main Content */}
            <View style={styles.content}>
              {renderFormContent()}
              {renderSuccessState()}
            </View>
            
            {/* Footer */}
            <AuthFooter style={styles.footer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </GradientBackground>
    </SafeArea>
  );
};

// ========================================================================================
// STYLES - ENTERPRISE DESIGN SYSTEM
// ========================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  formContainer: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  subtitle: {
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  globalError: {
    marginBottom: 16,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alternativeActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  alternativeText: {
    fontSize: 14,
    opacity: 0.8,
  },
  alternativeButton: {
    marginLeft: 4,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconText: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  successTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  successMessage: {
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 32,
  },
  footer: {
    paddingHorizontal: 24,
    marginTop: 'auto',
  },
});

export default ForgotPasswordScreen;