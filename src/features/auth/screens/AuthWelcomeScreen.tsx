import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  Switch,
  Dimensions,
  Platform,
  Pressable,
  TouchableOpacity,
} from 'react-native';

// Core UI Components
import SafeArea from '../../components/ui/SafeArea';
import GradientBackground from '../../components/ui/GradientBackground';
import Header from '../../components/ui/Header';
import Text, { 
  DisplayText,
  H1Text,
  H2Text, 
  H3Text,
  BodyText,
  PersianText, 
  ErrorText, 
  SuccessText 
} from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordField from '../../components/ui/PasswordField';
import EmailInput from '../../components/ui/EmailInput';
import PhoneInput from '../../components/ui/PhoneInput';
import PersianInput from '../../components/ui/PersianInput';
import Card, { GlassCard, ElevatedCard, OutlinedCard } from '../../components/ui/Card';
import Loader, { 
  SpinnerLoader, 
  DotsLoader, 
  QuantumLoader, 
  TeslaLoader 
} from '../../components/ui/Loader';
import { useToast } from '../../components/ui/Toast';
import Logo, { HeroLogo, HeaderLogo } from '../../components/ui/Logo';
import AnimatedLogo from '../../components/ui/AnimatedLogo';
import FieldError from '../../components/ui/FieldError';
import ValidationMessage from '../../components/ui/ValidationMessage';
import { DisplayHeading, SectionHeading } from '../../components/ui/Heading';
import OAuthButton, { GoogleOAuthButton, AppleOAuthButton } from '../../components/auth/OAuthButton';
import KeyboardAvoidingView from '../../components/ui/KeyboardAvoidingView';

// Theme
import { useTheme } from '../../components/theme/ThemeProvider';

