import { TouchableOpacity } from 'react-native';
// src/components/ui/Input.tsx
// IRANVERSE Enterprise Input - Agent Identity Data Collection
// Tesla-inspired precision with Persian Excellence
// Built for 90M users - Real-time Validation & Accessibility
import React, { useRef, useState, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { useTheme, useColors, useTypography, useSpacing, useRadius, useShadows, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// INPUT TYPES & INTERFACES - ENTERPRISE FORM SYSTEM
// ========================================================================================

export type InputVariant = 'default' | 'filled' | 'glass';
export type InputState = 'default' | 'focused' | 'error' | 'success' | 'disabled';
export type InputSize = 'small' | 'medium' | 'large';

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
}

export interface InputProps extends Omit<TextInputProps, 'style' | 'onFocus' | 'onBlur' | 'autoComplete' | 'textContentType'> {
  // Core Props
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  
  // Design Variants
  variant?: InputVariant;
  size?: InputSize;
  
  // States & Validation
  state?: InputState;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  
  // Labels & Help
  label?: string;
  placeholder?: string;
  helperText?: string;
  
  // Icons & Actions
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  
  // Styling
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  persianDigits?: boolean;
  
  // Real-time Features
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  
  // Advanced Features
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  characterCount?: boolean;
  
  // Security
  secureTextEntry?: boolean;
  autoComplete?: 'off' | 'email' | 'name' | 'username' | 'password' | 'new-password' | 'current-password' | 'tel' | 'street-address' | 'postal-code' | 'cc-number' | 'cc-exp' | 'cc-csc';
  textContentType?: 'none' | 'emailAddress' | 'password' | 'newPassword' | 'username' | 'name' | 'givenName' | 'familyName' | 'telephoneNumber' | 'streetAddressLine1' | 'streetAddressLine2' | 'postalCode' | 'creditCardNumber';
}

// ========================================================================================
// INPUT IMPLEMENTATION - REVOLUTIONARY DATA COLLECTION
// ========================================================================================

export const Input = forwardRef<InputRef, InputProps>(({
  value = '',
  onChangeText,
  onFocus,
  onBlur,
  variant = 'default',
  size = 'medium',
  state = 'default',
  error,
  success,
  disabled = false,
  required = false,
  label,
  placeholder,
  helperText,
  leftIcon,
  rightIcon,
  clearable = false,
  containerStyle,
  inputStyle,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
  rtl = false,
  persianText = false,
  persianDigits = false,
  debounceMs = 300,
  validateOnChange = false,
  validateOnBlur = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  characterCount = false,
  secureTextEntry = false,
  autoComplete,
  textContentType,
  ...textInputProps
}, ref) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const radius = useRadius();
  const shadows = useShadows();
  const animations = useAnimations();
  
  // Internal State
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [hasContent, setHasContent] = useState(!!value);
  
  // Refs
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Animation Values with cleanup
  const focusAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  
  // Cleanup animations and timers
  useEffect(() => {
    return () => {
      // Clear debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      
      // Cleanup animations
      focusAnim.stopAnimation();
      labelAnim.stopAnimation();
      borderAnim.stopAnimation();
      errorAnim.stopAnimation();
      focusAnim.removeAllListeners();
      labelAnim.removeAllListeners();
      borderAnim.removeAllListeners();
      errorAnim.removeAllListeners();
    };
  }, [focusAnim, labelAnim, borderAnim, errorAnim]);
  
  // Determine input state
  const currentState = disabled ? 'disabled' : 
                      error ? 'error' : 
                      success ? 'success' : 
                      isFocused ? 'focused' : 'default';
  
  // ========================================================================================
  // STYLE COMPUTATION - ENTERPRISE DESIGN SYSTEM
  // ========================================================================================
  
  const containerStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      width: '100%',
    };
    
    return baseStyle;
  }, []);
  
  const inputContainerStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      borderRadius: radius.input,
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      position: 'relative',
      overflow: 'hidden',
    };
    
    // Size-based styles
    const sizeStyles: Record<InputSize, ViewStyle> = {
      small: {
        height: multiline ? undefined : spacing.input.height * 0.8,
        paddingHorizontal: spacing.input.paddingHorizontal * 0.8,
        paddingVertical: multiline ? spacing.input.paddingVertical * 0.8 : 0,
      },
      medium: {
        height: multiline ? undefined : spacing.input.height,
        paddingHorizontal: spacing.input.paddingHorizontal,
        paddingVertical: multiline ? spacing.input.paddingVertical : 0,
      },
      large: {
        height: multiline ? undefined : spacing.input.height * 1.2,
        paddingHorizontal: spacing.input.paddingHorizontal * 1.2,
        paddingVertical: multiline ? spacing.input.paddingVertical * 1.2 : 0,
      },
    };
    
    // Variant-based styles
    const variantStyles: Record<InputVariant, ViewStyle> = {
      default: {
        backgroundColor: colors.interactive.surface,
        borderWidth: 1,
        borderColor: currentState === 'focused' ? colors.interactive.borderFocus :
                     currentState === 'error' ? colors.semantic.error :
                     currentState === 'success' ? colors.semantic.success :
                     colors.interactive.border,
      },
      filled: {
        backgroundColor: colors.interactive.backgroundSecondary,
        borderWidth: 0,
      },
      glass: {
        ...theme.utils.getGlassStyle(0.08),
        borderColor: currentState === 'focused' ? colors.interactive.borderFocus :
                     currentState === 'error' ? colors.semantic.error :
                     currentState === 'success' ? colors.semantic.success :
                     colors.glass.border,
      },
    };
    
    // Multiline adjustments
    const multilineStyle: ViewStyle = multiline ? {
      minHeight: numberOfLines ? numberOfLines * 24 : 80,
      alignItems: 'flex-start',
      paddingTop: spacing.input.paddingVertical,
    } : {};
    
    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...multilineStyle,
    };
  }, [variant, size, currentState, multiline, numberOfLines, rtl, colors, spacing, radius, theme]);
  
  const textInputStyles = useMemo(() => {
    const baseStyle: TextStyle = {
      flex: 1,
      ...typography.scale.input,
      fontFamily: persianText ? typography.families.persian : typography.families.primary,
      color: currentState === 'disabled' ? colors.interactive.textDisabled : colors.interactive.text,
      textAlign: rtl ? 'right' : 'left',
      minHeight: multiline ? numberOfLines ? numberOfLines * 24 : 80 : undefined,
    };
    
    // Size-based text styles
    const sizeTextStyles: Record<InputSize, TextStyle> = {
      small: {
        fontSize: typography.scale.bodySmall.fontSize,
        lineHeight: typography.scale.bodySmall.lineHeight,
      },
      medium: {
        fontSize: typography.scale.input.fontSize,
        lineHeight: typography.scale.input.lineHeight,
      },
      large: {
        fontSize: typography.scale.body.fontSize,
        lineHeight: typography.scale.body.lineHeight,
      },
    };
    
    // RTL text styles
    const rtlStyle: TextStyle = rtl ? {
      ...typography.rtl.persian,
      writingDirection: 'rtl',
    } : {};
    
    return {
      ...baseStyle,
      ...sizeTextStyles[size],
      ...rtlStyle,
    };
  }, [size, currentState, rtl, persianText, multiline, numberOfLines, colors, typography]);
  
  const labelStyles = useMemo(() => {
    const baseStyle: TextStyle = {
      ...typography.scale.bodySmall,
      fontFamily: persianText ? typography.families.persian : typography.families.primary,
      color: currentState === 'focused' ? colors.interactive.text :
             currentState === 'error' ? colors.semantic.error :
             currentState === 'success' ? colors.semantic.success :
             colors.interactive.textSecondary,
      marginBottom: spacing.xs,
      textAlign: rtl ? 'right' : 'left',
    };
    
    return baseStyle;
  }, [currentState, rtl, persianText, colors, typography, spacing]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - REAL-TIME VALIDATION
  // ========================================================================================
  
  const handleChangeText = useCallback((text: string) => {
    let processedText = text;
    
    // Persian digits conversion
    if (persianDigits) {
      const persianNumbers = '??????????';
      const englishNumbers = '0123456789';
      processedText = text.replace(/[?-?]/g, (match) => 
        englishNumbers[persianNumbers.indexOf(match)]
      );
    }
    
    // Update internal state
    setInternalValue(processedText);
    setHasContent(!!processedText);
    
    // Animate label
    Animated.timing(labelAnim, {
      toValue: processedText || isFocused ? 1 : 0,
      duration: animations.input.focusDuration,
      useNativeDriver: false,
    }).start();
    
    // Debounced callback with proper cleanup
    if (onChangeText) {
      if (debounceMs > 0) {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
          onChangeText(processedText);
          debounceTimer.current = null;
        }, debounceMs);
      } else {
        onChangeText(processedText);
      }
    }
  }, [isFocused, persianDigits, debounceMs, onChangeText, animations, labelAnim]);
  
  const handleFocus = useCallback((event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    
    // Focus animations
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: animations.input.focusDuration,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: animations.input.borderDuration,
        useNativeDriver: false,
      }),
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: animations.input.focusDuration,
        useNativeDriver: false,
      }),
    ]).start();
    
    onFocus?.(event);
  }, [animations, focusAnim, borderAnim, labelAnim, onFocus]);
  
  const handleBlur = useCallback((event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    
    // Blur animations
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: animations.input.focusDuration,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: animations.input.borderDuration,
        useNativeDriver: false,
      }),
      Animated.timing(labelAnim, {
        toValue: hasContent ? 1 : 0,
        duration: animations.input.focusDuration,
        useNativeDriver: false,
      }),
    ]).start();
    
    onBlur?.(event);
  }, [hasContent, animations, focusAnim, borderAnim, labelAnim, onBlur]);
  
  const handleClear = useCallback(() => {
    setInternalValue('');
    setHasContent(false);
    
    Animated.timing(labelAnim, {
      toValue: isFocused ? 1 : 0,
      duration: animations.input.focusDuration,
      useNativeDriver: false,
    }).start();
    
    onChangeText?.('');
    inputRef.current?.focus();
  }, [isFocused, onChangeText, animations, labelAnim]);
  
  // ========================================================================================
  // IMPERATIVE METHODS - REF INTERFACE
  // ========================================================================================
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: handleClear,
    getValue: () => internalValue,
    setValue: (newValue: string) => {
      setInternalValue(newValue);
      setHasContent(!!newValue);
      Animated.timing(labelAnim, {
        toValue: newValue || isFocused ? 1 : 0,
        duration: animations.input.focusDuration,
        useNativeDriver: false,
      }).start();
    },
  }), [internalValue, isFocused, handleClear, animations, labelAnim]);
  
  // ========================================================================================
  // EFFECTS - EXTERNAL VALUE SYNC
  // ========================================================================================
  
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      setHasContent(!!value);
    }
  }, [value, internalValue]);
  
  useEffect(() => {
    if (error) {
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: animations.duration.fast,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: animations.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  }, [error, animations, errorAnim]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: spacing.xs }}>
        <Text style={[labelStyles, labelStyle]}>
          {label}
        </Text>
        {required && (
          <Text style={{ color: colors.semantic.error, marginLeft: rtl ? 0 : spacing.xs / 2, marginRight: rtl ? spacing.xs / 2 : 0 }}>
            *
          </Text>
        )}
      </View>
    );
  };
  
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    
    return (
      <View style={{ 
        marginRight: rtl ? 0 : spacing.sm, 
        marginLeft: rtl ? spacing.sm : 0,
        width: iconSize,
        height: iconSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {leftIcon}
      </View>
    );
  };
  
  const renderRightIcon = () => {
    const icons = [];
    
    // Clear button
    if (clearable && hasContent && !disabled) {
      icons.push(
        <TouchableOpacity
          key="clear"
          onPress={handleClear}
          style={{ 
            padding: spacing.xs,
            marginLeft: rtl ? 0 : spacing.xs,
            marginRight: rtl ? spacing.xs : 0,
          }}
          accessibilityLabel="Clear input"
          accessibilityRole="button"
        >
          <Text style={{ color: colors.interactive.textSecondary, fontSize: 16 }}>�</Text>
        </TouchableOpacity>
      );
    }
    
    // Custom right icon
    if (rightIcon) {
      const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
      
      icons.push(
        <View key="icon" style={{ 
          marginLeft: rtl ? 0 : spacing.sm, 
          marginRight: rtl ? spacing.sm : 0,
          width: iconSize,
          height: iconSize,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {rightIcon}
        </View>
      );
    }
    
    return icons.length > 0 ? (
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
        {icons}
      </View>
    ) : null;
  };
  
  const renderHelperText = () => {
    const text = error || success || helperText;
    if (!text) return null;
    
    const color = error ? colors.semantic.error :
                  success ? colors.semantic.success :
                  colors.interactive.textSecondary;
    
    return (
      <Animated.View
        style={{
          opacity: errorAnim,
          transform: [{
            translateY: errorAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0],
            }),
          }],
          marginTop: spacing.xs,
        }}
      >
        <Text style={{
          ...typography.scale.caption,
          color,
          textAlign: rtl ? 'right' : 'left',
        }}>
          {text}
        </Text>
      </Animated.View>
    );
  };
  
  const renderCharacterCount = () => {
    if (!characterCount || !maxLength) return null;
    
    const count = internalValue.length;
    const isNearLimit = count > maxLength * 0.8;
    const isOverLimit = count > maxLength;
    
    return (
      <Text style={{
        ...typography.scale.caption,
        color: isOverLimit ? colors.semantic.error :
               isNearLimit ? colors.semantic.warning :
               colors.interactive.textSecondary,
        textAlign: rtl ? 'left' : 'right',
        marginTop: spacing.xs,
      }}>
        {count}/{maxLength}
      </Text>
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  return (
    <View style={[containerStyles, containerStyle]} testID={testID}>
      {renderLabel()}
      
      <Animated.View style={[inputContainerStyles]}>
        {renderLeftIcon()}
        
        <TextInput
          ref={inputRef}
          value={internalValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.interactive.textSecondary}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          autoComplete={autoComplete}
          textContentType={textContentType}
          style={[textInputStyles, inputStyle]}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{
            disabled,
            expanded: isFocused,
          }}
          {...textInputProps}
        />
        
        {renderRightIcon()}
      </Animated.View>
      
      {renderHelperText()}
      {renderCharacterCount()}
    </View>
  );
});

Input.displayName = 'Input';

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Input;
