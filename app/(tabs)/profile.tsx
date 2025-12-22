import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/libs/store/authStore';
import { Card, Button } from '@/components';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          logout();
          router.replace('/(auth)/sign-in');
        }
      }
    ]);
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Personal Information', route: '/settings' },
    { icon: 'shield-checkmark-outline', title: 'Security Settings', route: '/settings' },
    { icon: 'notifications-outline', title: 'Notifications', route: '/settings/notifications' },
    { icon: 'lock-closed-outline', title: 'Privacy', route: '/settings/privacy' },
    { icon: 'help-circle-outline', title: 'Help & Support', route: '#' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View className="bg-gradient-to-b from-blue-600 to-blue-700 px-6 pt-12 pb-12">
        <View className="items-center">
          <View className="w-28 h-28 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-28 h-28 rounded-full" />
            ) : (
              <View className="w-28 h-28 rounded-full bg-blue-100 items-center justify-center">
                <Text className="text-blue-600 text-5xl font-bold">
                  {user?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-white text-2xl font-bold mb-1">{user?.username || 'User'}</Text>
          <Text className="text-blue-100 text-base">{user?.email}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-6 py-6">
        {/* Account Status Card */}
        <Card variant="default" padding="md" style={{ marginBottom: 24 }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-semibold text-gray-900">Account Status</Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-800 text-xs font-semibold">Active</Text>
            </View>
          </View>
          <View className="border-t border-gray-200 pt-4 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Member Since</Text>
              <Text className="font-semibold text-gray-900">Nov 2024</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Email Verified</Text>
              <Text className="font-semibold text-green-600">✓ Yes</Text>
            </View>
          </View>
        </Card>

        {/* Settings Menu */}
        <Text className="text-lg font-bold text-gray-900 mb-4">Settings</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => item.route !== '#' && router.push(item.route as any)}
            disabled={item.route === '#'}
          >
            <Card variant="default" padding="md" style={{ marginBottom: 12 }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
                    <Ionicons name={item.icon as any} size={20} color="#2563eb" />
                  </View>
                  <Text className="text-gray-900 font-medium flex-1">{item.title}</Text>
                </View>
                {item.route !== '#' && <Ionicons name="chevron-forward" size={20} color="#d1d5db" />}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={20} color="white" />}
          />
        </View>
      </View>
    </ScrollView>
  );
}
