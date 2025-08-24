import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { restaurantAPI } from '../services/api';

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, [sortBy, sortOrder]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      // Use the centralized API service - but backend returns array directly
      const data = await restaurantAPI.getAll({
        sort_by: sortBy,
        order: sortOrder
      });
      
      // Backend returns array directly, not wrapped in {restaurants: [...]}
      const restaurantsArray = Array.isArray(data) ? data : (data.restaurants || []);
      setRestaurants(restaurantsArray);
      console.log(`📋 Loaded ${restaurantsArray.length} restaurants from API service, sorted by ${sortBy} ${sortOrder}`);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      // Try without query parameters as fallback
      try {
        console.log('📋 Trying fallback API call without parameters...');
        const fallbackResponse = await fetch('https://us-central1-mongoose1-app.cloudfunctions.net/api/restaurants/holding');
        const fallbackData = await fallbackResponse.json();
        const restaurantsArray = Array.isArray(fallbackData) ? fallbackData : [];
        setRestaurants(restaurantsArray);
        console.log(`📋 Fallback loaded ${restaurantsArray.length} restaurants`);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      restaurant.restaurant_name?.toLowerCase().includes(term) ||
      restaurant.city?.toLowerCase().includes(term) ||
      restaurant.state?.toLowerCase().includes(term) ||
      restaurant.gm_name?.toLowerCase().includes(term)
    );
  });

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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Restaurant Database</Text>
          <Text style={styles.subtitle}>({filteredRestaurants.length} restaurants)</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants, cities, or managers..."
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'created_at' && styles.activeSortButton]}
          onPress={() => toggleSort('created_at')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'created_at' && styles.activeSortButtonText]}>
            Date {sortBy === 'created_at' && (sortOrder === 'desc' ? '↓' : '↑')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'restaurant_name' && styles.activeSortButton]}
          onPress={() => toggleSort('restaurant_name')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'restaurant_name' && styles.activeSortButtonText]}>
            Name {sortBy === 'restaurant_name' && (sortOrder === 'desc' ? '↓' : '↑')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredRestaurants.map((restaurant, index) => (
          <View key={restaurant.id || index} style={styles.restaurantCard}>
            <View style={styles.restaurantHeader}>
              <Ionicons name="restaurant" size={24} color="#007AFF" />
              <View style={styles.restaurantTitleContainer}>
                <Text style={styles.restaurantName}>{restaurant.restaurant_name}</Text>
                <Text style={styles.createdBy}>Added by: {restaurant.created_by || 'unknown'}</Text>
              </View>
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
                  {restaurant.gm_phone && (
                    <Text style={styles.detailText}> ({restaurant.gm_phone})</Text>
                  )}
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
                {restaurant.updated_at !== restaurant.created_at && (
                  <Text style={styles.timestampUpdate}>
                    {'\n'}Updated: {new Date(restaurant.updated_at).toLocaleDateString()} at {new Date(restaurant.updated_at).toLocaleTimeString()}
                  </Text>
                )}
              </Text>
            </View>
          </View>
        ))}

        {filteredRestaurants.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>
              {searchTerm ? 'No restaurants found matching your search' : 'No restaurants found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchTerm ? 'Try a different search term' : 'Add some restaurants to see them here'}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  sortLabel: {
    color: '#666',
    fontSize: 14,
  },
  sortButton: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeSortButton: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#fff',
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
  restaurantTitleContainer: {
    marginLeft: 8,
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  createdBy: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
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
  timestampUpdate: {
    color: '#888',
    fontSize: 11,
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
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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