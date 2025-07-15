// src/components/ui/KeyboardAvoidingView.tsx
// IRANVERSE Enterprise KeyboardAvoidingView - Revolutionary Form Experience
// Tesla-inspired keyboard handling with Agent Identity Flow
// Built for 90M users - Seamless Input Experience & Accessibility
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  ViewStyle,
  Dimensions,
  EmitterSubscription,
  Easing,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// ========================================================================================
// KEYBOARD TYPES & INTERFACES - ENTERPRISE FORM SYSTEM
// ========================================================================================

export type KeyboardBehavior = 'height' | 'position' | 'padding';

export interface KeyboardAvoidingViewProps {
  // Core Props
  children: React.ReactNode;
  
  // Keyboard Behavior
  behavior?: KeyboardBehavior;
  enabled?: boolean;
  
  // Layout Configuration
  keyboardVerticalOffset?: number;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  
  // Animation
  animationDuration?: number;
  animationEasing?: string;
  
  // Advanced Features
  resetScrollOnKeyboardHide?: boolean;
  extraScrollHeight?: number;
  enableOnAndroid?: boolean;
  
  // Callbacks
  onKeyboardShow?: (keyboardHeight: number) => void;
  onKeyboardHide?: () => void;
  onKeyboardToggle?: (isVisible: boolean, keyboardHeight: number) => void;
  
  // Accessibility
  testID?: string;
}

// ========================================================================================
// KEYBOARD STATE MANAGEMENT - ENTERPRISE PRECISION
// ========================================================================================

interface KeyboardState {
  isVisible: boolean;
  height: number;
  duration: number;
  easing: string;
}

const useKeyboardState = () => {
  const [keyboardState, setKeyboardState] = React.useState<KeyboardState>({
    isVisible: false,
    height: 0,
    duration: 250,
    easing: 'easeInEaseOut',
  });
  
  useEffect(() => {
    let keyboardShowListener: EmitterSubscription;
    let keyboardHideListener: EmitterSubscription;
    
    if (Platform.OS === 'ios') {
      keyboardShowListener = Keyboard.addListener('keyboardWillShow', (event) => {
        setKeyboardState({
          isVisible: true,
          height: event.endCoordinates.height,
          duration: event.duration || 250,
          easing: event.easing || 'easeInEaseOut',
        });
      });
      
      keyboardHideListener = Keyboard.addListener('keyboardWillHide', (event) => {
        setKeyboardState({
          isVisible: false,
          height: 0,
          duration: event.duration || 250,
          easing: event.easing || 'easeInEaseOut',
        });
      });
    } else {
      keyboardShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
        setKeyboardState({
          isVisible: true,
          height: event.endCoordinates.height,
          duration: 250,
          easing: 'easeInEaseOut',
        });
      });
      
      keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardState({
          isVisible: false,
          height: 0,
          duration: 250,
          easing: 'easeInEaseOut',
        });
      });
    }
    
    return () => {
      keyboardShowListener?.remove?.();
      keyboardHideListener?.remove?.();
    };
  }, []);
  
  return keyboardState;
};

// ========================================================================================
// KEYBOARD AVOIDING IMPLEMENTATION - REVOLUTIONARY UX
// ========================================================================================

