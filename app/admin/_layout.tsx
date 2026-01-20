import { Stack } from 'expo-router';
import React from 'react';

const AdminLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="verifications" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AdminLayout;