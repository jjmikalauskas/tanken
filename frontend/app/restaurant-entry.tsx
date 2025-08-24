import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { 
  FaUtensils,
  FaArrowLeft,
  FaStore,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaUser,
  FaClipboard,
  FaChevronUp,
  FaChevronDown,
  FaBicycle,
  FaCar,
  FaHamburger
} from 'react-icons/fa';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { restaurantAPI } from '../services/api';

export default function RestaurantEntry() {
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    management: false,
    digital: false,
  });

  const [formData, setFormData] = useState({
    // Pre-filled test data for quick testing
    restaurantName: 'Tycoon Flats',
    streetAddress: '121 Main St',
    city: 'Dallas',
    state: 'TX',
    zipcode: '75409',
    primaryPhone: '(214) 555-0123',
    websiteUrl: 'https://tycoonflats.com',
    menuUrl: 'https://tycoonflats.com/menu',
    menuComments: 'Full bar, steakhouse menu, daily specials available',
    
    // Management
    gmName: 'John Smith',
    gmPhone: '(214) 555-0124',
    secondaryPhone: '(214) 555-0125',
    thirdPhone: '(214) 555-0126',
    
    // Digital Presence
    doordashUrl: 'https://doordash.com/store/tycoon-flats',
    uberEatsUrl: 'https://ubereats.com/store/tycoon-flats',
    grubhubUrl: 'https://grubhub.com/restaurant/tycoon-flats',
    
    // Additional
    notes: 'Upscale steakhouse, full bar, private dining available',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle section expansion
  const toggleSection = (section: 'management' | 'digital') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Pre-fill test data for easy testing
  const fillTestData = () => {
    setFormData({
      // Pre-filled test data for quick testing
      restaurantName: 'Tycoon Flats',
      streetAddress: '121 Main St',
      city: 'Dallas',
      state: 'TX',
      zipcode: '75409',
      primaryPhone: '(214) 555-0123',
      websiteUrl: 'https://tycoonflats.com',
      menuUrl: 'https://tycoonflats.com/menu',
      menuComments: 'Full bar, steakhouse menu, daily specials available',
      
      // Management
      gmName: 'John Smith',
      gmPhone: '(214) 555-0124',
      secondaryPhone: '(214) 555-0125',
      thirdPhone: '(214) 555-0126',
      
      // Digital Presence
      doordashUrl: 'https://doordash.com/store/tycoon-flats',
      uberEatsUrl: 'https://ubereats.com/store/tycoon-flats',
      grubhubUrl: 'https://grubhub.com/restaurant/tycoon-flats',
      
      // Additional
      notes: 'Upscale steakhouse, full bar, private dining available',
    });

    // Expand sections when test data is filled
    setExpandedSections({
      management: true,
      digital: true,
    });

    Alert.alert('Test Data Loaded! 🎉', 'Form has been pre-filled with sample data for easy testing.');
  };

  // Validation functions
  const validatePhone = (phone: string) => {
    if (!phone) return true; // Optional fields
    // US phone format: (xxx) xxx-xxxx or xxx-xxx-xxxx or xxxxxxxxxx
    const phoneRegex = /^(\(\d{3}\)\s?|\d{3}[-.]?)\d{3}[-.]?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Optional fields
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateZipCode = (zip: string) => {
    // US zip format: 12345 or 12345-6789
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const validateForm = () => {
    const { restaurantName, streetAddress, city, state, zipcode, primaryPhone } = formData;
    
    // Check required fields
    if (!restaurantName || !streetAddress || !city || !state || !zipcode || !primaryPhone) {
      Alert.alert('Error', 'Please fill in all required fields:\n- Restaurant Name\n- Street Address\n- City\n- State\n- Zipcode\n- Primary Phone');
      return false;
    }

    // Validate zipcode
    if (!validateZipCode(zipcode)) {
      Alert.alert('Invalid Zipcode', 'Please enter a valid zipcode (12345 or 12345-6789)');
      return false;
    }

    // Validate primary phone (required)
    if (!validatePhone(primaryPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number for Primary Phone\nExample: (214) 555-0123');
      return false;
    }

    // Validate optional phone numbers
    if (formData.gmPhone && !validatePhone(formData.gmPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number for GM Phone\nExample: (214) 555-0123');
      return false;
    }
    if (formData.secondaryPhone && !validatePhone(formData.secondaryPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number for Secondary Phone\nExample: (214) 555-0123');
      return false;
    }
    if (formData.thirdPhone && !validatePhone(formData.thirdPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number for Third Phone\nExample: (214) 555-0123');
      return false;
    }

    // Validate URLs
    if (formData.websiteUrl && !validateUrl(formData.websiteUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid Website URL\nExample: https://restaurant.com');
      return false;
    }
    if (formData.menuUrl && !validateUrl(formData.menuUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid Menu URL\nExample: https://restaurant.com/menu');
      return false;
    }
    if (formData.doordashUrl && !validateUrl(formData.doordashUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid DoorDash URL');
      return false;
    }
    if (formData.uberEatsUrl && !validateUrl(formData.uberEatsUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid Uber Eats URL');
      return false;
    }
    if (formData.grubhubUrl && !validateUrl(formData.grubhubUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid Grubhub URL');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Generate unique key
      const restaurantKey = `${formData.restaurantName}-${formData.streetAddress}#-${formData.zipcode}`.replace(/\s+/g, '');

      // Prepare data in the format your existing backend expects
      const restaurantData = {
        name: formData.restaurantName,
        address: `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipcode}`,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        primaryPhone: formData.primaryPhone,
        websiteUrl: formData.websiteUrl,
        menuUrl: formData.menuUrl,
        menuComments: formData.menuComments,
        gmName: formData.gmName,
        gmPhone: formData.gmPhone,
        secondaryPhone: formData.secondaryPhone,
        thirdPhone: formData.thirdPhone,
        doordashUrl: formData.doordashUrl,
        uberEatsUrl: formData.uberEatsUrl,
        grubhubUrl: formData.grubhubUrl,
        notes: formData.notes,
        restaurantName: formData.restaurantName,
        streetAddress: formData.streetAddress,
        // Keep the restaurant key for reference
        restaurantKey: restaurantKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('🏪 Saving to your existing backend with key:', restaurantKey);
      
      // Use the centralized API service instead of direct fetch
      const result = await restaurantAPI.create(restaurantData);
      
      console.log('🏪 Restaurant saved successfully:', result);
      console.log('🏪 About to show first success alert...');
      
      // First, show success alert (works on mobile, fallback for web)
      Alert.alert(
        '🎉 Success!',
        `Restaurant '${formData.restaurantName}' has been saved successfully!`,
        [
          { 
            text: 'OK',
            onPress: () => {
              console.log('🏪 First alert OK pressed, showing second alert...');
              // After success acknowledgment, ask what to do next
              Alert.alert(
                'What\'s Next?',
                'What would you like to do now?',
                [
                  {
                    text: 'Add Another Restaurant',
                    onPress: () => {
                      console.log('🏪 User chose "Add Another" - clearing form...');
                      // Clear form for next entry
                      setFormData({
                        restaurantName: '',
                        streetAddress: '',
                        city: 'Dallas',
                        state: 'TX',
                        zipcode: '',
                        primaryPhone: '',
                        websiteUrl: '',
                        menuUrl: '',
                        menuComments: '',
                        gmName: '',
                        gmPhone: '',
                        secondaryPhone: '',
                        thirdPhone: '',
                        doordashUrl: '',
                        uberEatsUrl: '',
                        grubhubUrl: '',
                        notes: '',
                      });
                      
                      // Collapse sections
                      setExpandedSections({
                        management: false,
                        digital: false,
                      });
                      console.log('🏪 Form cleared and sections collapsed!');
                    }
                  },
                  {
                    text: 'View Restaurant List',
                    onPress: () => {
                      console.log('🏪 User chose "View List" - navigating...');
                      router.push('/restaurant-list');
                    }
                  },
                  {
                    text: 'Stay Here',
                    style: 'cancel',
                    onPress: () => {
                      console.log('🏪 User chose "Stay Here" - doing nothing...');
                    }
                  }
                ]
              );
            }
          }
        ]
      );
      
      console.log('🏪 First alert should be showing now...');
      
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
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FaArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={fillTestData}
              style={styles.restaurantIcon}
            >
              <FaUtensils size={32} color="#007AFF" />
              <Text style={styles.iconHint}>Tap for test data</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Restaurant</Text>
            <Text style={styles.subtitle}>Enter restaurant details for our database</Text>
          </View>
        </View>

        <View style={styles.form}>
          
          {/* Basic Information Section */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <FaStore size={20} color="#666" style={styles.inputIcon} />
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
            <FaMapMarkerAlt size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Street Address *"
              placeholderTextColor="#666"
              value={formData.streetAddress}
              onChangeText={(value) => updateFormData('streetAddress', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.flexInput]}>
              <FaMapMarkerAlt size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="City *"
                placeholderTextColor="#666"
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, styles.stateInput]}>
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

            <View style={[styles.inputContainer, styles.zipInput]}>
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
            <FaPhone size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Primary Phone Number *"
              placeholderTextColor="#666"
              value={formData.primaryPhone}
              onChangeText={(value) => updateFormData('primaryPhone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <FaGlobe size={20} color="#666" style={styles.inputIcon} />
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

          <View style={styles.inputContainer}>
            <FaUtensils size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Menu URL"
              placeholderTextColor="#666"
              value={formData.menuUrl}
              onChangeText={(value) => updateFormData('menuUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, styles.notesContainer]}>
            <FaClipboard size={20} color="#666" style={[styles.inputIcon, styles.notesIcon]} />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Menu comments (cuisine type, specialties, etc.)"
              placeholderTextColor="#666"
              value={formData.menuComments}
              onChangeText={(value) => updateFormData('menuComments', value)}
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Management & Contact Information - Collapsible */}
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('management')}
          >
            <Text style={styles.sectionTitle}>Management & Contact</Text>
            {expandedSections.management ? 
              <FaChevronUp size={20} color="#007AFF" /> : 
              <FaChevronDown size={20} color="#007AFF" />
            }
          </TouchableOpacity>

          {expandedSections.management && (
            <View style={styles.collapsibleSection}>
              <View style={styles.inputContainer}>
                <FaUser size={20} color="#666" style={styles.inputIcon} />
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
                <FaPhone size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="GM Phone Number"
                  placeholderTextColor="#666"
                  value={formData.gmPhone}
                  onChangeText={(value) => updateFormData('gmPhone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <FaPhone size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Secondary Phone (Optional)"
                  placeholderTextColor="#666"
                  value={formData.secondaryPhone}
                  onChangeText={(value) => updateFormData('secondaryPhone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <FaPhone size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Third Phone (Optional)"
                  placeholderTextColor="#666"
                  value={formData.thirdPhone}
                  onChangeText={(value) => updateFormData('thirdPhone', value)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}

          {/* Digital Presence - Collapsible */}
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('digital')}
          >
            <Text style={styles.sectionTitle}>Digital Presence</Text>
            {expandedSections.digital ? 
              <FaChevronUp size={20} color="#007AFF" /> : 
              <FaChevronDown size={20} color="#007AFF" />
            }
          </TouchableOpacity>

          {expandedSections.digital && (
            <View style={styles.collapsibleSection}>
              <View style={styles.inputContainer}>
                <FaBicycle size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="DoorDash URL (Optional)"
                  placeholderTextColor="#666"
                  value={formData.doordashUrl}
                  onChangeText={(value) => updateFormData('doordashUrl', value)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <FaCar size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Uber Eats URL (Optional)"
                  placeholderTextColor="#666"
                  value={formData.uberEatsUrl}
                  onChangeText={(value) => updateFormData('uberEatsUrl', value)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <FaHamburger size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Grubhub URL (Optional)"
                  placeholderTextColor="#666"
                  value={formData.grubhubUrl}
                  onChangeText={(value) => updateFormData('grubhubUrl', value)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {/* Additional Notes Section */}
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          
          <View style={[styles.inputContainer, styles.notesContainer]}>
            <FaClipboard size={20} color="#666" style={[styles.inputIcon, styles.notesIcon]} />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Additional notes or special information"
              placeholderTextColor="#666"
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>💾 Save Restaurant</Text>
              </>
            )}
          </TouchableOpacity>
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
  headerContainer: {
    position: 'relative',
    marginBottom: 32,
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
    padding: 8,
  },
  header: {
    alignItems: 'center',
  },
  restaurantIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconHint: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
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
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 16,
    marginBottom: 12,
    paddingLeft: 4,
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
    paddingVertical: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  flexInput: {
    flex: 2,
  },
  stateInput: {
    flex: 0.8,
  },
  zipInput: {
    flex: 1.2,
  },
  notesContainer: {
    alignItems: 'flex-start',
  },
  notesIcon: {
    marginTop: 12,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
    paddingBottom: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  collapsibleSection: {
    marginBottom: 16,
  },
});