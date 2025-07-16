// src/screens/GrokShowcase.tsx
// IRANVERSE GROK Button Showcase - Premium Dark Aesthetic Demo
// Displays authentic GROK buttons on gradient background

import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import components
import GradientBackground from '../../shared/components/layout/GradientBackground';
import GrokButton from '../../shared/components/ui/GrokButton';
import { H1, H2, H3, Body, Caption } from '../../shared/components/ui/Text';
import SafeArea from '../../shared/components/layout/SafeArea';
import SmartIcon from '../../shared/components/ui/SmartIcon';
import { ThemeProvider, useTheme } from '../../shared/theme/ThemeProvider';
import { GrokDarkCard } from '../../shared/components/ui/Card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========================================================================================
// GROK SHOWCASE CONTENT
// ========================================================================================

const GrokShowcaseContent: React.FC = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const handleButtonPress = useCallback((action: string) => {
    Alert.alert('GROK Button', `${action} pressed`);
  }, []);
  
  const handleLoadingPress = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    Alert.alert('GROK Button', 'Loading complete');
  }, []);
  
  const handleSignUp = useCallback(() => {
    Alert.alert('Sign Up', `Email: ${email}\nPassword: ${password.length} characters\nTerms: ${agreedToTerms ? 'Accepted' : 'Not accepted'}`);
  }, [email, password, agreedToTerms]);
  
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <H1 style={styles.title}>GROK Premium Buttons</H1>
        <Body style={styles.subtitle}>
          Authentic obsidian glass aesthetic with carved depth layers
        </Body>
      </View>
      
      {/* Sign Up Card Section */}
      <View style={styles.section}>
        <GrokDarkCard>
          <View style={styles.signUpCard}>
            <H2 style={styles.signUpTitle}>Create Account</H2>
            <Body style={styles.signUpSubtitle}>
              Join millions in the IRANVERSE metaverse
            </Body>
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <SmartIcon 
                name="mail" 
                size={20} 
                color="rgba(255, 255, 255, 0.5)" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <SmartIcon 
                name="lock" 
                size={20} 
                color="rgba(255, 255, 255, 0.5)" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <GrokButton
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                style={styles.checkbox}
              >
                {agreedToTerms && (
                  <SmartIcon name="check" size={16} color="#EC602A" />
                )}
              </GrokButton>
              <Body style={styles.termsText}>
                I agree to the{' '}
                <Body style={styles.termsLink}>Terms of Service</Body>
                {' '}and{' '}
                <Body style={styles.termsLink}>Privacy Policy</Body>
              </Body>
            </View>
            
            {/* Sign Up Button */}
            <GrokButton
              onPress={handleSignUp}
              fullWidth
              style={styles.signUpButton}
              textStyle={styles.signUpButtonText}
            >
              Create Account
            </GrokButton>
            
            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Caption style={styles.dividerText}>OR</Caption>
              <View style={styles.dividerLine} />
            </View>
            
            {/* OAuth Buttons */}
            <GrokButton
              onPress={() => handleButtonPress('Sign up with Google')}
              fullWidth
              leftIcon={
                <View style={styles.googleIcon}>
                  <SmartIcon name="google" size={20} color="#FFFFFF" />
                </View>
              }
              style={styles.oauthButton}
            >
              Continue with Google
            </GrokButton>
            
            <GrokButton
              onPress={() => handleButtonPress('Sign up with Apple')}
              fullWidth
              leftIcon={
                <SmartIcon name="apple" size={20} color="#FFFFFF" />
              }
              style={styles.oauthButton}
            >
              Continue with Apple
            </GrokButton>
            
            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Body style={styles.signInText}>
                Already have an account?{' '}
              </Body>
              <Body 
                style={styles.signInLink}
                onPress={() => handleButtonPress('Sign In')}
              >
                Sign In
              </Body>
            </View>
          </View>
        </GrokDarkCard>
      </View>
      
      {/* Section 1: Basic GROK Buttons */}
      <View style={styles.section}>
        <H2 style={styles.sectionTitle}>Authentication Buttons</H2>
        
        <GrokButton
          onPress={() => handleButtonPress('Continue with X')}
          fullWidth
          leftIcon={
            <SmartIcon name="twitter" size={20} color="#FFFFFF" />
          }
        >
          Continue with X
        </GrokButton>
        
        <GrokButton
          onPress={() => handleButtonPress('Continue with Google')}
          fullWidth
          leftIcon={
            <View style={styles.googleIcon}>
              <SmartIcon name="google" size={20} color="#FFFFFF" />
            </View>
          }
        >
          Continue with Google
        </GrokButton>
        
        <GrokButton
          onPress={() => handleButtonPress('Continue with Apple')}
          fullWidth
          leftIcon={
            <SmartIcon name="apple" size={20} color="#FFFFFF" />
          }
        >
          Continue with Apple
        </GrokButton>
        
        <GrokButton
          onPress={() => handleButtonPress('Continue with Email')}
          fullWidth
          leftIcon={
            <SmartIcon name="mail" size={20} color="#FFFFFF" />
          }
        >
          Continue with Email
        </GrokButton>
      </View>
      
      {/* Section 2: Action Buttons */}
      <View style={styles.section}>
        <H2 style={styles.sectionTitle}>Action Variants</H2>
        
        <View style={styles.buttonRow}>
          <GrokButton
            onPress={() => handleButtonPress('Primary')}
            style={styles.halfButton}
          >
            Primary
          </GrokButton>
          
          <GrokButton
            onPress={() => handleButtonPress('Secondary')}
            style={styles.halfButton}
            rightIcon={
              <SmartIcon name="arrow-right" size={16} color="#FFFFFF" />
            }
          >
            Next
          </GrokButton>
        </View>
        
        <GrokButton
          onPress={handleLoadingPress}
          fullWidth
          loading={isLoading}
        >
          Loading State
        </GrokButton>
        
        <GrokButton
          onPress={() => {}}
          fullWidth
          disabled
        >
          Disabled State
        </GrokButton>
      </View>
      
      {/* Section 3: Icon Buttons */}
      <View style={styles.section}>
        <H2 style={styles.sectionTitle}>Icon Variations</H2>
        
        <View style={styles.iconButtonGrid}>
          <GrokButton
            onPress={() => handleButtonPress('Settings')}
            style={styles.iconButton}
          >
            <SmartIcon name="settings" size={20} color="#FFFFFF" />
          </GrokButton>
          
          <GrokButton
            onPress={() => handleButtonPress('Notifications')}
            style={styles.iconButton}
          >
            <SmartIcon name="notification" size={20} color="#FFFFFF" />
          </GrokButton>
          
          <GrokButton
            onPress={() => handleButtonPress('Profile')}
            style={styles.iconButton}
          >
            <SmartIcon name="user" size={20} color="#FFFFFF" />
          </GrokButton>
          
          <GrokButton
            onPress={() => handleButtonPress('Search')}
            style={styles.iconButton}
          >
            <SmartIcon name="search" size={20} color="#FFFFFF" />
          </GrokButton>
        </View>
      </View>
      
      {/* Section 4: Premium Actions */}
      <View style={styles.section}>
        <H2 style={styles.sectionTitle}>Premium Actions</H2>
        
        <GrokButton
          onPress={() => handleButtonPress('Get Started')}
          fullWidth
          style={styles.premiumButton}
          textStyle={styles.premiumButtonText}
        >
          Get Started with IRANVERSE
        </GrokButton>
        
        <GrokButton
          onPress={() => handleButtonPress('Upgrade')}
          fullWidth
          leftIcon={
            <SmartIcon name="star" size={20} color="#EC602A" />
          }
          style={styles.upgradeButton}
        >
          Upgrade to Premium
        </GrokButton>
      </View>
      
      {/* Footer Info */}
      <View style={styles.footer}>
        <Caption style={styles.footerText}>
          GROK buttons feature ultra-dark surfaces with carved glass aesthetics
        </Caption>
        <Caption style={styles.footerText}>
          Deep shadows • Subtle borders • Premium feel
        </Caption>
      </View>
    </ScrollView>
  );
};

