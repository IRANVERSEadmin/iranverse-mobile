// src/utils/validation.ts
// IRANVERSE Enterprise Form Validation
// Comprehensive validation system with Persian/RTL support
// Built for 90M users - RFC Compliant + Cultural Sensitivity
import { ValidationError } from '../types/api';

// ========================================================================================
// VALIDATION RESULT TYPES - ENTERPRISE STANDARDS
// ========================================================================================

/**
 * Individual field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

/**
 * Complete form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  fieldResults: Record<string, FieldValidationResult>;
  globalErrors: ValidationError[];
}

/**
 * Validation configuration options
 */
export interface ValidationOptions {
  // Language & Localization
  language?: 'en' | 'fa';
  rtl?: boolean;
  
  // Validation Strictness
  strict?: boolean;
  allowEmptyOptional?: boolean;
  
  // Persian-Specific Options
  allowPersianCharacters?: boolean;
  requirePersianName?: boolean;
  
  // Security Options
  checkCommonPasswords?: boolean;
  allowWeakPasswords?: boolean;
  
  // Real-time Options
  debounceMs?: number;
  showWarnings?: boolean;
}

// ========================================================================================
// EMAIL VALIDATION - RFC 5322 COMPLIANT
// ========================================================================================

/**
 * Comprehensive email validation with RFC 5322 compliance
 * Supports international domains and Persian email providers
 */
