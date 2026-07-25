import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_CONFIG } from './config';

const isWeb = Platform.OS === 'web';

function getSecure(key: string): Promise<string | null> {
  if (isWeb) {
    return Promise.resolve(localStorage.getItem(key));
  }
  return SecureStore.getItemAsync(key);
}

function setSecure(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(key, value);
}

function removeSecure(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return Promise.resolve();
  }
  return SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return getSecure(AUTH_CONFIG.tokenKeys.accessToken);
  },

  async setAccessToken(token: string): Promise<void> {
    return setSecure(AUTH_CONFIG.tokenKeys.accessToken, token);
  },

  async removeAccessToken(): Promise<void> {
    return removeSecure(AUTH_CONFIG.tokenKeys.accessToken);
  },

  async getRefreshToken(): Promise<string | null> {
    return getSecure(AUTH_CONFIG.tokenKeys.refreshToken);
  },

  async setRefreshToken(token: string): Promise<void> {
    return setSecure(AUTH_CONFIG.tokenKeys.refreshToken, token);
  },

  async removeRefreshToken(): Promise<void> {
    return removeSecure(AUTH_CONFIG.tokenKeys.refreshToken);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      removeSecure(AUTH_CONFIG.tokenKeys.accessToken),
      removeSecure(AUTH_CONFIG.tokenKeys.refreshToken),
      removeSecure(AUTH_CONFIG.tokenKeys.user),
    ]);
  },

  async getOnboardingComplete(): Promise<boolean> {
    const val = await AsyncStorage.getItem(AUTH_CONFIG.storageKeys.onboardingComplete);
    return val === 'true';
  },

  async setOnboardingComplete(value: boolean): Promise<void> {
    await AsyncStorage.setItem(AUTH_CONFIG.storageKeys.onboardingComplete, String(value));
  },

  async getLastEmail(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_CONFIG.storageKeys.lastEmail);
  },

  async setLastEmail(email: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_CONFIG.storageKeys.lastEmail, email);
  },
};
