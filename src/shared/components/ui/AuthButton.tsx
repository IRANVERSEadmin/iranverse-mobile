// src/shared/components/ui/AuthButton.tsx
// IRANVERSE Authentication Button - Grok Design System
// Sleek, minimalist buttons matching X/Twitter aesthetic
// Built for authentication flows with premium feel

import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

// Button variants matching the reference design
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

interface AuthButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  testID,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: 52,
      borderRadius: 26,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      opacity: disabled ? 0.5 : 1,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          height: 40,
        };
      default:
        return baseStyle;
    }
  };
  
  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: '#000000',
        };
      case 'secondary':
      case 'outline':
      case 'text':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      default:
        return baseStyle;
    }
  };
  
  const buttonStyle = StyleSheet.flatten([
    getButtonStyles(),
    fullWidth && styles.fullWidth,
    style,
  ]);
  
  const textStyles = StyleSheet.flatten([
    getTextStyles(),
    textStyle,
  ]);
  
  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={buttonStyle}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#000000' : '#FFFFFF'}
          />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={textStyles}>{children}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  icon: {
    marginRight: 8,
  },
});

export default AuthButton;