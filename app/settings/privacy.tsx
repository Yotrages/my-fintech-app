import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFetch, useMutate } from '@/hooks/useFetch';

export default function PrivacySettingsScreen() {
  const { data: settings, isLoading } = useFetch<{ data: any }>('settings');
  
  const [profilePublic, setProfilePublic] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    if (settings?.data) {
      setProfilePublic(settings.data.profilePublic);
      setShowBalance(settings.data.showBalanceOnHome);
    }
  }, [settings]);

  const { mutate, isLoading: saving } = useMutate('PATCH', 'settings/privacy', {
    successMessage: 'Privacy settings updated'
  });

  const handleSave = () => {
    mutate({
      profilePublic,
      showBalanceOnHome: showBalance
    });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</Text>

        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1">Public Profile</Text>
              <Text className="text-sm text-gray-600">Let others find you by username</Text>
            </View>
            <Switch
              value={profilePublic}
              onValueChange={setProfilePublic}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={profilePublic ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1">Show Balance on Home</Text>
              <Text className="text-sm text-gray-600">Display your balance on dashboard</Text>
            </View>
            <Switch
              value={showBalance}
              onValueChange={setShowBalance}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={showBalance ? '#2563eb' : '#f3f4f6'}
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
            <Text className="text-white font-semibold text-base">Save Privacy Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
