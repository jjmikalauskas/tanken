interface Restaurant {
  id: string;
  restaurant_name: string;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  primary_phone: string;
  restaurant_key: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface AdminStats {
  total_count: number;
  cities_covered: number;
  states_covered: number;
  cities: string[];
  states: string[];
  created_by_users: string[];
  current_user: string;
}

export default function AdminScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/restaurants`);
      const data = await response.json();
      
      setRestaurants(data.restaurants || []);
      setStats(data.stats || null);
      console.log('📊 Admin data loaded:', data.stats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string, restaurantName: string) => {
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
              setDeleting(restaurantId);
              
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/restaurants/${restaurantId}`,
                { method: 'DELETE' }
              );
              
              if (response.ok) {
                Alert.alert('Success', 'Restaurant deleted successfully');
                fetchAdminData(); // Refresh data
              } else {
                Alert.alert('Error', 'Failed to delete restaurant');
              }
            } catch (error) {
              console.error('Error deleting restaurant:', error);
              Alert.alert('Error', 'Failed to delete restaurant');
            } finally {
              setDeleting(null);
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
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
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
          <Text style={styles.title}>Database Admin</Text>
          <Text style={styles.subtitle}>Firestore Management</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchAdminData}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Database Statistics */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Database Statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="restaurant" size={32} color="#007AFF" />
                <Text style={styles.statNumber}>{stats.total_count}</Text>
                <Text style={styles.statLabel}>Total Restaurants</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="location" size={32} color="#28A745" />
                <Text style={styles.statNumber}>{stats.cities_covered}</Text>
                <Text style={styles.statLabel}>Cities</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="map" size={32} color="#FFC107" />
                <Text style={styles.statNumber}>{stats.states_covered}</Text>
                <Text style={styles.statLabel}>States</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="person" size={32} color="#DC3545" />
                <Text style={styles.statNumber}>{stats.created_by_users.length}</Text>
                <Text style={styles.statLabel}>Users</Text>
              </View>
            </View>

            <View style={styles.currentUser}>
              <Text style={styles.currentUserText}>Current User: {stats.current_user}</Text>
            </View>

            {/* Cities and States */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailTitle}>Cities ({stats.cities.length})</Text>
                {stats.cities.slice(0, 5).map((city, index) => (
                  <Text key={index} style={styles.detailItem}>{city}</Text>
                ))}
                {stats.cities.length > 5 && (
                  <Text style={styles.detailMore}>+ {stats.cities.length - 5} more</Text>
                )}
              </View>
              
              <View style={styles.detailColumn}>
                <Text style={styles.detailTitle}>States ({stats.states.length})</Text>
                {stats.states.slice(0, 5).map((state, index) => (
                  <Text key={index} style={styles.detailItem}>{state}</Text>
                ))}
                {stats.states.length > 5 && (
                  <Text style={styles.detailMore}>+ {stats.states.length - 5} more</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Restaurant Management */}
        <View style={styles.managementContainer}>
          <Text style={styles.sectionTitle}>Restaurant Management</Text>
          
          {restaurants.map((restaurant, index) => (
            <View key={restaurant.id || index} style={styles.restaurantItem}>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.restaurant_name}</Text>
                <Text style={styles.restaurantDetails}>
                  {restaurant.city}, {restaurant.state} • {restaurant.created_by}
                </Text>
                <Text style={styles.restaurantKey}>{restaurant.restaurant_key}</Text>
                <Text style={styles.restaurantDate}>
                  {new Date(restaurant.created_at).toLocaleDateString()}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.deleteButton, deleting === restaurant.id && styles.deletingButton]}
                onPress={() => handleDeleteRestaurant(restaurant.id, restaurant.restaurant_name)}
                disabled={deleting === restaurant.id}
              >
                {deleting === restaurant.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="trash" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          ))}

          {restaurants.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>No restaurants in database</Text>
              <Text style={styles.emptySubtext}>Add some restaurants to manage them here</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/restaurant-entry')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Add Restaurant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryActionButton]}
          onPress={() => router.push('/restaurant-list')}
        >
          <Ionicons name="list" size={20} color="#007AFF" />
          <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>View List</Text>
        </TouchableOpacity>
      </View>
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
  refreshButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  currentUser: {
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  currentUserText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  detailColumn: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
    padding: 12,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailItem: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  detailMore: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  managementContainer: {
    marginBottom: 100,
  },
  restaurantItem: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantDetails: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  restaurantKey: {
    color: '#007AFF',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  restaurantDate: {
    color: '#666',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletingButton: {
    opacity: 0.6,
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
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryActionButtonText: {
    color: '#007AFF',
  },
});