export const KeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> = ({
  children,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  enabled = true,
  keyboardVerticalOffset = 0,
  contentContainerStyle,
  style,
  animationDuration,
  animationEasing,
  // resetScrollOnKeyboardHide = true,
  extraScrollHeight = 20,
  enableOnAndroid = true,
  onKeyboardShow,
  onKeyboardHide,
  onKeyboardToggle,
  testID,
}) => {
  
  // Theme System
  const theme = useTheme();
  const animations = theme.animations;
  const spacing = theme.spacing;
  
  // Keyboard State
  const keyboardState = useKeyboardState();
  
  // Animation Values with cleanup
  const keyboardHeightAnim = useRef(new Animated.Value(0)).current;
  const contentOffsetAnim = useRef(new Animated.Value(0)).current;
  
  // Cleanup animations
  useEffect(() => {
    return () => {
      keyboardHeightAnim.stopAnimation();
      contentOffsetAnim.stopAnimation();
      keyboardHeightAnim.removeAllListeners();
      contentOffsetAnim.removeAllListeners();
    };
  }, [keyboardHeightAnim, contentOffsetAnim]);
  
  // Screen Dimensions
  Dimensions.get('window');
  
  // ========================================================================================
  // KEYBOARD ANIMATION SYSTEM - TESLA-INSPIRED SMOOTHNESS
  // ========================================================================================
  
  const animateKeyboard = useCallback((
    toHeight: number,
    duration: number = animationDuration || animations.duration.medium,
    easingName: string = animationEasing || animations.easing.smooth
  ) => {
    // Convert easing string to Easing function
    const getEasingFunction = (easing: string) => {
      switch (easing) {
        case 'easeIn':
          return Easing.in(Easing.ease);
        case 'easeOut':
          return Easing.out(Easing.ease);
        case 'easeInOut':
        case 'easeInEaseOut':
          return Easing.inOut(Easing.ease);
        case 'linear':
          return Easing.linear;
        default:
          return Easing.inOut(Easing.ease);
      }
    };
    
    Animated.parallel([
      Animated.timing(keyboardHeightAnim, {
        toValue: toHeight,
        duration,
        easing: getEasingFunction(easingName),
        useNativeDriver: false,
      }),
      Animated.timing(contentOffsetAnim, {
        toValue: toHeight > 0 ? extraScrollHeight : 0,
        duration,
        easing: getEasingFunction(easingName),
        useNativeDriver: false,
      }),
    ]).start();
  }, [
    keyboardHeightAnim,
    contentOffsetAnim,
    extraScrollHeight,
    animationDuration,
    animationEasing,
    animations,
  ]);
  
  // ========================================================================================
  // KEYBOARD EVENT HANDLING - ENTERPRISE RESPONSIVENESS
  // ========================================================================================
  
  useEffect(() => {
    const { isVisible, height, duration, easing } = keyboardState;
    
    // Animate keyboard appearance/disappearance
    animateKeyboard(isVisible ? height : 0, duration, easing);
    
    // Trigger callbacks
    if (isVisible) {
      onKeyboardShow?.(height);
    } else {
      onKeyboardHide?.();
    }
    
    onKeyboardToggle?.(isVisible, height);
  }, [keyboardState, animateKeyboard, onKeyboardShow, onKeyboardHide, onKeyboardToggle]);
  
  // ========================================================================================
  // PLATFORM-SPECIFIC BEHAVIOR - UNIVERSAL COMPATIBILITY
  // ========================================================================================
  
  const shouldUseNativeKeyboardAvoidingView = useMemo(() => {
    return Platform.OS === 'ios' || (Platform.OS === 'android' && enableOnAndroid);
  }, [enableOnAndroid]);
  
  const nativeBehavior = useMemo(() => {
    if (Platform.OS === 'ios') {
      return behavior;
    } else if (Platform.OS === 'android') {
      // Android-specific behavior optimization
      return 'height';
    }
    return 'padding';
  }, [behavior]);
  
  // ========================================================================================
  // STYLE COMPUTATION - RESPONSIVE LAYOUT
  // ========================================================================================
  
  const containerStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      flex: 1,
    };
    
    return baseStyle;
  }, []);
  
  const contentStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      flex: 1,
    };
    
    return baseStyle;
  }, []);
  
  const animatedContentStyle = useMemo(() => {
    return {
      transform: [{
        translateY: contentOffsetAnim.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -extraScrollHeight],
          extrapolate: 'clamp',
        }),
      }],
    };
  }, [contentOffsetAnim, extraScrollHeight]);
  
  // ========================================================================================
  // RENDER LOGIC - PLATFORM OPTIMIZATION
  // ========================================================================================
  
  if (!enabled) {
    return (
      <View style={[containerStyle, style]} testID={testID}>
        {children}
      </View>
    );
  }
  
  // Web Platform - Custom Implementation
  if (Platform.OS === 'web') {
    return (
      <View style={[containerStyle, style]} testID={testID}>
        <Animated.View
          style={[
            contentStyle,
            contentContainerStyle,
            animatedContentStyle,
            {
              paddingBottom: keyboardHeightAnim.interpolate({
                inputRange: [0, 400],
                outputRange: [0, keyboardVerticalOffset + spacing.lg],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    );
  }
  
  // Native Platforms - Enhanced RN KeyboardAvoidingView
  if (shouldUseNativeKeyboardAvoidingView) {
    return (
      <RNKeyboardAvoidingView
        style={[containerStyle, style]}
        behavior={nativeBehavior}
        enabled={enabled}
        keyboardVerticalOffset={keyboardVerticalOffset}
        testID={testID}
      >
        <Animated.View
          style={[
            contentStyle,
            contentContainerStyle,
            animatedContentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </RNKeyboardAvoidingView>
    );
  }
  
  // Fallback - Manual Implementation
  return (
    <View style={[containerStyle, style]} testID={testID}>
      <Animated.View
        style={[
          contentStyle,
          contentContainerStyle,
          animatedContentStyle,
          {
            marginBottom: keyboardHeightAnim.interpolate({
              inputRange: [0, 400],
              outputRange: [0, keyboardVerticalOffset],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

// ========================================================================================
// UTILITY HOOKS - KEYBOARD STATE ACCESS
// ========================================================================================

export const useKeyboard = () => {
  const keyboardState = useKeyboardState();
  
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);
  
  return {
    ...keyboardState,
    dismiss: dismissKeyboard,
  };
};

export const useKeyboardHeight = () => {
  const keyboardState = useKeyboardState();
  return keyboardState.height;
};

export const useIsKeyboardVisible = () => {
  const keyboardState = useKeyboardState();
  return keyboardState.isVisible;
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const KeyboardAvoidingViewPosition: React.FC<Omit<KeyboardAvoidingViewProps, 'behavior'>> = (props) => (
  <KeyboardAvoidingView {...props} behavior="position" />
);

export const KeyboardAvoidingViewHeight: React.FC<Omit<KeyboardAvoidingViewProps, 'behavior'>> = (props) => (
  <KeyboardAvoidingView {...props} behavior="height" />
);

export const KeyboardAvoidingViewPadding: React.FC<Omit<KeyboardAvoidingViewProps, 'behavior'>> = (props) => (
  <KeyboardAvoidingView {...props} behavior="padding" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default KeyboardAvoidingView;
