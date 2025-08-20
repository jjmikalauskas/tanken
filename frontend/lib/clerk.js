import { ClerkProvider } from '@clerk/clerk-expo';
import Constants from 'expo-constants';

const clerkPublishableKey = Constants.expoConfig?.extra?.clerkPublishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error('Missing Clerk Publishable Key. Please add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file.');
}

export { ClerkProvider, clerkPublishableKey };