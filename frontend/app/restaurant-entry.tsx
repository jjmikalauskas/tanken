import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Initialize Firebase (using existing config)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function RestaurantEntry() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    restaurantName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipcode: '',
    primaryPhone: '',
    websiteUrl: '',
    
    // Management
    gmName: '',
    gmPhone: '',
    secondaryPhone: '',
    thirdPhone: '',
    
    // Digital Presence
    doordashUrl: '',
    uberEatsUrl: '',
    grubhubUrl: '',
    
    // Additional
    notes: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRestaurantKey = () => {
    const { restaurantName, streetAddress, zipcode } = formData;
    // Clean and format: RestaurantName-StreetAddress-Zipcode
    const cleanName = restaurantName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const cleanAddress = streetAddress.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${cleanName}-${cleanAddress}-${zipcode}`;
  };

  const validateForm = () => {
    const { restaurantName, streetAddress, city, state, zipcode, primaryPhone } = formData;
    
    if (!restaurantName || !streetAddress || !city || !state || !zipcode || !primaryPhone) {
      Alert.alert('Error', 'Please fill in all required fields:\n- Restaurant Name\n- Street Address\n- City\n- State\n- Zipcode\n- Primary Phone');
      return false;
    }

    // Basic zipcode validation
    if (!/^\d{5}(-\d{4})?$/.test(zipcode)) {
      Alert.alert('Error', 'Please enter a valid zipcode (12345 or 12345-6789)');
      return false;
    }

    return true;
  };

  const handleSaveRestaurant = async () => {
    console.log('🏪 Save Restaurant button clicked!');
    console.log('📝 Form data:', formData);
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Generate unique key
      const restaurantKey = generateRestaurantKey();
      
      // Prepare data for Firestore
      const restaurantData = {
        ...formData,
        restaurantKey,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('🏪 Saving to Firestore with key:', restaurantKey);
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'restaurants'), restaurantData);
      
      console.log('🏪 Restaurant saved successfully:', docRef.id);
      
      Alert.alert(
        'Success!',
        `Restaurant "${formData.restaurantName}" saved successfully!\n\nKey: ${restaurantKey}`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              // Clear form for next entry
              setFormData({
                restaurantName: '',
                streetAddress: '',
                city: '',
                state: '',
                zipcode: '',
                primaryPhone: '',
                websiteUrl: '',
                gmName: '',
                gmPhone: '',
                secondaryPhone: '',
                thirdPhone: '',
                doordashUrl: '',
                uberEatsUrl: '',
                grubhubUrl: '',
                notes: '',
              });
            }
          },
          { text: 'Done', style: 'default' }
        ]
      );
      
    } catch (error) {
      console.error('🏪 Error saving restaurant:', error);
      Alert.alert('Error', `Failed to save restaurant: ${error.message}`);
    } finally {
      setLoading(false);
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
          <Ionicons name="restaurant" size={32} color="#007AFF" />
          <Text style={styles.title}>Add Restaurant</Text>
          <Text style={styles.subtitle}>Enter restaurant details for our database</Text>
        </View>

        <View style={styles.form}>
          
          {/* Basic Information Section */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="storefront-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Restaurant Name *"
              placeholderTextColor="#666"
              value={formData.restaurantName}
              onChangeText={(value) => updateFormData('restaurantName', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Street Address *"
              placeholderTextColor="#666"
              value={formData.streetAddress}
              onChangeText={(value) => updateFormData('streetAddress', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
              <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="City *"
                placeholderTextColor="#666"
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginHorizontal: 4 }]}>
              <TextInput
                style={styles.input}
                placeholder="State *"
                placeholderTextColor="#666"
                value={formData.state}
                onChangeText={(value) => updateFormData('state', value)}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <TextInput
                style={styles.input}
                placeholder="Zipcode *"
                placeholderTextColor="#666"
                value={formData.zipcode}
                onChangeText={(value) => updateFormData('zipcode', value)}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Primary Phone *"
              placeholderTextColor="#666"
              value={formData.primaryPhone}
              onChangeText={(value) => updateFormData('primaryPhone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="globe-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              placeholderTextColor="#666"
              value={formData.websiteUrl}
              onChangeText={(value) => updateFormData('websiteUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Management Section */}
          <Text style={styles.sectionTitle}>Management & Contact</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="General Manager Name"
              placeholderTextColor="#666"
              value={formData.gmName}
              onChangeText={(value) => updateFormData('gmName', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="GM Phone"
              placeholderTextColor="#666"
              value={formData.gmPhone}
              onChangeText={(value) => updateFormData('gmPhone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Secondary Phone"
              placeholderTextColor="#666"
              value={formData.secondaryPhone}
              onChangeText={(value) => updateFormData('secondaryPhone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Third Phone"
              placeholderTextColor="#666"
              value={formData.thirdPhone}
              onChangeText={(value) => updateFormData('thirdPhone', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Digital Presence Section */}
          <Text style={styles.sectionTitle}>Digital Presence</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="car-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="DoorDash URL"
              placeholderTextColor="#666"
              value={formData.doordashUrl}
              onChangeText={(value) => updateFormData('doordashUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="car-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Uber Eats URL"
              placeholderTextColor="#666"
              value={formData.uberEatsUrl}
              onChangeText={(value) => updateFormData('uberEatsUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="car-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Grubhub URL"
              placeholderTextColor="#666"
              value={formData.grubhubUrl}
              onChangeText={(value) => updateFormData('grubhubUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Notes Section */}
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          
          <View style={[styles.inputContainer, styles.notesContainer]}>
            <Ionicons name="document-text-outline" size={20} color="#666" style={[styles.inputIcon, styles.notesIcon]} />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Additional notes or special information..."
              placeholderTextColor="#666"
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <View style={styles.saveButton}>
            <button
              onClick={handleSaveRestaurant}
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
                '🏪 Save Restaurant'
              )}
            </button>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 24,
    marginBottom: 16,
    paddingLeft: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
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
  notesContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
    minHeight: 80,
  },
  inputIcon: {
    marginRight: 12,
  },
  notesIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  notesInput: {
    paddingVertical: 8,
    minHeight: 60,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 40,
  },
});