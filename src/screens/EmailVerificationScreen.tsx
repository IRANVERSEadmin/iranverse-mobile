// src/screens/EmailVerificationScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  Alert,
  Vibration,
  Platform,
  TouchableOpacity,
  Animated,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

// Enterprise UI Components
import GradientBackground from '../components/ui/GradientBackground';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Services and Context
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useLanguage } from '../hooks/useLanguage';
import { deepLinkService } from '../utils/deepLinking';

// Types
import { ApiErrorResponse } from '../types/auth.types';

interface EmailVerificationScreenProps {
  navigation: any;
  route: any;
}

interface VerificationState {
  email: string;
  token?: string;
  isVerifying: boolean;
  isResending: boolean;
  canResend: boolean;
  resendCountdown: number;
  verificationAttempts: number;
  verificationSuccess: boolean;
  errorMessage?: string;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation, route }) => {
  // Context and Hooks
  const { user, isAuthenticated } = useAuth();
  const { language, isRTL, t } = useLanguage();
  
  // Animation References
  const fadeAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  const successAnim = new Animated.Value(0);
  
  // State Management
  const [verificationState, setVerificationState] = useState<VerificationState>({
    email: route.params?.email || user?.email || '',
    token: route.params?.token,
    isVerifying: false,
    isResending: false,
    canResend: false,
    resendCountdown: 60,
    verificationAttempts: 0,
    verificationSuccess: false,
  });

  // Back Handler for Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (verificationState.verificationSuccess) {
          // If verification successful, go to avatar creation
          navigation.navigate('AvatarCreation');
        } else {
          // Otherwise go back to signup
          navigation.goBack();
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, verificationState.verificationSuccess])
  );

  // Initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  // Auto-verify if token is provided (from deep link)
  useEffect(() => {
    if (verificationState.token && !verificationState.isVerifying) {
      handleEmailVerification();
    }
  }, [verificationState.token]);

  // Resend countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!verificationState.canResend && verificationState.resendCountdown > 0) {
      interval = setInterval(() => {
        setVerificationState(prev => {
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
  }, [verificationState.canResend, verificationState.resendCountdown]);

  // Success animation
  useEffect(() => {
    if (verificationState.verificationSuccess) {
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Auto-navigate after success
      const timer = setTimeout(() => {
        navigation.navigate('AvatarCreation');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [verificationState.verificationSuccess, navigation]);

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

  // Email Verification Handler
  const handleEmailVerification = useCallback(async () => {
    if (!verificationState.email) {
      Alert.alert(
        t('error.verificationFailed'),
        t('error.checkEmail'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    setVerificationState(prev => ({ 
      ...prev, 
      isVerifying: true, 
      errorMessage: undefined 
    }));

    try {
      const response = await authService.verifyEmail(
        verificationState.email,
        verificationState.token
      );
      
      if (response.success) {
        triggerHaptic('success');
        
        setVerificationState(prev => ({
          ...prev,
          isVerifying: false,
          verificationSuccess: true,
          verificationAttempts: prev.verificationAttempts + 1,
        }));

        // Show success message
        Alert.alert(
          t('success.emailVerified'),
          t('avatar.required'),
          [
            { 
              text: t('common.ok'), 
              onPress: () => navigation.navigate('AvatarCreation')
            }
          ]
        );
      } else {
        throw new Error('Verification failed');
      }
    } catch (error: any) {
      triggerHaptic('error');
      
      const attempts = verificationState.verificationAttempts + 1;
      
      setVerificationState(prev => ({
        ...prev,
        isVerifying: false,
        verificationAttempts: attempts,
      }));

      // Handle specific errors
      if (error.response?.data?.error) {
        const apiError = error.response.data as ApiErrorResponse;
        const errorMessage = isRTL ? 
          (apiError.error.message_fa || apiError.error.message) : 
          apiError.error.message;

        setVerificationState(prev => ({
          ...prev,
          errorMessage,
        }));

        if (apiError.error.code === 'VERIFICATION_TOKEN_EXPIRED') {
          Alert.alert(
            t('error.verificationFailed'),
            errorMessage,
            [
              { text: t('verification.resend'), onPress: handleResendVerification },
              { text: t('common.cancel'), style: 'cancel' }
            ]
          );
        } else {
          Alert.alert(
            t('error.verificationFailed'),
            errorMessage,
            [{ text: t('common.ok'), style: 'default' }]
          );
        }
      } else {
        Alert.alert(
          t('error.verificationFailed'),
          t('error.checkEmail'),
          [{ text: t('common.ok'), style: 'default' }]
        );
      }
    }
  }, [verificationState.email, verificationState.token, isRTL, t, triggerHaptic, navigation]);

  // Resend Verification Handler
  const handleResendVerification = useCallback(async () => {
    if (!verificationState.email) {
      return;
    }

    setVerificationState(prev => ({ ...prev, isResending: true }));

    try {
      await authService.resendVerificationEmail(verificationState.email);
      
      triggerHaptic('light');
      
      setVerificationState(prev => ({
        ...prev,
        isResending: false,
        canResend: false,
        resendCountdown: 60,
        errorMessage: undefined,
      }));

      Alert.alert(
        t('verification.resent'),
        t('verification.checkEmail'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    } catch (error: any) {
      triggerHaptic('error');
      
      setVerificationState(prev => ({ ...prev, isResending: false }));

      if (error.response?.data?.error) {
        const apiError = error.response.data as ApiErrorResponse;
        const errorMessage = isRTL ? 
          (apiError.error.message_fa || apiError.error.message) : 
          apiError.error.message;

        Alert.alert(
          t('error.resendFailed'),
          errorMessage,
          [{ text: t('common.ok'), style: 'default' }]
        );
      } else {
        Alert.alert(
          t('error.resendFailed'),
          t('error.tryAgainLater'),
          [{ text: t('common.ok'), style: 'default' }]
        );
      }
    }
  }, [verificationState.email, isRTL, t, triggerHaptic]);

  // Handle manual check button
  const handleManualCheck = useCallback(() => {
    if (verificationState.token) {
      // If we have a token, try verification
      handleEmailVerification();
    } else {
      // If no token, show instructions
      Alert.alert(
        t('verification.title'),
        t('verification.description', { email: verificationState.email }),
        [
          { text: t('verification.resend'), onPress: handleResendVerification },
          { text: t('common.ok'), style: 'default' }
        ]
      );
    }
  }, [verificationState.token, verificationState.email, t, handleEmailVerification, handleResendVerification]);

  // Navigate back
  const handleBack = useCallback(() => {
    if (verificationState.verificationSuccess) {
      navigation.navigate('AvatarCreation');
    } else {
      navigation.goBack();
    }
  }, [navigation, verificationState.verificationSuccess]);

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
          onPress={handleBack}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          testID="verification-back-button"
        >
          <Feather 
            name={isRTL ? "arrow-right" : "arrow-left"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>
          {t('verification.title')}
        </Text>

        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Card variant="elevated" style={styles.verificationCard}>
          {/* Success State */}
          {verificationState.verificationSuccess ? (
            <Animated.View 
              style={[
                styles.successContainer,
                { transform: [{ scale: successAnim }] }
              ]}
            >
              <View style={styles.successIcon}>
                <Feather name="check-circle" size={64} color="#00FF85" />
              </View>
              <Text style={[styles.successTitle, isRTL && styles.rtlText]}>
                {t('success.emailVerified')}
              </Text>
              <Text style={[styles.successMessage, isRTL && styles.rtlText]}>
                {t('avatar.required')}
              </Text>
              
              <Button
                title={t('avatar.title')}
                onPress={() => navigation.navigate('AvatarCreation')}
                variant="quantum"
                size="large"
                style={styles.successButton}
                testID="create-avatar-button"
              />
            </Animated.View>
          ) : (
            /* Normal Verification State */
            <View style={styles.verificationContainer}>
              {/* Email Icon */}
              <Animated.View 
                style={[
                  styles.emailIcon,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Feather name="mail" size={64} color="#8A5CF6" />
              </Animated.View>

              {/* Title and Description */}
              <Text style={[styles.verificationTitle, isRTL && styles.rtlText]}>
                {t('verification.title')}
              </Text>
              
              <Text style={[styles.verificationDescription, isRTL && styles.rtlText]}>
                {t('verification.description', { email: verificationState.email })}
              </Text>

              {/* Error Message */}
              {verificationState.errorMessage && (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={20} color="#FF5252" />
                  <Text style={[styles.errorText, isRTL && styles.rtlText]}>
                    {verificationState.errorMessage}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  title={t('verification.checkEmail')}
                  onPress={handleManualCheck}
                  variant="quantum"
                  size="large"
                  loading={verificationState.isVerifying}
                  disabled={verificationState.isVerifying}
                  style={styles.checkButton}
                  testID="check-email-button"
                />

                {/* Resend Section */}
                <View style={styles.resendSection}>
                  {verificationState.canResend ? (
                    <TouchableOpacity
                      onPress={handleResendVerification}
                      disabled={verificationState.isResending}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={t('verification.resend')}
                      testID="resend-verification-button"
                    >
                      <Text style={[styles.resendText, isRTL && styles.rtlText]}>
                        {verificationState.isResending ? 
                          t('common.loading') : 
                          t('verification.resend')
                        }
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.resendCountdown, isRTL && styles.rtlText]}>
                      {t('verification.resendIn', { seconds: verificationState.resendCountdown })}
                    </Text>
                  )}
                </View>

                {/* Attempt Counter */}
                {verificationState.verificationAttempts > 0 && (
                  <Text style={[styles.attemptCounter, isRTL && styles.rtlText]}>
                    {t('login.attemptsWarning', { 
                      remaining: Math.max(0, 5 - verificationState.verificationAttempts) 
                    })}
                  </Text>
                )}
              </View>
            </View>
          )}
        </Card>

        {/* Help Section */}
        {!verificationState.verificationSuccess && (
          <View style={styles.helpSection}>
            <Text style={[styles.helpTitle, isRTL && styles.rtlText]}>
              Need help?
            </Text>
            <Text style={[styles.helpText, isRTL && styles.rtlText]}>
              • Check your spam/junk folder{'\n'}
              • Make sure you entered the correct email{'\n'}
              • Verification links expire after 24 hours
            </Text>
          </View>
        )}
      </Animated.View>
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
  placeholder: {
    width: 40, // Match back button width for centering
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  verificationCard: {
    marginBottom: 30,
  },
  verificationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emailIcon: {
    marginBottom: 24,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  verificationDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF5252',
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
    gap: 20,
  },
  checkButton: {
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
    textAlign: 'center',
  },
  attemptCounter: {
    color: '#FF9800',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00FF85',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  successButton: {
    width: '100%',
  },
  helpSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default EmailVerificationScreen;