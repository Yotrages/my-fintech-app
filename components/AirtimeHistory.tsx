import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';

interface Transaction {
  id: string;
  provider: string;
  phoneNumber: string;
  amount: number;
  fee: number;
  total: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

interface AirtimeHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
  currencySymbol: string;
  providerEmojis: Record<string, string>;
}

export const AirtimeHistory = ({
  transactions,
  isLoading,
  currencySymbol,
  providerEmojis,
}: AirtimeHistoryProps) => {
  if (isLoading) {
    return (
      <View className="items-center py-8">
        <Text className="text-slate-500">Loading...</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View className="items-center py-8">
        <Ionicons name="list-outline" size={48} color="#cbd5e1" />
        <Text className="text-slate-500 mt-2">No transactions yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <Card className="mb-3 p-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-slate-800">{item.provider}</Text>
              <Text className="text-sm text-slate-600 mt-1">
                {providerEmojis[item.provider] || '📱'} {item.phoneNumber}
              </Text>
              <Text className="text-xs text-slate-400 mt-1">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-slate-800">{currencySymbol}{item.amount.toLocaleString()}</Text>
              <Text className="text-xs text-slate-500 mt-1">Fee: {currencySymbol}{item.fee}</Text>
              <Text
                className={`text-xs font-semibold mt-1 ${
                  item.status === 'completed'
                    ? 'text-green-600'
                    : item.status === 'failed'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </Card>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
