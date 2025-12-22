import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFetch, useMutate } from '@/hooks/useFetch';

export default function NotificationSettingsScreen() {
  const { data: settings, isLoading } = useFetch<{ data: any }>('settings');
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [verificationAlerts, setVerificationAlerts] = useState(true);

  useEffect(() => {
    if (settings?.data) {
      setEmailNotifications(settings.data.emailNotifications);
      setPushNotifications(settings.data.pushNotifications);
      setTransactionAlerts(settings.data.transactionAlerts);
      setVerificationAlerts(settings.data.verificationAlerts);
    }
  }, [settings]);

  const { mutate, isLoading: saving } = useMutate('PATCH', 'settings/notifications', {
    successMessage: 'Notification preferences updated'
  });

  const handleSave = () => {
    mutate({
      emailNotifications,
      pushNotifications,
      transactionAlerts,
      verificationAlerts
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</Text>

        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1">Email Notifications</Text>
              <Text className="text-sm text-gray-600">Receive updates via email</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={emailNotifications ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1">Push Notifications</Text>
              <Text className="text-sm text-gray-600">Receive alerts on your device</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={pushNotifications ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1">Transaction Alerts</Text>
              <Text className="text-sm text-gray-600">Get notified about all transactions</Text>
            </View>
            <Switch
              value={transactionAlerts}
              onValueChange={setTransactionAlerts}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={transactionAlerts ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1">Verification Alerts</Text>
              <Text className="text-sm text-gray-600">Account verification updates</Text>
            </View>
            <Switch
              value={verificationAlerts}
              onValueChange={setVerificationAlerts}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={verificationAlerts ? '#2563eb' : '#f3f4f6'}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-blue-600 rounded-xl py-4 items-center"
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
