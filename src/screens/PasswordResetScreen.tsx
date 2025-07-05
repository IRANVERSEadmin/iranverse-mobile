// src/screens/PasswordResetScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import enterprise components and utilities
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { authService } from '../services/authService';
import { validateEmail, validatePassword } from '../utils/validation';
import { AuthErrorCodes, ResetPasswordDto, ForgotPasswordDto } from '../types/auth.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enterprise Password Reset Phases
type ResetPhase = 'email_input' | 'email_sent' | 'reset_form' | 'success' | 'error';

interface PasswordResetScreenProps {
  navigation: any;
  route?: {
    params?: {
      token?: string;
      email?: string;
    };
  };
}

const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({ navigation, route }) => {
  // Hooks
  const { t, language, isRTL } = useLanguage();
  const { networkStatus } = useAuth();

  // Core State
  const [phase, setPhase] = useState<ResetPhase>('email_input');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Initialize from deep link
  useEffect(() => {
    if (route?.params?.token) {
      setToken(route.params.token);
      setPhase('reset_form');
    }
    if (route?.params?.email) {
      setEmail(route.params.email);
    }

    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [route?.params]);

  // Password strength calculation
  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordStrength(validation.score || 0);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Validation functions
  const validateEmailInput = (): boolean => {
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setErrors({ email: Object.values(validation.errors)[0] });
      triggerShakeAnimation();
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePasswordInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      newErrors.password = Object.values(passwordValidation.errors)[0];
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('validation.password.noMatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShakeAnimation();
      return false;
    }

    setErrors({});
    return true;
  };

  // Animation helpers
  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const animatePhaseTransition = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // API functions
  const handleForgotPassword = async () => {
    if (!validateEmailInput()) return;

    setLoading(true);
    try {
      const request: ForgotPasswordDto = {
        email,
        language: language === 'farsi' ? 'fa' : 'en',
      };

      const response = await authService.forgotPassword(request);

      if (response.success) {
        setPhase('email_sent');
        setResendCooldown(60);
        animatePhaseTransition();
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      if (error.code === AuthErrorCodes.RATE_LIMIT_EXCEEDED) {
        Alert.alert(
          t('error.tryAgainLater'),
          t('login.rateLimited.message', { seconds: '60' })
        );
      } else {
        Alert.alert(
          t('error.networkError'),
          error.message || t('error.tryAgainLater')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswordInputs()) return;

    setLoading(true);
    try {
      const request: ResetPasswordDto = {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      const response = await authService.resetPassword(request);

      if (response.success) {
        setPhase('success');
        animatePhaseTransition();
        
        // Auto-navigate to login after success
        setTimeout(() => {
          navigation.navigate('Login');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      if (error.code === AuthErrorCodes.RESET_TOKEN_INVALID || 
          error.code === AuthErrorCodes.RESET_TOKEN_EXPIRED) {
        setPhase('error');
        animatePhaseTransition();
      } else {
        Alert.alert(
          t('error.tryAgainLater'),
          error.message || t('error.serverError')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    await handleForgotPassword();
  };

  // Password strength indicator
  const renderPasswordStrength = () => {
    const strengthColors = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'];
    const strengthLabels = [
      t('validation.password.veryWeak'),
      t('validation.password.weak'),
      t('validation.password.fair'),
      t('validation.password.good'),
      t('validation.password.strong'),
    ];

    return (
      <View style={styles.passwordStrengthContainer}>
        <View style={styles.passwordStrengthBar}>
          {[1, 2, 3, 4, 5].map((level) => (
            <View
              key={level}
              style={[
                styles.passwordStrengthSegment,
                {
                  backgroundColor: passwordStrength >= level 
                    ? strengthColors[passwordStrength - 1] 
                    : 'rgba(255, 255, 255, 0.1)',
                },
              ]}
            />
          ))}
        </View>
        {passwordStrength > 0 && (
          <Text style={[styles.passwordStrengthLabel, { color: strengthColors[passwordStrength - 1] }]}>
            {strengthLabels[passwordStrength - 1]}
          </Text>
        )}
      </View>
    );
  };

  // Phase-specific content renderers
  const renderEmailInputPhase = () => (
    <Animated.View 
      style={[
        styles.phaseContainer,
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { translateX: shakeAnim }
          ] 
        }
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('passwordReset.title')}</Text>
        <Text style={styles.subtitle}>{t('passwordReset.description')}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('form.email.label')}</Text>
          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={[styles.textInput, { textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('form.email.placeholder')}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              editable={!loading}
            />
          </View>
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        <Button
          title={t('passwordReset.sendLink')}
          onPress={handleForgotPassword}
          variant="primary"
          size="large"
          loading={loading}
          disabled={!email || loading || networkStatus === 'offline'}
          asyncOperation={true}
          glowEffect={true}
          style={styles.primaryButton}
        />

        {networkStatus === 'offline' && (
          <Text style={styles.offlineWarning}>
            {t('error.networkOffline')}
          </Text>
        )}
      </View>
    </Animated.View>
  );

  const renderEmailSentPhase = () => (
    <Animated.View 
      style={[
        styles.phaseContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <View style={styles.successIconContainer}>
        <Text style={styles.successIcon}>📬</Text>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('passwordReset.linkSent')}</Text>
        <Text style={styles.subtitle}>
          {t('passwordReset.linkSentDescription')}
        </Text>
        <Text style={styles.emailDisplay}>{email}</Text>
      </View>

      <View style={styles.actionContainer}>
        <Button
          title={
            resendCooldown > 0 
              ? t('verification.resendIn', { seconds: resendCooldown })
              : t('verification.resend')
          }
          onPress={handleResendEmail}
          variant="secondary"
          size="medium"
          disabled={resendCooldown > 0 || loading}
          loading={loading}
          style={styles.secondaryButton}
        />

        <Button
          title={t('common.back')}
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="medium"
          style={styles.ghostButton}
        />
      </View>
    </Animated.View>
  );

  const renderResetFormPhase = () => (
    <Animated.View 
      style={[
        styles.phaseContainer,
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { translateX: shakeAnim }
          ] 
        }
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('passwordReset.title')}</Text>
        <Text style={styles.subtitle}>{t('passwordReset.newPasswordDescription')}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('passwordReset.newPassword')}</Text>
          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={[styles.textInput, { textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('form.password.placeholder')}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="next"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
          {newPassword && renderPasswordStrength()}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('passwordReset.confirmNewPassword')}</Text>
          <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={[styles.textInput, { textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('form.confirmPassword.placeholder')}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="done"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        <Button
          title={t('passwordReset.updatePassword')}
          onPress={handleResetPassword}
          variant="primary"
          size="large"
          loading={loading}
          disabled={!newPassword || !confirmPassword || loading || passwordStrength < 3}
          asyncOperation={true}
          glowEffect={true}
          style={styles.primaryButton}
        />
      </View>
    </Animated.View>
  );

  const renderSuccessPhase = () => (
    <Animated.View 
      style={[
        styles.phaseContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <View style={styles.successIconContainer}>
        <Text style={styles.successIcon}>✅</Text>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('success.passwordReset')}</Text>
        <Text style={styles.subtitle}>{t('passwordReset.successDescription')}</Text>
      </View>

      <View style={styles.actionContainer}>
        <Button
          title={t('auth.login')}
          onPress={() => navigation.navigate('Login')}
          variant="primary"
          size="large"
          glowEffect={true}
          style={styles.primaryButton}
        />
      </View>
    </Animated.View>
  );

  const renderErrorPhase = () => (
    <Animated.View 
      style={[
        styles.phaseContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <View style={styles.errorIconContainer}>
        <Text style={styles.errorIcon}>❌</Text>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('error.invalidToken')}</Text>
        <Text style={styles.subtitle}>{t('passwordReset.tokenExpiredDescription')}</Text>
      </View>

      <View style={styles.actionContainer}>
        <Button
          title={t('passwordReset.requestNewLink')}
          onPress={() => {
            setPhase('email_input');
            animatePhaseTransition();
          }}
          variant="primary"
          size="large"
          style={styles.primaryButton}
        />

        <Button
          title={t('auth.login')}
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          size="medium"
          style={styles.ghostButton}
        />
      </View>
    </Animated.View>
  );

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>IRANVERSE</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {phase === 'email_input' && renderEmailInputPhase()}
              {phase === 'email_sent' && renderEmailSentPhase()}
              {phase === 'reset_form' && renderResetFormPhase()}
              {phase === 'success' && renderSuccessPhase()}
              {phase === 'error' && renderErrorPhase()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  backIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00ff88',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT * 0.7,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  emailDisplay: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginTop: 4,
  },
  passwordStrengthContainer: {
    marginTop: 12,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 8,
  },
  secondaryButton: {
    marginBottom: 16,
  },
  ghostButton: {
    marginTop: 8,
  },
  actionContainer: {
    gap: 16,
    marginTop: 20,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 64,
  },
  errorIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 64,
  },
  offlineWarning: {
    fontSize: 14,
    color: '#ff9800',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default PasswordResetScreen;