export const validateEmail = (
  email: string,
  options: ValidationOptions = {}
): FieldValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Basic null/empty check
  if (!email || typeof email !== 'string') {
    errors.push(createValidationError(
      'email',
      'REQUIRED',
      'Email is required',
      'ایمیل الزامی است',
      options.language
    ));
    return { isValid: false, errors, warnings };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Length validation
  if (trimmedEmail.length === 0) {
    errors.push(createValidationError(
      'email',
      'REQUIRED',
      'Email cannot be empty',
      'ایمیل نمی‌تواند خالی باشد',
      options.language
    ));
    return { isValid: false, errors, warnings };
  }

  if (trimmedEmail.length > 254) {
    errors.push(createValidationError(
      'email',
      'TOO_LONG',
      'Email address is too long (maximum 254 characters)',
      'آدرس ایمیل خیلی طولانی است (حداکثر ۲۵۴ کاراکتر)',
      options.language
    ));
  }

  // RFC 5322 regex pattern (simplified but comprehensive)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    errors.push(createValidationError(
      'email',
      'INVALID_FORMAT',
      'Please enter a valid email address',
      'لطفاً آدرس ایمیل معتبری وارد کنید',
      options.language
    ));
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    errors.push(createValidationError(
      'email',
      'INVALID_FORMAT',
      'Email cannot contain consecutive dots',
      'ایمیل نمی‌تواند شامل نقطه‌های متوالی باشد',
      options.language
    ));
  }

  // Check for invalid starting/ending characters
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    errors.push(createValidationError(
      'email',
      'INVALID_FORMAT',
      'Email cannot start or end with a dot',
      'ایمیل نمی‌تواند با نقطه شروع یا تمام شود',
      options.language
    ));
  }

  // Local part validation (before @)
  const [localPart, domainPart] = trimmedEmail.split('@');
  
  if (localPart.length > 64) {
    errors.push(createValidationError(
      'email',
      'INVALID_LOCAL_PART',
      'Email local part is too long (maximum 64 characters)',
      'بخش محلی ایمیل خیلی طولانی است (حداکثر ۶۴ کاراکتر)',
      options.language
    ));
  }

  // Domain validation
  if (domainPart && domainPart.length > 253) {
    errors.push(createValidationError(
      'email',
      'INVALID_DOMAIN',
      'Email domain is too long',
      'دامنه ایمیل خیلی طولانی است',
      options.language
    ));
  }

  // Iranian email providers check (for warnings)
  const iranianProviders = ['gmail.com', 'yahoo.com', 'chmail.ir', 'mail.ir', 'iranmail.com'];
  const isIranianProvider = iranianProviders.some(provider => trimmedEmail.endsWith(`@${provider}`));
  
  if (!isIranianProvider && options.language === 'fa') {
    warnings.push(createValidationError(
      'email',
      'NON_IRANIAN_PROVIDER',
      'Consider using an Iranian email provider for better local support',
      'برای پشتیبانی بهتر محلی، استفاده از ارائه‌دهنده ایمیل ایرانی را در نظر بگیرید',
      options.language,
      'warning'
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: options.showWarnings ? warnings : undefined,
  };
};

// ========================================================================================
// PASSWORD VALIDATION - ENTERPRISE SECURITY
// ========================================================================================

/**
 * Enterprise-grade password validation with security scoring
 * Supports Persian characters and cultural password patterns
 */
export const validatePassword = (
  password: string,
  options: ValidationOptions = {}
): FieldValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Basic null/empty check
  if (!password || typeof password !== 'string') {
    errors.push(createValidationError(
      'password',
      'REQUIRED',
      'Password is required',
      'رمز عبور الزامی است',
      options.language
    ));
    return { isValid: false, errors, warnings };
  }

  // Length validation
  if (password.length < 8) {
    errors.push(createValidationError(
      'password',
      'TOO_SHORT',
      'Password must be at least 8 characters long',
      'رمز عبور باید حداقل ۸ کاراکتر باشد',
      options.language
    ));
  }

  if (password.length > 128) {
    errors.push(createValidationError(
      'password',
      'TOO_LONG',
      'Password is too long (maximum 128 characters)',
      'رمز عبور خیلی طولانی است (حداکثر ۱۲۸ کاراکتر)',
      options.language
    ));
  }

  // Character complexity validation
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasPersianChars = /[\u0600-\u06FF]/.test(password);

  // English character requirements (unless allowing Persian-only)
  if (!options.allowPersianCharacters || !hasPersianChars) {
    if (!hasLowercase) {
      errors.push(createValidationError(
        'password',
        'MISSING_LOWERCASE',
        'Password must contain at least one lowercase letter',
        'رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد',
        options.language
      ));
    }

    if (!hasUppercase) {
      errors.push(createValidationError(
        'password',
        'MISSING_UPPERCASE',
        'Password must contain at least one uppercase letter',
        'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد',
        options.language
      ));
    }
  }

  if (!hasNumbers) {
    errors.push(createValidationError(
      'password',
      'MISSING_NUMBERS',
      'Password must contain at least one number',
      'رمز عبور باید حداقل یک عدد داشته باشد',
      options.language
    ));
  }

  if (!hasSymbols && !hasPersianChars) {
    errors.push(createValidationError(
      'password',
      'MISSING_SYMBOLS',
      'Password must contain at least one special character',
      'رمز عبور باید حداقل یک کاراکتر ویژه داشته باشد',
      options.language
    ));
  }

  // Common password patterns
  const commonPatterns = [
    /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/, // Only letters and numbers
    /(.)\1{2,}/, // Repeated characters (3+ times)
    /^[0-9]+$/, // Only numbers
    /^[a-zA-Z]+$/, // Only letters
  ];

  commonPatterns.forEach((pattern, index) => {
    if (pattern.test(password)) {
      const messages = [
        ['Password should contain special characters for better security', 'برای امنیت بیشتر، رمز عبور باید شامل کاراکترهای ویژه باشد'],
        ['Avoid using repeated characters', 'از استفاده کاراکترهای تکراری خودداری کنید'],
        ['Password cannot contain only numbers', 'رمز عبور نمی‌تواند فقط شامل اعداد باشد'],
        ['Password cannot contain only letters', 'رمز عبور نمی‌تواند فقط شامل حروف باشد'],
      ];
      
      warnings.push(createValidationError(
        'password',
        'WEAK_PATTERN',
        messages[index][0],
        messages[index][1],
        options.language,
        'warning'
      ));
    }
  });

  // Common passwords check
  if (options.checkCommonPasswords) {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      // Persian common passwords
      'رمزعبور', '۱۲۳۴۵۶', 'ایران', 'تهران', 'اصفهان'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push(createValidationError(
        'password',
        'COMMON_PASSWORD',
        'This password is too common and easily guessable',
        'این رمز عبور خیلی رایج است و به راحتی قابل حدس زدن است',
        options.language
      ));
    }
  }

  // Sequential characters check
  const hasSequential = /(?:abc|bcd|cde|def|123|234|345|456|789)/i.test(password);
  if (hasSequential) {
    warnings.push(createValidationError(
      'password',
      'SEQUENTIAL_CHARS',
      'Avoid using sequential characters',
      'از استفاده کاراکترهای متوالی خودداری کنید',
      options.language,
      'warning'
    ));
  }

  // Calculate password strength score
  const strengthScore = calculatePasswordStrength(password);
  if (strengthScore < 3 && !options.allowWeakPasswords) {
    warnings.push(createValidationError(
      'password',
      'WEAK_PASSWORD',
      'Consider using a stronger password',
      'استفاده از رمز عبور قوی‌تری را در نظر بگیرید',
      options.language,
      'warning'
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: options.showWarnings ? warnings : undefined,
  };
};

// ========================================================================================
// USERNAME VALIDATION - INTERNATIONAL + PERSIAN
// ========================================================================================

/**
 * Username validation with Persian and Latin character support
 * Handles cultural naming conventions and character restrictions
 */
export const validateUsername = (
  username: string,
  options: ValidationOptions = {}
): FieldValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Basic null/empty check
  if (!username || typeof username !== 'string') {
    errors.push(createValidationError(
      'username',
      'REQUIRED',
      'Username is required',
      'نام کاربری الزامی است',
      options.language
    ));
    return { isValid: false, errors, warnings };
  }

  const trimmedUsername = username.trim();

  // Length validation
  if (trimmedUsername.length < 3) {
    errors.push(createValidationError(
      'username',
      'TOO_SHORT',
      'Username must be at least 3 characters long',
      'نام کاربری باید حداقل ۳ کاراکتر باشد',
      options.language
    ));
  }

  if (trimmedUsername.length > 30) {
    errors.push(createValidationError(
      'username',
      'TOO_LONG',
      'Username is too long (maximum 30 characters)',
      'نام کاربری خیلی طولانی است (حداکثر ۳۰ کاراکتر)',
      options.language
    ));
  }

  // Character validation
  const hasEnglishChars = /[a-zA-Z]/.test(trimmedUsername);
  const hasPersianChars = /[\u0600-\u06FF]/.test(trimmedUsername);
  const hasNumbers = /[0-9]/.test(trimmedUsername);
  const hasValidSpecialChars = /^[a-zA-Z0-9\u0600-\u06FF._-]+$/.test(trimmedUsername);

  if (!hasValidSpecialChars) {
    errors.push(createValidationError(
      'username',
      'INVALID_CHARACTERS',
      'Username can only contain letters, numbers, dots, underscores, and hyphens',
      'نام کاربری فقط می‌تواند شامل حروف، اعداد، نقطه، خط زیر و خط تیره باشد',
      options.language
    ));
  }

  // Starting/ending character validation
  if (/^[._-]/.test(trimmedUsername) || /[._-]$/.test(trimmedUsername)) {
    errors.push(createValidationError(
      'username',
      'INVALID_START_END',
      'Username cannot start or end with dot, underscore, or hyphen',
      'نام کاربری نمی‌تواند با نقطه، خط زیر یا خط تیره شروع یا تمام شود',
      options.language
    ));
  }

  // Consecutive special characters
  if (/[._-]{2,}/.test(trimmedUsername)) {
    errors.push(createValidationError(
      'username',
      'CONSECUTIVE_SPECIAL',
      'Username cannot contain consecutive dots, underscores, or hyphens',
      'نام کاربری نمی‌تواند شامل نقطه، خط زیر یا خط تیره‌های متوالی باشد',
      options.language
    ));
  }

  // Reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'user', 'iranverse',
    'api', 'www', 'mail', 'support', 'help', 'info',
    'test', 'demo', 'guest', 'null', 'undefined',
    // Persian reserved words
    'مدیر', 'کاربر', 'پشتیبانی', 'راهنما', 'اطلاعات'
  ];

  if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
    errors.push(createValidationError(
      'username',
      'RESERVED_USERNAME',
      'This username is reserved and cannot be used',
      'این نام کاربری رزرو شده و قابل استفاده نیست',
      options.language
    ));
  }

  // Only numbers check
  if (/^[0-9._-]+$/.test(trimmedUsername)) {
    errors.push(createValidationError(
      'username',
      'ONLY_NUMBERS',
      'Username must contain at least one letter',
      'نام کاربری باید حداقل یک حرف داشته باشد',
      options.language
    ));
  }

  // Mixed script warning (Persian + Latin)
  if (hasEnglishChars && hasPersianChars) {
    warnings.push(createValidationError(
      'username',
      'MIXED_SCRIPTS',
      'Consider using either Persian or English characters for consistency',
      'برای یکنواختی، استفاده از حروف فارسی یا انگلیسی را در نظر بگیرید',
      options.language,
      'warning'
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: options.showWarnings ? warnings : undefined,
  };
};

// ========================================================================================
// NAME VALIDATION - CULTURAL SENSITIVITY
// ========================================================================================

/**
 * Full name validation with Persian and international name support
 * Handles cultural naming conventions and character sets
 */
export const validateFullName = (
  name: string,
  field: 'firstName' | 'lastName' | 'displayName',
  options: ValidationOptions = {}
): FieldValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Basic null/empty check for required fields
  if (!name || typeof name !== 'string') {
    if (field !== 'displayName' || !options.allowEmptyOptional) {
      const fieldNames = {
        firstName: ['First name', 'نام'],
        lastName: ['Last name', 'نام خانوادگی'],
        displayName: ['Display name', 'نام نمایشی']
      };
      
      errors.push(createValidationError(
        field,
        'REQUIRED',
        `${fieldNames[field][0]} is required`,
        `${fieldNames[field][1]} الزامی است`,
        options.language
      ));
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  const trimmedName = name.trim();

  // Length validation
  if (trimmedName.length === 0) {
    errors.push(createValidationError(
      field,
      'REQUIRED',
      'Name cannot be empty',
      'نام نمی‌تواند خالی باشد',
      options.language
    ));
    return { isValid: false, errors, warnings };
  }

  if (trimmedName.length < 2) {
    errors.push(createValidationError(
      field,
      'TOO_SHORT',
      'Name must be at least 2 characters long',
      'نام باید حداقل ۲ کاراکتر باشد',
      options.language
    ));
  }

  if (trimmedName.length > 50) {
    errors.push(createValidationError(
      field,
      'TOO_LONG',
      'Name is too long (maximum 50 characters)',
      'نام خیلی طولانی است (حداکثر ۵۰ کاراکتر)',
      options.language
    ));
  }

  // Character validation - support Persian, Arabic, Latin, and common diacritics
  const validNameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFFa-zA-Z\s\-'\.]+$/;
  
  if (!validNameRegex.test(trimmedName)) {
    errors.push(createValidationError(
      field,
      'INVALID_CHARACTERS',
      'Name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed',
      'نام شامل کاراکترهای نامعتبر است. فقط حروف، فاصله، خط تیره و آپستروف مجاز است',
      options.language
    ));
  }

  // No numbers allowed
  if (/[0-9]/.test(trimmedName)) {
    errors.push(createValidationError(
      field,
      'CONTAINS_NUMBERS',
      'Name cannot contain numbers',
      'نام نمی‌تواند شامل اعداد باشد',
      options.language
    ));
  }

  // Multiple consecutive spaces
  if (/\s{2,}/.test(trimmedName)) {
    warnings.push(createValidationError(
      field,
      'MULTIPLE_SPACES',
      'Avoid using multiple consecutive spaces',
      'از استفاده فاصله‌های متوالی خودداری کنید',
      options.language,
      'warning'
    ));
  }

  // Starting/ending with space, hyphen, or apostrophe
  if (/^[\s\-']/.test(trimmedName) || /[\s\-']$/.test(trimmedName)) {
    errors.push(createValidationError(
      field,
      'INVALID_START_END',
      'Name cannot start or end with space, hyphen, or apostrophe',
      'نام نمی‌تواند با فاصله، خط تیره یا آپستروف شروع یا تمام شود',
      options.language
    ));
  }

  // Persian name validation
  const hasPersianChars = /[\u0600-\u06FF]/.test(trimmedName);
  const hasLatinChars = /[a-zA-Z]/.test(trimmedName);

  if (options.requirePersianName && !hasPersianChars) {
    errors.push(createValidationError(
      field,
      'PERSIAN_REQUIRED',
      'Persian characters are required for this field',
      'استفاده از حروف فارسی برای این فیلد الزامی است',
      options.language
    ));
  }

  // Mixed script warning
  if (hasPersianChars && hasLatinChars) {
    warnings.push(createValidationError(
      field,
      'MIXED_SCRIPTS',
      'Consider using either Persian or Latin characters for consistency',
      'برای یکنواختی، استفاده از حروف فارسی یا لاتین را در نظر بگیرید',
      options.language,
      'warning'
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: options.showWarnings ? warnings : undefined,
  };
};

// ========================================================================================
// FORM VALIDATION ORCHESTRATOR - COMPLETE FORMS
// ========================================================================================

/**
 * Validate complete login form
 */
export const validateLoginForm = (
  formData: { email: string; password: string },
  options: ValidationOptions = {}
): FormValidationResult => {
  const fieldResults: Record<string, FieldValidationResult> = {};
  const globalErrors: ValidationError[] = [];

  // Validate individual fields
  fieldResults.email = validateEmail(formData.email, options);
  fieldResults.password = validatePassword(formData.password, {
    ...options,
    checkCommonPasswords: false, // Skip for login
    allowWeakPasswords: true, // Allow for existing accounts
  });

  // Check overall form validity
  const isValid = Object.values(fieldResults).every(result => result.isValid);

  return {
    isValid,
    fieldResults,
    globalErrors,
  };
};

/**
 * Validate complete signup form
 */
export const validateSignupForm = (
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    firstName?: string;
    lastName?: string;
  },
  options: ValidationOptions = {}
): FormValidationResult => {
  const fieldResults: Record<string, FieldValidationResult> = {};
  const globalErrors: ValidationError[] = [];

  // Validate individual fields
  fieldResults.email = validateEmail(formData.email, options);
  fieldResults.password = validatePassword(formData.password, {
    ...options,
    checkCommonPasswords: true,
    allowWeakPasswords: false,
  });
  fieldResults.username = validateUsername(formData.username, options);

  // Password confirmation validation
  if (formData.password !== formData.confirmPassword) {
    fieldResults.confirmPassword = {
      isValid: false,
      errors: [createValidationError(
        'confirmPassword',
        'PASSWORD_MISMATCH',
        'Passwords do not match',
        'رمزهای عبور یکسان نیستند',
        options.language
      )],
    };
  } else {
    fieldResults.confirmPassword = { isValid: true, errors: [] };
  }

  // Optional name validation
  if (formData.firstName) {
    fieldResults.firstName = validateFullName(formData.firstName, 'firstName', options);
  }

  if (formData.lastName) {
    fieldResults.lastName = validateFullName(formData.lastName, 'lastName', options);
  }

  // Check overall form validity
  const isValid = Object.values(fieldResults).every(result => result.isValid);

  return {
    isValid,
    fieldResults,
    globalErrors,
  };
};

// ========================================================================================
// UTILITY FUNCTIONS - VALIDATION HELPERS
// ========================================================================================

/**
 * Create standardized validation error
 */
const createValidationError = (
  field: string,
  code: string,
  englishMessage: string,
  persianMessage: string,
  language: 'en' | 'fa' = 'en',
  severity: 'error' | 'warning' = 'error'
): ValidationError => {
  return {
    field,
    code,
    message: language === 'fa' ? persianMessage : englishMessage,
    value: undefined,
    constraint: severity,
  };
};

/**
 * Calculate password strength score (0-5)
 */
const calculatePasswordStrength = (password: string): number => {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character diversity
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/(?:123|abc|qwe)/i.test(password)) score -= 1; // Sequential patterns

  return Math.max(0, Math.min(5, score));
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (
  password: string,
  language: 'en' | 'fa' = 'en'
): string => {
  const score = calculatePasswordStrength(password);
  
  const labels = {
    en: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'],
    fa: ['خیلی ضعیف', 'ضعیف', 'متوسط', 'خوب', 'قوی', 'خیلی قوی']
  };

  return labels[language][score] || labels[language][0];
};

/**
 * Real-time validation with debouncing
 */
export const createDebouncedValidator = (
  validatorFn: (value: string, options?: ValidationOptions) => FieldValidationResult,
  debounceMs: number = 300
) => {
  let timeout: NodeJS.Timeout;
  
  return (
    value: string,
    options: ValidationOptions = {},
    callback: (result: FieldValidationResult) => void
  ) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const result = validatorFn(value, options);
      callback(result);
    }, debounceMs);
  };
};

