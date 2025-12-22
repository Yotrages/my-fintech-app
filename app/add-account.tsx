import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddAccountScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  // Fetch ALL countries from backend
  const { data: countriesData } = useFetch<{ data: any[] }>('countries');
  const countries = countriesData?.data || [];

  // Filter countries by search
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const { mutate, isLoading } = useMutate('POST', 'accounts/bank-account', {
    successMessage: 'Bank account added! Please submit verification.',
    onSuccess: (data) => router.push(`/verify-account/${data.data.id}`)
  });

  const handleSubmit = () => {
    mutate({
      accountType: 'checking',
      country: selectedCountry.code,
      currency: selectedCountry.currency,
      bankName,
      accountNumber,
      routingNumber: routingNumber || undefined
    });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Add Bank Account</Text>
        <Text className="text-gray-600 mb-6">Select your country to get started</Text>

        {/* Search Countries */}
        <View className="mb-4">
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search countries..."
              className="flex-1 ml-2 text-base"
            />
          </View>
        </View>

        {/* Popular Countries Quick Access */}
        {!search && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Popular</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {countries.filter(c => ['US', 'NG', 'GB', 'KE', 'GH', 'IN'].includes(c.code)).map((country) => (
                <TouchableOpacity
                  key={country.code}
                  onPress={() => setSelectedCountry(country)}
                  className={`mr-2 px-4 py-3 rounded-xl border-2 ${
                    selectedCountry?.code === country.code ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Text className="text-2xl mb-1">{country.flag}</Text>
                  <Text className="text-xs font-medium">{country.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Countries List */}
        <View className="mb-6" style={{ maxHeight: 300 }}>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            {search ? 'Search Results' : 'All Countries'} ({filteredCountries.length})
          </Text>
          <ScrollView className="border border-gray-200 rounded-xl">
            {filteredCountries.map((country) => (
              <TouchableOpacity
                key={country.code}
                onPress={() => setSelectedCountry(country)}
                className={`p-4 border-b border-gray-100 flex-row items-center ${
                  selectedCountry?.code === country.code ? 'bg-blue-50' : ''
                }`}
              >
                <Text className="text-2xl mr-3">{country.flag}</Text>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{country.name}</Text>
                  <Text className="text-sm text-gray-500">{country.currency}</Text>
                </View>
                {selectedCountry?.code === country.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bank Details Form */}
        {selectedCountry && (
          <>
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <Text className="text-blue-900 font-semibold">
                Selected: {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.currency})
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Bank Name</Text>
              <TextInput
                value={bankName}
                onChangeText={setBankName}
                placeholder="Enter your bank name"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Account Number</Text>
              <TextInput
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Enter account number"
                keyboardType="numeric"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>

            {['US', 'CA'].includes(selectedCountry.code) && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Routing Number</Text>
                <TextInput
                  value={routingNumber}
                  onChangeText={setRoutingNumber}
                  placeholder="9-digit routing number"
                  keyboardType="numeric"
                  maxLength={9}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </View>
            )}

            <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <Text className="text-green-900 font-semibold mb-2">✅ Stripe Auto-Setup</Text>
              <Text className="text-green-800 text-sm">
                Your payment account will be created automatically. No extra steps needed!
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !bankName || !accountNumber}
              className={`rounded-xl py-4 items-center ${
                isLoading || !bankName || !accountNumber ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Add Account & Verify</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
