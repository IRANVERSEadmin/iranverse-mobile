// src/screens/auth/EmailSentScreen.tsx
// IRANVERSE Enterprise Email Sent - Revolutionary Verification Wait Experience
// Tesla-inspired email verification with Agent Identity Guidance
// Built for 90M users - Deep Link Email Verification Flow
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  BackHandler,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../App';

// Enterprise Component Library
import SafeArea from '../../../shared/components/layout/SafeArea';
import GradientBackground from '../../../shared/components/layout/GradientBackground';
import Text from '../../../shared/components/ui/Text';
import Button from '../../../shared/components/ui/Button';
import { useTheme } from '../../../shared/theme/ThemeProvider';

// Auth Components
import AuthHeader from '../components/AuthHeader';

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE EMAIL VERIFICATION
// ========================================================================================

type EmailSentScreenProps = NativeStackScreenProps<RootStackParamList, 'EmailSent'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========================================================================================
// EMAIL SENT SCREEN IMPLEMENTATION - REVOLUTIONARY VERIFICATION WAIT
// ========================================================================================

const EmailSentScreen: React.FC<EmailSentScreenProps> = ({ navigation, route }) => {
  const { email, tempUserId } = route.params;
  
  // Theme System
  const theme = useTheme();
  const { colors, spacing, animations } = theme;
  
  // State Management
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds cooldown
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  
  // Animation Values with cleanup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const emailIconAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Timer References
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const pulseTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup animations and timers
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
      if (pulseTimer.current) {
        clearTimeout(pulseTimer.current);
        pulseTimer.current = null;
      }
      
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      emailIconAnim.stopAnimation();
      pulseAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      emailIconAnim.removeAllListeners();
      pulseAnim.removeAllListeners();
    };
  }, [fadeAnim, slideAnim, emailIconAnim, pulseAnim]);
  
  // ========================================================================================
  // ENTRANCE ANIMATION SYSTEM - TESLA-INSPIRED
  // ========================================================================================
  
  useEffect(() => {
    const startEntranceAnimation = () => {
      // Email icon animation
      Animated.spring(emailIconAnim, {
        toValue: 1,
        tension: 400,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Content fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.duration.medium,
        useNativeDriver: true,
      }).start();
      
      // Content slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 300,
        friction: 12,
        useNativeDriver: true,
      }).start();
      
      // Start pulse animation
      startPulseAnimation();
    };
    
    const timer = setTimeout(startEntranceAnimation, 100);
    return () => clearTimeout(timer);
  }, [animations, fadeAnim, slideAnim, emailIconAnim]);
  
  const startPulseAnimation = useCallback(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        pulseTimer.current = setTimeout(pulse, 2000);
      });
    };
    pulse();
  }, [pulseAnim]);
  
  // ========================================================================================
  // COOLDOWN TIMER SYSTEM - ENTERPRISE ANTI-SPAM
  // ========================================================================================
  
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownTimer.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            if (cooldownTimer.current) {
              clearInterval(cooldownTimer.current);
              cooldownTimer.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
    };
  }, [resendCooldown]);
  
  // ========================================================================================
  // RESEND EMAIL HANDLER - ENTERPRISE RATE LIMITING
  // ========================================================================================
  
  const handleResendEmail = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;
    
    setIsResending(true);
    
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'https://api.iranverse.com'}/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tempUserId }),
        }
      );
      
      if (response.ok) {
        setResendCount(prev => prev + 1);
        setResendCooldown(60); // Reset cooldown
        
        // Show success feedback
        // Could add a toast notification here
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Resend failed:', errorData.message);
        // Could show error toast here
      }
    } catch (error) {
      console.error('Resend error:', error);
      // Could show network error toast here
    } finally {
      setIsResending(false);
    }
  }, [tempUserId, resendCooldown, isResending]);
  
  // ========================================================================================
  // EMAIL CLIENT HANDLER - ENTERPRISE UX
  // ========================================================================================
  
  const handleOpenEmailApp = useCallback(async () => {
    try {
      // Attempt to open default email app
      const emailUrl = Platform.select({
        ios: 'message://',
        android: 'mailto:',
        default: 'mailto:',
      });
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      }
    } catch (error) {
      console.error('Error opening email app:', error);
    }
  }, []);
  
  // ========================================================================================
  // NAVIGATION HANDLERS - TYPE-SAFE ENTERPRISE FLOW
  // ========================================================================================
  
  const handleBackToSignup = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  const handleBackToLogin = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);
  
  // Android back button handling
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackToSignup();
      return true;
    });
    
    return () => backHandler.remove();
  }, [handleBackToSignup]);
  
  // ========================================================================================
  // COMPONENT RENDER - REVOLUTIONARY VERIFICATION EXPERIENCE
  // ========================================================================================
  
  return (
    <SafeArea edges={['top', 'bottom']} style={styles.container}>
      <GradientBackground 
        animated 
        particleField 
        style={styles.background}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header Section */}
          <AuthHeader 
            showBackButton
            onBackPress={handleBackToSignup}
            title="Check Your Email"
            subtitle={`We sent a verification link to ${email}`}
            style={{ marginBottom: spacing.xl }}
          />
          
          {/* Email Icon Section */}
          <Animated.View 
            style={[
              styles.iconSection,
              {
                transform: [
                  { scale: emailIconAnim },
                  { scale: pulseAnim },
                ],
              }
            ]}
          >
            <View style={[styles.emailIcon, { backgroundColor: colors.interactive.surface }]}>
              <Text style={[styles.emailIconText, { color: colors.interactive.text.primary }]}>
                ✉️
              </Text>
            </View>
          </Animated.View>
          
          {/* Instructions Section */}
          <View style={styles.instructionsSection}>
            <Text
              variant="h3"
              align="center"
              style={[styles.instructionTitle, { color: colors.interactive.text.primary }]}
            >
              Verification Email Sent
            </Text>
            
            <Text
              variant="body"
              align="center"
              style={[styles.instructionText, { color: colors.interactive.text.secondary }]}
            >
              Click the verification link in your email to continue setting up your IRANVERSE account.
            </Text>
            
            <Text
              variant="bodySmall"
              align="center"
              style={[styles.helperText, { color: colors.interactive.text.secondary }]}
            >
              The link will open IRANVERSE automatically and verify your account.
            </Text>
          </View>
          
          {/* Action Buttons Section */}
          <View style={styles.actionsSection}>
            <Button
              variant="ghost"
              size="large"
              fullWidth
              onPress={handleOpenEmailApp}
              style={styles.emailButton}
              accessibilityLabel="Open email app"
              testID="open-email-button"
            >
              Open Email App
            </Button>
            
            <Button
              variant="ghost"
              size="large"
              fullWidth
              onPress={handleResendEmail}
              disabled={resendCooldown > 0 || isResending}
              style={styles.resendButton}
              accessibilityLabel={
                resendCooldown > 0 
                  ? `Resend email in ${resendCooldown} seconds`
                  : 'Resend verification email'
              }
              testID="resend-email-button"
            >
              {isResending 
                ? 'Sending...' 
                : resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s`
                  : resendCount > 0 
                    ? 'Resend Email Again' 
                    : 'Resend Email'
              }
            </Button>
          </View>
          
          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text
              variant="caption"
              align="center"
              style={[styles.helpText, { color: colors.interactive.text.secondary }]}
            >
              Didn't receive the email? Check your spam folder or try a different email address.
            </Text>
            
            <Button
              variant="ghost"
              size="large"
              fullWidth
              onPress={handleBackToLogin}
              style={styles.loginButton}
              accessibilityLabel="Already have an account? Sign in"
              testID="back-to-login-button"
            >
              Already have an account? Sign In
            </Button>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  iconSection: {
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.05,
  },
  emailIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  emailIconText: {
    fontSize: 48,
    lineHeight: 56,
  },
  instructionsSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  instructionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  instructionText: {
    marginBottom: 12,
    lineHeight: 24,
    textAlign: 'center',
  },
  helperText: {
    opacity: 0.8,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionsSection: {
    gap: 16,
    marginTop: 32,
  },
  emailButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  resendButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  helpSection: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 16,
  },
  helpText: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  loginButton: {
    height: 48,
  },
});

export default EmailSentScreen;