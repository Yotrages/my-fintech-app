import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components';

interface Provider {
  name: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
  currencyCode: string;
  phonePrefixes?: string[];
}

interface ProviderGridProps {
  providers: Record<string, Provider>;
  selectedProvider: string | null;
  isLoading: boolean;
  currencySymbol: string;
  emojis: Record<string, string>;
  onSelectProvider: (code: string, config: Provider) => void;
}

export const ProviderGrid = ({
  providers,
  selectedProvider,
  isLoading,
  currencySymbol,
  emojis,
  onSelectProvider,
}: ProviderGridProps) => {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const providerEntries = Object.entries(providers).map(([code, config]) => ({
    code,
    ...config,
  }));

  if (providerEntries.length === 0) {
    return (
      <View className="items-center py-8">
        <Ionicons name="alert-circle-outline" size={48} color="#cbd5e1" />
        <Text className="text-slate-500 mt-2">No providers available</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Text className="text-slate-700 font-semibold">Select Provider</Text>
      <FlatList
        data={providerEntries}
        scrollEnabled={false}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelectProvider(item.code, item)}
            className={`flex-1 p-4 rounded-lg border-2 ${
              selectedProvider === item.code
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <Text className="text-3xl mb-2">
              {emojis[item.code] || '📱'}
            </Text>
            <Text className="font-bold text-slate-800">{item.name}</Text>
            <Text className="text-xs text-slate-500 mt-2">
              {currencySymbol}{item.minAmount}-{item.maxAmount}
            </Text>
            <Text className="text-xs text-emerald-600 font-semibold mt-1">
              {(item.fee * 100).toFixed(2)}% fee
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.code}
      />
    </View>
  );
};
