// src/screens/legal/TermsScreen.tsx
// IRANVERSE Terms of Service - Enterprise Legal Documentation
// Multi-language support (English/Farsi) with high-tech UI
// Built for 90M users - Industry-standard legal compliance

import React, { useState, useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// UI Components
import { H1, H2, H3, Body, Caption, PersianH1, PersianH2, PersianBody } from '../../shared/components/ui/Text';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import GradientBackground from '../../shared/components/layout/GradientBackground';
import Header from '../../shared/components/layout/Header';
import { useTheme } from '../../shared/theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Section {
  title: string;
  titleFa: string;
  content: string[];
  contentFa: string[];
}

const termsData: Section[] = [
  {
    title: "1. Acceptance of Terms",
    titleFa: "۱. پذیرش شرایط",
    content: [
      "By accessing or using IRANVERSE platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
      "If you do not agree with any of these terms, you are prohibited from using or accessing this platform.",
      "We reserve the right to update these terms at any time without prior notice."
    ],
    contentFa: [
      "با دسترسی یا استفاده از پلتفرم ایرانورس، شما موافقت می‌کنید که به این شرایط خدمات و تمام قوانین و مقررات قابل اجرا پایبند باشید.",
      "اگر با هر یک از این شرایط موافق نیستید، از استفاده یا دسترسی به این پلتفرم منع می‌شوید.",
      "ما حق به‌روزرسانی این شرایط را در هر زمان بدون اطلاع قبلی محفوظ می‌داریم."
    ]
  },
  {
    title: "2. User Accounts",
    titleFa: "۲. حساب‌های کاربری",
    content: [
      "You are responsible for maintaining the confidentiality of your account and password.",
      "You agree to accept responsibility for all activities that occur under your account.",
      "You must provide accurate, current, and complete information during registration.",
      "IRANVERSE reserves the right to suspend or terminate accounts that violate these terms."
    ],
    contentFa: [
      "شما مسئول حفظ محرمانگی حساب و رمز عبور خود هستید.",
      "شما موافقت می‌کنید که مسئولیت تمام فعالیت‌هایی که تحت حساب شما انجام می‌شود را بپذیرید.",
      "شما باید اطلاعات دقیق، جاری و کامل را در هنگام ثبت‌نام ارائه دهید.",
      "ایرانورس حق تعلیق یا خاتمه حساب‌هایی که این شرایط را نقض می‌کنند، محفوظ می‌دارد."
    ]
  },
  {
    title: "3. User Content",
    titleFa: "۳. محتوای کاربر",
    content: [
      "Users retain ownership of content they create and share on IRANVERSE.",
      "By posting content, you grant IRANVERSE a worldwide, non-exclusive license to use, modify, and display your content.",
      "You are solely responsible for the content you post and must ensure it complies with all applicable laws.",
      "Prohibited content includes but is not limited to: illegal content, hate speech, harassment, spam, and malware."
    ],
    contentFa: [
      "کاربران مالکیت محتوایی که در ایرانورس ایجاد و به اشتراک می‌گذارند را حفظ می‌کنند.",
      "با ارسال محتوا، شما به ایرانورس مجوز جهانی و غیرانحصاری برای استفاده، تغییر و نمایش محتوای خود می‌دهید.",
      "شما تنها مسئول محتوایی که ارسال می‌کنید هستید و باید اطمینان حاصل کنید که با تمام قوانین قابل اجرا مطابقت دارد.",
      "محتوای ممنوع شامل اما نه محدود به: محتوای غیرقانونی، سخنان نفرت‌آمیز، آزار و اذیت، هرزنامه و بدافزار است."
    ]
  },
  {
    title: "4. Privacy and Data Protection",
    titleFa: "۴. حریم خصوصی و حفاظت از داده‌ها",
    content: [
      "Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.",
      "We implement industry-standard security measures to protect your personal data.",
      "You have the right to access, correct, or delete your personal information at any time.",
      "We do not sell or rent your personal information to third parties."
    ],
    contentFa: [
      "حریم خصوصی شما برای ما مهم است. لطفاً سیاست حریم خصوصی ما را برای درک نحوه جمع‌آوری و استفاده از اطلاعات شما مرور کنید.",
      "ما اقدامات امنیتی استاندارد صنعت را برای حفاظت از داده‌های شخصی شما اجرا می‌کنیم.",
      "شما حق دسترسی، تصحیح یا حذف اطلاعات شخصی خود را در هر زمان دارید.",
      "ما اطلاعات شخصی شما را به اشخاص ثالث نمی‌فروشیم یا اجاره نمی‌دهیم."
    ]
  },
  {
    title: "5. Intellectual Property",
    titleFa: "۵. مالکیت معنوی",
    content: [
      "IRANVERSE and its original content, features, and functionality are owned by IRANVERSE Inc. and are protected by international copyright, trademark, and other intellectual property laws.",
      "You may not copy, modify, distribute, sell, or lease any part of our services without written permission.",
      "User-generated content remains the property of the respective users.",
      "IRANVERSE respects the intellectual property rights of others and expects users to do the same."
    ],
    contentFa: [
      "ایرانورس و محتوای اصلی، ویژگی‌ها و عملکرد آن متعلق به شرکت ایرانورس است و توسط قوانین بین‌المللی حق چاپ، علامت تجاری و سایر قوانین مالکیت معنوی محافظت می‌شود.",
      "شما نمی‌توانید بدون اجازه کتبی، هیچ بخشی از خدمات ما را کپی، تغییر، توزیع، فروش یا اجاره دهید.",
      "محتوای تولید شده توسط کاربر، مالکیت کاربران مربوطه باقی می‌ماند.",
      "ایرانورس به حقوق مالکیت معنوی دیگران احترام می‌گذارد و از کاربران انتظار دارد که همین کار را انجام دهند."
    ]
  },
  {
    title: "6. Limitation of Liability",
    titleFa: "۶. محدودیت مسئولیت",
    content: [
      "IRANVERSE is provided on an 'as is' and 'as available' basis without warranties of any kind.",
      "We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.",
      "Our total liability shall not exceed the amount paid by you, if any, for accessing our services.",
      "Some jurisdictions do not allow certain limitations, so these limitations may not apply to you."
    ],
    contentFa: [
      "ایرانورس بر اساس 'همانطور که هست' و 'در صورت دسترسی' بدون هیچ گونه ضمانتی ارائه می‌شود.",
      "ما مسئول هیچ گونه خسارت غیرمستقیم، اتفاقی، خاص، تبعی یا تنبیهی نخواهیم بود.",
      "مسئولیت کل ما از مبلغ پرداخت شده توسط شما، در صورت وجود، برای دسترسی به خدمات ما تجاوز نخواهد کرد.",
      "برخی از حوزه‌های قضایی محدودیت‌های خاصی را مجاز نمی‌دانند، بنابراین این محدودیت‌ها ممکن است برای شما اعمال نشود."
    ]
  },
  {
    title: "7. Termination",
    titleFa: "۷. خاتمه",
    content: [
      "We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms.",
      "Upon termination, your right to use the service will cease immediately.",
      "All provisions which by their nature should survive termination shall survive.",
      "You may terminate your account at any time through your account settings."
    ],
    contentFa: [
      "ما ممکن است حساب شما را فوراً و بدون اطلاع قبلی، برای هر گونه نقض این شرایط، خاتمه یا تعلیق کنیم.",
      "پس از خاتمه، حق شما برای استفاده از خدمات فوراً متوقف خواهد شد.",
      "تمام مفادی که بر اساس ماهیت خود باید پس از خاتمه باقی بمانند، باقی خواهند ماند.",
      "شما می‌توانید حساب خود را در هر زمان از طریق تنظیمات حساب خود خاتمه دهید."
    ]
  },
  {
    title: "8. Governing Law",
    titleFa: "۸. قانون حاکم",
    content: [
      "These Terms shall be governed by and construed in accordance with applicable laws.",
      "Any disputes arising from these Terms shall be resolved through binding arbitration.",
      "You agree to submit to the personal jurisdiction of the courts for resolution of disputes.",
      "These Terms constitute the entire agreement between you and IRANVERSE."
    ],
    contentFa: [
      "این شرایط باید توسط قوانین قابل اجرا اداره و تفسیر شود.",
      "هر گونه اختلاف ناشی از این شرایط از طریق داوری الزام‌آور حل و فصل خواهد شد.",
      "شما موافقت می‌کنید که برای حل و فصل اختلافات به صلاحیت شخصی دادگاه‌ها تسلیم شوید.",
      "این شرایط کل توافق بین شما و ایرانورس را تشکیل می‌دهد."
    ]
  }
];

const TermsScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [language, setLanguage] = useState<'en' | 'fa'>('en');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleLanguageToggle = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'fa' : 'en');
  }, []);

  const handleAcceptTerms = useCallback(() => {
    setAcceptedTerms(true);
    // You can save this acceptance state to AsyncStorage or your backend
    navigation.goBack();
  }, [navigation]);

  const HeaderComponent = language === 'en' ? H1 : PersianH1;
  const SubHeaderComponent = language === 'en' ? H2 : PersianH2;
  const BodyComponent = language === 'en' ? Body : PersianBody;

  return (
    <GradientBackground animated={false}>
      <SafeAreaView style={styles.container}>
        <Header
          title={language === 'en' ? "Terms of Service" : "شرایط خدمات"}
          leftActions={[{
            icon: 'arrow-left' as any,
            onPress: () => navigation.goBack(),
          }]}
          rightActions={[{
            icon: 'globe' as any,
            onPress: handleLanguageToggle,
          }]}
        />

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <HeaderComponent style={styles.title}>
              {language === 'en' ? 'IRANVERSE Terms of Service' : 'شرایط خدمات ایرانورس'}
            </HeaderComponent>
            <Caption style={styles.lastUpdated}>
              {language === 'en' ? 'Last updated: January 2025' : 'آخرین به‌روزرسانی: دی ۱۴۰۳'}
            </Caption>
          </View>

          {termsData.map((section, index) => (
            <Card key={index} style={styles.sectionCard}>
              <SubHeaderComponent style={styles.sectionTitle}>
                {language === 'en' ? section.title : section.titleFa}
              </SubHeaderComponent>
              {(language === 'en' ? section.content : section.contentFa).map((paragraph, pIndex) => (
                <BodyComponent key={pIndex} style={styles.paragraph}>
                  {paragraph}
                </BodyComponent>
              ))}
            </Card>
          ))}

          <View style={styles.acceptContainer}>
            <Button
              variant="primary"
              onPress={handleAcceptTerms}
              fullWidth
              size="large"
              style={styles.acceptButton}
            >
              {language === 'en' ? 'I Accept the Terms' : 'شرایط را می‌پذیرم'}
            </Button>
            <Caption style={styles.acceptNote}>
              {language === 'en' 
                ? 'By clicking accept, you agree to be bound by these terms'
                : 'با کلیک بر روی پذیرش، شما موافقت می‌کنید که به این شرایط پایبند باشید'
              }
            </Caption>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  lastUpdated: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#FFFFFF',
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  acceptContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  acceptButton: {
    marginBottom: 16,
  },
  acceptNote: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default TermsScreen;