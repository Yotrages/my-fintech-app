import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFetch } from '@/hooks/useFetch';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import currency from 'currency.js';
import { ScreenWrapper } from '@/components/ScreenWrapper';

interface Transaction {
  id: string;
  transactionReference: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  createdAt: string;
  sourceAccount?: { accountNumber: string };
  destinationAccount?: { accountNumber: string };
}

export default function TransactionsScreen() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  
  const { data: accounts } = useFetch<{ data: any[] }>('accounts');
  const accountId = selectedAccount || accounts?.data?.[0]?.id;

  const { data: transactions, isLoading, refetch } = useFetch<{ data: Transaction[] }>(
    `transactions/history/${accountId}`,
    !!accountId
  );

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'arrow-forward';
      case 'deposit':
        return 'arrow-down';
      case 'withdrawal':
        return 'arrow-up';
      default:
        return 'card';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdrawal':
      case 'transfer':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
          item.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Ionicons
            name={getTransactionIcon(item.type)}
            size={20}
            color={item.type === 'deposit' ? '#16a34a' : '#dc2626'}
          />
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-gray-900 mb-1">
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text className="text-sm text-gray-500">
            {format(new Date(item.createdAt), 'MMM dd, yyyy • HH:mm')}
          </Text>
          {item.description && (
            <Text className="text-xs text-gray-400 mt-1">
              {item.description}
            </Text>
          )}
        </View>

        <View className="items-end">
          <Text className={`font-bold text-lg ${getTransactionColor(item.type)}`}>
            {item.type === 'deposit' ? '+' : '-'}
            {currency(item.amount, { symbol: '$' }).format()}
          </Text>
          <View className={`px-2 py-1 rounded-full mt-1 ${
            item.status === 'completed' ? 'bg-green-100' :
            item.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Text className={`text-xs font-medium ${
              item.status === 'completed' ? 'text-green-800' :
              item.status === 'pending' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!accountId) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Create an account to view transactions</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
    <View className="bg-gray-50">
      <View className="bg-blue-600 px-6 pt-16 pb-6">
        <Text className="text-white text-2xl font-bold">
          Transactions
        </Text>
      </View>

      <FlatList
        data={transactions?.data || []}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">No transactions yet</Text>
          </View>
        }
      />
    </View>
    </ScreenWrapper>
  );
}
