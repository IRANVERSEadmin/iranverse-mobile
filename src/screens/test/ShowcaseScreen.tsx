// src/screens/ShowcaseScreen.tsx
// IRANVERSE Component Showcase - Ultimate UI Component Gallery
// Demonstrates ALL UI components, variations, and theme capabilities
// Built for 90M users - Complete component showcase with live examples

import React, { useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

// Import all UI components
import AnimatedLogo from '../../shared/components/ui/AnimatedLogo';
import Button, { 
  GrokAuthButton, 
  ButtonRef,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  OutlineButton,
  GlassButton,
  CriticalButton,
  XAuthButton,
  GoogleAuthButton,
  AppleAuthButton,
  IranverseAuthButton
} from '../../shared/components/ui/Button';
import Card, { InteractiveCard, GlassCard, GrokDarkCard } from '../../shared/components/ui/Card';
import EmailInput from '../../shared/components/forms/EmailInput';
import FieldError from '../../shared/components/forms/FieldError';
import GradientBackground from '../../shared/components/layout/GradientBackground';
import Header, { TabHeader } from '../../shared/components/layout/Header';
import Heading from '../../shared/components/ui/Heading';
import Input from '../../shared/components/forms/Input';
import KeyboardAvoidingView from '../../shared/components/layout/KeyboardAvoidingView';
import Loader from '../../shared/components/ui/Loader';
import Logo from '../../shared/components/ui/Logo';
import LogoWatermark from '../../shared/components/ui/LogoWatermark';
import PasswordField from '../../shared/components/forms/PasswordField';
import PersianInput from '../../shared/components/forms/PersianInput';
import PhoneInput from '../../shared/components/forms/PhoneInput';
import SafeArea from '../../shared/components/layout/SafeArea';
import Text, { H1, H2, H3, Body, Caption, PersianText, ErrorText, SuccessText, Link } from '../../shared/components/ui/Text';
import { ToastProvider, useToast } from '../../shared/components/ui/Toast';
import ValidationMessage from '../../shared/components/forms/ValidationMessage';
import SmartIcon, { SmartSearchIcon, SmartGoogleIcon, SmartAppleIcon, SmartTwitterIcon } from '../../shared/components/ui/SmartIcon';
import GrokButton from '../../shared/components/ui/GrokButton';

// Import auth components
import AuthFooter from '../../features/auth/components/AuthFooter';
import AuthHeader, { BrandedAuthHeader } from '../../features/auth/components/AuthHeader';
import OAuthButton, { GoogleOAuthButton, AppleOAuthButton } from '../../features/auth/components/OAuthButton';

// Import theme
import { ThemeProvider, useTheme } from '../../shared/theme/ThemeProvider';
// Import error boundary
import ErrorBoundary from '../../shared/components/ErrorBoundary';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========================================================================================
// COMPONENT CATEGORIES
// ========================================================================================

const COMPONENT_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid', count: 25 },
  { id: 'buttons', label: 'Buttons', icon: 'click', count: 12 },
  { id: 'inputs', label: 'Inputs', icon: 'edit', count: 6 },
  { id: 'cards', label: 'Cards', icon: 'copy', count: 4 },
  { id: 'text', label: 'Typography', icon: 'text', count: 10 },
  { id: 'auth', label: 'Auth', icon: 'lock', count: 8 },
  { id: 'feedback', label: 'Feedback', icon: 'message', count: 6 },
  { id: 'layout', label: 'Layout', icon: 'square', count: 4 },
  { id: 'branding', label: 'Branding', icon: 'star', count: 3 },
];

// ========================================================================================
// SECTION COMPONENT
// ========================================================================================

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  category?: string;
}

