// src/screens/ButtonTest.tsx
// Quick test screen to verify button appearance
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GradientBackground from '../components/ui/GradientBackground';
import SafeArea from '../components/ui/SafeArea';
import { Button, GrokAuthButton } from '../components/ui/Button';
import { H1, Body } from '../components/ui/Text';
import SmartIcon from '../components/ui/SmartIcon';

const ButtonTest: React.FC = () => {
  return (
    <SafeAreaProvider>
      <GradientBackground>
        <SafeArea edges={['top', 'bottom']}>
          <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <H1 style={styles.title}>Button Test</H1>
            
            <Body style={styles.sectionTitle}>GROK Auth Buttons</Body>
            
            <GrokAuthButton 
              provider="x"
              onPress={() => {}}
              fullWidth
              style={styles.button}
              providerIcon={<SmartIcon name="x" size={20} color="#FFFFFF" />}
            >
              Continue with X
            </GrokAuthButton>
            
            <GrokAuthButton 
              provider="google"
              onPress={() => {}}
              fullWidth
              style={styles.button}
              providerIcon={<SmartIcon text="G" size={20} color="#FFFFFF" />}
            >
              Continue with Google
            </GrokAuthButton>
            
            <GrokAuthButton 
              provider="apple"
              onPress={() => {}}
              fullWidth
              style={styles.button}
              providerIcon={<SmartIcon text="🍎" size={20} color="#FFFFFF" />}
            >
              Continue with Apple
            </GrokAuthButton>
            
            <Button
              variant="grok-auth"
              onPress={() => {}}
              fullWidth
              style={styles.button}
            >
              Continue with Email
            </Button>
            
            <Body style={styles.sectionTitle}>Other Variants</Body>
            
            <Button
              variant="primary"
              onPress={() => {}}
              fullWidth
              style={styles.button}
            >
              Primary Button
            </Button>
            
            <Button
              variant="secondary"
              onPress={() => {}}
              fullWidth
              style={styles.button}
            >
              Secondary Button
            </Button>
            
            <Button
              variant="ghost"
              onPress={() => {}}
              fullWidth
              style={styles.button}
            >
              Ghost Button
            </Button>
          </ScrollView>
        </SafeArea>
      </GradientBackground>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 20,
    marginBottom: 15,
  },
  button: {
    marginBottom: 12,
  },
});

export default ButtonTest;