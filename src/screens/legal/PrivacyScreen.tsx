// src/screens/legal/PrivacyScreen.tsx
// IRANVERSE Privacy Policy - Enterprise Data Protection Documentation
// Multi-language support (English/Farsi) with high-tech UI
// Built for 90M users - GDPR/CCPA compliant privacy standards

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

interface PrivacySection {
  title: string;
  titleFa: string;
  content: string[];
  contentFa: string[];
  icon?: string;
}

const privacyData: PrivacySection[] = [
  {
    title: "1. Information We Collect",
    titleFa: "۱. اطلاعاتی که جمع‌آوری می‌کنیم",
    icon: "database",
    content: [
      "Account Information: Username, email address, phone number, and profile details you provide during registration.",
      "Usage Data: Information about how you interact with IRANVERSE, including features used, content viewed, and time spent.",
      "Device Information: Device type, operating system, unique device identifiers, and network information.",
      "Location Data: With your permission, we may collect location data to provide location-based features.",
      "Communications: Messages, feedback, and other communications you send through our platform."
    ],
    contentFa: [
      "اطلاعات حساب: نام کاربری، آدرس ایمیل، شماره تلفن و جزئیات نمایه که در هنگام ثبت‌نام ارائه می‌دهید.",
      "داده‌های استفاده: اطلاعات در مورد نحوه تعامل شما با ایرانورس، شامل ویژگی‌های استفاده شده، محتوای مشاهده شده و زمان صرف شده.",
      "اطلاعات دستگاه: نوع دستگاه، سیستم عامل، شناسه‌های منحصر به فرد دستگاه و اطلاعات شبکه.",
      "داده‌های مکان: با اجازه شما، ممکن است داده‌های مکان را برای ارائه ویژگی‌های مبتنی بر مکان جمع‌آوری کنیم.",
      "ارتباطات: پیام‌ها، بازخورد و سایر ارتباطاتی که از طریق پلتفرم ما ارسال می‌کنید."
    ]
  },
  {
    title: "2. How We Use Your Information",
    titleFa: "۲. نحوه استفاده از اطلاعات شما",
    icon: "settings",
    content: [
      "Service Provision: To create and maintain your account, provide customer support, and deliver requested services.",
      "Personalization: To customize your experience and provide content recommendations based on your preferences.",
      "Communication: To send important updates, security alerts, and promotional messages (with your consent).",
      "Analytics: To understand usage patterns, improve our services, and develop new features.",
      "Security: To detect and prevent fraud, abuse, and other harmful activities.",
      "Legal Compliance: To comply with legal obligations and enforce our terms of service."
    ],
    contentFa: [
      "ارائه خدمات: برای ایجاد و نگهداری حساب شما، ارائه پشتیبانی مشتری و ارائه خدمات درخواستی.",
      "شخصی‌سازی: برای سفارشی‌سازی تجربه شما و ارائه توصیه‌های محتوا بر اساس ترجیحات شما.",
      "ارتباطات: برای ارسال به‌روزرسانی‌های مهم، هشدارهای امنیتی و پیام‌های تبلیغاتی (با رضایت شما).",
      "تجزیه و تحلیل: برای درک الگوهای استفاده، بهبود خدمات ما و توسعه ویژگی‌های جدید.",
      "امنیت: برای تشخیص و جلوگیری از تقلب، سوء استفاده و سایر فعالیت‌های مضر.",
      "انطباق قانونی: برای رعایت تعهدات قانونی و اجرای شرایط خدمات ما."
    ]
  },
  {
    title: "3. Information Sharing",
    titleFa: "۳. اشتراک‌گذاری اطلاعات",
    icon: "share",
    content: [
      "We do not sell, rent, or trade your personal information to third parties.",
      "Service Providers: We may share information with trusted third-party service providers who help us operate our platform.",
      "Legal Requirements: We may disclose information when required by law or to protect our rights and safety.",
      "Business Transfers: In case of merger, acquisition, or sale of assets, user information may be transferred.",
      "Aggregated Data: We may share anonymized, aggregated data that cannot identify individual users.",
      "With Your Consent: We will share personal information with third parties when we have your explicit consent."
    ],
    contentFa: [
      "ما اطلاعات شخصی شما را به اشخاص ثالث نمی‌فروشیم، اجاره نمی‌دهیم یا مبادله نمی‌کنیم.",
      "ارائه‌دهندگان خدمات: ممکن است اطلاعات را با ارائه‌دهندگان خدمات شخص ثالث مورد اعتماد که به ما در اداره پلتفرم کمک می‌کنند، به اشتراک بگذاریم.",
      "الزامات قانونی: ممکن است اطلاعات را در صورت الزام قانونی یا برای حفاظت از حقوق و ایمنی خود افشا کنیم.",
      "انتقال تجاری: در صورت ادغام، تملک یا فروش دارایی‌ها، اطلاعات کاربر ممکن است منتقل شود.",
      "داده‌های تجمیع شده: ممکن است داده‌های ناشناس و تجمیع شده را که نمی‌تواند کاربران فردی را شناسایی کند، به اشتراک بگذاریم.",
      "با رضایت شما: اطلاعات شخصی را با اشخاص ثالث در صورت داشتن رضایت صریح شما به اشتراک خواهیم گذاشت."
    ]
  },
  {
    title: "4. Data Security",
    titleFa: "۴. امنیت داده‌ها",
    icon: "lock",
    content: [
      "We implement industry-standard security measures to protect your personal information.",
      "Encryption: All data transmissions are encrypted using SSL/TLS protocols.",
      "Access Controls: We limit access to personal information to authorized personnel only.",
      "Regular Audits: We conduct regular security audits and vulnerability assessments.",
      "Incident Response: We have procedures in place to respond to data security incidents.",
      "However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
    ],
    contentFa: [
      "ما اقدامات امنیتی استاندارد صنعت را برای حفاظت از اطلاعات شخصی شما اجرا می‌کنیم.",
      "رمزگذاری: تمام انتقال داده‌ها با استفاده از پروتکل‌های SSL/TLS رمزگذاری می‌شوند.",
      "کنترل‌های دسترسی: ما دسترسی به اطلاعات شخصی را فقط به پرسنل مجاز محدود می‌کنیم.",
      "ممیزی‌های منظم: ما ممیزی‌های امنیتی منظم و ارزیابی‌های آسیب‌پذیری انجام می‌دهیم.",
      "واکنش به حوادث: ما رویه‌هایی برای پاسخ به حوادث امنیتی داده‌ها داریم.",
      "با این حال، هیچ روش انتقال از طریق اینترنت 100٪ ایمن نیست و ما نمی‌توانیم امنیت مطلق را تضمین کنیم."
    ]
  },
  {
    title: "5. Your Rights and Choices",
    titleFa: "۵. حقوق و انتخاب‌های شما",
    icon: "user-check",
    content: [
      "Access: You can request access to the personal information we hold about you.",
      "Correction: You can update or correct your personal information through your account settings.",
      "Deletion: You can request deletion of your account and associated personal data.",
      "Portability: You can request a copy of your data in a machine-readable format.",
      "Opt-out: You can opt-out of promotional communications at any time.",
      "Cookie Preferences: You can manage your cookie preferences through your browser settings."
    ],
    contentFa: [
      "دسترسی: می‌توانید درخواست دسترسی به اطلاعات شخصی که در مورد شما نگهداری می‌کنیم را داشته باشید.",
      "تصحیح: می‌توانید اطلاعات شخصی خود را از طریق تنظیمات حساب خود به‌روزرسانی یا تصحیح کنید.",
      "حذف: می‌توانید درخواست حذف حساب خود و داده‌های شخصی مرتبط را داشته باشید.",
      "قابلیت حمل: می‌توانید درخواست کپی از داده‌های خود در قالب قابل خواندن توسط ماشین داشته باشید.",
      "انصراف: می‌توانید در هر زمان از ارتباطات تبلیغاتی انصراف دهید.",
      "ترجیحات کوکی: می‌توانید ترجیحات کوکی خود را از طریق تنظیمات مرورگر خود مدیریت کنید."
    ]
  },
  {
    title: "6. Children's Privacy",
    titleFa: "۶. حریم خصوصی کودکان",
    icon: "shield",
    content: [
      "IRANVERSE is not intended for users under the age of 13 (or applicable age in your jurisdiction).",
      "We do not knowingly collect personal information from children under 13.",
      "If we discover that we have collected information from a child under 13, we will delete it immediately.",
      "Parents or guardians who believe their child has provided us with personal information can contact us for removal."
    ],
    contentFa: [
      "ایرانورس برای کاربران زیر 13 سال (یا سن قابل اجرا در حوزه قضایی شما) در نظر گرفته نشده است.",
      "ما آگاهانه اطلاعات شخصی از کودکان زیر 13 سال جمع‌آوری نمی‌کنیم.",
      "اگر متوجه شویم که اطلاعاتی از کودک زیر 13 سال جمع‌آوری کرده‌ایم، فوراً آن را حذف خواهیم کرد.",
      "والدین یا سرپرستانی که معتقدند فرزندشان اطلاعات شخصی را به ما ارائه داده است، می‌توانند برای حذف با ما تماس بگیرند."
    ]
  },
  {
    title: "7. International Data Transfers",
    titleFa: "۷. انتقال بین‌المللی داده‌ها",
    icon: "globe",
    content: [
      "Your information may be transferred to and processed in countries other than your own.",
      "We ensure appropriate safeguards are in place for international data transfers.",
      "We comply with applicable data protection laws regarding cross-border transfers.",
      "By using IRANVERSE, you consent to the transfer of your information to other countries."
    ],
    contentFa: [
      "اطلاعات شما ممکن است به کشورهایی غیر از کشور خودتان منتقل و در آنجا پردازش شود.",
      "ما اطمینان می‌دهیم که تدابیر حفاظتی مناسب برای انتقال بین‌المللی داده‌ها وجود دارد.",
      "ما از قوانین حفاظت از داده‌های قابل اجرا در مورد انتقال‌های فرامرزی پیروی می‌کنیم.",
      "با استفاده از ایرانورس، شما به انتقال اطلاعات خود به کشورهای دیگر رضایت می‌دهید."
    ]
  },
  {
    title: "8. Changes to Privacy Policy",
    titleFa: "۸. تغییرات در سیاست حریم خصوصی",
    icon: "refresh",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.",
      "We will notify you of material changes through the app or via email.",
      "The updated policy will be effective immediately upon posting.",
      "Your continued use of IRANVERSE after changes constitutes acceptance of the updated policy.",
      "We encourage you to review this policy periodically."
    ],
    contentFa: [
      "ممکن است این سیاست حریم خصوصی را از زمانی به زمان دیگر به‌روزرسانی کنیم تا تغییرات در شیوه‌ها یا الزامات قانونی ما را منعکس کند.",
      "ما شما را از تغییرات مهم از طریق برنامه یا ایمیل مطلع خواهیم کرد.",
      "سیاست به‌روزرسانی شده بلافاصله پس از ارسال مؤثر خواهد بود.",
      "ادامه استفاده شما از ایرانورس پس از تغییرات به منزله پذیرش سیاست به‌روزرسانی شده است.",
      "ما شما را تشویق می‌کنیم که این سیاست را به صورت دوره‌ای مرور کنید."
    ]
  },
  {
    title: "9. Contact Information",
    titleFa: "۹. اطلاعات تماس",
    icon: "mail",
    content: [
      "If you have questions or concerns about this Privacy Policy, please contact us:",
      "Email: privacy@iranverse.com",
      "Data Protection Officer: dpo@iranverse.com",
      "Address: IRANVERSE Inc., Privacy Department",
      "We aim to respond to all privacy inquiries within 30 days."
    ],
    contentFa: [
      "اگر سؤال یا نگرانی در مورد این سیاست حریم خصوصی دارید، لطفاً با ما تماس بگیرید:",
      "ایمیل: privacy@iranverse.com",
      "افسر حفاظت از داده‌ها: dpo@iranverse.com",
      "آدرس: شرکت ایرانورس، بخش حریم خصوصی",
      "ما هدف داریم به تمام پرس‌وجوهای حریم خصوصی ظرف 30 روز پاسخ دهیم."
    ]
  }
];

const PrivacyScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [language, setLanguage] = useState<'en' | 'fa'>('en');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleLanguageToggle = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'fa' : 'en');
  }, []);

  const handleAcceptPrivacy = useCallback(() => {
    setAcceptedPrivacy(true);
    navigation.goBack();
  }, [navigation]);

  const HeaderComponent = language === 'en' ? H1 : PersianH1;
  const SubHeaderComponent = language === 'en' ? H2 : PersianH2;
  const BodyComponent = language === 'en' ? Body : PersianBody;

  return (
    <GradientBackground animated={false}>
      <SafeAreaView style={styles.container}>
        <Header
          title={language === 'en' ? "Privacy Policy" : "سیاست حریم خصوصی"}
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
              {language === 'en' ? 'IRANVERSE Privacy Policy' : 'سیاست حریم خصوصی ایرانورس'}
            </HeaderComponent>
            <Caption style={styles.lastUpdated}>
              {language === 'en' ? 'Last updated: January 2025' : 'آخرین به‌روزرسانی: دی ۱۴۰۳'}
            </Caption>
          </View>

          <View style={styles.introCard}>
            <BodyComponent style={styles.introText}>
              {language === 'en' 
                ? 'At IRANVERSE, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.'
                : 'در ایرانورس، ما متعهد به حفاظت از حریم خصوصی شما و تضمین امنیت اطلاعات شخصی شما هستیم. این سیاست حریم خصوصی توضیح می‌دهد که چگونه داده‌های شما را جمع‌آوری، استفاده و محافظت می‌کنیم.'
              }
            </BodyComponent>
          </View>

          {privacyData.map((section, index) => (
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
              onPress={handleAcceptPrivacy}
              fullWidth
              size="large"
              style={styles.acceptButton}
            >
              {language === 'en' ? 'I Understand' : 'متوجه شدم'}
            </Button>
            <Caption style={styles.acceptNote}>
              {language === 'en' 
                ? 'By using IRANVERSE, you acknowledge that you have read and understood this Privacy Policy'
                : 'با استفاده از ایرانورس، شما تأیید می‌کنید که این سیاست حریم خصوصی را خوانده و درک کرده‌اید'
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
  introCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(236, 96, 42, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 96, 42, 0.3)',
  },
  introText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
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
    paddingHorizontal: 20,
  },
});

export default PrivacyScreen;