import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useFetch } from '@/hooks/useFetch';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components';

export default function RatesScreen() {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [search, setSearch] = useState('');
  
  const { data: ratesData, isLoading, refetch } = useFetch<{ data: { rates: Record<string, number> } }>(`exchange-rates/all?base=${baseCurrency}`);

  const rates = ratesData?.data?.rates || {};
  const filteredRates = Object.entries(rates).filter(([currency]) => 
    currency.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenWrapper>
    <ScrollView className="bg-white" refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
      <View className="px-6 py-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Live Exchange Rates</Text>
        <Text className="text-gray-600 mb-6">Real-time currency conversion rates</Text>

        <View className="flex-row mb-6">
          <View className="flex-1 mr-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">Base Currency</Text>
            <TextInput
              value={baseCurrency}
              onChangeText={setBaseCurrency}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="USD"
              maxLength={3}
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">Search</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="Currency..."
            />
          </View>
        </View>

        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <Text className="text-blue-900 font-semibold">1 {baseCurrency} equals:</Text>
        </View>

        {filteredRates.map(([currency, rate]) => (
          <View key={currency} className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <Text className="text-gray-900 font-medium">{currency}</Text>
            <Text className="text-gray-900 font-bold">{parseFloat(rate.toString()).toFixed(4)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
    </ScreenWrapper>
  );
}
