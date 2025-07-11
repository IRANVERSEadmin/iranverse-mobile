// src/screens/auth/LoginScreen.tsx
// IRANVERSE Enterprise Login - Revolutionary Authentication Experience
// Tesla-inspired login flow with enterprise security standards
// Built for 90M users - Enterprise Performance & Accessibility
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  BackHandler,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// IRANVERSE Components - Using only verified components
import SafeArea from '../components/ui/SafeArea';
import GradientBackground from '../components/ui/GradientBackground';
import Text from '../components/ui/Text';

// Import the centralized type definitions from App.tsx
import { RootStackParamList } from '../../App';

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE LOGIN SYSTEM
// ========================================================================================

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

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

// ========================================================================================
// LOGIN SCREEN - REVOLUTIONARY AUTHENTICATION
// ========================================================================================

const LoginScreen: React.FC = () => {
  // Navigation & Route
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<LoginScreenRouteProp>();
  const { email: routeEmail } = route.params || {};

  // Screen Dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Component State
  const [state, setState] = useState<LoginState>({
    email: routeEmail || '',
    password: '',
    rememberMe: false,
    isSubmitting: false,
    validationErrors: {},
    showPassword: false,
    loginAttempts: 0,
    isLocked: false,
    lockoutTimer: 0,
  });

  // Animation Values with cleanup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Input refs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      slideAnim.stopAnimation();
      shakeAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      scaleAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      shakeAnim.removeAllListeners();
    };
  }, [fadeAnim, scaleAnim, slideAnim, shakeAnim]);

  // ========================================================================================
  // FORM FIELD MANAGEMENT - ENTERPRISE DATA HANDLING
  // ========================================================================================

  const updateField = useCallback((field: keyof LoginState, value: any) => {
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

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!state.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!state.password) {
      errors.password = 'Password is required';
    } else if (state.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }

    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, validationErrors: errors }));
      triggerShakeAnimation();
      triggerHaptic();
      return false;
    }

    return true;
  }, [state]);

  // ========================================================================================
  // ANIMATIONS & FEEDBACK - TESLA-INSPIRED UX
  // ========================================================================================

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
  // AUTHENTICATION HANDLERS - ENTERPRISE SECURITY
  // ========================================================================================

  const handleLogin = useCallback(async () => {
    if (state.isLocked) {
      Alert.alert(
        'Account Locked',
        `Please wait ${Math.ceil(state.lockoutTimer / 60)} minutes before trying again.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, accept any valid email/password combination
      if (state.email && state.password.length >= 3) {
        triggerHaptic();
        
        // Navigate to AuthComplete screen (successful authentication)
        navigation.navigate('AuthComplete', {
          userId: `user_${Date.now()}`,
          email: state.email,
          userName: state.email.split('@')[0], // Extract username from email
          accessToken: `token_${Date.now()}`,
          isNewUser: false,
          nextAction: 'home',
          hasAvatar: true,
          avatarUrl: undefined,
        });

        setState(prev => ({
          ...prev,
          isSubmitting: false,
          loginAttempts: 0,
          validationErrors: {},
        }));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      triggerHaptic();
      triggerShakeAnimation();
      
      const newAttempts = state.loginAttempts + 1;
      
      // Check for lockout after 5 failed attempts
      if (newAttempts >= 5) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          loginAttempts: newAttempts,
          isLocked: true,
          lockoutTimer: 300, // 5 minutes lockout
        }));
        
        Alert.alert(
          'Account Locked',
          'Too many failed login attempts. Please try again in 5 minutes.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      setState(prev => ({
        ...prev,
        validationErrors: {
          email: 'Invalid email or password',
          password: 'Invalid email or password',
        },
        isSubmitting: false,
        loginAttempts: newAttempts,
      }));
    }
  }, [state, validateForm, navigation]);

  // ========================================================================================
  // NAVIGATION HANDLERS - ENTERPRISE FLOW CONTROL
  // ========================================================================================

  const handleGoBack = useCallback(() => {
    navigation.navigate('AuthWelcome');
  }, [navigation]);

  const handleSignupPress = useCallback(() => {
    navigation.navigate('Signup');
  }, [navigation]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  // Android back button handling
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [handleGoBack])
  );

  // Lockout timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isLocked && state.lockoutTimer > 0) {
      interval = setInterval(() => {
        setState(prev => {
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
  }, [state.isLocked, state.lockoutTimer]);

  // ========================================================================================
  // LIFECYCLE EFFECTS - ENTERPRISE INITIALIZATION
  // ========================================================================================

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 400,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  // ========================================================================================
  // RENDER HELPERS - ENTERPRISE UI COMPONENTS
  // ========================================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
        accessibilityLabel="Go back"
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>
        Sign In
      </Text>
      
      <View style={styles.placeholder} />
    </View>
  );

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeTitle}>Welcome Back</Text>
      <Text style={styles.welcomeSubtitle}>
        Sign in to continue your IRANVERSE journey
      </Text>
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.formFields}>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TouchableOpacity 
          style={[styles.inputWrapper, state.validationErrors.email && styles.inputError]}
          onPress={() => emailRef.current?.focus()}
          activeOpacity={1}
        >
          <Text style={styles.inputIcon}>📧</Text>
          <TextInput
            ref={emailRef}
            style={styles.textInput}
            value={state.email}
            onChangeText={(text: string) => updateField('email', text)}
            placeholder="Enter your email address"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!state.isLocked}
            onSubmitEditing={() => passwordRef.current?.focus()}
            returnKeyType="next"
            blurOnSubmit={false}
            textContentType="emailAddress"
            autoComplete="email"
          />
        </TouchableOpacity>
        {state.validationErrors.email && (
          <Text style={styles.errorText}>{state.validationErrors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TouchableOpacity 
          style={[styles.inputWrapper, state.validationErrors.password && styles.inputError]}
          onPress={() => passwordRef.current?.focus()}
          activeOpacity={1}
        >
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            ref={passwordRef}
            style={styles.textInput}
            value={state.password}
            onChangeText={(text: string) => updateField('password', text)}
            placeholder="Enter your password"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            secureTextEntry={!state.showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!state.isLocked}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
            blurOnSubmit={false}
            textContentType="password"
            autoComplete="password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => updateField('showPassword', !state.showPassword)}
          >
            <Text style={styles.eyeIconText}>
              {state.showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
        {state.validationErrors.password && (
          <Text style={styles.errorText}>{state.validationErrors.password}</Text>
        )}
      </View>

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => updateField('rememberMe', !state.rememberMe)}
          disabled={state.isLocked}
        >
          <View style={[styles.checkbox, state.rememberMe && styles.checkboxChecked]}>
            {state.rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleForgotPassword}
          disabled={state.isLocked}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Lockout Timer */}
      {state.isLocked && (
        <View style={styles.lockoutContainer}>
          <Text style={styles.lockoutIcon}>🔒</Text>
          <Text style={styles.lockoutText}>
            Account locked. Try again in {Math.floor(state.lockoutTimer / 60)}:
            {String(state.lockoutTimer % 60).padStart(2, '0')}
          </Text>
        </View>
      )}

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, (state.isSubmitting || state.isLocked) && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={state.isSubmitting || state.isLocked}
      >
        <Text style={styles.loginButtonText}>
          {state.isSubmitting ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {/* Login Attempts Warning */}
      {state.loginAttempts > 0 && state.loginAttempts < 5 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            {5 - state.loginAttempts} attempts remaining before account lockout
          </Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Don't have an account?</Text>
      <TouchableOpacity onPress={handleSignupPress}>
        <Text style={styles.footerLink}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );

  // ========================================================================================
  // MAIN RENDER - ENTERPRISE LAYOUT
  // ========================================================================================

  return (
    <SafeArea edges={['top', 'bottom']} style={styles.container}>
      <GradientBackground animated={true}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          {renderHeader()}

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
              {/* Welcome Section */}
              {renderWelcomeSection()}

              {/* Login Form */}
              {renderLoginForm()}

              {/* Footer */}
              {renderFooter()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 44,
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
    paddingVertical: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
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
    marginBottom: 40,
  },
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
  eyeIcon: {
    padding: 4,
  },
  eyeIconText: {
    fontSize: 18,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
  lockoutIcon: {
    fontSize: 20,
  },
  lockoutText: {
    flex: 1,
    fontSize: 14,
    color: '#FF5252',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#8A5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#8A5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  warningIcon: {
    fontSize: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footerLink: {
    fontSize: 16,
    color: '#8A5CF6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;