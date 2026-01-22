import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useFetch } from '@/hooks/useFetch';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: account } = useFetch<{ data: any }>(`accounts/${id}`);

  const accountData = account?.data;

  return (
    <ScreenWrapper>
    <ScrollView className="bg-white">
      <View className="px-6 py-8">
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            {accountData?.currency} {parseFloat(accountData?.balance || 0).toLocaleString()}
          </Text>
          <Text className="text-gray-600">{accountData?.bankName}</Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="text-gray-600 text-sm mb-1">Account Number</Text>
          <Text className="text-gray-900 font-bold text-lg mb-3">{accountData?.accountNumber}</Text>
          
          <Text className="text-gray-600 text-sm mb-1">Country</Text>
          <Text className="text-gray-900 font-medium mb-3">{accountData?.country}</Text>
          
          <Text className="text-gray-600 text-sm mb-1">Status</Text>
          <Text className={`font-semibold ${accountData?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
            {accountData?.isVerified ? '✓ Verified' : 'Pending Verification'}
          </Text>
        </View>

        <View className="flex-row space-x-3 mb-6">
          <TouchableOpacity onPress={() => router.push('/send-money')} className="flex-1 bg-blue-600 rounded-xl p-4 items-center">
            <Ionicons name="paper-plane" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push(`/deposit/${id}`)} className="flex-1 bg-green-600 rounded-xl p-4 items-center">
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Deposit</Text>
          </TouchableOpacity>
        </View>

        {!accountData?.isVerified && (
          <TouchableOpacity onPress={() => router.push(`/verify-account/${id}`)} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <Text className="text-yellow-900 font-semibold">⚠️ Verify this account to send/receive money</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
    </ScreenWrapper>
  );
}
