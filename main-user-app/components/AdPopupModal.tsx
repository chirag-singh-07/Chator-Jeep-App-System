import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, Text, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import api from '../lib/api';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

interface AdPopup {
  _id: string;
  title: string;
  imageUrl: string;
  type: string;
  couponCode?: string;
}

export function AdPopupModal() {
  const [visible, setVisible] = useState(false);
  const [popup, setPopup] = useState<AdPopup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePopup();
  }, []);

  const fetchActivePopup = async () => {
    try {
      // The backend automatically determines if it's a new user based on their token if they are logged in.
      // If not logged in, they are treated as a new user.
      const res = await api.get('/ad-popup/active');
      if (res.data?.data) {
        setPopup(res.data.data);
        setVisible(true);
      }
    } catch (error) {
      console.log('Failed to fetch ad popup:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = async () => {
    if (popup?.couponCode) {
      await Clipboard.setStringAsync(popup.couponCode);
      Toast.show({
        type: 'success',
        text1: 'Coupon Copied!',
        text2: 'Use this code at checkout.',
      });
      setVisible(false); // Close after copying so they can use the app
    }
  };

  if (!visible || !popup) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <BlurView intensity={30} tint="dark" style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setVisible(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <Image 
              source={{ uri: popup.imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
            />
            
            {/* White overlay info box if coupon code is present */}
            {popup.couponCode && (
              <View style={styles.infoBox}>
                <Text style={styles.title}>{popup.title}</Text>
                
                <View style={styles.couponContainer}>
                  <Text style={styles.couponLabel}>USE CODE</Text>
                  <Text style={styles.couponCode}>{popup.couponCode}</Text>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={copyCouponCode}>
                  <Text style={styles.actionButtonText}>Copy Code & Order Now</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {!popup.couponCode && (
              <View style={styles.infoBoxNoCoupon}>
                 <Text style={styles.titleNoCoupon}>{popup.title}</Text>
                 <TouchableOpacity style={styles.actionButton} onPress={() => setVisible(false)}>
                  <Text style={styles.actionButtonText}>Explore Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
    marginBottom: 12,
  },
  content: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  image: {
    width: '100%',
    height: 300,
  },
  infoBox: {
    padding: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Black',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  couponContainer: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  couponLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#666',
    letterSpacing: 2,
    marginBottom: 4,
  },
  couponCode: {
    fontSize: 24,
    fontFamily: 'Inter-Black',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#000',
    fontFamily: 'Inter-Black',
    fontSize: 16,
  },
  infoBoxNoCoupon: {
    padding: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  titleNoCoupon: {
    fontSize: 20,
    fontFamily: 'Inter-Black',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  }
});
