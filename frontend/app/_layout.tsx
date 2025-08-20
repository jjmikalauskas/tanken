import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="restaurant-entry" />
        <Stack.Screen name="restaurant-list" />
        <Stack.Screen name="admin" />
      </Stack>
    </>
  );
}