// ========================================================================================
// MAIN SHOWCASE SCREEN
// ========================================================================================

const GrokShowcase: React.FC = () => {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <GradientBackground
          animated
          depthLayers
          particleField
          luminanceShifts
        >
          <SafeArea edges={['top', 'bottom']}>
            <GrokShowcaseContent />
          </SafeArea>
        </GradientBackground>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

// ========================================================================================
// STYLES
// ========================================================================================

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    maxWidth: 300,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  iconButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: (SCREEN_WIDTH - 40 - 36) / 4, // 4 buttons with gaps
    paddingHorizontal: 0,
  },
  googleIcon: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderRadius: 20,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButton: {
    height: 64,
    backgroundColor: 'rgba(236, 96, 42, 0.1)',
    borderColor: 'rgba(236, 96, 42, 0.2)',
  },
  premiumButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EC602A',
  },
  upgradeButton: {
    backgroundColor: 'rgba(236, 96, 42, 0.05)',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 4,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  // Sign Up Card Styles
  signUpCard: {
    padding: 28,
  },
  signUpTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  signUpSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 12,
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  termsText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  termsLink: {
    color: '#EC602A',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: '#EC602A',
    borderColor: '#EC602A',
    height: 56,
  },
  signUpButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  oauthButton: {
    marginBottom: 12,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signInText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  signInLink: {
    color: '#EC602A',
    fontSize: 14,
    fontWeight: '600',
  },
});

// ========================================================================================
// EXPORTS
// ========================================================================================

export default GrokShowcase;