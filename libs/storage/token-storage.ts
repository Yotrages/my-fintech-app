import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'refresh_token';


export const tokenStorage = {
  setToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  deleteToken: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error deleting token:', error);
      throw error;
    }
  },

  hasToken: async (): Promise<boolean> => {
    const token = await tokenStorage.getToken();
    return !!token;
  },

  async clearToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export const asyncTokenStorage = {
  setToken: async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  getToken: async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  deleteToken: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  hasToken: async () => {
    const token = await asyncTokenStorage.getToken();
    return !!token;
  }
};