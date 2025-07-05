// src/i18n/authMessages.ts
/**
 * IRANVERSE Authentication Messages
 * Complete English and Persian translations for authentication flows
 * Supports all UI text, validation messages, and error handling
 */

export const authMessages = {
  english: {
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.retry': 'Retry',
    'common.changeLanguage': 'Change Language',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.optional': 'Optional',
    'common.required': 'Required',

    // Authentication Main
    'auth.login': 'Sign In',
    'auth.register': 'Sign Up',
    'auth.logout': 'Sign Out',
    'auth.forgotPassword': 'Forgot Password',
    'auth.resetPassword': 'Reset Password',
    'auth.changePassword': 'Change Password',
    'auth.verifyEmail': 'Verify Email',
    'auth.resendVerification': 'Resend Verification',

    // Signup Flow
    'signup.title': 'Create Account',
    'signup.step': 'Step {current} of {total}',
    'signup.personalInfo.title': 'Personal Information',
    'signup.personalInfo.description': 'Let\'s get to know you better',
    'signup.preferences.title': 'Account Preferences',
    'signup.preferences.description': 'Customize your IRANVERSE experience',
    'signup.createAccount': 'Create Account',
    'signup.createAccountHint': 'Complete registration and proceed to email verification',

    // Login Flow
    'login.title': 'Welcome Back',
    'login.welcome': 'Welcome to IRANVERSE',
    'login.subtitle': 'Sign in to explore the 3D social universe',
    'login.signIn': 'Sign In',
    'login.signInHint': 'Sign in to your account',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot password?',
    'login.noAccount': 'Don\'t have an account?',
    'login.signUp': 'Sign up',
    'login.continueWithGoogle': 'Continue with Google',
    'login.googleHint': 'Sign in using your Google account',
    'login.or': 'OR',
    'login.invalidCredentials': 'Invalid email or password',
    'login.attemptsWarning': '{remaining} attempts remaining before lockout',

    // Login Lockout
    'login.locked.title': 'Account Temporarily Locked',
    'login.locked.message': 'Too many failed attempts. Try again in {minutes} minutes.',
    'login.locked.tooManyAttempts': 'Account locked due to too many failed login attempts.',
    'login.locked.countdown': 'Locked for {minutes}:{seconds}',

    // Rate Limiting
    'login.rateLimited.title': 'Too Many Requests',
    'login.rateLimited.message': 'Please wait {seconds} seconds before trying again.',

    // Form Fields
    'form.email.label': 'Email Address',
    'form.email.labelRTL': 'Email Address',
    'form.email.placeholder': 'Enter your email address',
    'form.email.placeholderRTL': 'Enter your email address',
    'form.email.optional': 'Email is recommended for account recovery',

    'form.password.label': 'Password',
    'form.password.labelRTL': 'Password',
    'form.password.placeholder': 'Enter your password',
    'form.password.placeholderRTL': 'Enter your password',

    'form.confirmPassword.label': 'Confirm Password',
    'form.confirmPassword.labelRTL': 'Confirm Password',
    'form.confirmPassword.placeholder': 'Confirm your password',
    'form.confirmPassword.placeholderRTL': 'Confirm your password',

    'form.firstName.label': 'First Name',
    'form.firstName.labelRTL': 'First Name',
    'form.firstName.placeholder': 'Enter your first name',
    'form.firstName.placeholderRTL': 'Enter your first name',

    'form.lastName.label': 'Last Name',
    'form.lastName.labelRTL': 'Last Name',
    'form.lastName.placeholder': 'Enter your last name',
    'form.lastName.placeholderRTL': 'Enter your last name',

    'form.username.label': 'Username',
    'form.username.labelRTL': 'Username',
    'form.username.placeholder': 'Choose a username',
    'form.username.placeholderRTL': 'Choose a username',
    'form.username.optional': 'Username is optional - you can set it later',

    'form.phone.label': 'Phone Number',
    'form.phone.labelRTL': 'Phone Number',
    'form.phone.placeholder': '+98 9XX XXX XXXX',
    'form.phone.placeholderRTL': '+98 9XX XXX XXXX',
    'form.phone.optional': 'Phone number helps with account security',

    'form.dateOfBirth.label': 'Date of Birth',
    'form.dateOfBirth.labelRTL': 'Date of Birth',
    'form.dateOfBirth.placeholder': 'YYYY-MM-DD',
    'form.dateOfBirth.placeholderRTL': 'YYYY-MM-DD',
    'form.dateOfBirth.optional': 'Used for age-appropriate content',

    'form.marketing.label': 'I want to receive updates about new features and events',
    'form.terms.label': 'I agree to the Terms of Service',
    'form.privacy.label': 'I agree to the Privacy Policy',

    // Validation Messages
    'validation.email.required': 'Email address is required',
    'validation.email.invalid': 'Please enter a valid email address',
    'validation.password.required': 'Password is required',
    'validation.password.minLength': 'Password must be at least 8 characters',
    'validation.password.noMatch': 'Passwords do not match',
    'validation.firstName.required': 'First name is required',
    'validation.firstName.minLength': 'First name must be at least 2 characters',
    'validation.lastName.required': 'Last name is required',
    'validation.lastName.minLength': 'Last name must be at least 2 characters',
    'validation.username.minLength': 'Username must be at least 3 characters',
    'validation.username.invalid': 'Username can only contain letters, numbers, and underscores',
    'validation.phone.invalid': 'Please enter a valid phone number',
    'validation.age.minimum': 'You must be at least 13 years old',
    'validation.terms.required': 'You must accept the Terms of Service',
    'validation.privacy.required': 'You must accept the Privacy Policy',

    // Email Verification
    'verification.title': 'Verify Your Email',
    'verification.description': 'We\'ve sent a verification link to {email}. Please check your inbox and click the link to continue.',
    'verification.checkEmail': 'I\'ve Verified My Email',
    'verification.resend': 'Resend verification email',
    'verification.resendIn': 'Resend in {seconds} seconds',
    'verification.resent': 'Verification Email Sent',

    // Password Reset
    'passwordReset.title': 'Reset Password',
    'passwordReset.description': 'Enter your email address and we\'ll send you a link to reset your password.',
    'passwordReset.sendLink': 'Send Reset Link',
    'passwordReset.linkSent': 'Reset Link Sent',
    'passwordReset.linkSentDescription': 'If an account with that email exists, we\'ve sent a password reset link.',
    'passwordReset.newPassword': 'New Password',
    'passwordReset.confirmNewPassword': 'Confirm New Password',
    'passwordReset.updatePassword': 'Update Password',

    // Error Messages
    'error.networkError': 'Network connection failed',
    'error.serverError': 'Server error occurred',
    'error.tryAgainLater': 'Please try again later',
    'error.registrationFailed': 'Registration Failed',
    'error.loginFailed': 'Login Failed',
    'error.verificationFailed': 'Email Verification Failed',
    'error.checkEmail': 'Please check your email and try again',
    'error.resendFailed': 'Failed to resend verification email',
    'error.oauthFailed': 'Social login failed',
    'error.sessionExpired': 'Your session has expired. Please sign in again.',
    'error.accountLocked': 'Account is temporarily locked',
    'error.invalidToken': 'Invalid or expired token',
    'error.userNotFound': 'User not found',
    'error.emailAlreadyExists': 'An account with this email already exists',
    'error.usernameNotAvailable': 'This username is not available',
    'error.invalidCredentials': 'Invalid email or password',

    // Success Messages
    'success.registrationComplete': 'Registration completed successfully!',
    'success.loginSuccess': 'Welcome back!',
    'success.emailVerified': 'Email verified successfully',
    'success.passwordReset': 'Password reset successfully',
    'success.passwordChanged': 'Password changed successfully',
    'success.profileUpdated': 'Profile updated successfully',
    'success.logoutSuccess': 'Signed out successfully',

    // Avatar Creation
    'avatar.title': 'Create Your Avatar',
    'avatar.description': 'Design your 3D avatar for the IRANVERSE experience',
    'avatar.required': 'Avatar creation is required to continue',
    'avatar.creating': 'Creating your avatar...',
    'avatar.created': 'Avatar created successfully!',
    'avatar.error': 'Failed to create avatar',
    'avatar.retry': 'Try Again',

    // Navigation
    'nav.home': 'Home',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.about': 'About',

    // Deep Links
    'deeplink.emailVerification': 'Email Verification',
    'deeplink.passwordReset': 'Password Reset',
    'deeplink.invalidLink': 'Invalid or expired link',

    // Accessibility
    'accessibility.menu': 'Menu',
    'accessibility.close': 'Close',
    'accessibility.back': 'Go back',
    'accessibility.next': 'Next step',
    'accessibility.toggle': 'Toggle',
    'accessibility.expand': 'Expand',
    'accessibility.collapse': 'Collapse',
  },

  farsi: {
    // Common
    'common.ok': 'تأیید',
    'common.cancel': 'لغو',
    'common.back': 'بازگشت',
    'common.next': 'بعدی',
    'common.loading': 'در حال بارگذاری...',
    'common.error': 'خطا',
    'common.success': 'موفق',
    'common.retry': 'تلاش مجدد',
    'common.changeLanguage': 'تغییر زبان',
    'common.close': 'بستن',
    'common.save': 'ذخیره',
    'common.edit': 'ویرایش',
    'common.delete': 'حذف',
    'common.confirm': 'تأیید',
    'common.optional': 'اختیاری',
    'common.required': 'الزامی',

    // Authentication Main
    'auth.login': 'وارد شوید',
    'auth.register': 'ثبت نام',
    'auth.logout': 'خروج',
    'auth.forgotPassword': 'فراموشی رمز عبور',
    'auth.resetPassword': 'بازنشانی رمز عبور',
    'auth.changePassword': 'تغییر رمز عبور',
    'auth.verifyEmail': 'تأیید ایمیل',
    'auth.resendVerification': 'ارسال مجدد تأیید',

    // Signup Flow
    'signup.title': 'ایجاد حساب',
    'signup.step': 'مرحله {current} از {total}',
    'signup.personalInfo.title': 'اطلاعات شخصی',
    'signup.personalInfo.description': 'بیایید شما را بهتر بشناسیم',
    'signup.preferences.title': 'تنظیمات حساب',
    'signup.preferences.description': 'تجربه IRANVERSE خود را شخصی‌سازی کنید',
    'signup.createAccount': 'ایجاد حساب',
    'signup.createAccountHint': 'ثبت نام را کامل کنید و به تأیید ایمیل بروید',

    // Login Flow
    'login.title': 'خوش آمدید',
    'login.welcome': 'به IRANVERSE خوش آمدید',
    'login.subtitle': 'وارد شوید تا جهان اجتماعی سه‌بعدی را کاوش کنید',
    'login.signIn': 'ورود',
    'login.signInHint': 'وارد حساب کاربری خود شوید',
    'login.rememberMe': 'مرا به خاطر بسپار',
    'login.forgotPassword': 'رمز عبور را فراموش کرده‌اید؟',
    'login.noAccount': 'حساب کاربری ندارید؟',
    'login.signUp': 'ثبت نام کنید',
    'login.continueWithGoogle': 'ادامه با گوگل',
    'login.googleHint': 'با حساب گوگل خود وارد شوید',
    'login.or': 'یا',
    'login.invalidCredentials': 'ایمیل یا رمز عبور نامعتبر',
    'login.attemptsWarning': '{remaining} تلاش باقی مانده تا قفل شدن حساب',

    // Login Lockout
    'login.locked.title': 'حساب موقتاً قفل شده',
    'login.locked.message': 'تلاش‌های ناموفق زیاد. {minutes} دقیقه دیگر تلاش کنید.',
    'login.locked.tooManyAttempts': 'حساب به دلیل تلاش‌های ناموفق زیاد قفل شده.',
    'login.locked.countdown': 'قفل شده برای {minutes}:{seconds}',

    // Rate Limiting
    'login.rateLimited.title': 'درخواست‌های زیاد',
    'login.rateLimited.message': 'لطفاً {seconds} ثانیه صبر کنید و دوباره تلاش کنید.',

    // Form Fields
    'form.email.label': 'آدرس ایمیل',
    'form.email.labelRTL': 'آدرس ایمیل',
    'form.email.placeholder': 'آدرس ایمیل خود را وارد کنید',
    'form.email.placeholderRTL': 'آدرس ایمیل خود را وارد کنید',
    'form.email.optional': 'ایمیل برای بازیابی حساب توصیه می‌شود',

    'form.password.label': 'رمز عبور',
    'form.password.labelRTL': 'رمز عبور',
    'form.password.placeholder': 'رمز عبور خود را وارد کنید',
    'form.password.placeholderRTL': 'رمز عبور خود را وارد کنید',

    'form.confirmPassword.label': 'تأیید رمز عبور',
    'form.confirmPassword.labelRTL': 'تأیید رمز عبور',
    'form.confirmPassword.placeholder': 'رمز عبور را دوباره وارد کنید',
    'form.confirmPassword.placeholderRTL': 'رمز عبور را دوباره وارد کنید',

    'form.firstName.label': 'نام',
    'form.firstName.labelRTL': 'نام',
    'form.firstName.placeholder': 'نام خود را وارد کنید',
    'form.firstName.placeholderRTL': 'نام خود را وارد کنید',

    'form.lastName.label': 'نام خانوادگی',
    'form.lastName.labelRTL': 'نام خانوادگی',
    'form.lastName.placeholder': 'نام خانوادگی خود را وارد کنید',
    'form.lastName.placeholderRTL': 'نام خانوادگی خود را وارد کنید',

    'form.username.label': 'نام کاربری',
    'form.username.labelRTL': 'نام کاربری',
    'form.username.placeholder': 'نام کاربری انتخاب کنید',
    'form.username.placeholderRTL': 'نام کاربری انتخاب کنید',
    'form.username.optional': 'نام کاربری اختیاری است - بعداً می‌توانید تنظیم کنید',

    'form.phone.label': 'شماره تلفن',
    'form.phone.labelRTL': 'شماره تلفن',
    'form.phone.placeholder': '+98 9XX XXX XXXX',
    'form.phone.placeholderRTL': '+98 9XX XXX XXXX',
    'form.phone.optional': 'شماره تلفن به امنیت حساب کمک می‌کند',

    'form.dateOfBirth.label': 'تاریخ تولد',
    'form.dateOfBirth.labelRTL': 'تاریخ تولد',
    'form.dateOfBirth.placeholder': 'YYYY-MM-DD',
    'form.dateOfBirth.placeholderRTL': 'YYYY-MM-DD',
    'form.dateOfBirth.optional': 'برای محتوای مناسب سن استفاده می‌شود',

    'form.marketing.label': 'می‌خواهم در مورد ویژگی‌ها و رویدادهای جدید اطلاع‌رسانی شوم',
    'form.terms.label': 'با شرایط خدمات موافقم',
    'form.privacy.label': 'با سیاست حفظ حریم خصوصی موافقم',

    // Validation Messages
    'validation.email.required': 'آدرس ایمیل الزامی است',
    'validation.email.invalid': 'لطفاً آدرس ایمیل معتبری وارد کنید',
    'validation.password.required': 'رمز عبور الزامی است',
    'validation.password.minLength': 'رمز عبور باید حداقل ۸ کاراکتر باشد',
    'validation.password.noMatch': 'رمزهای عبور مطابقت ندارند',
    'validation.firstName.required': 'نام الزامی است',
    'validation.firstName.minLength': 'نام باید حداقل ۲ کاراکتر باشد',
    'validation.lastName.required': 'نام خانوادگی الزامی است',
    'validation.lastName.minLength': 'نام خانوادگی باید حداقل ۲ کاراکتر باشد',
    'validation.username.minLength': 'نام کاربری باید حداقل ۳ کاراکتر باشد',
    'validation.username.invalid': 'نام کاربری فقط می‌تواند شامل حروف، اعداد و خط زیر باشد',
    'validation.phone.invalid': 'لطفاً شماره تلفن معتبری وارد کنید',
    'validation.age.minimum': 'شما باید حداقل ۱۳ سال سن داشته باشید',
    'validation.terms.required': 'باید شرایط خدمات را بپذیرید',
    'validation.privacy.required': 'باید سیاست حفظ حریم خصوصی را بپذیرید',

    // Email Verification
    'verification.title': 'تأیید ایمیل شما',
    'verification.description': 'لینک تأیید به {email} ارسال شده. لطفاً صندوق ورودی خود را بررسی کنید و روی لینک کلیک کنید.',
    'verification.checkEmail': 'ایمیل خود را تأیید کردم',
    'verification.resend': 'ارسال مجدد ایمیل تأیید',
    'verification.resendIn': 'ارسال مجدد در {seconds} ثانیه',
    'verification.resent': 'ایمیل تأیید ارسال شد',

    // Password Reset
    'passwordReset.title': 'بازنشانی رمز عبور',
    'passwordReset.description': 'آدرس ایمیل خود را وارد کنید تا لینک بازنشانی رمز عبور برایتان بفرستیم.',
    'passwordReset.sendLink': 'ارسال لینک بازنشانی',
    'passwordReset.linkSent': 'لینک بازنشانی ارسال شد',
    'passwordReset.linkSentDescription': 'اگر حسابی با این ایمیل وجود داشته باشد، لینک بازنشانی رمز عبور ارسال شده است.',
    'passwordReset.newPassword': 'رمز عبور جدید',
    'passwordReset.confirmNewPassword': 'تأیید رمز عبور جدید',
    'passwordReset.updatePassword': 'بروزرسانی رمز عبور',

    // Error Messages
    'error.networkError': 'خطا در اتصال به شبکه',
    'error.serverError': 'خطای سرور رخ داده',
    'error.tryAgainLater': 'لطفاً بعداً دوباره تلاش کنید',
    'error.registrationFailed': 'ثبت نام ناموفق',
    'error.loginFailed': 'ورود ناموفق',
    'error.verificationFailed': 'تأیید ایمیل ناموفق',
    'error.checkEmail': 'لطفاً ایمیل خود را بررسی کنید و دوباره تلاش کنید',
    'error.resendFailed': 'ارسال مجدد ایمیل تأیید ناموفق',
    'error.oauthFailed': 'ورود با شبکه اجتماعی ناموفق',
    'error.sessionExpired': 'جلسه شما منقضی شده. لطفاً دوباره وارد شوید.',
    'error.accountLocked': 'حساب موقتاً قفل شده',
    'error.invalidToken': 'توکن نامعتبر یا منقضی شده',
    'error.userNotFound': 'کاربر یافت نشد',
    'error.emailAlreadyExists': 'حسابی با این ایمیل از قبل وجود دارد',
    'error.usernameNotAvailable': 'این نام کاربری در دسترس نیست',
    'error.invalidCredentials': 'ایمیل یا رمز عبور نامعتبر',

    // Success Messages
    'success.registrationComplete': 'ثبت نام با موفقیت کامل شد!',
    'success.loginSuccess': 'خوش آمدید!',
    'success.emailVerified': 'ایمیل با موفقیت تأیید شد',
    'success.passwordReset': 'رمز عبور با موفقیت بازنشانی شد',
    'success.passwordChanged': 'رمز عبور با موفقیت تغییر کرد',
    'success.profileUpdated': 'پروفایل با موفقیت بروزرسانی شد',
    'success.logoutSuccess': 'با موفقیت خارج شدید',

    // Avatar Creation
    'avatar.title': 'آواتار خود را بسازید',
    'avatar.description': 'آواتار سه‌بعدی خود را برای تجربه IRANVERSE طراحی کنید',
    'avatar.required': 'ساخت آواتار برای ادامه الزامی است',
    'avatar.creating': 'در حال ساخت آواتار شما...',
    'avatar.created': 'آواتار با موفقیت ساخته شد!',
    'avatar.error': 'ساخت آواتار ناموفق',
    'avatar.retry': 'تلاش مجدد',

    // Navigation
    'nav.home': 'خانه',
    'nav.profile': 'پروفایل',
    'nav.settings': 'تنظیمات',
    'nav.help': 'راهنما',
    'nav.about': 'درباره',

    // Deep Links
    'deeplink.emailVerification': 'تأیید ایمیل',
    'deeplink.passwordReset': 'بازنشانی رمز عبور',
    'deeplink.invalidLink': 'لینک نامعتبر یا منقضی شده',

    // Accessibility
    'accessibility.menu': 'منو',
    'accessibility.close': 'بستن',
    'accessibility.back': 'بازگشت',
    'accessibility.next': 'مرحله بعدی',
    'accessibility.toggle': 'تغییر وضعیت',
    'accessibility.expand': 'گسترش',
    'accessibility.collapse': 'جمع کردن',
  },
} as const;

// Export individual language objects for type safety
export const englishMessages = authMessages.english;
export const farsiMessages = authMessages.farsi;

// Export type for message keys (for TypeScript safety)
export type MessageKey = keyof typeof englishMessages;

// Helper function to get message with fallback
export const getMessage = (
  key: MessageKey,
  language: 'english' | 'farsi' = 'english',
  params: Record<string, string | number> = {}
): string => {
  const messages = authMessages[language] || authMessages.english;
  let message = messages[key];
  
  // Fallback to English if key not found in current language
  if (!message && language !== 'english') {
    message = authMessages.english[key];
  }
  
  // If still no message, return the key itself
  if (!message) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  // Replace parameters in the message
  return Object.entries(params).reduce<string>(
    (msg, [paramKey, value]) => msg.replace(`{${paramKey}}`, String(value)),
    message
  );
};

export default authMessages;
