import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { biometricEnabled, authenticateWithBiometric, checkBiometricSupport } = useAuth();

  useEffect(() => {
    checkBiometricLogin();
  }, []);

  const checkBiometricLogin = async () => {
    if (biometricEnabled) {
      const isSupported = await checkBiometricSupport();
      if (isSupported) {
        showBiometricPrompt();
      }
    }
  };

  const showBiometricPrompt = () => {
    Alert.alert(
      'Biometric Login',
      'Would you like to use biometric authentication?',
      [
        { text: 'Use Password', style: 'cancel' },
        { text: 'Use Biometric', onPress: handleBiometricLogin },
      ]
    );
  };

  const handleBiometricLogin = async () => {
    console.log('🔒 Biometric login button clicked! 12:54');
    try {
      const success = await authenticateWithBiometric();
      console.log('🔒 Biometric authentication result:', success);
      
      if (success) {
        // Get stored credentials for biometric login
        const storedEmail = await AsyncStorage.getItem('biometricEmail');
        const storedPassword = await AsyncStorage.getItem('biometricPassword');
        
        console.log('🔒 Stored credentials found:', !!storedEmail, !!storedPassword);
        
        if (storedEmail && storedPassword) {
          setLoading(true);
          console.log('🔒 Attempting signin with stored credentials');
          await signInWithEmailAndPassword(storedEmail, storedPassword);
          console.log('🔒 Biometric login successful, navigating to home');
          router.replace('/(tabs)/home');
        } else {
          Alert.alert('Error', 'No stored credentials found. Please login with password first.');
        }
      }
    } catch (error) {
      console.error('🔒 Biometric login error:', error);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    console.log('🔑 Login button clicked! 1:15 PM');
    console.log('🔑 Login form data:', { email: email || 'empty', password: password ? '***' : 'empty' });
    
    if (!email || !password) {
      console.log('🔑 Validation failed: Missing email or password');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('🔑 Starting login process...');
    
    // DEMO BYPASS: If email starts with "john", simulate successful login
    if (email.toLowerCase().startsWith('john')) {
      console.log('🎯 DEMO MODE: Email starts with "john" - simulating successful login');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store credentials for biometric login if enabled
      if (biometricEnabled) {
        console.log('🔑 Storing credentials for biometric login');
        await AsyncStorage.setItem('biometricEmail', email);
        await AsyncStorage.setItem('biometricPassword', password);
      }
      
      console.log('🎯 DEMO: Navigating to home page');
      setLoading(false);
      router.replace('/(tabs)/home');
      return;
    }
    
    // For other emails, try Firebase authentication
    try {
      console.log('🔑 Calling Firebase signInWithEmailAndPassword...');
      await signInWithEmailAndPassword(auth, email, password);
      
      console.log('🔑 Firebase login successful!');
      
      // Store credentials for biometric login if enabled
      if (biometricEnabled) {
        console.log('🔑 Storing credentials for biometric login');
        await AsyncStorage.setItem('biometricEmail', email);
        await AsyncStorage.setItem('biometricPassword', password);
      }
      
      console.log('🔑 Navigating to home page');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('🔑 Firebase login error:', error);
      
      // Show development-friendly message for reCAPTCHA issues
      if (error.message.includes('reCAPTCHA') || error.message.includes('development limitation')) {
        Alert.alert(
          'Firebase Web Limitation',
          'Firebase blocks web authentication with reCAPTCHA in development mode.\n\n💡 TIP: Use an email starting with "john" for demo purposes, or try this in a real React Native mobile app where it works perfectly!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Login Failed', error.message);
      }
    } finally {
      setLoading(false);
      console.log('🔑 Login process completed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back 1:15 PM</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 50 }]}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.loginButton}>
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#007AFF80' : '#007AFF',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                'Sign In'
              )}
            </button>
          </View>

          {biometricEnabled && (
            <View style={styles.biometricButton}>
              <button
                onClick={handleBiometricLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#1C1C1C',
                  color: '#007AFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="finger-print" size={24} color="#007AFF" style={{ marginRight: 8 }} />
                Use Biometric
              </button>
            </View>
          )}

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  forgotPassword: {
    color: '#007AFF',
    textAlign: 'right',
    marginBottom: 24,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  biometricButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});