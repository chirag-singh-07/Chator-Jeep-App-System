import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import messaging from '@react-native-firebase/messaging';

export default function PermissionsModal() {
  const requestPermissions = async () => {
    try {
      // 1. Request Location
      await Location.requestForegroundPermissionsAsync();

      // 2. Request Notifications
      await messaging().requestPermission();
    } catch (e) {
      console.warn('Error requesting permissions:', e);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestPermissions();
    }
  }, []);

  return null; // The UI has been removed as requested
}
