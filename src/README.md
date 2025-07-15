# IRANVERSE Mobile App - Source Code Structure

## Directory Structure Overview

### `/core` - Core Infrastructure
- **`/config`** - Application configuration files
- **`/constants`** - Global constants (API endpoints, routes)
- **`/hooks`** - Core hooks (useWebView)
- **`/services`** - Core services (DeepLinkHandler)
- **`/types`** - Global TypeScript types
- **`/utils`** - Utility functions (storage, validation, startup verification)

### `/features` - Feature Modules
Self-contained feature modules with their own components, screens, hooks, and types.

#### `/features/auth` - Authentication Feature
- **`/components`** - AuthHeader, AuthFooter, OAuthButton
- **`/screens`** - Login, SignUp, ForgotPassword, etc.
- **`/hooks`** - useAuth
- **`/contexts`** - AuthContext
- **`/types`** - Authentication types

#### `/features/avatar` - Avatar Management
- **`/contexts`** - AvatarContext
- **`/hooks`** - useAvatar
- **`/types`** - Avatar types
- **`/utils`** - Avatar utilities

#### `/features/onboarding` - User Onboarding
- **`/screens`** - AvatarCreationScreen, OnboardingCompleteScreen

### `/shared` - Shared Resources
Components and utilities used across features.

#### `/shared/components`
- **`/ui`** - Basic UI components (Button, Text, Card, etc.)
- **`/forms`** - Form components (Input, EmailInput, PasswordField, etc.)
- **`/layout`** - Layout components (Header, SafeArea, GradientBackground)

#### `/shared/theme`
- ThemeProvider and theme configuration

### `/screens` - Top-Level Screens
- Main app screens (HomeScreen, FirstScreen, ThreeDSceneScreen)
- **`/test`** - Test and showcase screens

## Import Examples

```typescript
// Import from core
import { API_BASE_URL } from '@/core/constants/api';
import { useWebView } from '@/core/hooks/useWebView';

// Import from features
import { LoginScreen, useAuth } from '@/features/auth';

// Import from shared
import { Button, Text, Card } from '@/shared/components/ui';
import { Input, EmailInput } from '@/shared/components/forms';
import { Header, GradientBackground } from '@/shared/components/layout';
```

## Benefits of This Structure

1. **Feature Isolation** - Each feature is self-contained
2. **Clear Dependencies** - Easy to understand what depends on what
3. **Scalability** - New features can be added without affecting existing code
4. **Maintainability** - Related code is grouped together
5. **Reusability** - Shared components are easily discoverable
6. **Type Safety** - TypeScript types are co-located with their features