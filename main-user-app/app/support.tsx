import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const FAQS = [
  {
    q: "How do I track my order?",
    a: "You can track your order in real-time from the 'Orders' tab by clicking on the active order."
  },
  {
    q: "What is the cancellation policy?",
    a: "Orders can be cancelled before the restaurant accepts them for a full refund."
  },
  {
    q: "How do I use a promo code?",
    a: "Enter your code in the 'Apply Promo' field on the checkout screen before placing your order."
  },
  {
    q: "How can I contact the restaurant?",
    a: "You can call the restaurant directly from the order tracking page once your order is confirmed."
  }
];

export default function SupportScreen() {
  const router = useRouter();

  const contactWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+919876543210&text=Hello Support!');
  };

  const contactCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  const contactEmail = () => {
    Linking.openURL('mailto:support@chatorijeep.com');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 45 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
               <Ionicons name="headset" size={50} color={Colors.light.primary} />
            </View>
            <Text style={styles.heroTitle}>How can we help you today?</Text>
            <Text style={styles.heroSub}>Our support team is available 24/7 to assist you with any queries or issues.</Text>
          </View>

          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactCard} onPress={contactWhatsApp}>
               <View style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="logo-whatsapp" size={24} color="#2E7D32" />
               </View>
               <Text style={styles.contactLabel}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={contactCall}>
               <View style={[styles.contactIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="call" size={24} color="#1565C0" />
               </View>
               <Text style={styles.contactLabel}>Call Us</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={contactEmail}>
               <View style={[styles.contactIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="mail" size={24} color="#EF6C00" />
               </View>
               <Text style={styles.contactLabel}>Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {FAQS.map((faq, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(i * 100)} style={styles.faqCard}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={styles.faqA}>{faq.a}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={styles.policyLinks}>
            <TouchableOpacity style={styles.policyBtn}>
               <Text style={styles.policyText}>Privacy Policy</Text>
               <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.policyBtn}>
               <Text style={styles.policyText}>Terms of Service</Text>
               <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: '#FFFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  contactCard: {
    width: (width - 70) / 3,
    backgroundColor: '#F9FAFB',
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contactIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  faqSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  faqQ: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  faqA: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontWeight: '500',
  },
  policyLinks: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  policyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  policyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
});
