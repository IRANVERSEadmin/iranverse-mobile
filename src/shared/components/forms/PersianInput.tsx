// src/components/ui/PersianInput.tsx
// IRANVERSE PersianInput - Grok iOS Revolution
// Minimal Persian/RTL Input with Essential Features

import React, { forwardRef } from 'react';
import Input, { InputProps, InputRef } from './Input';

export interface PersianInputProps extends InputProps {
  persianDigits?: boolean;
  rtlSupport?: boolean;
}

export const PersianInput = forwardRef<InputRef, PersianInputProps>((props, ref) => {
  const { persianDigits = true, rtlSupport = true, ...inputProps } = props;
  
  return (
    <Input
      ref={ref}
      {...inputProps}
      rtl={rtlSupport}
      placeholder={props.placeholder || "متن خود را وارد کنید"}
      style={props.style}
      inputStyle={{
        textAlign: rtlSupport ? 'right' : 'left',
        ...props.inputStyle,
      }}
    />
  );
});

PersianInput.displayName = 'PersianInput';

export default PersianInput;