import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the API base URL based on the platform and environment
export const getApiBaseUrl = (): string => {
  const baseUrl = Constants.expoConfig?.extra?.API_BASE;
  
  console.log("🔧 API_BASE from config:", baseUrl);
  
  if (baseUrl && baseUrl !== 'API_BASE=http://localhost:5000') {
    return baseUrl;
  }

  // Fallback logic for different platforms
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  } else if (Platform.OS === 'ios') {
    // For iOS physical device, use your computer's IP address
    // You'll need to replace this with your actual IP address
    return 'http://10.0.10.183:5044'; // Using the same IP as Metro
  } else if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2
    // For physical device, use your computer's IP address
    return 'http://10.0.2.2:5044';
  }

  return 'http://localhost:5000';
};

export const API_BASE = getApiBaseUrl();

// Helper function to make API calls with proper error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
