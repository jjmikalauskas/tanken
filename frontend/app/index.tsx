import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import RestaurantEntry from './restaurant-entry';

export default function Index() {
  return <RestaurantEntry />;
}