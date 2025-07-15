// src/screens/TestScreen.tsx
// Simple test screen to diagnose white screen issue

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>IRANVERSE Test Screen</Text>
      <Text style={styles.subtitle}>If you see this, the app is working!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#EC602A',
    textAlign: 'center',
  },
});

export default TestScreen;