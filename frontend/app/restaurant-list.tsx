import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/restaurants`);
      const data = await response.json();
      setRestaurants(data.restaurants || []);
      console.log('📋 Loaded restaurants:', data.restaurants?.length || 0);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Restaurant Database</Text>
        <Text style={styles.subtitle}>({restaurants.length} restaurants)</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {restaurants.map((restaurant, index) => (
          <View key={restaurant._id || index} style={styles.restaurantCard}>
            <View style={styles.restaurantHeader}>
              <Ionicons name="restaurant" size={24} color="#007AFF" />
              <Text style={styles.restaurantName}>{restaurant.restaurant_name}</Text>
            </View>
            
            <View style={styles.restaurantDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {restaurant.street_address}, {restaurant.city}, {restaurant.state} {restaurant.zipcode}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{restaurant.primary_phone}</Text>
              </View>

              {restaurant.website_url && (
                <View style={styles.detailRow}>
                  <Ionicons name="globe-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{restaurant.website_url}</Text>
                </View>
              )}

              {restaurant.gm_name && (
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>GM: {restaurant.gm_name}</Text>
                </View>
              )}

              {restaurant.notes && (
                <View style={styles.detailRow}>
                  <Ionicons name="document-text-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{restaurant.notes}</Text>
                </View>
              )}

              <View style={styles.keyContainer}>
                <Text style={styles.keyLabel}>Restaurant Key:</Text>
                <Text style={styles.keyValue}>{restaurant.restaurant_key}</Text>
              </View>

              <Text style={styles.timestamp}>
                Added: {new Date(restaurant.created_at).toLocaleDateString()} at {new Date(restaurant.created_at).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}

        {restaurants.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No restaurants found</Text>
            <Text style={styles.emptySubtext}>Add some restaurants to see them here</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/restaurant-entry')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Restaurant</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  restaurantCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  restaurantDetails: {
    marginLeft: 32,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  keyContainer: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  keyLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  keyValue: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});