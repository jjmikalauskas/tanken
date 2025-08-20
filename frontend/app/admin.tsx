import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MongoAdmin() {
  const [restaurants, setRestaurants] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurants');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant data and stats
      const restaurantResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/restaurants`);
      const restaurantData = await restaurantResponse.json();
      
      // Fetch database stats
      const dbResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/database-stats`);
      const dbData = await dbResponse.json();
      
      setRestaurants(restaurantData.restaurants || []);
      setStats(restaurantData.stats || {});
      setDbStats(dbData || {});
      
      console.log('📊 Admin data loaded:', {
        restaurants: restaurantData.restaurants?.length,
        collections: dbData.collections?.length
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = (restaurantId: string, restaurantName: string) => {
    Alert.alert(
      'Delete Restaurant',
      `Are you sure you want to delete "${restaurantName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/restaurants/${restaurantId}`, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                Alert.alert('Success', 'Restaurant deleted successfully');
                fetchData(); // Refresh data
              } else {
                throw new Error('Failed to delete restaurant');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete restaurant');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading MongoDB Admin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>🗄️ MongoDB Admin</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text style={[styles.tabText, activeTab === 'restaurants' && styles.activeTabText]}>
            Restaurants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Database Stats
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'restaurants' && (
          <View>
            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats?.total_count || 0}</Text>
                <Text style={styles.statLabel}>Total Restaurants</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats?.cities_covered || 0}</Text>
                <Text style={styles.statLabel}>Cities</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats?.states_covered || 0}</Text>
                <Text style={styles.statLabel}>States</Text>
              </View>
            </View>

            {/* Restaurant List */}
            <Text style={styles.sectionTitle}>Restaurant Database</Text>
            
            {restaurants.map((restaurant, index) => (
              <View key={restaurant._id} style={styles.restaurantCard}>
                <View style={styles.restaurantHeader}>
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.restaurant_name}</Text>
                    <Text style={styles.restaurantLocation}>
                      {restaurant.city}, {restaurant.state} {restaurant.zipcode}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRestaurant(restaurant._id, restaurant.restaurant_name)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.restaurantDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{restaurant.street_address}</Text>
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

                  <View style={styles.keyContainer}>
                    <Text style={styles.keyLabel}>Restaurant Key:</Text>
                    <Text style={styles.keyValue}>{restaurant.restaurant_key}</Text>
                  </View>

                  <View style={styles.timestampRow}>
                    <Text style={styles.timestamp}>
                      Created: {new Date(restaurant.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={styles.dbId}>ID: {restaurant._id}</Text>
                  </View>
                </View>
              </View>
            ))}

            {restaurants.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={64} color="#666" />
                <Text style={styles.emptyText}>No restaurants found</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'stats' && (
          <View>
            <Text style={styles.sectionTitle}>Database Statistics</Text>
            
            {/* Collection Stats */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Collections</Text>
              {dbStats?.collections?.map((collection, index) => (
                <View key={index} style={styles.collectionRow}>
                  <Text style={styles.collectionName}>📄 {collection}</Text>
                  <Text style={styles.collectionCount}>
                    {dbStats.collection_stats?.[collection] || 0} documents
                  </Text>
                </View>
              ))}
            </View>

            {/* Geographic Distribution */}
            {stats?.cities && stats.cities.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Geographic Coverage</Text>
                <Text style={styles.cardSubtitle}>Cities with Restaurants:</Text>
                <View style={styles.cityGrid}>
                  {stats.cities.map((city, index) => (
                    <View key={index} style={styles.cityTag}>
                      <Text style={styles.cityText}>{city}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Database Info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Database Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Collections:</Text>
                <Text style={styles.infoValue}>{dbStats?.total_collections || 0}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Database Type:</Text>
                <Text style={styles.infoValue}>MongoDB</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Environment:</Text>
                <Text style={styles.infoValue}>Development</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Restaurant FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/restaurant-entry')}
      >
        <Ionicons name="add" size={24} color="#fff" />
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
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  restaurantCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  restaurantLocation: {
    fontSize: 14,
    color: '#007AFF',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FF3B3020',
    borderRadius: 8,
  },
  restaurantDetails: {
    marginLeft: 0,
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
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  dbId: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
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
  card: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  collectionName: {
    color: '#fff',
    fontSize: 14,
  },
  collectionCount: {
    color: '#007AFF',
    fontSize: 12,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cityTag: {
    backgroundColor: '#007AFF20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  cityText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#666',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});