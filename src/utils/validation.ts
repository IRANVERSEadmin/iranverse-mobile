// src/utils/validation.ts
/**
 * IRANVERSE Validation Utilities
 * Enterprise-grade form validation with Persian/Farsi support
 * Iranian market specific validations and patterns
 */

import { ValidationResult, FormFieldValidation, RegisterDto, LoginDto } from '../types/auth.types';

// ==================== VALIDATION PATTERNS ====================

export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  PHONE_IRAN: /^(\+98|0)?9\d{9}$/,
  PHONE_INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,
  IRANIAN_NATIONAL_ID: /^\d{10}$/,
  PERSIAN_CHARS: /[\u0600-\u06FF]/,
  ENGLISH_CHARS: /[A-Za-z]/,
  NUMBERS: /\d/,
  SPECIAL_CHARS: /[^A-Za-z0-9\u0600-\u06FF]/,
  URL: /^https?:\/\/.+\..+/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
} as const;

// ==================== VALIDATION MESSAGES ====================

export const VALIDATION_MESSAGES = {
  EN: {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    EMAIL_REQUIRED: 'Email address is required',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_MIN_LENGTH: 'Password must be at least {min} characters',
    PASSWORD_MAX_LENGTH: 'Password cannot exceed {max} characters',
    PASSWORD_WEAK: 'Password is too weak. Include uppercase, lowercase, numbers, and symbols',
    PASSWORD_NO_MATCH: 'Passwords do not match',
    USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores',
    USERNAME_MIN_LENGTH: 'Username must be at least {min} characters',
    USERNAME_MAX_LENGTH: 'Username cannot exceed {max} characters',
    PHONE_INVALID: 'Please enter a valid phone number',
    PHONE_IRAN_INVALID: 'Please enter a valid Iranian mobile number (09xxxxxxxxx)',
    NAME_REQUIRED: 'Name is required',
    NAME_MIN_LENGTH: 'Name must be at least {min} characters',
    NAME_MAX_LENGTH: 'Name cannot exceed {max} characters',
    AGE_MINIMUM: 'You must be at least {min} years old',
    AGE_MAXIMUM: 'Age cannot exceed {max} years',
    DATE_INVALID: 'Please enter a valid date',
    TERMS_REQUIRED: 'You must accept the terms and conditions',
    PRIVACY_REQUIRED: 'You must accept the privacy policy',
    NATIONAL_ID_INVALID: 'Please enter a valid Iranian national ID',
    URL_INVALID: 'Please enter a valid URL',
    CHARACTERS_ONLY: 'Only letters are allowed',
    NUMBERS_ONLY: 'Only numbers are allowed',
    NO_SPECIAL_CHARS: 'Special characters are not allowed',
    MIXED_LANGUAGE: 'Please use either English or Persian characters, not both',
  },
  FA: {
    REQUIRED: 'این فیلد اجباری است',
    EMAIL_INVALID: 'لطفاً آدرس ایمیل معتبری وارد کنید',
    EMAIL_REQUIRED: 'آدرس ایمیل الزامی است',
    PASSWORD_REQUIRED: 'رمز عبور الزامی است',
    PASSWORD_MIN_LENGTH: 'رمز عبور باید حداقل {min} کاراکتر باشد',
    PASSWORD_MAX_LENGTH: 'رمز عبور نمی‌تواند بیش از {max} کاراکتر باشد',
    PASSWORD_WEAK: 'رمز عبور ضعیف است. شامل حروف بزرگ، کوچک، اعداد و نمادها باشد',
    PASSWORD_NO_MATCH: 'رمزهای عبور مطابقت ندارند',
    USERNAME_INVALID: 'نام کاربری فقط می‌تواند شامل حروف، اعداد و خط زیر باشد',
    USERNAME_MIN_LENGTH: 'نام کاربری باید حداقل {min} کاراکتر باشد',
    USERNAME_MAX_LENGTH: 'نام کاربری نمی‌تواند بیش از {max} کاراکتر باشد',
    PHONE_INVALID: 'لطفاً شماره تلفن معتبری وارد کنید',
    PHONE_IRAN_INVALID: 'لطفاً شماره موبایل ایرانی معتبری وارد کنید (۰۹xxxxxxxxx)',
    NAME_REQUIRED: 'نام الزامی است',
    NAME_MIN_LENGTH: 'نام باید حداقل {min} کاراکتر باشد',
    NAME_MAX_LENGTH: 'نام نمی‌تواند بیش از {max} کاراکتر باشد',
    AGE_MINIMUM: 'شما باید حداقل {min} سال سن داشته باشید',
    AGE_MAXIMUM: 'سن نمی‌تواند بیش از {max} سال باشد',
    DATE_INVALID: 'لطفاً تاریخ معتبری وارد کنید',
    TERMS_REQUIRED: 'باید شرایط و قوانین را بپذیرید',
    PRIVACY_REQUIRED: 'باید سیاست حفظ حریم خصوصی را بپذیرید',
    NATIONAL_ID_INVALID: 'لطفاً کد ملی ایرانی معتبری وارد کنید',
    URL_INVALID: 'لطفاً آدرس اینترنتی معتبری وارد کنید',
    CHARACTERS_ONLY: 'فقط حروف مجاز هستند',
    NUMBERS_ONLY: 'فقط اعداد مجاز هستند',
    NO_SPECIAL_CHARS: 'کاراکترهای خاص مجاز نیستند',
    MIXED_LANGUAGE: 'لطفاً فقط از حروف انگلیسی یا فارسی استفاده کنید، نه هر دو',
  },
} as const;