/**
 * Validate field based on type
 */
export const validateField = (
  fieldType: 'email' | 'password' | 'username' | 'firstName' | 'lastName' | 'displayName',
  value: string,
  options: ValidationOptions = {}
): FieldValidationResult => {
  switch (fieldType) {
    case 'email':
      return validateEmail(value, options);
    case 'password':
      return validatePassword(value, options);
    case 'username':
      return validateUsername(value, options);
    case 'firstName':
    case 'lastName':
    case 'displayName':
      return validateFullName(value, fieldType, options);
    default:
      return { isValid: true, errors: [] };
  }
};

/**
 * Get validation error message for display
 */
export const getValidationErrorMessage = (
  errors: ValidationError[],
  language: 'en' | 'fa' = 'en'
): string | null => {
  if (errors.length === 0) return null;
  
  // Return the first error message
  return errors[0].message;
};

/**
 * Check if form has any validation errors
 */
export const hasValidationErrors = (result: FormValidationResult): boolean => {
  return !result.isValid || result.globalErrors.length > 0;
};

/**
 * Get all validation errors as flat array
 */
export const getAllValidationErrors = (result: FormValidationResult): ValidationError[] => {
  const allErrors: ValidationError[] = [...result.globalErrors];
  
  Object.values(result.fieldResults).forEach(fieldResult => {
    allErrors.push(...fieldResult.errors);
  });
  
  return allErrors;
};

// ========================================================================================
// EXPORT VALIDATION UTILITIES
// ========================================================================================

export default {
  // Individual field validators
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  
  // Form validators
  validateLoginForm,
  validateSignupForm,
  
  // Utility functions
  validateField,
  getPasswordStrengthLabel,
  createDebouncedValidator,
  getValidationErrorMessage,
  hasValidationErrors,
  getAllValidationErrors,
  
  // Password strength
  calculatePasswordStrength: (password: string) => calculatePasswordStrength(password),
};