// For temporary gradient
import { LinearGradient } from 'expo-linear-gradient';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Debug Component Showcase with Enhanced Features
const DebugShowcase: React.FC = () => {
  // Theme and utilities
  const toast = useToast();
  const theme = useTheme();
  const colors = theme.colors;
  
  // Safety check for theme
  if (!colors) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading theme...</Text>
      </View>
    );
  }

  // State Management
  const [debugMode, setDebugMode] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [componentStates, setComponentStates] = useState({
    buttons: { pressed: '', loading: false, disabled: false },
    inputs: { focused: '', value: '', validation: 'neutral' },
    cards: { selected: '', animated: false },
    loaders: { active: 'spinner', size: 'medium' },
    theme: { mode: 'dark', accent: 'primary' }
  });

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    persian: '',
    search: ''
  });

  // UI State
  const [showAllVariants, setShowAllVariants] = useState(true);
  const [rtlMode, setRtlMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  // Refs
  const scrollRef = useRef<ScrollView>(null);
  const inputRefs = useRef<any[]>([]);

  // Performance tracking
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []);

  // Debug Panel
  const DebugPanel = () => (
    <Card variant="glass" style={styles.debugPanel}>
      <H3Text>Debug Information</H3Text>
      <View style={styles.debugInfo}>
        <Text variant="caption" style={{ marginBottom: 4 }}>Platform: {Platform.OS}</Text>
        <Text variant="caption" style={{ marginBottom: 4 }}>Screen: {SCREEN_WIDTH}x{SCREEN_HEIGHT}</Text>
        <Text variant="caption" style={{ marginBottom: 4 }}>Theme: {componentStates.theme.mode}</Text>
        <Text variant="caption" style={{ marginBottom: 4 }}>Renders: {renderCount}</Text>
        <Text variant="caption">RTL: {rtlMode ? 'Yes' : 'No'}</Text>
      </View>
    </Card>
  );

  // Component State Visualizer
  const StateVisualizer = () => (
    <Card variant="elevated" style={styles.stateCard}>
      <SectionHeading icon={<Text>🔍</Text>}>Component States</SectionHeading>
      <View style={styles.stateGrid}>
        <View style={styles.stateItem}>
          <Text variant="caption" color="secondary">Active Button</Text>
          <Text variant="body">{componentStates.buttons.pressed || 'None'}</Text>
        </View>
        <View style={styles.stateItem}>
          <Text variant="caption" color="secondary">Focused Input</Text>
          <Text variant="body">{componentStates.inputs.focused || 'None'}</Text>
        </View>
        <View style={styles.stateItem}>
          <Text variant="caption" color="secondary">Selected Card</Text>
          <Text variant="body">{componentStates.cards.selected || 'None'}</Text>
        </View>
        <View style={styles.stateItem}>
          <Text variant="caption" color="secondary">Active Loader</Text>
          <Text variant="body">{componentStates.loaders.active}</Text>
        </View>
      </View>
    </Card>
  );

  // Button Test Suite
  const ButtonTestSuite = () => {
    const buttonVariants = ['primary', 'secondary', 'critical', 'success', 'glass', 'grok', 'ghost', 'outlined'];
    const buttonSizes = ['small', 'medium', 'large'];
    
    return (
      <Card variant="glass" style={styles.showcaseCard}>
        <SectionHeading icon={<Text>🎯</Text>} badge="Interactive">
          Button Test Suite
        </SectionHeading>
        
        {/* Temporary: Simple buttons to test theme */}
        <H3Text style={styles.subsectionTitle}>Theme Test</H3Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={{
              backgroundColor: colors?.interactive?.primary || '#007AFF',
              padding: 12,
              borderRadius: 8,
              marginRight: 8
            }}
            onPress={() => toast.showInfo('Primary color works!')}
          >
            <Text style={{ color: '#fff' }}>Primary</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              backgroundColor: colors?.semantic?.success || '#00FF88',
              padding: 12,
              borderRadius: 8,
              marginRight: 8
            }}
            onPress={() => toast.showInfo('Success color works!')}
          >
            <Text style={{ color: '#fff' }}>Success</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              borderWidth: 1,
              borderColor: colors?.interactive?.border || '#333',
              padding: 12,
              borderRadius: 8
            }}
            onPress={() => toast.showInfo('Border color works!')}
          >
            <Text style={{ color: colors?.interactive?.text || '#fff' }}>Border</Text>
          </TouchableOpacity>
        </View>

        {/* Comment out Button components temporarily
        <H3Text style={styles.subsectionTitle}>Size Variations</H3Text>
        <View style={styles.buttonRow}>
          {buttonSizes.map(size => (
            <Button
              key={size}
              variant="primary"
              size={size as any}
              style={{ marginRight: 12 }}
              onPress={() => {
                setComponentStates(prev => ({
                  ...prev,
                  buttons: { ...prev.buttons, pressed: `${size} button` }
                }));
                toast.showInfo(`${size} button pressed`);
              }}
            >
              {size}
            </Button>
          ))}
        </View>

        <H3Text style={styles.subsectionTitle}>All Variants</H3Text>
        <View style={styles.variantGrid}>
          {buttonVariants.map(variant => (
            <Button
              key={variant}
              variant={variant as any}
              style={{ marginRight: 12, marginBottom: 12 }}
              onPress={() => {
                setComponentStates(prev => ({
                  ...prev,
                  buttons: { ...prev.buttons, pressed: variant }
                }));
              }}
              loading={componentStates.buttons.loading && componentStates.buttons.pressed === variant}
              disabled={componentStates.buttons.disabled && componentStates.buttons.pressed === variant}
            >
              {variant}
            </Button>
          ))}
        </View>
        */}

        {/* State Controls */}
        <View style={styles.controlRow}>
          <Switch
            value={componentStates.buttons.loading}
            onValueChange={(val) => setComponentStates(prev => ({
              ...prev,
              buttons: { ...prev.buttons, loading: val }
            }))}
          />
          <Text style={{ marginRight: 12 }}>Loading State</Text>
          <Switch
            value={componentStates.buttons.disabled}
            onValueChange={(val) => setComponentStates(prev => ({
              ...prev,
              buttons: { ...prev.buttons, disabled: val }
            }))}
          />
          <Text>Disabled State</Text>
        </View>
      </Card>
    );
  };

  // Input Test Suite
  const InputTestSuite = () => {
    const inputVariants = ['default', 'filled', 'glass', 'enterprise'];
    
    return (
      <Card variant="elevated" style={styles.showcaseCard}>
        <SectionHeading icon={<Text>⌨️</Text>} badge="Forms">
          Input Test Suite
        </SectionHeading>

        {/* Basic Inputs */}
        <H3Text style={styles.subsectionTitle}>Input Variants</H3Text>
        {inputVariants.map((variant, index) => (
          <Input
            key={variant}
            ref={ref => { inputRefs.current[index] = ref; }}
            label={`${variant} Input`}
            placeholder={`Enter ${variant} text...`}
            variant={variant as any}
            value={formData.username}
            onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
            onFocus={() => setComponentStates(prev => ({
              ...prev,
              inputs: { ...prev.inputs, focused: variant }
            }))}
            leftIcon={<Text>📝</Text>}
            clearable
            rtl={rtlMode}
          />
        ))}

        {/* Specialized Inputs */}
        <H3Text style={styles.subsectionTitle}>Specialized Inputs</H3Text>
        
        <EmailInput
          label="Email Input"
          value={formData.email}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, email: text }))}
          variant="filled"
          error={formData.email !== '' && !formData.email.includes('@') ? 'Invalid email format' : undefined}
        />

        <PhoneInput
          label="Phone Input"
          value={formData.phone}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, phone: text }))}
          variant="glass"
        />

        <PasswordField
          label="Password Field"
          value={formData.password}
          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
          showStrengthIndicator
          showValidationHints
          variant="filled"
          minLength={8}
        />

        {rtlMode && (
          <PersianInput
            label="ورودی فارسی"
            placeholder="متن فارسی وارد کنید..."
            value={formData.persian}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, persian: text }))}
            variant="filled"
          />
        )}
      </Card>
    );
  };

  // Typography Showcase
  const TypographyShowcase = () => (
    <Card variant="glass" style={styles.showcaseCard}>
      <SectionHeading icon={<Text>📖</Text>}>Typography System</SectionHeading>
      
      <View style={styles.typographySection}>
        <DisplayText style={{ marginBottom: 8 }}>Display Text</DisplayText>
        <H1Text style={{ marginBottom: 8 }}>Heading Level 1</H1Text>
        <H2Text style={{ marginBottom: 8 }}>Heading Level 2</H2Text>
        <H3Text style={{ marginBottom: 8 }}>Heading Level 3</H3Text>
        <BodyText style={{ marginBottom: 8 }}>Body text for main content with regular weight</BodyText>
        <Text variant="caption" style={{ marginBottom: 8 }}>Caption text for annotations</Text>
        <Text variant="button" style={{ marginBottom: 8 }}>BUTTON TEXT</Text>
        <Text variant="body" style={{ marginBottom: 8 }}>Label Text</Text>
        
        <View style={styles.divider} />
        
        <SuccessText style={{ marginBottom: 8 }}>Success message with icon</SuccessText>
        <ErrorText style={{ marginBottom: 8 }}>Error message with icon</ErrorText>
        <Text color="warning" style={{ marginBottom: 8 }}>Warning text color</Text>
        <Text color="info">Information text color</Text>
        
        {rtlMode && (
          <>
            <View style={styles.divider} />
            <PersianText variant="display" style={{ marginBottom: 8 }}>متن نمایشی فارسی</PersianText>
            <PersianText variant="h1" style={{ marginBottom: 8 }}>عنوان اصلی فارسی</PersianText>
            <PersianText variant="body">متن بدنه به زبان فارسی برای محتوای اصلی</PersianText>
          </>
        )}
      </View>
    </Card>
  );

  // Loader Showcase
  const LoaderShowcase = () => {
    const loaderTypes = ['spinner', 'dots', 'quantum', 'tesla'];
    const loaderSizes = ['small', 'medium', 'large', 'hero'];
    
    return (
      <Card variant="elevated" style={styles.showcaseCard}>
        <SectionHeading icon={<Text>⏳</Text>}>Loading States</SectionHeading>
        
        <H3Text style={styles.subsectionTitle}>Loader Types</H3Text>
        <View style={styles.loaderGrid}>
          <SpinnerLoader visible={true} size="medium" text="Spinner" />
          <DotsLoader visible={true} size="medium" text="Dots" />
          <QuantumLoader visible={true} size="medium" text="Quantum" />
          <TeslaLoader visible={true} size="medium" text="Tesla" intent="processing" />
        </View>

        <H3Text style={styles.subsectionTitle}>Size Variations</H3Text>
        <View style={styles.loaderSizeGrid}>
          {loaderSizes.map(size => (
            <View key={size} style={styles.loaderItem}>
              <Loader
                visible={true}
                variant={componentStates.loaders.active as any}
                size={size as any}
                text={size}
              />
            </View>
          ))}
        </View>

        {/* Loader Controls */}
        <View style={styles.controlRow}>
          <Text>Active Loader:</Text>
          <View style={styles.loaderButtons}>
            {loaderTypes.map(type => (
              <Pressable
                key={type}
                style={[
                  styles.loaderButton,
                  componentStates.loaders.active === type && styles.loaderButtonActive
                ].filter(Boolean)}
                onPress={() => setComponentStates(prev => ({
                  ...prev,
                  loaders: { ...prev.loaders, active: type }
                }))}
              >
                <Text variant="caption">{type}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>
    );
  };

  // Card Showcase
  const CardShowcase = () => (
    <View style={styles.showcaseSection}>
      <SectionHeading icon={<Text>🎴</Text>}>Card System</SectionHeading>
      
      <View style={styles.cardGrid}>
        <Pressable
          onPress={() => setComponentStates(prev => ({
            ...prev,
            cards: { ...prev.cards, selected: 'glass' }
          }))}
          style={{ flex: 1 }}
        >
          <GlassCard style={{
            ...styles.demoCard,
            ...(componentStates.cards.selected === 'glass' ? styles.selectedCard : {})
          }}>
            <H3Text>Glass Card</H3Text>
            <Text variant="caption">Tap to select</Text>
          </GlassCard>
        </Pressable>

        <Pressable
          onPress={() => setComponentStates(prev => ({
            ...prev,
            cards: { ...prev.cards, selected: 'elevated' }
          }))}
          style={{ flex: 1 }}
        >
          <ElevatedCard style={{
            ...styles.demoCard,
            ...(componentStates.cards.selected === 'elevated' ? styles.selectedCard : {})
          }}>
            <H3Text>Elevated Card</H3Text>
            <Text variant="caption">With shadow</Text>
          </ElevatedCard>
        </Pressable>

        <Pressable
          onPress={() => setComponentStates(prev => ({
            ...prev,
            cards: { ...prev.cards, selected: 'outlined' }
          }))}
          style={{ flex: 1 }}
        >
          <OutlinedCard style={{
            ...styles.demoCard,
            ...(componentStates.cards.selected === 'outlined' ? styles.selectedCard : {})
          }}>
            <H3Text>Outlined Card</H3Text>
            <Text variant="caption">Border style</Text>
          </OutlinedCard>
        </Pressable>
      </View>
    </View>
  );

  // Toast Demo
  const ToastDemo = () => {
    const toastTypes = [
      { type: 'success', message: 'Operation completed successfully!' },
      { type: 'error', message: 'An error occurred. Please try again.' },
      { type: 'warning', message: 'Warning: This action cannot be undone.' },
      { type: 'info', message: 'New update available for download.' },
      { type: 'critical', message: 'Critical security alert!' }
    ];

    return (
      <Card variant="glass" style={styles.showcaseCard}>
        <SectionHeading icon={<Text>🍞</Text>}>Toast Notifications</SectionHeading>
        
        <View style={styles.toastGrid}>
          {toastTypes.map(({ type, message }) => (
            <Button
              key={type}
              variant={type === 'critical' ? 'critical' : 'secondary'}
              size="small"
              style={{ marginRight: 8, marginBottom: 8 }}
              onPress={() => {
                switch(type) {
                  case 'success':
                    toast.showSuccess(message);
                    break;
                  case 'error':
                    toast.showError(message);
                    break;
                  case 'warning':
                    toast.showWarning(message);
                    break;
                  case 'info':
                    toast.showInfo(message);
                    break;
                  case 'critical':
                    toast.showCritical(message);
                    break;
                }
              }}
            >
              {type} Toast
            </Button>
          ))}
        </View>
      </Card>
    );
  };

  // Logo Showcase
  const LogoShowcase = () => (
    <Card variant="elevated" style={styles.showcaseCard}>
      <SectionHeading icon={<Text>🎨</Text>}>Logo System</SectionHeading>
      
      <View style={styles.logoGrid}>
        <View style={styles.logoItem}>
          <Logo size="small" variant="auto" />
          <Text variant="caption">Small</Text>
        </View>
        
        <View style={styles.logoItem}>
          <Logo size="medium" variant="auto" />
          <Text variant="caption">Medium</Text>
        </View>
        
        <View style={styles.logoItem}>
          <Logo size="large" variant="auto" />
          <Text variant="caption">Large</Text>
        </View>
        
        <View style={styles.logoItem}>
          <AnimatedLogo
            size="medium"
            animation="ambient"
            autoStart={true}
            glow
          />
          <Text variant="caption">Animated</Text>
        </View>
        
        <View style={styles.logoItem}>
          <HeroLogo variant="white" />
          <Text variant="caption">Hero</Text>
        </View>
        
        <View style={styles.logoItem}>
          <HeaderLogo />
          <Text variant="caption">Header</Text>
        </View>
      </View>
    </Card>
  );

  // OAuth Showcase
  const OAuthShowcase = () => (
    <Card variant="glass" style={styles.showcaseCard}>
      <SectionHeading icon={<Text>🔐</Text>}>OAuth Integration</SectionHeading>
      
      <View style={styles.oauthSection}>
        <GoogleOAuthButton
          onPress={() => {
            toast.showInfo('Google OAuth initiated');
          }}
          loading={false}
          rtl={rtlMode}
          style={{ marginBottom: 12 }}
        />
        
        <AppleOAuthButton
          onPress={() => {
            toast.showInfo('Apple OAuth initiated');
          }}
          loading={false}
          rtl={rtlMode}
          style={{ marginBottom: 12 }}
        />
        
        <OAuthButton
          provider="google"
          onPress={() => {
            toast.showInfo('GitHub OAuth initiated');
          }}
          rtl={rtlMode}
          style={{ marginBottom: 12 }}
        />
        
        <OAuthButton
          provider="apple"
          onPress={() => {
            toast.showInfo('Apple OAuth initiated');
          }}
          rtl={rtlMode}
        />
      </View>
    </Card>
  );

  // Validation Showcase
  const ValidationShowcase = () => (
    <Card variant="outlined" style={styles.showcaseCard}>
      <SectionHeading icon={<Text>✅</Text>}>Validation System</SectionHeading>
      
      <View style={styles.validationSection}>
        <FieldError
          visible={true}
          variant="error"
          message="This field is required"
          style={{ marginBottom: 12 }}
        />
        
        <FieldError
          visible={true}
          variant="warning"
          message="Password strength is weak"
          style={{ marginBottom: 12 }}
        />
        
        <FieldError
          visible={true}
          variant="critical"
          message="Security breach detected!"
          style={{ marginBottom: 12 }}
        />
        
        <ValidationMessage
          state="valid"
          message="Email format is correct"
          showIcon={true}
          style={{ marginBottom: 12 }}
        />
        
        <ValidationMessage
          state="invalid"
          message="Invalid phone number format"
          showIcon={true}
          style={{ marginBottom: 12 }}
        />
        
        <ValidationMessage
          state="validating"
          message="Checking availability..."
          showIcon={true}
        />
      </View>
    </Card>
  );

  // Control Panel
  const ControlPanel = () => (
    <Card variant="glass" style={styles.controlPanel}>
      <SectionHeading icon={<Text>⚙️</Text>}>Control Panel</SectionHeading>
      
      <View style={styles.controls}>
        <View style={styles.controlItem}>
          <Text>Debug Mode</Text>
          <Switch value={debugMode} onValueChange={setDebugMode} />
        </View>
        
        <View style={styles.controlItem}>
          <Text>RTL Mode</Text>
          <Switch value={rtlMode} onValueChange={setRtlMode} />
        </View>
        
        <View style={styles.controlItem}>
          <Text>High Contrast</Text>
          <Switch value={highContrast} onValueChange={setHighContrast} />
        </View>
        
        <View style={styles.controlItem}>
          <Text>Show All Variants</Text>
          <Switch value={showAllVariants} onValueChange={setShowAllVariants} />
        </View>
        
        <View style={styles.controlItem}>
          <Text>Performance Mode</Text>
          <Switch value={performanceMode} onValueChange={setPerformanceMode} />
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <Button
          variant="critical"
          size="small"
          style={{ marginRight: 8, marginBottom: 8 }}
          onPress={() => {
            setFormData({
              username: '',
              email: '',
              phone: '',
              password: '',
              persian: '',
              search: ''
            });
            toast.showInfo('Form reset');
          }}
        >
          Reset Form
        </Button>
        
        <Button
          variant="primary"
          size="small"
          style={{ marginRight: 8, marginBottom: 8 }}
          onPress={() => {
            Alert.alert('Debug Info', JSON.stringify(componentStates, null, 2));
          }}
        >
          Export State
        </Button>
        
        <Button
          variant="primary"
          size="small"
          style={{ marginBottom: 8 }}
          onPress={() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
        >
          Scroll Top
        </Button>
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Temporary visible gradient for testing */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460', '#16213e', '#1a1a2e']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Original GradientBackground (commented out for now)
      <GradientBackground
        animated={!performanceMode}
        depthLayers={true}
        particleField={!performanceMode}
        luminanceShifts={true}
        performanceMode={performanceMode ? 'battery' : 'high'}
        debugVisualization={debugMode}
      >
      */}
      
      <SafeArea>
        <Header
          variant="glass"
          title="UI Debug Showcase"
          subtitle={`v2.0 - ${Platform.OS}`}
          rightActions={[
            {
              icon: <Text>{debugMode ? '🐛' : '🎨'}</Text>,
              onPress: () => setDebugMode(!debugMode),
              accessibilityLabel: "Toggle debug mode"
            }
          ]}
        />

        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.contentContainer,
              rtlMode && styles.rtlContent
            ].filter(Boolean)}
            showsVerticalScrollIndicator={false}
          >
            {/* Debug Information */}
            {debugMode && (
              <>
                <DebugPanel />
                <StateVisualizer />
              </>
            )}

            {/* Component Showcases */}
            <DisplayHeading centered decoration="gradient">
              IRANVERSE Component Library
            </DisplayHeading>

            <TypographyShowcase />
            <ButtonTestSuite />
            <InputTestSuite />
            <LoaderShowcase />
            <CardShowcase />
            <LogoShowcase />
            <ToastDemo />
            <OAuthShowcase />
            <ValidationShowcase />
            <ControlPanel />

            {/* Bottom Padding */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeArea>
      {/* End of commented GradientBackground
      </GradientBackground>
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  rtlContent: {
    flexDirection: 'row-reverse'
  },
  showcaseCard: {
    marginBottom: 20,
    padding: 20,
  },
  showcaseSection: {
    marginBottom: 20,
  },
  debugPanel: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  debugInfo: {
    marginTop: 8,
  },
  stateCard: {
    marginBottom: 16,
    padding: 16,
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  stateItem: {
    flex: 1,
    minWidth: 140,
    marginRight: 16,
    marginBottom: 16,
  },
  subsectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  variantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  typographySection: {
    // Typography container
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  loaderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 100,
    marginBottom: 20,
  },
  loaderSizeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    minHeight: 120,
    marginBottom: 20,
  },
  loaderItem: {
    alignItems: 'center',
  },
  loaderButtons: {
    flexDirection: 'row',
  },
  loaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  loaderButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardGrid: {
    flexDirection: 'row',
    marginTop: 12,
  },
  demoCard: {
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  toastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  logoItem: {
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  oauthSection: {
    marginTop: 12,
  },
  validationSection: {
    marginTop: 12,
  },
  controlPanel: {
    marginTop: 20,
    marginBottom: 40,
    padding: 20,
  },
  controls: {
    marginTop: 12,
  },
  controlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    flexWrap: 'wrap',
  },
});

// Wrapper component to ensure theme is loaded
const AuthWelcomeScreen: React.FC = () => {
  // Force theme initialization
  const theme = useTheme();
  const colors = theme.colors;
  
  // Don't render until theme is ready
  if (!colors || !colors.interactive || !colors.interactive.border) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff' }}>Initializing theme...</Text>
      </View>
    );
  }
  
  return <DebugShowcase />;
};

export default AuthWelcomeScreen;