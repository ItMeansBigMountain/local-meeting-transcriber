import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Platform-aware storage utility that uses SecureStore on native platforms
 * and localStorage on web platforms
 */
export class Storage {
  static async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Failed to store item in localStorage:', error);
        throw error;
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('Failed to store item in SecureStore:', error);
        throw error;
      }
    }
  }

  static async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Failed to retrieve item from localStorage:', error);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('Failed to retrieve item from SecureStore:', error);
        return null;
      }
    }
  }

  static async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove item from localStorage:', error);
        throw error;
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('Failed to remove item from SecureStore:', error);
        throw error;
      }
    }
  }

  // Alias for removeItem to match SecureStore API
  static async deleteItemAsync(key: string): Promise<void> {
    return this.removeItem(key);
  }
}
