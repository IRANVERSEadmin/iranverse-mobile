// src/components/test/IconTest.tsx
// Quick test component to verify 2D icons are working

import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../ui/Text';
import SmartIcon, { 
  SmartSearchIcon, 
  SmartBackIcon, 
  SmartCloseIcon, 
  SmartCheckIcon,
  SmartMailIcon,
  SmartPhoneIcon,
  SmartEyeIcon 
} from '../ui/SmartIcon';
import { useTheme } from '../ui/theme/ThemeProvider';

const IconTest: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={{ padding: 20, backgroundColor: theme.colors.foundation.darkest }}>
      <Text style={{ color: theme.colors.interactive.text.primary, fontSize: 18, marginBottom: 20 }}>
        Icon Test - Should show 2D SVG icons, not emoji
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <SmartSearchIcon size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>Search</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartBackIcon size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>Back</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartCloseIcon size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>Close</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartCheckIcon size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>Check</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartMailIcon size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>Email</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartPhoneIcon size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>Phone</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartEyeIcon size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>Eye</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartIcon name="settings" size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>Settings</Text>
        </View>
      </View>
      
      <Text style={{ color: theme.colors.interactive.text.primary, fontSize: 16, marginTop: 30, marginBottom: 10 }}>
        Migration Test (using emoji keys):
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <SmartIcon migrationKey="🔍" size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>🔍 → search</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartIcon migrationKey="←" size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>← → arrow-left</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartIcon migrationKey="✓" size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>✓ → check</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <SmartIcon migrationKey="✕" size={24} />
          <Text style={{ color: theme.colors.interactive.text.secondary, fontSize: 12 }}>✕ → close</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default IconTest;