const Section: React.FC<SectionProps> = ({ 
  title, 
  description, 
  children, 
  variant = 'default',
  category = 'all'
}) => {
  const theme = useTheme();
  
  const renderContainer = () => {
    const content = (
      <>
        <H2 style={styles.sectionTitle}>{title}</H2>
        {description && (
          <Body style={styles.sectionDescription}>{description}</Body>
        )}
        <View style={styles.sectionContent}>{children}</View>
      </>
    );
    
    switch (variant) {
      case 'elevated':
        return <Card style={styles.section}>{content}</Card>;
      case 'glass':
        return <GlassCard style={styles.section}>{content}</GlassCard>;
      default:
        return <View style={[styles.section, styles.defaultSection]}>{content}</View>;
    }
  };
  
  return renderContainer();
};

// ========================================================================================
// SHOWCASE CONTENT COMPONENT
// ========================================================================================

const ShowcaseContent: React.FC = () => {
  const theme = useTheme();
  const { show: showToast } = useToast();
  
  // Navigation state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Component states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [persianText, setPersianText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');
  const [refreshing, setRefreshing] = useState(false);
  
  // Refs
  const buttonRef = useRef<ButtonRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Handlers
  const handleButtonPress = useCallback((variant: string) => {
    showToast({
      message: `${variant} button pressed`,
      type: 'success',
      duration: 2000,
    } as any);
  }, [showToast]);
  
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast({
        message: 'Showcase refreshed',
        type: 'info',
      } as any);
    }, 2000);
  }, [showToast]);
  
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);
  
  // Filter sections based on category
  const shouldShowSection = useCallback((sectionCategory: string) => {
    return activeCategory === 'all' || activeCategory === sectionCategory;
  }, [activeCategory]);
  
  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.accent.primary}
        />
      }
    >
      {/* Hero Section */}
      <Section title="IRANVERSE UI Components" description="Complete component library showcase">
        <AnimatedLogo size={120} />
        <Body style={styles.heroText}>
          Enterprise-grade components built for 90M users
        </Body>
      </Section>
      
      {/* Category Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {COMPONENT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryChange(category.id)}
            style={[
              styles.categoryChip,
              activeCategory === category.id && styles.categoryChipActive
            ]}
          ><SmartIcon 
              name={category.icon as any} 
              size={16} 
              color={activeCategory === category.id ? '#FFFFFF' : theme.colors.interactive.text.secondary}
            /><Body style={[
              styles.categoryLabel,
              activeCategory === category.id && styles.categoryLabelActive
            ] as any}>
              {category.label}
            </Body><View style={[
              styles.categoryBadge,
              activeCategory === category.id && styles.categoryBadgeActive
            ]}>
              <Caption style={styles.categoryCount}>{category.count}</Caption>
            </View></TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* 1. BUTTON COMPONENTS */}
      {shouldShowSection('buttons') && (
        <Section 
          title="Button Components" 
          description="All button variants with Grok-inspired design" 
          variant="elevated"
          category="buttons"
        >
          {/* GROK Auth Buttons */}
          <H3 style={styles.subsectionTitle}>GROK Authentication Buttons</H3>
          
          <XAuthButton
            onPress={() => handleButtonPress('Continue with X')}
            fullWidth
            style={styles.itemSpacing}
          >
            Continue with X
          </XAuthButton>
          
          <GoogleAuthButton
            onPress={() => handleButtonPress('Continue with Google')}
            fullWidth
            style={styles.itemSpacing}
          >
            Continue with Google
          </GoogleAuthButton>
          
          <AppleAuthButton
            onPress={() => handleButtonPress('Continue with Apple')}
            fullWidth
            style={styles.itemSpacing}
          >
            Continue with Apple
          </AppleAuthButton>
          
          <Button
            variant="grok-auth"
            onPress={() => handleButtonPress('Continue with Email')}
            fullWidth
            style={styles.itemSpacing}
          >
            Continue with Email
          </Button>
          
          {/* Standard Button Variants */}
          <H3 style={styles.subsectionTitle}>Button Variants</H3>
          
          <PrimaryButton
            onPress={() => handleButtonPress('Primary')}
            fullWidth
            style={styles.itemSpacing}
          >
            Primary Button (Black)
          </PrimaryButton>
          
          <SecondaryButton
            onPress={() => handleButtonPress('Secondary')}
            fullWidth
            style={styles.itemSpacing}
          >
            Secondary Button (Gray)
          </SecondaryButton>
          
          <GhostButton
            onPress={() => handleButtonPress('Ghost')}
            fullWidth
            style={styles.itemSpacing}
          >
            Ghost Button
          </GhostButton>
          
          <OutlineButton
            onPress={() => handleButtonPress('Outline')}
            fullWidth
            style={styles.itemSpacing}
          >
            Outline Button
          </OutlineButton>
          
          <GlassButton
            onPress={() => handleButtonPress('Glass')}
            fullWidth
            style={styles.itemSpacing}
          >
            Glass Button
          </GlassButton>
          
          <CriticalButton
            onPress={() => handleButtonPress('Critical')}
            fullWidth
            style={styles.itemSpacing}
          >
            Critical Button
          </CriticalButton>
          
          {/* Standalone GROK Button */}
          <GrokButton
            onPress={() => handleButtonPress('Standalone GROK')}
            fullWidth
            style={styles.itemSpacing}
          >
            Standalone GROK Button
          </GrokButton>
          
          {/* Size Variations */}
          <H3 style={styles.subsectionTitle}>Button Sizes</H3>
          <View style={styles.row}>
            <Button size="small" style={styles.buttonInRow}>Small</Button>
            <Button size="medium" style={styles.buttonInRow}>Medium</Button>
            <Button size="large" style={styles.buttonInRow}>Large</Button>
            <Button size="xlarge" style={styles.buttonInRow}>XLarge</Button>
          </View>
          
          {/* Button States */}
          <H3 style={styles.subsectionTitle}>Button States & Features</H3>
          
          <Button 
            loading
            loadingText="Processing..."
            fullWidth
            style={styles.itemSpacing}
          >
            Loading Button
          </Button>
          
          <Button 
            disabled
            fullWidth
            style={styles.itemSpacing}
          >
            Disabled Button
          </Button>
          
          <Button 
            shimmerEffect
            fullWidth
            style={styles.itemSpacing}
          >
            Button with Shimmer Effect
          </Button>
          
          <Button 
            glowEffect
            fullWidth
            style={styles.itemSpacing}
          >
            Button with Glow Effect
          </Button>
          
          {/* Icon Buttons */}
          <H3 style={styles.subsectionTitle}>Icon Buttons</H3>
          
          <Button 
            leftIcon={<SmartIcon name={'rocket' as any} size={20} color="#FFFFFF" />}
            fullWidth
            style={styles.itemSpacing}
          >
            Left Icon Button
          </Button>
          
          <Button 
            rightIcon={<SmartIcon name={'arrow-right' as any} size={20} color="#FFFFFF" />}
            fullWidth
            style={styles.itemSpacing}
          >
            Right Icon Button
          </Button>
          
          <View style={styles.row}>
            <Button 
              iconOnly
              leftIcon={<SmartIcon name={'settings' as any} size={20} color="#FFFFFF" />}
              style={styles.iconButton}
            >
              {''}
            </Button>
            <Button 
              iconOnly
              leftIcon={<SmartIcon name={'bell' as any} size={20} color="#FFFFFF" />}
              style={styles.iconButton}
            >
              {''}
            </Button>
            <Button 
              iconOnly
              leftIcon={<SmartIcon name={'user' as any} size={20} color="#FFFFFF" />}
              style={styles.iconButton}
            >
              {''}
            </Button>
            <Button 
              iconOnly
              leftIcon={<SmartIcon name={'search' as any} size={20} color="#FFFFFF" />}
              style={styles.iconButton}
            >
              {''}
            </Button>
          </View>
          
          {/* Button with Analytics */}
          <Button
            fullWidth
            style={styles.itemSpacing}
            analytics={{
              category: 'showcase',
              action: 'button_click',
              label: 'analytics_demo'
            }}
            onPress={() => {
              handleButtonPress('Analytics Button');
              console.log('Analytics tracked!');
            }}
          >
            Button with Analytics Tracking
          </Button>
          
          {/* Button with Ref */}
          <Button
            ref={buttonRef}
            fullWidth
            style={styles.itemSpacing}
            onPress={() => {
              handleButtonPress('Ref Button');
              console.log('Button state:', buttonRef.current?.getState());
            }}
          >
            Button with Ref (Check Console)
          </Button>
        </Section>
      )}
      
      {/* 2. INPUT COMPONENTS */}
      {shouldShowSection('inputs') && (
        <Section 
          title="Input Components" 
          description="Form inputs with validation and special features"
          variant="elevated"
          category="inputs"
        >
          <Input
            placeholder="Enter text here"
            value={inputValue}
            onChangeText={setInputValue}
          />
          
          <EmailInput
            label="Email Input"
            value={email}
            onChangeText={setEmail}
            required
            error={email && !email.includes('@') ? 'Invalid email format' : undefined}
          />
          
          <PhoneInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            countryCode="+98"
          />
          
          <PasswordField
            label="Password Field"
            value={password}
            onChangeText={setPassword}
            strengthMeter
            showRequirements
            generatePassword
          />
          
          <PersianInput
            label="Persian Input"
            value={persianText}
            onChangeText={setPersianText}
            placeholder="متن فارسی را وارد کنید"
            rtl
          />
          
          <Input
            label="Error State"
            value=""
            error="This field has an error"
            onChangeText={() => {}}
          />
          
          <Input
            label="Success State"
            value="Valid input"
            success="Input is valid"
            onChangeText={() => {}}
          />
          
          <Input
            label="Disabled Input"
            value="Cannot edit"
            disabled
            onChangeText={() => {}}
          />
          
          <Input
            label="Loading Input"
            value=""
            loading
            onChangeText={() => {}}
          />
          
          <Input
            label="Multiline Input"
            value=""
            multiline
            numberOfLines={4}
            placeholder="Enter multiple lines of text..."
            onChangeText={() => {}}
          />
        </Section>
      )}
      
      {/* 3. CARD COMPONENTS */}
      {shouldShowSection('cards') && (
        <Section 
          title="Card Components" 
          description="Card variations for content presentation"
          category="cards"
        >
          <Card style={styles.itemSpacing}>
            <H3>Standard Card</H3>
            <Body>Basic card with shadow and border radius</Body>
          </Card>
          
          <InteractiveCard 
            onPress={() => showToast({ message: 'Interactive card pressed' } as any)}
            style={styles.itemSpacing}
          >
            <H3>Interactive Card</H3>
            <Body>Tap me for interaction</Body>
          </InteractiveCard>
          
          <GlassCard style={styles.itemSpacing}>
            <H3 style={{ color: '#FFFFFF' }}>Glass Card</H3>
            <Body style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Glassmorphic card with blur effect
            </Body>
          </GlassCard>
          
          <GrokDarkCard style={styles.itemSpacing}>
            <H3 style={{ color: '#FFFFFF' }}>GROK Dark Card</H3>
            <Body style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Ultra-dark card for GROK aesthetic
            </Body>
          </GrokDarkCard>
          
          {/* Card with Complex Content */}
          <Card style={styles.itemSpacing}>
            <View style={styles.cardHeader}>
              <SmartIcon name={'package' as any} size={24} color={theme.colors.accent.primary} />
              <H3 style={{ marginLeft: 8 }}>Complex Card</H3>
            </View>
            <Body style={{ marginVertical: 12 }}>
              Cards can contain any content including buttons, images, and more.
            </Body>
            <View style={styles.row}>
              <Button size="small" variant="secondary" style={styles.buttonInRow}>
                Action 1
              </Button>
              <Button size="small" style={styles.buttonInRow}>
                Action 2
              </Button>
            </View>
          </Card>
        </Section>
      )}
      
      {/* 4. TYPOGRAPHY */}
      {shouldShowSection('text') && (
        <Section 
          title="Typography" 
          description="Text components and styles"
          variant="glass"
          category="text"
        >
          <H1 style={styles.itemSpacing}>Heading 1 - Hero Text</H1>
          <H2 style={styles.itemSpacing}>Heading 2 - Section Title</H2>
          <H3 style={styles.itemSpacing}>Heading 3 - Subsection</H3>
          
          <Body style={styles.itemSpacing}>
            Body text for regular content. This is the default text style used throughout the application.
          </Body>
          
          <Caption style={styles.itemSpacing}>
            Caption text for small details and metadata
          </Caption>
          
          <Link 
            onPress={() => Alert.alert('Link', 'Link pressed!')}
            style={styles.itemSpacing}
          >
            Clickable Link Text
          </Link>
          
          <ErrorText style={styles.itemSpacing}>
            Error text for validation messages
          </ErrorText>
          
          <SuccessText style={styles.itemSpacing}>
            Success text for positive feedback
          </SuccessText>
          
          <PersianText style={styles.itemSpacing}>
            متن فارسی با قلم و تنظیمات مناسب
          </PersianText>
          
          <Body style={styles.itemSpacing}>
            Text with <Text style={{ fontWeight: 'bold' }}>bold</Text>, 
            <Text style={{ fontStyle: 'italic' }}> italic</Text>, and 
            <Text style={{ textDecorationLine: 'underline' }}> underlined</Text> styles.
          </Body>
        </Section>
      )}
      
      {/* 5. AUTH COMPONENTS */}
      {shouldShowSection('auth') && (
        <Section 
          title="Authentication Components" 
          description="Pre-built auth UI components"
          variant="elevated"
          category="auth"
        >
          <AuthHeader 
            title="Welcome Back"
            subtitle="Sign in to continue"
          />
          
          <BrandedAuthHeader
            title="IRANVERSE"
            subtitle="Enter the metaverse"
          />
          
          <View style={styles.authSection}>
            <GoogleOAuthButton
              onPress={() => handleButtonPress('OAuth Google')}
              style={styles.itemSpacing}
            />
            
            <AppleOAuthButton
              onPress={() => handleButtonPress('OAuth Apple')}
              style={styles.itemSpacing}
            />
            
            <OAuthButton
              provider="google"
              onPress={() => handleButtonPress('OAuth Custom')}
              style={styles.itemSpacing}
            />
          </View>
          
          <AuthFooter
            onLinkPress={() => Alert.alert('Navigation', 'Go to Sign Up')}
          />
          
          <AuthFooter
            variant="compact"
            onLinkPress={() => Alert.alert('Navigation', 'Navigate')}
          />
        </Section>
      )}
      
      {/* 6. FEEDBACK COMPONENTS */}
      {shouldShowSection('feedback') && (
        <Section 
          title="Feedback Components" 
          description="User feedback and validation"
          category="feedback"
        >
          <ValidationMessage
            type="error"
            message="This is an error message"
            style={styles.itemSpacing}
          />
          
          <ValidationMessage
            type="success"
            message="Operation completed successfully"
            style={styles.itemSpacing}
          />
          
          <ValidationMessage
            type="warning"
            message="Please review before continuing"
            style={styles.itemSpacing}
          />
          
          <ValidationMessage
            type="info"
            message="Additional information for the user"
            style={styles.itemSpacing}
          />
          
          <FieldError
            message="Field validation error"
            style={styles.itemSpacing}
          />
          
          <Button
            onPress={() => showToast({
              message: 'Toast notification example',
              type: 'success',
              duration: 3000,
            } as any)}
            fullWidth
            style={styles.itemSpacing}
          >
            Show Toast Notification
          </Button>
          
          <Button
            variant="secondary"
            onPress={() => showToast({
              message: 'Error toast example',
              type: 'error',
              action: {
                label: 'Retry',
                onPress: () => Alert.alert('Action', 'Retry pressed'),
              },
            } as any)}
            fullWidth
            style={styles.itemSpacing}
          >
            Show Error Toast with Action
          </Button>
        </Section>
      )}
      
      {/* 7. LOADERS */}
      {shouldShowSection('feedback') && (
        <Section 
          title="Loading States" 
          description="Various loading indicators"
          variant="elevated"
          category="feedback"
        >
          <View style={styles.loaderGrid}>
            <View style={styles.loaderItem}>
              <Loader size="small" />
              <Caption style={{ marginTop: 8 }}>Small</Caption>
            </View>
            
            <View style={styles.loaderItem}>
              <Loader size="medium" />
              <Caption style={{ marginTop: 8 }}>Medium</Caption>
            </View>
            
            <View style={styles.loaderItem}>
              <Loader size="large" />
              <Caption style={{ marginTop: 8 }}>Large</Caption>
            </View>
            
            <View style={styles.loaderItem}>
              <Loader />
              <Caption style={{ marginTop: 8 }}>Default</Caption>
            </View>
          </View>
          
          <Loader 
            text="Loading content..." 
            fullScreen={false}
            style={styles.itemSpacing}
          />
        </Section>
      )}
      
      {/* 8. HEADERS */}
      {shouldShowSection('layout') && (
        <Section 
          title="Header Components" 
          description="Navigation and app headers"
          category="layout"
        >
          <Header
            title="Standard Header"
            subtitle="With subtitle"
            leftActions={[{
              icon: 'arrow-left' as any,
              onPress: () => Alert.alert('Navigation', 'Back pressed'),
            }]}
            rightActions={[{
              icon: 'settings' as any,
              onPress: () => Alert.alert('Action', 'Settings pressed'),
            }]}
          />
          
          <View style={{ height: 16 }} />
          
          <Header
            title="Search Header"
            subtitle="Example search functionality"
            search={{
              placeholder: 'Search...',
              value: searchQuery,
              onChangeText: setSearchQuery,
              onSubmit: () => Alert.alert('Search', `Searching for: ${searchQuery}`),
            }}
          />
          
          <View style={{ height: 16 }} />
          
          <TabHeader
            tabs={[
              { id: 'tab1', label: 'Tab 1' },
              { id: 'tab2', label: 'Tab 2' },
              { id: 'tab3', label: 'Tab 3' },
            ]}
            activeTab={activeTab}
            onTabPress={setActiveTab}
          />
        </Section>
      )}
      
      {/* 9. BRANDING */}
      {shouldShowSection('branding') && (
        <Section 
          title="Branding Components" 
          description="Logo and brand elements"
          variant="glass"
          category="branding"
        >
          <View style={styles.brandingGrid}>
            <View style={styles.brandingItem}>
              <Logo size={60} />
              <Caption style={{ marginTop: 8 }}>Color Logo</Caption>
            </View>
            
            <View style={styles.brandingItem}>
              <Logo size={60} variant="white" />
              <Caption style={{ marginTop: 8 }}>White Logo</Caption>
            </View>
            
            <View style={styles.brandingItem}>
              <Logo size={60} variant="black" />
              <Caption style={{ marginTop: 8 }}>Black Logo</Caption>
            </View>
          </View>
          
          <View style={styles.watermarkContainer}>
            <LogoWatermark />
            <Body style={styles.watermarkText}>
              Logo watermark for backgrounds
            </Body>
          </View>
          
          <AnimatedLogo size={100} style={{ alignSelf: 'center', marginTop: 20 }} />
        </Section>
      )}
      
      {/* 10. LAYOUT HELPERS */}
      {shouldShowSection('layout') && (
        <Section 
          title="Layout Components" 
          description="Layout utilities and containers"
          category="layout"
        >
          <Card style={styles.itemSpacing}>
            <H3>SafeArea Component</H3>
            <Body>Automatically handles device safe areas</Body>
          </Card>
          
          <Card style={styles.itemSpacing}>
            <H3>KeyboardAvoidingView</H3>
            <Body>Prevents keyboard from covering inputs</Body>
          </Card>
          
          <Card style={styles.itemSpacing}>
            <H3>GradientBackground</H3>
            <Body>Beautiful animated gradient backgrounds</Body>
            <Caption style={{ marginTop: 8 }}>
              Currently visible behind all components
            </Caption>
          </Card>
        </Section>
      )}
      
      {/* 11. ICONS SHOWCASE */}
      {shouldShowSection('all') && (
        <Section 
          title="Icon System" 
          description="SmartIcon component with all available icons"
          variant="elevated"
        >
          <View style={styles.iconGrid}>
            {['home', 'user', 'settings', 'search', 'heart', 'star', 'bell', 
              'mail', 'lock', 'eye', 'edit', 'trash', 'plus', 'minus', 
              'check', 'x', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
              'chevron-left', 'chevron-right', 'menu', 'grid', 'list', 'filter',
              'camera', 'image', 'video', 'mic', 'volume', 'play', 'pause', 'stop'].map((icon) => (
              <View key={icon} style={styles.iconItem}>
                <SmartIcon name={icon as any} size={24} color={theme.colors.interactive.text.primary} />
                <Caption style={styles.iconLabel}>{icon}</Caption>
              </View>
            ))}
          </View>
        </Section>
      )}
      
      {/* 12. THEME COLORS */}
      {shouldShowSection('all') && (
        <Section 
          title="Theme Colors" 
          description="Color palette from ThemeProvider"
        >
          <View style={styles.colorGrid}>
            <View style={styles.colorCategory}>
              <H3 style={styles.colorCategoryTitle}>Foundation</H3>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.foundation.black }]}>
                  <Caption style={styles.colorLabel}>Black</Caption>
                </View>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.foundation.white }]}>
                  <Caption style={[styles.colorLabel, { color: '#000' }]}>White</Caption>
                </View>
              </View>
            </View>
            
            <View style={styles.colorCategory}>
              <H3 style={styles.colorCategoryTitle}>Accent</H3>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent.primary }]}>
                  <Caption style={styles.colorLabel}>Primary</Caption>
                </View>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent.secondary }]}>
                  <Caption style={styles.colorLabel}>Secondary</Caption>
                </View>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent.success }]}>
                  <Caption style={styles.colorLabel}>Success</Caption>
                </View>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent.warning }]}>
                  <Caption style={styles.colorLabel}>Warning</Caption>
                </View>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent.critical }]}>
                  <Caption style={styles.colorLabel}>Critical</Caption>
                </View>
              </View>
            </View>
            
            <View style={styles.colorCategory}>
              <H3 style={styles.colorCategoryTitle}>Surface</H3>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.interactive.surface }]}>
                  <Caption style={styles.colorLabel}>Surface</Caption>
                </View>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.glass.subtle }]}>
                  <Caption style={styles.colorLabel}>Glass Subtle</Caption>
                </View>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.glass.strong }]}>
                  <Caption style={styles.colorLabel}>Glass Strong</Caption>
                </View>
              </View>
            </View>
          </View>
        </Section>
      )}
      
      {/* 10. AUTH WELCOME SCREEN */}
      {shouldShowSection('auth') && (
        <View style={{ marginHorizontal: -16, marginTop: 40 }}>
          <View style={{ height: SCREEN_HEIGHT }}>
            <GradientBackground animated={true}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                {/* Logo */}
                <AnimatedLogo size={120} glow={true} />
                
                {/* Title */}
                <H1 style={{ color: '#FFFFFF', marginTop: 32, marginBottom: 8, textAlign: 'center' }}>
                  Welcome to IRANVERSE
                </H1>
                
                {/* Subtitle */}
                <Body style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: 48, textAlign: 'center' }}>
                  Experience the future of digital identity
                </Body>
                
                {/* Auth Buttons */}
                <View style={{ width: '100%', maxWidth: 320 }}>
                  <GrokAuthButton 
                    provider="x"
                    onPress={() => showToast({ message: 'Continue with X', type: 'info' } as any)}
                    fullWidth
                    style={{ marginBottom: 16 }}
                    providerIcon={<SmartTwitterIcon size={20} color="#FFFFFF" />}
                  >
                    Continue with X
                  </GrokAuthButton>
                  
                  <GrokAuthButton 
                    provider="google"
                    onPress={() => showToast({ message: 'Continue with Google', type: 'info' } as any)}
                    fullWidth
                    style={{ marginBottom: 16 }}
                    providerIcon={<SmartGoogleIcon size={20} color="#FFFFFF" />}
                  >
                    Continue with Google
                  </GrokAuthButton>
                  
                  <GrokAuthButton 
                    provider="apple"
                    onPress={() => showToast({ message: 'Continue with Apple', type: 'info' } as any)}
                    fullWidth
                    style={{ marginBottom: 16 }}
                    providerIcon={<SmartAppleIcon size={20} color="#FFFFFF" />}
                  >
                    Continue with Apple
                  </GrokAuthButton>
                  
                  <View style={{ marginVertical: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginHorizontal: 16 }}>OR</Text>
                      <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                    </View>
                  </View>
                  
                  <Button
                    variant="primary"
                    onPress={() => showToast({ message: 'Sign in with Email', type: 'info' } as any)}
                    fullWidth
                    style={{ marginBottom: 16 }}
                  >
                    Sign in with Email
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onPress={() => showToast({ message: 'Create Account', type: 'info' } as any)}
                    fullWidth
                  >
                    Create Account
                  </Button>
                </View>
                
                {/* Footer */}
                <View style={{ position: 'absolute', bottom: 40, alignItems: 'center' }}>
                  <AuthFooter variant="compact" />
                </View>
              </View>
            </GradientBackground>
          </View>
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.footer}>
        <AnimatedLogo size={60} />
        <H3 style={styles.footerTitle}>IRANVERSE UI Kit</H3>
        <Body style={styles.footerText}>
          Built with React Native + TypeScript
        </Body>
        <Caption style={styles.footerVersion}>
          Version 1.0.0 - Grok-inspired Design System
        </Caption>
      </View>
    </ScrollView>
  );
};