// ==================== VALIDATION CONFIGURATION ====================

export interface ValidationConfig {
  language: 'en' | 'fa';
  iranianMode: boolean;
  strictMode: boolean;
  customPatterns?: Record<string, RegExp>;
  customMessages?: Record<string, string>;
}

const DEFAULT_CONFIG: ValidationConfig = {
  language: 'en',
  iranianMode: true,
  strictMode: false,
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format validation message with parameters
 */
export function formatMessage(
  message: string, 
  params: Record<string, string | number> = {}
): string {
  return Object.entries(params).reduce(
    (msg, [key, value]) => msg.replace(`{${key}}`, String(value)),
    message
  );
}

/**
 * Get validation message in specified language
 */
export function getValidationMessage(
  key: keyof typeof VALIDATION_MESSAGES.EN,
  language: 'en' | 'fa' = 'en',
  params: Record<string, string | number> = {}
): string {
  const messages = VALIDATION_MESSAGES[language.toUpperCase() as 'EN' | 'FA'];
  const message = messages[key] || VALIDATION_MESSAGES.EN[key];
  return formatMessage(message, params);
}

/**
 * Detect if text contains Persian characters
 */
export function containsPersian(text: string): boolean {
  return VALIDATION_PATTERNS.PERSIAN_CHARS.test(text);
}

/**
 * Detect if text contains English characters
 */
export function containsEnglish(text: string): boolean {
  return VALIDATION_PATTERNS.ENGLISH_CHARS.test(text);
}

/**
 * Check if text has mixed languages
 */
export function hasMixedLanguages(text: string): boolean {
  return containsPersian(text) && containsEnglish(text);
}

/**
 * Validate Iranian National ID using checksum algorithm
 */
export function validateIranianNationalId(nationalId: string): boolean {
  if (!nationalId || !VALIDATION_PATTERNS.IRANIAN_NATIONAL_ID.test(nationalId)) {
    return false;
  }

  // Check for repeated digits
  if (/^(\d)\1{9}$/.test(nationalId)) {
    return false;
  }

  // Calculate checksum
  const digits = nationalId.split('').map(Number);
  const checksum = digits.slice(0, 9).reduce((sum, digit, index) => {
    return sum + digit * (10 - index);
  }, 0) % 11;

  const lastDigit = digits[9];
  
  if (checksum < 2) {
    return lastDigit === checksum;
  } else {
    return lastDigit === 11 - checksum;
  }
}

/**
 * Calculate password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let score = 0;
  const length = password.length;

  // Length scoring (0-40 points)
  if (length >= 8) score += 10;
  if (length >= 12) score += 10;
  if (length >= 16) score += 10;
  if (length >= 20) score += 10;

  // Character variety (0-40 points)
  if (/[a-z]/.test(password)) score += 5;
  if (/[A-Z]/.test(password)) score += 5;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  if (containsPersian(password)) score += 5; // Persian characters bonus

  // Pattern complexity (0-20 points)
  const patterns = [
    /(.)\1{2,}/, // Repeated characters
    /123|234|345|456|567|678|789|890/, // Sequential numbers
    /abc|bcd|cde|def|efg|fgh|ghi|hij/, // Sequential letters
    /password|123456|qwerty|admin/i, // Common passwords
  ];

  let patternPenalty = 0;
  patterns.forEach(pattern => {
    if (pattern.test(password.toLowerCase())) patternPenalty += 5;
  });

  score = Math.max(0, score - patternPenalty);

  // Bonus for mixed scripts (English + Persian)
  if (containsPersian(password) && containsEnglish(password)) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Get password strength level
 */
export function getPasswordStrengthLevel(score: number): 'weak' | 'medium' | 'strong' | 'ultra' {
  if (score >= 80) return 'ultra';
  if (score >= 60) return 'strong';
  if (score >= 40) return 'medium';
  return 'weak';
}

// ==================== FIELD VALIDATORS ====================

/**
 * Email validation
 */
export function validateEmail(
  email: string,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en' } = { ...DEFAULT_CONFIG, ...config };
  const errors: Record<string, string> = {};

  if (!email || !email.trim()) {
    errors.email = getValidationMessage('EMAIL_REQUIRED', language);
  } else if (!VALIDATION_PATTERNS.EMAIL.test(email.trim())) {
    errors.email = getValidationMessage('EMAIL_INVALID', language);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {},
  };
}

/**
 * Password validation
 */
export function validatePassword(
  password: string,
  confirmPassword?: string,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en', strictMode = false } = { ...DEFAULT_CONFIG, ...config };
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!password) {
    errors.password = getValidationMessage('PASSWORD_REQUIRED', language);
  } else {
    if (password.length < 8) {
      errors.password = getValidationMessage('PASSWORD_MIN_LENGTH', language, { min: 8 });
    } else if (password.length > 128) {
      errors.password = getValidationMessage('PASSWORD_MAX_LENGTH', language, { max: 128 });
    }

    // Strength validation
    const strength = calculatePasswordStrength(password);
    const strengthLevel = getPasswordStrengthLevel(strength);

    if (strictMode && strengthLevel === 'weak') {
      errors.password = getValidationMessage('PASSWORD_WEAK', language);
    } else if (strengthLevel === 'weak' || strengthLevel === 'medium') {
      warnings.password = getValidationMessage('PASSWORD_WEAK', language);
    }
  }

  // Confirm password validation
  if (confirmPassword !== undefined) {
    if (password !== confirmPassword) {
      errors.confirmPassword = getValidationMessage('PASSWORD_NO_MATCH', language);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    score: password ? calculatePasswordStrength(password) : 0,
  };
}

/**
 * Username validation
 */
export function validateUsername(
  username: string,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en' } = { ...DEFAULT_CONFIG, ...config };
  const errors: Record<string, string> = {};

  if (username && username.trim()) {
    const trimmed = username.trim();
    
    if (trimmed.length < 3) {
      errors.username = getValidationMessage('USERNAME_MIN_LENGTH', language, { min: 3 });
    } else if (trimmed.length > 30) {
      errors.username = getValidationMessage('USERNAME_MAX_LENGTH', language, { max: 30 });
    } else if (!VALIDATION_PATTERNS.USERNAME.test(trimmed)) {
      errors.username = getValidationMessage('USERNAME_INVALID', language);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {},
  };
}

/**
 * Phone number validation
 */
export function validatePhone(
  phone: string,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en', iranianMode = true } = { ...DEFAULT_CONFIG, ...config };
  const errors: Record<string, string> = {};

  if (phone && phone.trim()) {
    const cleaned = phone.replace(/\s/g, '');
    
    if (iranianMode) {
      if (!VALIDATION_PATTERNS.PHONE_IRAN.test(cleaned)) {
        errors.phone = getValidationMessage('PHONE_IRAN_INVALID', language);
      }
    } else {
      if (!VALIDATION_PATTERNS.PHONE_INTERNATIONAL.test(cleaned)) {
        errors.phone = getValidationMessage('PHONE_INVALID', language);
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {},
  };
}

/**
 * Name validation (supports Persian and English)
 */
export function validateName(
  name: string,
  fieldName: 'first_name' | 'last_name',
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en', strictMode = false } = { ...DEFAULT_CONFIG, ...config };
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!name || !name.trim()) {
    errors[fieldName] = getValidationMessage('NAME_REQUIRED', language);
  } else {
    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
      errors[fieldName] = getValidationMessage('NAME_MIN_LENGTH', language, { min: 2 });
    } else if (trimmed.length > 50) {
      errors[fieldName] = getValidationMessage('NAME_MAX_LENGTH', language, { max: 50 });
    }

    // Check for numbers or special characters
    if (VALIDATION_PATTERNS.NUMBERS.test(trimmed)) {
      errors[fieldName] = getValidationMessage('CHARACTERS_ONLY', language);
    }

    // In strict mode, warn about mixed languages
    if (strictMode && hasMixedLanguages(trimmed)) {
      warnings[fieldName] = getValidationMessage('MIXED_LANGUAGE', language);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Date of birth validation
 */
export function validateDateOfBirth(
  dateOfBirth: string,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en' } = { ...DEFAULT_CONFIG, ...config };
  const errors: Record<string, string> = {};

  if (dateOfBirth && dateOfBirth.trim()) {
    if (!VALIDATION_PATTERNS.DATE_ISO.test(dateOfBirth)) {
      errors.date_of_birth = getValidationMessage('DATE_INVALID', language);
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        errors.date_of_birth = getValidationMessage('AGE_MINIMUM', language, { min: 13 });
      } else if (age > 120) {
        errors.date_of_birth = getValidationMessage('AGE_MAXIMUM', language, { max: 120 });
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {},
  };
}

/**
 * Iranian National ID validation
 */
export function validateNationalId(
  nationalId: string,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en' } = { ...DEFAULT_CONFIG, ...config };
  const errors: Record<string, string> = {};

  if (nationalId && nationalId.trim()) {
    if (!validateIranianNationalId(nationalId.trim())) {
      errors.national_id = getValidationMessage('NATIONAL_ID_INVALID', language);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {},
  };
}

/**
 * URL validation
 */
export function validateUrl(
  url: string,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en' } = { ...DEFAULT_CONFIG, ...config };
  const errors: Record<string, string> = {};

  if (url && url.trim()) {
    if (!VALIDATION_PATTERNS.URL.test(url.trim())) {
      errors.url = getValidationMessage('URL_INVALID', language);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: {},
  };
}

// ==================== FORM VALIDATORS ====================

/**
 * Validate registration form
 */
export function validateSignUpForm(
  data: Partial<RegisterDto>,
  step: 'personal_info' | 'account_preferences' | 'all' = 'all',
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  const { language = 'en' } = { ...DEFAULT_CONFIG, ...config };
  let errors: Record<string, string> = {};
  let warnings: Record<string, string> = {};

  // Personal Info Step
  if (step === 'personal_info' || step === 'all') {
    // Email validation
    const emailResult = validateEmail(data.email || '', config);
    errors = { ...errors, ...emailResult.errors };
    warnings = { ...warnings, ...emailResult.warnings };

    // Password validation
    const passwordResult = validatePassword(
      data.password || '',
      (data as any).confirmPassword,
      config
    );
    errors = { ...errors, ...passwordResult.errors };
    warnings = { ...warnings, ...passwordResult.warnings };

    // Name validation
    const firstNameResult = validateName(data.first_name || '', 'first_name', config);
    errors = { ...errors, ...firstNameResult.errors };
    warnings = { ...warnings, ...firstNameResult.warnings };

    const lastNameResult = validateName(data.last_name || '', 'last_name', config);
    errors = { ...errors, ...lastNameResult.errors };
    warnings = { ...warnings, ...lastNameResult.warnings };

    // Phone validation (optional)
    if (data.phone_number) {
      const phoneResult = validatePhone(data.phone_number, config);
      errors = { ...errors, ...phoneResult.errors };
      warnings = { ...warnings, ...phoneResult.warnings };
    }
  }

  // Account Preferences Step
  if (step === 'account_preferences' || step === 'all') {
    // Username validation (optional)
    if (data.username) {
      const usernameResult = validateUsername(data.username, config);
      errors = { ...errors, ...usernameResult.errors };
      warnings = { ...warnings, ...usernameResult.warnings };
    }

    // Date of birth validation (optional)
    if (data.date_of_birth) {
      const dobResult = validateDateOfBirth(data.date_of_birth, config);
      errors = { ...errors, ...dobResult.errors };
      warnings = { ...warnings, ...dobResult.warnings };
    }

    // Terms and privacy acceptance
    if (!data.terms_accepted) {
      errors.terms_accepted = getValidationMessage('TERMS_REQUIRED', language);
    }

    if (!data.privacy_policy_accepted) {
      errors.privacy_policy_accepted = getValidationMessage('PRIVACY_REQUIRED', language);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate login form
 */
export function validateLoginForm(
  data: Partial<LoginDto>,
  config: Partial<ValidationConfig> = {}
): ValidationResult {
  let errors: Record<string, string> = {};
  let warnings: Record<string, string> = {};

  // Email validation
  const emailResult = validateEmail(data.email || '', config);
  errors = { ...errors, ...emailResult.errors };
  warnings = { ...warnings, ...emailResult.warnings };

  // Password validation (basic - just check if provided)
  const passwordResult = validatePassword(data.password || '', undefined, {
    ...config,
    strictMode: false,
  });
  errors = { ...errors, ...passwordResult.errors };

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

// ==================== EXPORT VALIDATION HELPERS ====================

export const validators = {
  email: validateEmail,
  password: validatePassword,
  username: validateUsername,
  phone: validatePhone,
  name: validateName,
  dateOfBirth: validateDateOfBirth,
  nationalId: validateNationalId,
  url: validateUrl,
  signUpForm: validateSignUpForm,
  loginForm: validateLoginForm,
} as const;

export const patterns = VALIDATION_PATTERNS;
export const messages = VALIDATION_MESSAGES;



