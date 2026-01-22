import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFetch } from '@/hooks/useFetch';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ScreenWrapper } from '@/components';

interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  country: string;
  currency: string;
  balance: number;
  verificationStatus: string;
}

interface ApiResponse {
  status: string;
  data: Account[];
}

export default function AccountsScreen() {
  const router = useRouter();
  const { data: response, isLoading, refetch } = useFetch<ApiResponse>('accounts');

  const accounts = response?.data || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verified' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return config;
  };

  return (
    <ScreenWrapper>
    <ScrollView
      className="bg-gray-50"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />}
    >
      {/* Header */}
      <View className="bg-gradient-to-b from-blue-600 to-blue-700 px-6 pt-16 pb-8">
        <Text className="text-white text-3xl font-bold mb-2">Your Accounts</Text>
        <Text className="text-blue-100">Manage your bank accounts and transfers</Text>
      </View>

      <View className="px-6 py-6">
        {/* Add Account Button */}
        <View className="mb-6">
          <Button
            title="Add New Account"
            onPress={() => router.push('/add-account' as any)}
            variant="primary"
            fullWidth
            icon={<Ionicons name="add-circle" size={20} color="white" />}
          />
        </View>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <Card variant="outlined" padding="lg">
            <View className="items-center py-12">
              <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-4 text-center font-medium">
                No accounts yet
              </Text>
              <Text className="text-gray-400 mt-2 text-center text-sm">
                Add your first bank account to start sending money
              </Text>
            </View>
          </Card>
        ) : (
          accounts.map((account) => {
            const status = getStatusBadge(account.verificationStatus);
            return (
              <TouchableOpacity
                key={account.id}
                onPress={() => router.push(`/account/${account.id}` as any)}
                className="mb-3"
              >
                <Card variant="default" padding="md">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-gray-500 text-sm font-medium mb-1">
                        {account.country}
                      </Text>
                      <Text className="text-gray-900 font-bold text-xl mb-1">
                        {account.bankName}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        ••••{account.accountNumber?.slice(-4)}
                      </Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-full ${status.bg}`}>
                      <Text className={`text-xs font-semibold ${status.text}`}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  <View className="border-t border-gray-200 pt-3">
                    <Text className="text-gray-500 text-sm mb-1">Balance</Text>
                    <Text className="text-2xl font-bold text-gray-900">
                      {account.currency} {parseFloat(account.balance.toString()).toLocaleString()}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
    </ScreenWrapper>
  );
}
