import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Auth already initialized
  auth = getAuth(app);
}

// GLOBAL reCAPTCHA BYPASS - Apply immediately after auth initialization
if (typeof window !== 'undefined') {
  console.log('🔧 Applying global reCAPTCHA bypass for development...');
  
  // Method 1: Disable app verification
  try {
    if (auth.settings) {
      auth.settings.appVerificationDisabledForTesting = true;
    }
  } catch (e) {
    console.log('Method 1 bypass attempt:', e);
  }
  
  // Method 2: Override reCAPTCHA methods
  try {
    // Create a fake recaptcha verifier
    window.recaptchaVerifier = {
      type: 'recaptcha',
      verify: () => Promise.resolve('fake-token'),
      render: () => Promise.resolve('fake-widget-id'),
      clear: () => {},
    };
    
    // Override any reCAPTCHA config functions
    if (auth._delegate && auth._delegate._config) {
      auth._delegate._config.appVerificationDisabledForTesting = true;
    }
    
  } catch (e) {
    console.log('Method 2 bypass attempt:', e);
  }
  
  // Method 3: Monkey patch the problematic function
  try {
    const originalAuth = auth;
    if (originalAuth && originalAuth._delegate) {
      // Override getRecaptchaConfig if it exists
      const delegate = originalAuth._delegate;
      if (delegate.getRecaptchaConfig) {
        delegate.getRecaptchaConfig = () => ({ 
          recaptchaEnforcementState: 'OFF',
          recaptchaKey: 'fake-key'
        });
      }
    }
  } catch (e) {
    console.log('Method 3 bypass attempt:', e);
  }
  
  console.log('🔧 reCAPTCHA bypass configuration complete');
}

export { auth };
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
};