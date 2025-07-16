// src/components/examples/IconExample.tsx
// IRANVERSE Icon System Example - Demonstrating 2D Black & White Icons
// Shows how to switch between text-based and SVG icons seamlessly

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import Icon from '../../shared/components/ui/Icon';
import SmartIcon, { 
  SmartSearchIcon, 
  SmartBackIcon, 
  SmartCloseIcon, 
  SmartCheckIcon,
  SmartMailIcon,
  SmartPhoneIcon,
  SmartEyeIcon,
  SmartGoogleIcon,
  SmartAppleIcon,
  SmartTwitterIcon
} from '../../shared/components/ui/SmartIcon';
import { ICON_CONFIG } from '../../shared/components/ui/IconConfig';
import { useTheme } from '../../shared/theme/ThemeProvider';

const IconExample: React.FC = () => {
  const theme = useTheme();

  const iconExamples = [
    { name: 'search', component: SmartSearchIcon, description: 'Search functionality' },
    { name: 'arrow-left', component: SmartBackIcon, description: 'Back navigation' },
    { name: 'close', component: SmartCloseIcon, description: 'Close/cancel' },
    { name: 'check', component: SmartCheckIcon, description: 'Success/confirmation' },
    { name: 'mail', component: SmartMailIcon, description: 'Email communication' },
    { name: 'phone', component: SmartPhoneIcon, description: 'Phone contact' },
    { name: 'eye', component: SmartEyeIcon, description: 'Show/hide password' },
  ];

  const authExamples = [
    { name: 'google', component: SmartGoogleIcon, description: 'Google authentication' },
    { name: 'apple', component: SmartAppleIcon, description: 'Apple authentication' },
    { name: 'twitter', component: SmartTwitterIcon, description: 'X/Twitter authentication' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.foundation.darkest }]}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: theme.colors.interactive.text.primary }]}>
          IRANVERSE Icon System
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.interactive.text.secondary }]}>
          2D Black & White Icons - {ICON_CONFIG.USE_2D_ICONS ? 'SVG Mode' : 'Text Mode'}
        </Text>
      </View>

      {/* Size Examples */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.interactive.text.primary }]}>
          Sizes
        </Text>
        <View style={styles.row}>
          <Icon name="search" size="xs" color={theme.colors.interactive.text.primary} />
          <Icon name="search" size="sm" color={theme.colors.interactive.text.primary} />
          <Icon name="search" size="md" color={theme.colors.interactive.text.primary} />
          <Icon name="search" size="lg" color={theme.colors.interactive.text.primary} />
          <Icon name="search" size="xl" color={theme.colors.interactive.text.primary} />
          <Icon name="search" size={48} color={theme.colors.interactive.text.primary} />
        </View>
        <Text style={[styles.label, { color: theme.colors.interactive.text.secondary }]}>
          xs (12px) - sm (16px) - md (20px) - lg (24px) - xl (32px) - custom (48px)
        </Text>
      </View>

      {/* Interface Icons */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.interactive.text.primary }]}>
          Interface Icons
        </Text>
        <View style={styles.iconGrid}>
          {iconExamples.map(({ name, component: IconComponent, description }) => (
            <View key={name} style={styles.iconItem}>
              <IconComponent size="lg" color={theme.colors.interactive.text.primary} />
              <Text style={[styles.iconLabel, { color: theme.colors.interactive.text.secondary }]}>
                {description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Authentication Icons */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.interactive.text.primary }]}>
          Authentication Icons
        </Text>
        <View style={styles.iconGrid}>
          {authExamples.map(({ name, component: IconComponent, description }) => (
            <View key={name} style={styles.iconItem}>
              <IconComponent size="lg" />
              <Text style={[styles.iconLabel, { color: theme.colors.interactive.text.secondary }]}>
                {description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Direct Icon Usage */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.interactive.text.primary }]}>
          Direct Icon Usage
        </Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconItem}>
            <Icon name="home" size="lg" color={theme.colors.interactive.text.primary} />
            <Text style={[styles.iconLabel, { color: theme.colors.interactive.text.secondary }]}>
              Home
            </Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="settings" size="lg" color={theme.colors.interactive.text.primary} />
            <Text style={[styles.iconLabel, { color: theme.colors.interactive.text.secondary }]}>
              Settings
            </Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="user" size="lg" color={theme.colors.interactive.text.primary} />
            <Text style={[styles.iconLabel, { color: theme.colors.interactive.text.secondary }]}>
              Profile
            </Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="notification" size="lg" color={theme.colors.interactive.text.primary} />
            <Text style={[styles.iconLabel, { color: theme.colors.interactive.text.secondary }]}>
              Notifications
            </Text>
          </View>
        </View>
      </View>

      {/* Color Examples */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.interactive.text.primary }]}>
          Color Variants
        </Text>
        <View style={styles.row}>
          <Icon name="heart" size="lg" color="#000000" />
          <Icon name="heart" size="lg" color="#FFFFFF" />
          <Icon name="heart" size="lg" color="#EC602A" />
          <Icon name="heart" size="lg" color="#4285F4" />
          <Icon name="heart" size="lg" color="#FF0000" />
        </View>
        <Text style={[styles.label, { color: theme.colors.interactive.text.secondary }]}>
          Black - White - Brand Orange - Google Blue - Red
        </Text>
      </View>

      {/* Smart Icon Migration */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.interactive.text.primary }]}>
          Smart Icon Migration
        </Text>
        <View style={styles.row}>
          <SmartIcon migrationKey="🔍" size="lg" />
          <SmartIcon migrationKey="←" size="lg" />
          <SmartIcon migrationKey="✓" size="lg" />
          <SmartIcon migrationKey="✕" size="lg" />
          <SmartIcon migrationKey="📧" size="lg" />
        </View>
        <Text style={[styles.label, { color: theme.colors.interactive.text.secondary }]}>
          Automatic migration from text-based icons
        </Text>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconItem: {
    alignItems: 'center',
    width: 80,
    marginBottom: 16,
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default IconExample;