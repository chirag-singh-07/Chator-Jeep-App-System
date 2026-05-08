import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurantId?: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserStatus: (status: string) => void;
  uploadBranding: (logoJson: any, bannerJson: any) => Promise<void>;
  uploadLegalDocs: (aadhar: any, pan: any, livePhoto: any, otherDocs: any[]) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post(`/restaurants/login`, { email, password });
          const { accessToken, status, restaurantId } = response.data.data;
          
          await AsyncStorage.setItem("token", accessToken);
          set({ 
            token: accessToken, 
            user: { 
              email, 
              status: status, 
              restaurantId,
              id: '', 
              name: '',
              role: 'KITCHEN'
            }, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error.response?.data?.message || 'Login failed';
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post(`/restaurants/register`, data);
          const { accessToken, status, restaurantId } = response.data.data;
          
          await AsyncStorage.setItem("token", accessToken);
          set({ 
            token: accessToken,
            user: {
              email: data.email,
              status: status,
              restaurantId,
              id: '',
              name: data.ownerName,
              role: 'KITCHEN'
            },
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error.response?.data?.message || error.message || 'Registration failed due to network settings.';
        }
      },

      uploadBranding: async (logo, banner) => {
        set({ isLoading: true });
        console.log('--- STARTING BRANDING UPLOAD ---');
        try {
          const formData = new FormData();
          if (logo) {
            console.log('Adding logo to form data:', logo.uri);
            // @ts-ignore
            formData.append('logo', {
              uri: logo.uri,
              name: 'logo.jpg',
              type: 'image/jpeg',
            });
          }
          if (banner) {
            console.log('Adding banner to form data:', banner.uri);
            // @ts-ignore
            formData.append('banner', {
              uri: banner.uri,
              name: 'banner.jpg',
              type: 'image/jpeg',
            });
          }

          // 1. Upload images
          console.log('Sending request to /uploads/restaurant-brand...');
          const uploadRes = await apiClient.post('/uploads/restaurant-brand', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          console.log('Upload response received:', uploadRes.data);
          const { logo: logoUrls, banner: bannerUrls } = uploadRes.data.data;

          // 2. Update restaurant branding in database
          console.log('Updating restaurant branding in DB...');
          await apiClient.patch('/restaurants/me/branding', {
            logoUrls,
            bannerUrls,
          });

          console.log('Branding update successful!');
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Branding upload FAILED:', error);
          set({ isLoading: false });
          throw error.response?.data?.message || error.message || 'Image upload failed';
        }
      },

      logout: async () => {
        console.log('Logging out user...');
        await AsyncStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      uploadLegalDocs: async (aadhar, pan, livePhoto, otherDocs) => {
        set({ isLoading: true });
        console.log('--- STARTING LEGAL DOCS UPLOAD ---');
        try {
          const formData = new FormData();
          if (aadhar) {
            console.log('Adding Aadhar Card:', aadhar.uri);
            // @ts-ignore
            formData.append('aadharCard', {
              uri: aadhar.uri,
              name: 'aadhar.jpg',
              type: 'image/jpeg',
            });
          }
          if (pan) {
            console.log('Adding PAN Card:', pan.uri);
            // @ts-ignore
            formData.append('panCard', {
              uri: pan.uri,
              name: 'pan.jpg',
              type: 'image/jpeg',
            });
          }
          if (livePhoto) {
            console.log('Adding Live Photo:', livePhoto.uri);
            // @ts-ignore
            formData.append('livePhoto', {
              uri: livePhoto.uri,
              name: 'live-photo.jpg',
              type: 'image/jpeg',
            });
          }
          if (otherDocs && otherDocs.length > 0) {
            console.log(`Adding ${otherDocs.length} supplemental documents`);
            otherDocs.forEach((doc, index) => {
              // @ts-ignore
              formData.append('otherDocs', {
                uri: doc.uri,
                name: `doc-${index}.jpg`,
                type: 'image/jpeg',
              });
            });
          }

          // 1. Upload documents
          console.log('Sending request to /uploads/restaurant-legal...');
          const uploadRes = await apiClient.post('/uploads/restaurant-legal', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          console.log('Documents upload response:', uploadRes.data);
          const { aadharCard, panCard, livePhoto: livePhotoUrls, otherDocs: uploadedOtherDocs } = uploadRes.data.data;

          // 2. Update restaurant legal docs in database
          console.log('Updating legal docs in DB...');
          await apiClient.patch('/restaurants/me/legal-docs', {
            aadharCard,
            panCard,
            livePhoto: livePhotoUrls,
            documents: uploadedOtherDocs,
          });

          console.log('Legal docs update successful!');
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Legal docs upload FAILED:', error);
          set({ isLoading: false });
          throw error.response?.data?.message || error.message || 'Document upload failed';
        }
      },

      updateUserStatus: (status) => {
        set((state) => ({
          user: state.user ? { ...state.user, status } : null
        }));
      }
    }),
    {
      name: 'restaurant-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
