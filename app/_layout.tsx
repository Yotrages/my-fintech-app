import React, { useEffect, useRef, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import FlashMessage from "react-native-flash-message";
import ReactQueryProvider from "@/libs/react-query/react-query-provider";
import { useAuthStore } from "@/libs/store/authStore";
import { socketService } from "@/services/socket.service";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setLoading = useAuthStore((state) => state.setLoading);
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  
  const PUBLIC_ROUTES = ["(auth)", "+not-found"];

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsReady(true);
      } catch (error) {
        console.error("App initialization error:", error);
        setIsReady(true);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const currentRoute = segments[0];
    const isPublicRoute = PUBLIC_ROUTES.includes(currentRoute);

    if (isAuthenticated && token) {
      if (currentRoute === '(auth)') {
        router.replace('/(tabs)/home' as any);
      }
    }
    else {
      if (!isPublicRoute && currentRoute !== undefined) {
        router.replace('/(auth)/sign-in');
      }
    }
  }, [isAuthenticated, token]); 

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  if (!isReady || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ReactQueryProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Auth Routes - PUBLIC */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          {/* Dashboard - PROTECTED */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Protected Top-Level Screens */}
          <Stack.Screen name="send-money" options={{ headerShown: false }} />
          <Stack.Screen name="add-account" options={{ headerShown: false }} />
          <Stack.Screen name="rates" options={{ headerShown: false }} />
          <Stack.Screen name="notification" options={{ headerShown: false }} />

          {/* Protected Nested Screens (Folders) */}
          <Stack.Screen name="account" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen
            name="verify-account"
            options={{ headerShown: false }}
          />

          {/* 404 Route - PUBLIC */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <FlashMessage position="top" />
      </ReactQueryProvider>
    </SafeAreaProvider>
  );
}
