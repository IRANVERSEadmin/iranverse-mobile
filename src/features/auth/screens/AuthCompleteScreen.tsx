// src/screens/auth/AuthCompleteScreen.tsx
// IRANVERSE Enterprise Auth Complete - Revolutionary Success Experience
// Tesla-inspired authentication completion with Agent Identity Guidance
// Built for 90M users - Deep Link Verification Success Flow
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
// TYPES & INTERFACES - ENTERPRISE AUTH COMPLETION
// ========================================================================================

type AuthCompleteScreenProps = NativeStackScreenProps<RootStackParamList, 'AuthComplete'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========================================================================================
// AUTH COMPLETE SCREEN IMPLEMENTATION - REVOLUTIONARY SUCCESS EXPERIENCE
// ========================================================================================

const AuthCompleteScreen: React.FC<AuthCompleteScreenProps> = ({ navigation, route }) => {
  const { userId, email, userName, accessToken, isNewUser, nextAction, hasAvatar, avatarUrl } = route.params;
  
  // Theme System
  const theme = useTheme();
  const { colors, spacing, animations } = theme;
  
  // State Management
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Animation Values with cleanup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successIconAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Timer References
  const pulseTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup animations and timers
  useEffect(() => {
    return () => {
      if (pulseTimer.current) {
        clearTimeout(pulseTimer.current);
        pulseTimer.current = null;
      }
      
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      successIconAnim.stopAnimation();
      pulseAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      successIconAnim.removeAllListeners();
      pulseAnim.removeAllListeners();
    };
  }, [fadeAnim, slideAnim, successIconAnim, pulseAnim]);
  
  // ========================================================================================
  // ENTRANCE ANIMATION SYSTEM - TESLA-INSPIRED
  // ========================================================================================
  
  useEffect(() => {
    const startEntranceAnimation = () => {
      // Success icon animation
      Animated.spring(successIconAnim, {
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
  }, [animations, fadeAnim, slideAnim, successIconAnim]);
  
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
  // NAVIGATION HANDLERS - TYPE-SAFE ENTERPRISE FLOW
  // ========================================================================================
  
  const handleContinue = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    if (nextAction === 'avatar_creation') {
      navigation.navigate('AvatarCreation', {
        userId,
        email,
        userName,
        accessToken,
        isRequired: !hasAvatar,
        skipAllowed: hasAvatar,
      });
    } else {
      navigation.navigate('Home', {
        userId,
        avatarUrl: avatarUrl || '',
        isNewUser,
        accessToken,
        userName,
        welcomeMessage: isNewUser ? 'Welcome to IRANVERSE!' : 'Welcome back!',
      });
    }
  }, [navigation, nextAction, userId, email, userName, accessToken, hasAvatar, avatarUrl, isNewUser, isNavigating]);
  
  const handleBackToLogin = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);
  
  // Android back button handling
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleContinue();
      return true;
    });
    
    return () => backHandler.remove();
  }, [handleContinue]);
  
  // ========================================================================================
  // COMPONENT RENDER - REVOLUTIONARY SUCCESS EXPERIENCE
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
            title="Authentication Complete"
            subtitle={`Welcome ${isNewUser ? 'to' : 'back to'} IRANVERSE, ${userName}!`}
            style={{ marginBottom: spacing.xl }}
          />
          
          {/* Success Icon Section */}
          <Animated.View 
            style={[
              styles.iconSection,
              {
                transform: [
                  { scale: successIconAnim },
                  { scale: pulseAnim },
                ],
              }
            ]}
          >
            <View style={[styles.successIcon, { backgroundColor: colors.interactive.surface }]}>
              <Text style={[styles.successIconText, { color: colors.interactive.text.primary }]}>
                ✅
              </Text>
            </View>
          </Animated.View>
          
          {/* Success Message Section */}
          <View style={styles.messageSection}>
            <Text
              variant="h3"
              align="center"
              style={[styles.successTitle, { color: colors.interactive.text.primary }]}
            >
              {isNewUser ? 'Account Created Successfully!' : 'Welcome Back!'}
            </Text>
            
            <Text
              variant="body"
              align="center"
              style={[styles.successText, { color: colors.interactive.text.secondary }]}
            >
              {isNewUser 
                ? 'Your IRANVERSE account has been successfully created and verified.'
                : 'You have successfully signed in to your IRANVERSE account.'
              }
            </Text>
            
            <Text
              variant="bodySmall"
              align="center"
              style={[styles.helperText, { color: colors.interactive.text.secondary }]}
            >
              {nextAction === 'avatar_creation' 
                ? 'Next, create your digital avatar to enter the metaverse.'
                : 'You can now explore the IRANVERSE metaverse experience.'
              }
            </Text>
          </View>
          
          {/* Action Buttons Section */}
          <View style={styles.actionsSection}>
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={handleContinue}
              disabled={isNavigating}
              style={styles.continueButton}
              accessibilityLabel={nextAction === 'avatar_creation' ? 'Continue to avatar creation' : 'Continue to home'}
              testID="continue-button"
            >
              {isNavigating 
                ? 'Loading...'
                : nextAction === 'avatar_creation'
                  ? 'Create Avatar'
                  : 'Enter IRANVERSE'
              }
            </Button>
          </View>
          
          {/* User Info Section */}
          <View style={styles.userInfoSection}>
            <Text
              variant="caption"
              align="center"
              style={[styles.userInfoText, { color: colors.interactive.text.secondary }]}
            >
              Signed in as: {email}
            </Text>
            
            <Button
              variant="ghost"
              size="small"
              fullWidth
              onPress={handleBackToLogin}
              style={styles.signOutButton}
              accessibilityLabel="Sign out and return to login"
              testID="sign-out-button"
            >
              Sign Out
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
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 133, 0.3)',
    shadowColor: '#00FF85',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successIconText: {
    fontSize: 48,
    lineHeight: 56,
  },
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  successTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  successText: {
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
  continueButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#00FF85',
    shadowColor: '#00FF85',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userInfoSection: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 12,
  },
  userInfoText: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    opacity: 0.7,
  },
  signOutButton: {
    height: 40,
    paddingHorizontal: 16,
  },
});

export default AuthCompleteScreen;