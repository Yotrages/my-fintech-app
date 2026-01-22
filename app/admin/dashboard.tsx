import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFetch } from '@/hooks/useFetch';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { data: stats, isLoading, refetch } = useFetch<{ data: any }>('admin/dashboard');

  const statCards = [
    { title: 'Total Users', value: stats?.data?.totalUsers, icon: 'people', color: 'bg-blue-500' },
    { title: 'Total Accounts', value: stats?.data?.totalAccounts, icon: 'wallet', color: 'bg-green-500' },
    { title: 'Verified Accounts', value: stats?.data?.verifiedAccounts, icon: 'checkmark-circle', color: 'bg-purple-500' },
    { title: 'Pending Verifications', value: stats?.data?.pendingVerifications, icon: 'time', color: 'bg-yellow-500' },
    { title: 'Total Transactions', value: stats?.data?.totalTransactions, icon: 'swap-horizontal', color: 'bg-pink-500' },
    { title: 'Today Transactions', value: stats?.data?.todayTransactions, icon: 'trending-up', color: 'bg-indigo-500' }
  ];

  return (
    <ScreenWrapper>
    <ScrollView className="bg-gray-50" refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
      <View className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 pt-16 pb-8">
        <Text className="text-white text-3xl font-bold mb-2">Admin Dashboard</Text>
        <Text className="text-purple-100">Manage verifications & monitor activity</Text>
      </View>

      <View className="px-6 py-6">
        {/* Stats Grid */}
        <View className="flex-row flex-wrap -mx-2 mb-6">
          {statCards.map((stat, index) => (
            <View key={index} className="w-1/2 px-2 mb-4">
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <View className={`w-12 h-12 ${stat.color} rounded-full items-center justify-center mb-3`}>
                  <Ionicons name={stat.icon as any} size={24} color="white" />
                </View>
                <Text className="text-gray-600 text-sm mb-1">{stat.title}</Text>
                <Text className="text-2xl font-bold text-gray-900">{stat.value || 0}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-xl shadow-sm">
          <TouchableOpacity
            onPress={() => router.push('/admin/verifications' as any)}
            className="p-4 flex-row items-center justify-between border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="document-text" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text className="font-bold text-gray-900">Pending Verifications</Text>
                <Text className="text-sm text-gray-500">{stats?.data?.pendingVerifications} waiting</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="people" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text className="font-bold text-gray-900">User Management</Text>
                <Text className="text-sm text-gray-500">View all users</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </ScreenWrapper>
  );
}
