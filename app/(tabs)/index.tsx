import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFetch } from '@/hooks/useFetch';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components';
import { getCurrencySymbol } from '@/constants/countries';

interface AccountData {
  id: string;
  accountNumber: string;
  bankName: string;
  country: string;
  currency: string;
  balance: number;
  isVerified: boolean;
  verificationStatus: string;
}

interface ApiResponse {
  status: string;
  data: AccountData[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: response, isLoading, refetch } = useFetch<ApiResponse>('accounts');

  const accounts = response?.data || [];
  const verifiedAccounts = accounts.filter(acc => acc.isVerified);
  const pendingAccounts = accounts.filter(acc => acc.verificationStatus === 'pending');

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />}
    >
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-16 pb-8">
        <Text className="text-white text-3xl font-bold mb-2">Send Money Globally</Text>
        <Text className="text-blue-100 text-base">Fast, secure international transfers</Text>
      </View>

      <View className="px-6 py-6">
        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => router.navigate('/send-money' as any)}
            className="flex-1 bg-blue-600 rounded-2xl p-6 shadow-lg"
          >
            <Ionicons name="send" size={28} color="white" />
            <Text className="text-white font-bold text-lg mt-3">Send Money</Text>
            <Text className="text-blue-100 text-sm">To any country</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.navigate('/add-account' as any)}
            className="flex-1 bg-purple-600 rounded-2xl p-6 shadow-lg"
          >
            <Ionicons name="add-circle" size={28} color="white" />
            <Text className="text-white font-bold text-lg mt-3">Add Account</Text>
            <Text className="text-purple-100 text-sm">Bank account</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Menu */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Services</Text>
          <View className="flex-row flex-wrap gap-3">
            {/* Bills */}
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/bills' as any)}
              className="flex-1 min-w-[calc(50%-6px)] bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mb-2">
                <Ionicons name="document" size={20} color="#2563eb" />
              </View>
              <Text className="font-bold text-gray-900 text-sm">Pay Bills</Text>
              <Text className="text-gray-500 text-xs mt-1">Utilities</Text>
            </TouchableOpacity>

            {/* Airtime */}
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/airtime' as any)}
              className="flex-1 min-w-[calc(50%-6px)] bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="bg-purple-100 w-10 h-10 rounded-lg items-center justify-center mb-2">
                <Ionicons name="phone-portrait" size={20} color="#9333ea" />
              </View>
              <Text className="font-bold text-gray-900 text-sm">Buy Airtime</Text>
              <Text className="text-gray-500 text-xs mt-1">Mobile credit</Text>
            </TouchableOpacity>

            {/* Crypto */}
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/crypto' as any)}
              className="flex-1 min-w-[calc(50%-6px)] bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="bg-orange-100 w-10 h-10 rounded-lg items-center justify-center mb-2">
                <Text className="text-xl">₿</Text>
              </View>
              <Text className="font-bold text-gray-900 text-sm">Buy Crypto</Text>
              <Text className="text-gray-500 text-xs mt-1">Bitcoin & more</Text>
            </TouchableOpacity>

            {/* QR Code */}
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/qrcode' as any)}
              className="flex-1 min-w-[calc(50%-6px)] bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="bg-teal-100 w-10 h-10 rounded-lg items-center justify-center mb-2">
                <Ionicons name="qr-code" size={20} color="#14b8a6" />
              </View>
              <Text className="font-bold text-gray-900 text-sm">QR Code</Text>
              <Text className="text-gray-500 text-xs mt-1">Payment codes</Text>
            </TouchableOpacity>

            {/* Recurring Transfers */}
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/recurring' as any)}
              className="flex-1 min-w-[calc(50%-6px)] bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mb-2">
                <Ionicons name="repeat" size={20} color="#16a34a" />
              </View>
              <Text className="font-bold text-gray-900 text-sm">Recurring</Text>
              <Text className="text-gray-500 text-xs mt-1">Auto transfers</Text>
            </TouchableOpacity>

            {/* Cash Pickup */}
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/pickup' as any)}
              className="flex-1 min-w-[calc(50%-6px)] bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="bg-indigo-100 w-10 h-10 rounded-lg items-center justify-center mb-2">
                <Ionicons name="location" size={20} color="#4f46e5" />
              </View>
              <Text className="font-bold text-gray-900 text-sm">Cash Pickup</Text>
              <Text className="text-gray-500 text-xs mt-1">Withdraw cash</Text>
            </TouchableOpacity>

            {/* Group Payments */}
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/group' as any)}
              className="flex-1 min-w-[calc(50%-6px)] bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="bg-pink-100 w-10 h-10 rounded-lg items-center justify-center mb-2">
                <Ionicons name="people" size={20} color="#ec4899" />
              </View>
              <Text className="font-bold text-gray-900 text-sm">Group Pay</Text>
              <Text className="text-gray-500 text-xs mt-1">Split payments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Verifications Alert */}
        {pendingAccounts.length > 0 && (
          <Card variant="default" padding="md" style={{ marginBottom: 24 }}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={20} color="#d97706" />
              <Text className="text-amber-800 font-semibold ml-2 flex-1">Verification Pending</Text>
            </View>
            <Text className="text-amber-700 text-sm mb-3">
              {pendingAccounts.length} account(s) awaiting verification
            </Text>
            <Button
              title="View Details"
              onPress={() => router.navigate('/(tabs)/accounts' as any)}
              variant="ghost"
            />
          </Card>
        )}

        {/* Accounts Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Your Accounts</Text>
            <TouchableOpacity onPress={() => router.navigate('/(tabs)/accounts' as any)}>
              <Text className="text-blue-600 font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          {verifiedAccounts.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <View className="items-center py-8">
                <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-3 text-center font-medium">No verified accounts yet</Text>
                <Button
                  title="Add Your First Account"
                  onPress={() => router.navigate('/add-account' as any)}
                  variant="primary"
                  size="sm"
                  fullWidth
                  style={{ marginTop: 16 }}
                />
              </View>
            </Card>
          ) : (
            verifiedAccounts.slice(0, 2).map((account) => (
              <TouchableOpacity
                key={account.id}
                onPress={() => router.navigate(`/account/${account.id}` as any)}
                className="mb-3"
              >
                <Card variant="default" padding="md">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-2xl mr-2">🏦</Text>
                        <Text className="text-gray-600 font-medium flex-1">{account.bankName}</Text>
                      </View>
                      <Text className="text-gray-500 text-sm">****{account.accountNumber?.slice(-4)}</Text>
                      <Text className="text-2xl font-bold text-gray-900 mt-2">
                        {getCurrencySymbol(account.currency)}
                        {parseFloat(account.balance.toString()).toLocaleString()}
                      </Text>
                    </View>
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-800 text-xs font-semibold">✓ Verified</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Exchange Rates Widget */}
        <Card variant="default" padding="md">
          <Text className="font-bold text-gray-900 mb-4">Live Exchange Rates</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-gray-200">
              <Text className="text-gray-600">USD → NGN</Text>
              <Text className="font-semibold text-gray-900">₦1,650.00</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-200">
              <Text className="text-gray-600">USD → GBP</Text>
              <Text className="font-semibold text-gray-900">£0.79</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">USD → EUR</Text>
              <Text className="font-semibold text-gray-900">€0.92</Text>
            </View>
          </View>
          <Button
            title="View All Rates"
            onPress={() => router.navigate('/rates' as any)}
            variant="ghost"
            size="sm"
            fullWidth
            style={{ marginTop: 12 }}
          />
        </Card>
      </View>
    </ScrollView>
  );
}
