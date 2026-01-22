import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ScreenWrapper } from '@/components';

export default function NotificationsScreen() {
  const { data: notifications, isLoading, refetch } = useFetch<{ data: any[] }>('notifications');

  const { mutate: markAsRead } = useMutate('POST', 'notifications/read-all', {
    onSuccess: () => refetch()
  });

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      success: { name: 'checkmark-circle', color: '#10b981' },
      warning: { name: 'alert-circle', color: '#f59e0b' },
      error: { name: 'close-circle', color: '#ef4444' },
      transaction: { name: 'swap-horizontal', color: '#3b82f6' },
      verification: { name: 'shield-checkmark', color: '#8b5cf6' },
      info: { name: 'information-circle', color: '#6b7280' }
    };
    return icons[type] || icons.info;
  };

  return (
    <ScreenWrapper>
    <View className="bg-gray-50">
      <View className="bg-blue-600 px-6 pt-16 pb-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">Notifications</Text>
          <TouchableOpacity onPress={() => markAsRead({})}>
            <Text className="text-white font-semibold">Mark all read</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View className="px-6 py-4">
          {notifications?.data?.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons name="notifications-off-outline" size={64} color="#9ca3af" />
              <Text className="text-gray-500 mt-4">No notifications yet</Text>
            </View>
          ) : (
            notifications?.data?.map((notification) => {
              const icon = getIcon(notification.type);
              return (
                <TouchableOpacity
                  key={notification.id}
                  className={`bg-white rounded-xl p-4 mb-3 ${!notification.isRead ? 'border-l-4 border-blue-600' : ''}`}
                >
                  <View className="flex-row">
                    <View className="mr-3">
                      <Ionicons name={icon.name} size={24} color={icon.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 mb-1">{notification.title}</Text>
                      <Text className="text-gray-600 mb-2">{notification.message}</Text>
                      <Text className="text-xs text-gray-400">
                        {format(new Date(notification.createdAt), 'MMM dd, yyyy • HH:mm')}
                      </Text>
                    </View>
                    {!notification.isRead && (
                      <View className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
    </ScreenWrapper>
  );
}
