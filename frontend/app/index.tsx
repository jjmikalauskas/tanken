import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="restaurant" size={80} color="#007AFF" />
          <Text style={styles.title}>Restaurant Data Entry</Text>
          <Text style={styles.subtitle}>Manage restaurant information database</Text>
          <Text style={styles.userInfo}>Current User: data-entry1</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/restaurant-entry')}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Add New Restaurant</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/restaurant-list')}
          >
            <Ionicons name="list" size={24} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>View Restaurant List</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/admin')}
          >
            <Ionicons name="settings" size={24} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Database Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Using Firestore Database</Text>
          <Text style={styles.footerText}>No Authentication Required</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  userInfo: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    borderColor: '#007AFF',
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});