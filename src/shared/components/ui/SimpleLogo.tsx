import React, { useMemo } from 'react';
import {
  Image,
  ImageStyle,
  View,
  ViewStyle,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';

const LOGO_ASSETS = {
  black: require('../../../../assets/logo/iranverse-logo-black.png'),
  white: require('../../../../assets/logo/iranverse-logo-white.png'),
  gray: require('../../../../assets/logo/iranverse-logo-gray.png'),
} as const;

const LOGO_SIZES = {
  small: 40,
  medium: 56,
  large: 72,
} as const;

const ASPECT_RATIO = 1.2;

export type SimpleLogoVariant = 'black' | 'white' | 'gray' | 'auto';
export type SimpleLogoSize = keyof typeof LOGO_SIZES | number;

export interface SimpleLogoProps {
  variant?: SimpleLogoVariant;
  size?: SimpleLogoSize;
  width?: number;
  height?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
  onPress?: () => void;
}

const SimpleLogo: React.FC<SimpleLogoProps> = ({
  variant = 'auto',
  size = 'medium',
  width,
  height,
  style,
  containerStyle,
  accessibilityLabel = 'IRANVERSE Logo',
  testID = 'simple-logo',
  onPress,
}) => {
  const colorScheme = useColorScheme();

  const resolvedVariant = useMemo(() => {
    if (variant === 'auto') {
      return colorScheme === 'dark' ? 'white' : 'black';
    }
    return variant;
  }, [variant, colorScheme]);

  const dimensions = useMemo(() => {
    if (width && height) {
      return { width, height };
    }
    if (width) {
      return { width, height: Math.round(width / ASPECT_RATIO) };
    }
    if (height) {
      return { width: Math.round(height * ASPECT_RATIO), height };
    }
    
    const baseSize = typeof size === 'number' ? size : LOGO_SIZES[size];
    return {
      width: baseSize,
      height: Math.round(baseSize / ASPECT_RATIO),
    };
  }, [size, width, height]);

  const logoSource = LOGO_ASSETS[resolvedVariant];

  const imageStyle: ImageStyle = useMemo(() => ({
    width: dimensions.width,
    height: dimensions.height,
    ...style,
  }), [dimensions, style]);

  const containerStyles: ViewStyle = useMemo(() => ({
    alignItems: 'center',
    justifyContent: 'center',
    ...containerStyle,
  }), [containerStyle]);

  const LogoComponent = (
    <View style={containerStyles}>
      <Image
        source={logoSource}
        style={imageStyle}
        resizeMode="contain"
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        testID={testID}
      />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={containerStyles}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} button`}
        testID={`${testID}-button`}
      >
        <Image
          source={logoSource}
          style={imageStyle}
          resizeMode="contain"
          accessibilityLabel={accessibilityLabel}
        />
      </TouchableOpacity>
    );
  }

  return LogoComponent;
};

export default SimpleLogo;