// ========================================================================================
// MAIN SHOWCASE SCREEN
// ========================================================================================

const ShowcaseScreen: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <SafeAreaProvider>
            <GradientBackground animated particleField>
              <SafeArea edges={['top', 'bottom']}>
                <View style={styles.container}>
                  <ShowcaseContent />
                </View>
              </SafeArea>
            </GradientBackground>
          </SafeAreaProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// ========================================================================================
// STYLES
// ========================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  
  // Sections
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
  },
  defaultSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#FFFFFF',
  },
  sectionDescription: {
    marginBottom: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sectionContent: {
    gap: 12,
  },
  
  // Category Navigation
  categoryScroll: {
    maxHeight: 50,
    marginVertical: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  categoryBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryCount: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  
  // Common
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 8,
    flexWrap: 'wrap',
  },
  itemSpacing: {
    marginBottom: 12,
  },
  subsectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    color: '#FFFFFF',
  },
  
  // Buttons
  buttonInRow: {
    flex: 1,
    marginHorizontal: 4,
  },
  iconButton: {
    width: 56,
    paddingHorizontal: 0,
  },
  
  // Cards
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Loaders
  loaderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
  },
  loaderItem: {
    alignItems: 'center',
    width: '30%',
    padding: 10,
  },
  
  // Icons
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 32 - 64) / 5,
  },
  iconLabel: {
    marginTop: 4,
    fontSize: 10,
    textAlign: 'center',
  },
  
  // Colors
  colorGrid: {
    gap: 20,
  },
  colorCategory: {
    gap: 12,
  },
  colorCategoryTitle: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 80,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  colorLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Branding
  brandingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  brandingItem: {
    alignItems: 'center',
  },
  watermarkContainer: {
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  watermarkText: {
    color: '#FFFFFF',
    zIndex: 1,
  },
  
  // Auth
  authSection: {
    marginVertical: 20,
  },
  
  // Hero
  heroText: {
    textAlign: 'center',
    marginTop: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerTitle: {
    marginTop: 16,
    color: '#FFFFFF',
  },
  footerText: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  footerVersion: {
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default ShowcaseScreen;