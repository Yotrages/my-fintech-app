import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Personal Information', route: '/settings/personal-info' },
        { icon: 'mail-outline', label: 'Email & Phone', route: '/settings/contact' },
        { icon: 'camera-outline', label: 'Profile Photo', route: '/settings/photo' }
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: 'lock-closed-outline', label: 'Change Password', route: '/settings/password' },
        { icon: 'finger-print-outline', label: 'Biometric Login', route: '/settings/biometric' },
        { icon: 'shield-checkmark-outline', label: 'Two-Factor Authentication', route: '/settings/2fa' },
        { icon: 'card-outline', label: 'Transaction Security', route: '/settings/transaction-security' }
      ]
    },
    {
      title: 'Notifications',
      items: [
        { icon: 'notifications-outline', label: 'Push Notifications', route: '/settings/notifications' },
        { icon: 'mail-open-outline', label: 'Email Alerts', route: '/settings/email-alerts' }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'language-outline', label: 'Language', route: '/settings/language' },
        { icon: 'cash-outline', label: 'Default Currency', route: '/settings/currency' },
        { icon: 'color-palette-outline', label: 'Theme', route: '/settings/theme' }
      ]
    },
    {
      title: 'Privacy',
      items: [
        { icon: 'eye-off-outline', label: 'Privacy Settings', route: '/settings/privacy' },
        { icon: 'document-text-outline', label: 'Data & Privacy', route: '/settings/data-privacy' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', route: '/help' },
        { icon: 'chatbubbles-outline', label: 'Contact Support', route: '/support' },
        { icon: 'document-outline', label: 'Terms & Policies', route: '/terms' }
      ]
    }
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-6 pt-16 pb-8">
        <Text className="text-white text-3xl font-bold">Settings</Text>
        <Text className="text-blue-100">Manage your account preferences</Text>
      </View>

      <View className="px-6 py-6">
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className="text-sm font-bold text-gray-500 uppercase mb-3 px-2">
              {section.title}
            </Text>
            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={() => router.push(item.route as any)}
                  className={`p-4 flex-row items-center justify-between ${
                    itemIndex !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons name={item.icon as any} size={22} color="#3b82f6" />
                    <Text className="text-gray-900 ml-3 font-medium">{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity className="bg-red-50 rounded-xl p-4 mt-6">
          <View className="flex-row items-center justify-center">
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
            <Text className="text-red-600 font-semibold ml-2">Delete Account</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
