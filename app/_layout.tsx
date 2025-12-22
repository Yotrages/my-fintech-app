import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import FlashMessage from 'react-native-flash-message';
import ReactQueryProvider from '@/libs/react-query/react-query-provider';
import { useAuthStore } from '@/libs/store/authStore';
import { socketService } from '@/services/socket.service';
import { ActivityIndicator, View } from 'react-native';

/**
 * Root Layout - Entry point for the app
 * Handles:
 * 1. Token persistence from AsyncStorage
 * 2. Socket connection for authenticated users
 * 3. Route protection (redirects to sign-in if not authenticated)
 * 4. Loading state during initial auth check
 */
export default function RootLayout() {
  const { isAuthenticated, token, isLoading, setLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  /**
   * PUBLIC routes (accessible without authentication)
   */
  const PUBLIC_ROUTES = ['(auth)', '+not-found'];

  /**
   * Effect: Initial app setup and token validation
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        // Token is already restored from AsyncStorage by Zustand persist middleware
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsReady(true);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  /**
   * Effect: Route protection
   * - Unauthenticated users can only access (auth) and +not-found
   * - All other routes require authentication
   * - Authenticated users are redirected away from (auth) routes
   */
  useEffect(() => {
    if (!isReady || isLoading) return;

    const currentRoute = segments[0];
    const isPublicRoute = PUBLIC_ROUTES.includes(currentRoute);

    // User is authenticated
    if (isAuthenticated && token) {
      // Redirect to dashboard if they try to access auth screens
      if (currentRoute === '(auth)') {
        router.replace('/(tabs)/home');
      }
    }
    // User is not authenticated
    else {
      // Redirect to sign-in if accessing protected routes
      if (!isPublicRoute && currentRoute !== undefined) {
        router.replace('/(auth)/sign-in');
      }
    }
  }, [isAuthenticated, isReady, isLoading, token, segments]);

  /**
   * Effect: Connect socket when authenticated
   */
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  /**
   * Show splash screen while initializing
   */
  if (!isReady || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
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
        <Stack.Screen name="verify-account" options={{ headerShown: false }} />
        
        {/* 404 Route - PUBLIC */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <FlashMessage position="top" />
    </ReactQueryProvider>
  );
}
