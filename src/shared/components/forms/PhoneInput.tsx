// src/components/ui/PhoneInput.tsx
// IRANVERSE PhoneInput - Grok iOS Revolution
// Minimal Phone Input with Essential Validation

import React, { forwardRef } from 'react';
import Input, { InputProps, InputRef } from './Input';

export interface PhoneInputProps extends Omit<InputProps, 'keyboardType' | 'autoCapitalize' | 'autoCorrect'> {
  autoValidate?: boolean;
  countryCode?: string;
}

export const PhoneInput = forwardRef<InputRef, PhoneInputProps>((props, ref) => {
  const { autoValidate = true, countryCode = '+1', ...inputProps } = props;
  
  return (
    <Input
      ref={ref}
      {...inputProps}
      keyboardType="phone-pad"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="tel"
      textContentType="telephoneNumber"
      placeholder={props.placeholder || "Enter your phone number"}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;