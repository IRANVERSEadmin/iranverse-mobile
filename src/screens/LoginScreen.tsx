// src/screens/LoginScreen.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

// Enterprise UI Components (existing)
import GradientBackground from '../components/ui/GradientBackground';
import Button from '../components/ui/Button';
import CustomInput from '../components/ui/CustomInput';
import PasswordInput from '../components/ui/PasswordInput';
import Card from '../components/ui/Card';

// Auth Context and Services
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useLanguage } from '../hooks/useLanguage';
import { authMessages } from '../i18n/authMessages';

// Types
import { LoginDto, ApiErrorResponse } from '../types/auth.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

interface LoginState {
  email: string;
  password: string;
  rememberMe: boolean;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
  showPassword: boolean;
  loginAttempts: number;
  isLocked: boolean;
  lockoutTimer: number;
}

const LoginScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  // Context and Hooks
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const { language, setLanguage, isRTL, t } = useLanguage();
  
  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Google OAuth Configuration
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_EXPO_CLIENT_ID', // Replace with your Expo client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID',   // Replace with your iOS client ID
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with your Android client ID
    webClientId: 'YOUR_WEB_CLIENT_ID',   // Replace with your web client ID
    scopes: ['openid', 'profile', 'email'],
    
    
  });

  // State Management
  const [loginState, setLoginState] = useState<LoginState>({
    email: '',
    password: '',
    rememberMe: false,
    isSubmitting: false,
    validationErrors: {},
    showPassword: false,
    loginAttempts: 0,
    isLocked: false,
    lockoutTimer: 0,
  });

  // Refs for form inputs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Return destination from params
  const returnTo = route.params?.returnTo;

  // Back Handler for Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  // Initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Lockout timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (loginState.isLocked && loginState.lockoutTimer > 0) {
      interval = setInterval(() => {
        setLoginState(prev => {
          if (prev.lockoutTimer <= 1) {
            return { ...prev, isLocked: false, lockoutTimer: 0, loginAttempts: 0 };
          }
          return { ...prev, lockoutTimer: prev.lockoutTimer - 1 };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loginState.isLocked, loginState.lockoutTimer]);

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleAuth(googleResponse.authentication);
    }
  }, [googleResponse]);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      if (returnTo) {
        navigation.navigate(returnTo.screen, returnTo.params || {});
      } else {
        navigation.navigate('Home');
      }
    }
  }, [isAuthenticated, user, returnTo, navigation]);

  // Form Field Updates
  const updateField = useCallback((field: keyof LoginState, value: any) => {
    setLoginState(prev => ({
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

  // Shake animation for errors
  const triggerShakeAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
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

  // Form Validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!loginState.email.trim()) {
      errors.email = t('validation.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginState.email)) {
      errors.email = t('validation.email.invalid');
    }

    if (!loginState.password) {
      errors.password = t('validation.password.required');
    } else if (loginState.password.length < 3) {
      errors.password = t('validation.password.minLength');
    }

    if (Object.keys(errors).length > 0) {
      setLoginState(prev => ({
        ...prev,
        validationErrors: errors,
      }));
      triggerShakeAnimation();
      triggerHaptic('error');
      return false;
    }

    return true;
  }, [loginState, t, triggerShakeAnimation, triggerHaptic]);

  // Login Handler
  const handleLogin = useCallback(async () => {
    if (loginState.isLocked) {
      Alert.alert(
        t('login.locked.title'),
        t('login.locked.message', { minutes: Math.ceil(loginState.lockoutTimer / 60) }),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoginState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const loginData: LoginDto = {
        email: loginState.email.trim(),
        password: loginState.password,
        remember_me: loginState.rememberMe,
        device_fingerprint: `${Platform.OS}-${Platform.Version}`,
      };

      const response = await authService.login(loginData);

      if (response.success) {
        triggerHaptic('success');
        
        // Login successful - context will handle navigation
        setLoginState(prev => ({
          ...prev,
          isSubmitting: false,
          loginAttempts: 0,
          validationErrors: {},
        }));
      }
    } catch (error: any) {
      triggerHaptic('error');
      triggerShakeAnimation();
      
      const newAttempts = loginState.loginAttempts + 1;
      
      // Check for lockout after 5 failed attempts
      if (newAttempts >= 5) {
        setLoginState(prev => ({
          ...prev,
          isSubmitting: false,
          loginAttempts: newAttempts,
          isLocked: true,
          lockoutTimer: 300, // 5 minutes lockout
        }));
        
        Alert.alert(
          t('login.locked.title'),
          t('login.locked.tooManyAttempts'),
          [{ text: t('common.ok'), style: 'default' }]
        );
        return;
      }

      if (error.response?.data?.error) {
        const apiError = error.response.data as ApiErrorResponse;
        
        // Handle specific error cases
        if (apiError.error.code === 'INVALID_CREDENTIALS') {
          setLoginState(prev => ({
            ...prev,
            validationErrors: {
              email: t('login.invalidCredentials'),
              password: t('login.invalidCredentials'),
            },
            isSubmitting: false,
            loginAttempts: newAttempts,
          }));
        } else if (apiError.error.code === 'RATE_LIMIT_EXCEEDED') {
          const retryAfter = error.response.data.retry_after || 60;
          setLoginState(prev => ({
            ...prev,
            isSubmitting: false,
            isLocked: true,
            lockoutTimer: retryAfter,
          }));
          
          Alert.alert(
            t('login.rateLimited.title'),
            t('login.rateLimited.message', { seconds: retryAfter }),
            [{ text: t('common.ok'), style: 'default' }]
          );
        } else if (apiError.error.details?.field_errors) {
          // Handle field-specific errors
          const fieldErrors: Record<string, string> = {};
          apiError.error.details.field_errors.forEach(fieldError => {
            fieldErrors[fieldError.field] = isRTL ? 
              (fieldError.message_fa || fieldError.message) : 
              fieldError.message;
          });
          
          setLoginState(prev => ({
            ...prev,
            validationErrors: fieldErrors,
            isSubmitting: false,
            loginAttempts: newAttempts,
          }));
        } else {
          // General error
          Alert.alert(
            t('error.loginFailed'),
            isRTL ? (apiError.error.message_fa || apiError.error.message) : apiError.error.message,
            [{ text: t('common.ok'), style: 'default' }]
          );
          
          setLoginState(prev => ({
            ...prev,
            isSubmitting: false,
            loginAttempts: newAttempts,
          }));
        }
      } else {
        // Network or unexpected error
        Alert.alert(
          t('error.networkError'),
          t('error.tryAgainLater'),
          [{ text: t('common.ok'), style: 'default' }]
        );
        
        setLoginState(prev => ({
          ...prev,
          isSubmitting: false,
          loginAttempts: newAttempts,
        }));
      }
    }
  }, [loginState, validateForm, isRTL, t, triggerHaptic, triggerShakeAnimation]);

  // Google OAuth Handler
  const handleGoogleAuth = useCallback(async (authentication: any) => {
    if (!authentication?.accessToken) {
      triggerHaptic('error');
      Alert.alert(
        t('error.oauthFailed'),
        t('error.tryAgainLater'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    try {
      setLoginState(prev => ({ ...prev, isSubmitting: true }));

      const response = await authService.oauthLogin({
        provider: 'google',
        access_token: authentication.accessToken,
        device_fingerprint: `${Platform.OS}-${Platform.Version}`,
      });

      if (response.success) {
        triggerHaptic('success');
        // Context will handle navigation
      }
    } catch (error: any) {
      triggerHaptic('error');
      
      if (error.response?.data?.error) {
        const apiError = error.response.data as ApiErrorResponse;
        Alert.alert(
          t('error.oauthFailed'),
          isRTL ? (apiError.error.message_fa || apiError.error.message) : apiError.error.message,
          [{ text: t('common.ok'), style: 'default' }]
        );
      } else {
        Alert.alert(
          t('error.networkError'),
          t('error.tryAgainLater'),
          [{ text: t('common.ok'), style: 'default' }]
        );
      }
      
      setLoginState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [isRTL, t, triggerHaptic]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      triggerHaptic('light');
      await googlePromptAsync();
    } catch (error) {
      triggerHaptic('error');
      Alert.alert(
        t('error.oauthFailed'),
        t('error.tryAgainLater'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    }
  }, [googlePromptAsync, triggerHaptic, t]);

  // Navigation Handlers
  const handleForgotPassword = useCallback(() => {
    navigation.navigate('PasswordReset', { email: loginState.email });
  }, [navigation, loginState.email]);

  const handleSignUp = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

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
          onPress={() => navigation.goBack()}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          testID="login-back-button"
        >
          <Feather 
            name={isRTL ? "arrow-right" : "arrow-left"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>
          {t('login.title')}
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
                { translateY: slideAnim },
                { translateX: shakeAnim },
              ],
            }
          ]}
        >
          <Card variant="elevated" style={styles.formCard}>
            {/* Welcome Text */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, isRTL && styles.rtlText]}>
                {t('login.welcome')}
              </Text>
              <Text style={[styles.welcomeSubtitle, isRTL && styles.rtlText]}>
                {t('login.subtitle')}
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formFields}>
              <CustomInput
                ref={emailRef}
                value={loginState.email}
                onChangeText={(text) => updateField('email', text)}
                inputType="email"
                label={t('form.email.label')}
                labelRTL={t('form.email.labelRTL')}
                placeholder={t('form.email.placeholder')}
                placeholderRTL={t('form.email.placeholderRTL')}
                language={language}
                required
                autoFocus
                validationState={loginState.validationErrors.email ? 'invalid' : 'idle'}
                helperText={loginState.validationErrors.email}
                disabled={loginState.isLocked}
                testID="login-email-input"
              />

              <PasswordInput
                ref={passwordRef}
                value={loginState.password}
                onChangeText={(text) => updateField('password', text)}
                placeholder={t('form.password.placeholder')}
                placeholderRTL={t('form.password.placeholderRTL')}
                language={language}
                securityLevel="basic"
                disabled={loginState.isLocked}
                testID="login-password-input"
              />

              {loginState.validationErrors.password && (
                <Text style={[styles.errorText, isRTL && styles.rtlText]}>
                  {loginState.validationErrors.password}
                </Text>
              )}

              {/* Remember Me & Forgot Password */}
              <View style={[styles.optionsRow, isRTL && styles.optionsRowRTL]}>
                <TouchableOpacity
                  style={[styles.checkboxRow, isRTL && styles.checkboxRowRTL]}
                  onPress={() => updateField('rememberMe', !loginState.rememberMe)}
                  accessible
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: loginState.rememberMe }}
                  disabled={loginState.isLocked}
                  testID="login-remember-checkbox"
                >
                  <View style={[styles.checkbox, loginState.rememberMe && styles.checkboxChecked]}>
                    {loginState.rememberMe && (
                      <Feather name="check" size={12} color="#000000" />
                    )}
                  </View>
                  <Text style={[styles.rememberText, isRTL && styles.rtlText]}>
                    {t('login.rememberMe')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  disabled={loginState.isLocked}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={t('login.forgotPassword')}
                  testID="forgot-password-button"
                >
                  <Text style={[styles.forgotPasswordText, isRTL && styles.rtlText]}>
                    {t('login.forgotPassword')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Lockout Timer */}
              {loginState.isLocked && (
                <View style={styles.lockoutContainer}>
                  <Feather name="lock" size={20} color="#FF5252" />
                  <Text style={[styles.lockoutText, isRTL && styles.rtlText]}>
                    {t('login.locked.countdown', { 
                      minutes: Math.floor(loginState.lockoutTimer / 60),
                      seconds: loginState.lockoutTimer % 60 
                    })}
                  </Text>
                </View>
              )}

              {/* Login Button */}
              <Button
                title={t('login.signIn')}
                onPress={handleLogin}
                variant="quantum"
                size="large"
                loading={loginState.isSubmitting && !googleResponse}
                disabled={loginState.isSubmitting || loginState.isLocked}
                style={styles.loginButton}
                accessibilityHint={t('login.signInHint')}
                testID="login-button"
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, isRTL && styles.rtlText]}>
                  {t('login.or')}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google OAuth Button */}
              <Button
                title={t('login.continueWithGoogle')}
                onPress={handleGoogleLogin}
                variant="secondary"
                size="large"
                iconLeft="🌐"
                loading={loginState.isSubmitting && !!googleResponse}
                disabled={loginState.isSubmitting || loginState.isLocked || !googleRequest}
                style={styles.googleButton}
                accessibilityHint={t('login.googleHint')}
                testID="google-login-button"
              />

              {/* Login Attempts Warning */}
              {loginState.loginAttempts > 0 && loginState.loginAttempts < 5 && (
                <View style={styles.warningContainer}>
                  <Feather name="alert-triangle" size={16} color="#FF9800" />
                  <Text style={[styles.warningText, isRTL && styles.rtlText]}>
                    {t('login.attemptsWarning', { 
                      remaining: 5 - loginState.loginAttempts 
                    })}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Sign Up Prompt */}
          <View style={[styles.signUpPrompt, isRTL && styles.signUpPromptRTL]}>
            <Text style={[styles.signUpPromptText, isRTL && styles.rtlText]}>
              {t('login.noAccount')}
            </Text>
            <TouchableOpacity
              onPress={handleSignUp}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('login.signUp')}
              testID="signup-prompt-button"
            >
              <Text style={[styles.signUpLinkText, isRTL && styles.rtlText]}>
                {t('login.signUp')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.8,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    marginBottom: 30,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formFields: {
    gap: 20,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: -12,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  optionsRowRTL: {
    flexDirection: 'row-reverse',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxRowRTL: {
    flexDirection: 'row-reverse',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00FF85',
    borderColor: '#00FF85',
  },
  rememberText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#8A5CF6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  lockoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  lockoutText: {
    flex: 1,
    fontSize: 14,
    color: '#FF5252',
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    paddingHorizontal: 16,
  },
  googleButton: {
    marginBottom: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  signUpPromptRTL: {
    flexDirection: 'row-reverse',
  },
  signUpPromptText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signUpLinkText: {
    fontSize: 16,
    color: '#8A5CF6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default LoginScreen;

