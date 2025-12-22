import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionSecurityScreen() {
  const { data: settings, isLoading } = useFetch<{ data: any }>('settings');
  
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [requirePassword, setRequirePassword] = useState(true);
  const [dailyLimit, setDailyLimit] = useState('1000');

  useEffect(() => {
    if (settings?.data) {
      setBiometricEnabled(settings.data.biometricEnabled);
      setRequirePassword(settings.data.requirePasswordForTransfers);
      setDailyLimit(settings.data.dailyTransferLimit.toString());
    }
  }, [settings]);

  const { mutate, isLoading: saving } = useMutate('PATCH', 'settings/security', {
    successMessage: 'Security settings updated'
  });

  const handleSave = () => {
    mutate({
      biometricEnabled,
      requirePasswordForTransfers: requirePassword,
      dailyTransferLimit: parseInt(dailyLimit)
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
        <Text className="text-2xl font-bold text-gray-900 mb-2">Transaction Security</Text>
        <Text className="text-gray-600 mb-6">Protect your transfers with additional security</Text>

        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text className="text-blue-900 ml-2 flex-1 text-sm">
              These settings add extra layers of security to your money transfers
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 mb-1">Biometric Authentication</Text>
                <Text className="text-sm text-gray-600">Use fingerprint or Face ID</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={biometricEnabled ? '#2563eb' : '#f3f4f6'}
              />
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 mb-1">Require Password</Text>
                <Text className="text-sm text-gray-600">Ask for password before transfers</Text>
              </View>
              <Switch
                value={requirePassword}
                onValueChange={setRequirePassword}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={requirePassword ? '#2563eb' : '#f3f4f6'}
              />
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="font-semibold text-gray-900 mb-3">Daily Transfer Limit</Text>
            <Text className="text-sm text-gray-600 mb-3">
              Maximum amount you can transfer per day
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
              <Text className="text-xl mr-2">$</Text>
              <TextInput
                value={dailyLimit}
                onChangeText={setDailyLimit}
                placeholder="1000"
                keyboardType="numeric"
                className="flex-1 text-base"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-blue-600 rounded-xl py-4 items-center mt-6"
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Security Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
