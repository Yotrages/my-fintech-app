import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useMutate, useFetch } from '@/hooks/useFetch';
import { useRouter } from 'expo-router';
import currency from 'currency.js';
import { v4 as uuidv4 } from 'uuid';

export default function TransferScreen() {
  const router = useRouter();
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const { data: accounts } = useFetch<{ data: any[] }>('accounts');

  const { mutate, isLoading } = useMutate('POST', 'transactions/transfer', {
    successMessage: 'Transfer completed successfully!',
    onSuccess: () => {
      router.back();
    }
  });

  const handleTransfer = () => {
    if (!sourceAccountId || !destinationAccountNumber || !amount) {
      return;
    }

    mutate({
      sourceAccountId,
      destinationAccountNumber,
      amount: parseFloat(amount),
      description,
      idempotencyKey: uuidv4()
    });
  };

  const selectedAccount = accounts?.data?.find(acc => acc.id === sourceAccountId);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Transfer Money
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              From Account
            </Text>
            <View className="border border-gray-300 rounded-lg overflow-hidden">
              <Picker
                selectedValue={sourceAccountId}
                onValueChange={setSourceAccountId}
              >
                <Picker.Item label="Select account" value="" />
                {accounts?.data?.map((account) => (
                  <Picker.Item
                    key={account.id}
                    label={`${account.accountType} - ${currency(account.balance).format()}`}
                    value={account.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {selectedAccount && (
            <View className="bg-blue-50 rounded-lg p-4">
              <Text className="text-sm text-gray-600">Available Balance</Text>
              <Text className="text-2xl font-bold text-blue-600">
                {currency(selectedAccount.balance, { symbol: '$' }).format()}
              </Text>
            </View>
          )}

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              To Account Number
            </Text>
            <TextInput
              value={destinationAccountNumber}
              onChangeText={setDestinationAccountNumber}
              placeholder="Enter 10-digit account number"
              keyboardType="numeric"
              maxLength={10}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Amount
            </Text>
            <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
              <Text className="text-xl mr-2">$</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="flex-1 text-base"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What's this for?"
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            onPress={handleTransfer}
            disabled={isLoading || !sourceAccountId || !destinationAccountNumber || !amount}
            className={`rounded-lg py-4 items-center mt-6 ${
              isLoading || !sourceAccountId || !destinationAccountNumber || !amount
                ? 'bg-gray-300'
                : 'bg-blue-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Transfer {amount ? currency(parseFloat(amount), { symbol: '$' }).format() : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
