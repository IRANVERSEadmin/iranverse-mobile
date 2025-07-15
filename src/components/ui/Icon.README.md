# IRANVERSE 2D Black & White Icon System

A comprehensive icon system for the IRANVERSE mobile application, featuring 2D black and white SVG icons with intelligent fallback to text-based icons.

## Quick Start

### Basic Usage

```tsx
import Icon from './components/ui/Icon';

// Simple icon usage
<Icon name="search" size="md" />
<Icon name="user" size={24} color="#EC602A" />
```

### Smart Migration

```tsx
import SmartIcon, { SmartSearchIcon } from './components/ui/SmartIcon';

// Automatic migration from text-based icons
<SmartIcon migrationKey="🔍" size="lg" />

// Or use preset components
<SmartSearchIcon size="md" />
```

## Configuration

### Toggle Between Icon Systems

Edit `src/components/ui/IconConfig.ts`:

```typescript
export const ICON_CONFIG = {
  // Set to true for 2D SVG icons, false for text-based icons
  USE_2D_ICONS: true,
  
  // Other settings...
};
```

### Available Icon Names

The system includes 70+ carefully designed icons:

#### Navigation
- `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`
- `chevron-left`, `chevron-right`, `chevron-up`, `chevron-down`
- `home`, `menu`, `close`, `back`

#### Actions
- `search`, `filter`, `sort`, `refresh`, `share`
- `add`, `remove`, `edit`, `delete`, `save`
- `download`, `upload`, `copy`, `paste`

#### Communication
- `mail`, `phone`, `message`, `notification`, `chat`
- `video-call`, `microphone`, `speaker`

#### User & Profile
- `user`, `users`, `profile`, `avatar`, `account`
- `login`, `logout`, `register`, `settings`

#### Status & Feedback
- `check`, `checkmark`, `error`, `warning`, `info`
- `success`, `fail`, `loading`, `star`, `heart`

#### Interface
- `eye`, `eye-off`, `calendar`, `clock`, `location`
- `bookmark`, `tag`, `flag`, `lock`, `unlock`

#### Social & Auth
- `google`, `apple`, `twitter`, `facebook`, `github`

## Icon Sizes

```tsx
// Predefined sizes
<Icon name="search" size="xs" />   {/* 12px */}
<Icon name="search" size="sm" />   {/* 16px */}
<Icon name="search" size="md" />   {/* 20px */}
<Icon name="search" size="lg" />   {/* 24px */}
<Icon name="search" size="xl" />   {/* 32px */}

// Custom size
<Icon name="search" size={48} />
```

## Color System

```tsx
// Theme-aware (automatic black/white based on theme)
<Icon name="search" />

// Custom colors
<Icon name="search" color="#EC602A" />
<Icon name="search" color="#000000" />
<Icon name="search" color="#FFFFFF" />
```

## Component Integration

### Button Icons

```tsx
import { GoogleAuthButton, AppleAuthButton } from './components/ui/Button';

// Already integrated with new icon system
<GoogleAuthButton onPress={handleGoogleAuth} />
<AppleAuthButton onPress={handleAppleAuth} />
```

### Header Icons

```tsx
import { SmartSearchIcon, SmartBackIcon } from './components/ui/SmartIcon';

// Replace existing text-based icons
<SmartBackIcon size="lg" />
<SmartSearchIcon size="md" />
```

### Input Field Icons

```tsx
import { SmartMailIcon, SmartPhoneIcon, SmartEyeIcon } from './components/ui/SmartIcon';

// Form field indicators
<SmartMailIcon size="sm" />
<SmartPhoneIcon size="sm" />
<SmartEyeIcon size="sm" />
```

## Migration Guide

### From Text-Based Icons

Replace existing text/emoji icons:

```tsx
// OLD: Text-based
<Text style={{ fontSize: 20 }}>🔍</Text>

// NEW: Smart migration
<SmartIcon migrationKey="🔍" size="lg" />

// OR: Direct icon usage
<Icon name="search" size="lg" />
```

### Migration Map

The system automatically maps text-based icons:

- `🔍` → `search`
- `←` → `arrow-left`
- `✓` → `check`
- `✕` → `close`
- `📮` → `mail`
- `📧` → `mail`
- `📱` → `phone`
- `👁` → `eye`
- `G` → `google`
- `𝕏` → `twitter`
- `` → `apple`

## Best Practices

### 1. Use SmartIcon for Migration

```tsx
// Good: Automatic fallback and migration
<SmartIcon migrationKey="🔍" size="md" />

// Also good: Direct usage when you know the icon name
<Icon name="search" size="md" />
```

### 2. Consistent Sizing

```tsx
// Use consistent sizes within components
const iconSize = 'md'; // or theme-based size

<SmartSearchIcon size={iconSize} />
<SmartCloseIcon size={iconSize} />
```

### 3. Theme Integration

```tsx
// Let icons adapt to theme automatically
<Icon name="user" /> // Uses theme colors

// Or use theme colors explicitly
const theme = useTheme();
<Icon name="user" color={theme.colors.interactive.text.primary} />
```

### 4. Accessibility

```tsx
// Icons automatically include accessibility labels
<Icon 
  name="search" 
  testID="search-icon"
  // Automatically gets accessibilityLabel="search icon"
/>
```

## Performance

- **Lightweight**: SVG icons are vector-based and scale perfectly
- **Cacheable**: Icons are rendered inline, no external dependencies
- **Theme-aware**: Automatic color adaptation reduces bundle size
- **Fallback**: Graceful degradation to text-based icons when needed

## Customization

### Adding New Icons

1. Add the icon name to `IconName` type in `Icon.tsx`
2. Add the SVG path to `IconPaths` object
3. Optionally create a preset component

```tsx
// Add to IconPaths
'new-icon': <Path d="M..." stroke="currentColor" strokeWidth="2" fill="none" />,

// Create preset component
export const NewIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="new-icon" />
);
```

### Custom Styling

```tsx
<Icon 
  name="search"
  size="lg"
  style={{ 
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    padding: 8 
  }}
  strokeWidth={3}
/>
```

## Troubleshooting

### Icons Not Showing

1. Check if `react-native-svg` is properly installed
2. Verify the icon name exists in `IconPaths`
3. Ensure proper import statements

### Text Icons Still Showing

1. Check `ICON_CONFIG.USE_2D_ICONS` is set to `true`
2. Use `SmartIcon` with `force2D={true}` prop
3. Verify icon migration mapping exists

### Performance Issues

1. Use consistent icon sizes to optimize rendering
2. Consider using preset components for frequently used icons
3. Avoid inline style objects, use StyleSheet.create

## Examples

See `src/components/examples/IconExample.tsx` for comprehensive usage examples and visual demonstrations.