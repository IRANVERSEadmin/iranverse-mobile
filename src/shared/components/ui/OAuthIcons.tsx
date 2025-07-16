// src/shared/components/ui/OAuthIcons.tsx
// OAuth provider icons for authentication buttons

import React from 'react';
import { View, Text } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export const GoogleIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <View style={{ width: size, height: size, marginRight: 4 }}>
    <Text style={{ fontSize: size, color }}>G</Text>
  </View>
);

export const AppleIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <View style={{ width: size, height: size, marginRight: 4 }}>
    <Text style={{ fontSize: size, color }}></Text>
  </View>
);

export const TwitterIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <View style={{ width: size, height: size, marginRight: 4 }}>
    <Text style={{ fontSize: size, color }}>𝕏</Text>
  </View>
);

export const EmailIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <View style={{ width: size, height: size, marginRight: 4 }}>
    <Text style={{ fontSize: size * 0.8, color }}>@</Text>
  </View>
);