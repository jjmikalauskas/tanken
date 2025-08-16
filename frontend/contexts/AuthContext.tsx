import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  checkBiometricSupport: () => Promise<boolean>;
  authenticateWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Load biometric preference
    loadBiometricPreference();

    return unsubscribe;
  }, []);

  const loadBiometricPreference = async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometricEnabled');
      setBiometricEnabledState(enabled === 'true');
    } catch (error) {
      console.error('Failed to load biometric preference:', error);
    }
  };

  const setBiometricEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('biometricEnabled', enabled.toString());
      setBiometricEnabledState(enabled);
    } catch (error) {
      console.error('Failed to save biometric preference:', error);
    }
  };

  const checkBiometricSupport = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometric',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    biometricEnabled,
    setBiometricEnabled,
    checkBiometricSupport,
    authenticateWithBiometric,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};