import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import api from '../services/api';

// Web-compatible storage wrapper
const Storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    // Dynamic import for native
    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.deleteItemAsync(key);
  }
};

interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: string;
  country: string;
  language: string;
  is_verified: boolean;
  kyc_status: string;
  account_number: string;
  referral_code: string;
  profile_image?: string;
  two_factor_enabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<any>;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  register: (data: RegisterData) => Promise<any>;
  verifyOtp: (phone: string, otp: string) => Promise<any>;
  verify2FA: (userId: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  phone: string;
  name: string;
  email?: string;
  password: string;
  country: string;
  language?: string;
  referral_code?: string;
  nfc_card_number?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await Storage.getItem('monity_token');
      const storedUser = await Storage.getItem('monity_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    const response = await api.post('/auth/login', { phone, password });
    
    if (response.data.requires_2fa) {
      return { requires_2fa: true, user_id: response.data.user_id };
    }
    
    await saveAuth(response.data.token, response.data.user);
    return response.data;
  };

  const loginWithEmail = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.requires_2fa) {
      return { requires_2fa: true, user_id: response.data.user_id };
    }
    
    await saveAuth(response.data.token, response.data.user);
    return response.data;
  };

  const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    await saveAuth(response.data.token, response.data.user);
    return response.data;
  };

  const verify2FA = async (userId: string, otp: string) => {
    const response = await api.post('/auth/verify-2fa', { user_id: userId, otp });
    await saveAuth(response.data.token, response.data.user);
    return response.data;
  };

  const saveAuth = async (newToken: string, newUser: User) => {
    await Storage.setItem('monity_token', newToken);
    await Storage.setItem('monity_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = async () => {
    await Storage.removeItem('monity_token');
    await Storage.removeItem('monity_user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await Storage.setItem('monity_user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      updateUser(response.data);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        loginWithEmail,
        register,
        verifyOtp,
        verify2FA,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
