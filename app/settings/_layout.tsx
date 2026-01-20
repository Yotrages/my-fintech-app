import { Stack } from 'expo-router';
import React from 'react';

const SettingsLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="theme" options={{ headerShown: false }} />
      <Stack.Screen name="transaction-security" options={{ headerShown: false }} />
    </Stack>
  );
};

export default SettingsLayout;