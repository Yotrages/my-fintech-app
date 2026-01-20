import { Stack } from 'expo-router';
import React from 'react';

const VerifyAccountLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default VerifyAccountLayout;
