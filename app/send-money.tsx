import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { useRouter } from 'expo-router';
import { getCurrencySymbol, SUPPORTED_COUNTRIES } from '@/constants/countries';
import { v4 as uuidv4 } from 'uuid';

export default function SendMoneyScreen() {
  const router = useRouter();
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [calculation, setCalculation] = useState<any>(null);

  const { data: accounts } = useFetch<{ data: any[] }>('accounts');
  const verifiedAccounts = accounts?.data?.filter(acc => acc.isVerified) || [];
  
  const { mutate: calculateCost, isLoading: calculating } = useMutate('POST', 'transactions/calculate-cost', {
    onSuccess: (data) => setCalculation(data.data)
  });

  const { mutate: sendMoney, isLoading: sending } = useMutate('POST', 'transactions/cross-border-transfer', {
    successMessage: 'Money sent successfully!',
    onSuccess: () => router.back()
  });

  useEffect(() => {
    if (sourceAccountId && destinationAccountId && amount && parseFloat(amount) > 0) {
      calculateCost({ sourceAccountId, destinationAccountId, amount: parseFloat(amount) });
    }
  }, [sourceAccountId, destinationAccountId, amount]);

  const sourceAccount = verifiedAccounts.find(acc => acc.id === sourceAccountId);
  const destinationAccount = verifiedAccounts.find(acc => acc.id === destinationAccountId);

  const handleSend = () => {
    sendMoney({
      sourceAccountId,
      destinationAccountId,
      amount: parseFloat(amount),
      description,
      idempotencyKey: uuidv4()
    });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Send Money</Text>
        <Text className="text-gray-600 mb-8">Fast international transfers</Text>

        {/* From Account */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-3">From</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {verifiedAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                onPress={() => setSourceAccountId(account.id)}
                className={`mr-3 p-4 rounded-xl border-2 min-w-[200px] ${
                  sourceAccountId === account.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Text className="text-2xl mb-2">{SUPPORTED_COUNTRIES.find(c => c.code === account.country)?.flag}</Text>
                <Text className="text-gray-600 text-sm mb-1">{account.bankName}</Text>
                <Text className="font-bold text-lg">{getCurrencySymbol(account.currency)}{parseFloat(account.balance).toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* To Account */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-3">To</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {verifiedAccounts.filter(acc => acc.id !== sourceAccountId).map((account) => (
              <TouchableOpacity
                key={account.id}
                onPress={() => setDestinationAccountId(account.id)}
                className={`mr-3 p-4 rounded-xl border-2 min-w-[200px] ${
                  destinationAccountId === account.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Text className="text-2xl mb-2">{SUPPORTED_COUNTRIES.find(c => c.code === account.country)?.flag}</Text>
                <Text className="text-gray-600 text-sm mb-1">{account.bankName}</Text>
                <Text className="font-bold text-lg">{account.currency}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Amount */}
        {sourceAccount && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Amount</Text>
            <View className="border border-gray-300 rounded-xl px-4 py-3 flex-row items-center">
              <Text className="text-xl mr-2">{getCurrencySymbol(sourceAccount.currency)}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="flex-1 text-base"
              />
            </View>
          </View>
        )}

        {/* Calculation */}
        {calculation && destinationAccount && (
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="font-semibold text-gray-900 mb-3">Transfer Details</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">You send</Text>
              <Text className="font-medium">{getCurrencySymbol(sourceAccount.currency)}{calculation.sourceAmount.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Fee</Text>
              <Text className="font-medium">{getCurrencySymbol(sourceAccount.currency)}{calculation.fee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Total cost</Text>
              <Text className="font-bold">{getCurrencySymbol(sourceAccount.currency)}{calculation.totalCost.toFixed(2)}</Text>
            </View>
            <View className="border-t border-gray-200 my-3" />
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Exchange rate</Text>
              <Text className="font-medium">1 {sourceAccount.currency} = {calculation.rate.toFixed(4)} {destinationAccount.currency}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-900 font-semibold">Recipient gets</Text>
              <Text className="font-bold text-green-600 text-lg">{getCurrencySymbol(destinationAccount.currency)}{calculation.destinationAmount.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Description (Optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What's this for?"
            multiline
            numberOfLines={3}
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!calculation || sending}
          className={`rounded-xl py-4 items-center ${
            !calculation || sending ? 'bg-gray-300' : 'bg-blue-600'
          }`}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Send {calculation ? `${getCurrencySymbol(sourceAccount.currency)}${calculation.sourceAmount.toFixed(2)}` : 'Money'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}