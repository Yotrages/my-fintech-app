import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';

export default function ThemeSettingsScreen() {
  const { data: settings, isLoading } = useFetch<{ data: any }>('settings');
  const [selectedTheme, setSelectedTheme] = useState('auto');

  useEffect(() => {
    if (settings?.data) {
      setSelectedTheme(settings.data.theme);
    }
  }, [settings]);

  const { mutate, isLoading: saving } = useMutate('PATCH', 'settings/preferences', {
    successMessage: 'Theme updated'
  });

  const themes = [
    { value: 'light', label: 'Light', icon: 'sunny', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', icon: 'moon', description: 'Always use dark theme' },
    { value: 'auto', label: 'Auto', icon: 'phone-portrait', description: 'Match system settings' }
  ];

  const handleSelectTheme = (theme: string) => {
    setSelectedTheme(theme);
    mutate({ theme });
  };

  return (
    <ScreenWrapper>
    <ScrollView className="bg-white">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Appearance</Text>
        <Text className="text-gray-600 mb-6">Customize how the app looks</Text>

        <View className="space-y-3">
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.value}
              onPress={() => handleSelectTheme(theme.value)}
              className={`rounded-xl p-4 border-2 ${
                selectedTheme === theme.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <View className="flex-row items-center">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                  selectedTheme === theme.value ? 'bg-blue-600' : 'bg-gray-100'
                }`}>
                  <Ionicons
                    name={theme.icon as any}
                    size={24}
                    color={selectedTheme === theme.value ? 'white' : '#6b7280'}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`font-bold mb-1 ${
                    selectedTheme === theme.value ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {theme.label}
                  </Text>
                  <Text className="text-sm text-gray-600">{theme.description}</Text>
                </View>
                {selectedTheme === theme.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {saving && (
          <View className="mt-6 items-center">
            <ActivityIndicator size="small" color="#2563eb" />
            <Text className="text-gray-600 mt-2">Applying theme...</Text>
          </View>
        )}
      </View>
    </ScrollView>
    </ScreenWrapper>
  );
}