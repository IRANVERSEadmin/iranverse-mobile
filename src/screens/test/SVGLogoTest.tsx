// Test screen for SVG Logo components
import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import IranverseLogo from '../../shared/components/ui/IranverseLogo';
import AnimatedIranverseLogo from '../../shared/components/ui/AnimatedIranverseLogo';

const SVGLogoTest: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Static Logo - Brand</Text>
        <IranverseLogo size={120} variant="brand" />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>Static Logo - White</Text>
        <View style={styles.darkBg}>
          <IranverseLogo size={120} variant="white" />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>Static Logo - Black</Text>
        <IranverseLogo size={120} variant="black" />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>Animated Logo - Entrance</Text>
        <AnimatedIranverseLogo
          size={120}
          variant="brand"
          animationMode="entrance"
          autoStart={true}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>Animated Logo - Pulse</Text>
        <AnimatedIranverseLogo
          size={120}
          variant="brand"
          animationMode="pulse"
          autoStart={true}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>Animated Logo - Glow</Text>
        <AnimatedIranverseLogo
          size={120}
          variant="brand"
          animationMode="glow"
          autoStart={true}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  darkBg: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 10,
  },
});

export default SVGLogoTest;