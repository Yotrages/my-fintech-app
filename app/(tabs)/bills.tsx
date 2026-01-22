import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, CountryPickerButton, ProviderGrid, ScreenWrapper } from '@/components';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { billsApi } from '@/libs/axios/api';
import { useAuthStore } from '@/libs/store/authStore';
import { getAllCountries, Country, getCurrencySymbol } from '@/libs/countries';
import { validateBillPayment } from '@/libs/fraud-detection';
import { successNotification, errorNotification, warningNotification } from '@/libs/feedback/notification';

interface BillProvider {
  name: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
  currencyCode: string;
}

interface SavedAccount {
  id: string;
  provider: string;
  nickname: string;
  billDetails: Record<string, string>;
  isDefault: boolean;
}

interface Payment {
  id: string;
  provider: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  billDetails: Record<string, string>;
}

type Tab = 'pay' | 'saved' | 'history';

export default function BillsScreen() {
  const [tab, setTab] = useState<Tab>('pay');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedProviderConfig, setSelectedProviderConfig] = useState<BillProvider | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saveAccount, setSaveAccount] = useState(false);
  const [accountNickname, setAccountNickname] = useState('');
  const { user } = useAuthStore();

  // Initialize countries dynamically
  useEffect(() => {
    const countries = getAllCountries();
    setAllCountries(countries);
    
    if (!selectedCountry && countries.length > 0) {
      const defaultCountry = countries.find((c: any) => c.code === 'NG') || countries[0];
      setSelectedCountry(defaultCountry);
    }
  }, []);

  // Fetch providers
  const { data: providers = {}, isLoading: providersLoading, refetch: refetchProviders } = useFetch<Record<string, BillProvider>>(
    selectedCountry ? `/bills/providers?country=${selectedCountry.code}` : '',
    tab === 'pay' && !!selectedCountry
  );

  // Fetch saved accounts
  const { data: savedAccounts = [], isLoading: savedLoading, refetch: refetchSaved } = useFetch<SavedAccount[]>(
    '/bills/accounts/saved',
    tab === 'saved'
  );

  // Fetch payment history
  const { data: paymentHistory = [], isLoading: historyLoading, refetch: refetchHistory } = useFetch<Payment[]>(
    '/bills/history?limit=20&offset=0',
    tab === 'history'
  );

  // Create payment mutation
  const createPayment = useMutate('POST', '/bills/pay', {
    onSuccess: () => {
      setShowPaymentModal(false);
      setAccountNumber('');
      setAmount('');
      setAccountNickname('');
      setSaveAccount(false);
      setSelectedProvider(null);
      setSelectedProviderConfig(null);
      refetchHistory();
      successNotification('Payment initiated successfully!');
    },
    onError: (error) => {
      errorNotification(`Payment failed: ${error.message}`);
    },
  });

  // Delete saved account mutation
  const deleteSaved = useMutate('DELETE', `/bills/accounts`, {
    onSuccess: () => {
      refetchSaved();
      successNotification('Account deleted');
    },
    onError: (error) => {
      errorNotification(`Delete failed: ${error.message}`);
    },
  });

  const handlePayment = async () => {
    if (!selectedProvider || !selectedProviderConfig || !accountNumber || !amount) {
      errorNotification('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    
    // Comprehensive fraud detection validation
    const validation = validateBillPayment(accountNumber, numAmount, selectedProvider, selectedCountry?.code || '');
    
    if (!validation.isValid) {
      // Show all errors
      validation.errors.forEach(error => {
        errorNotification(error);
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        warningNotification(warning);
      });
    }

    // Additional amount validation
    if (numAmount < selectedProviderConfig.minAmount || numAmount > selectedProviderConfig.maxAmount) {
      errorNotification(
        `Amount must be between ${selectedCountry?.currency}${selectedProviderConfig.minAmount} and ${selectedCountry?.currency}${selectedProviderConfig.maxAmount}`
      );
      return;
    }

    const payload = {
      accountId: user?.id,
      provider: selectedProvider,
      amount: numAmount,
      billDetails: { accountNumber },
      country: selectedCountry?.code,
      saveAccount,
      accountNickname: saveAccount ? accountNickname || accountNumber : undefined,
    };

    createPayment.mutate(payload as any);
  };

  const onRefresh = React.useCallback(() => {
    refetchProviders();
    if (tab === 'saved') refetchSaved();
    if (tab === 'history') refetchHistory();
  }, [refetchProviders, refetchSaved, refetchHistory, tab]);

  const providerEmojis: Record<string, string> = {
    dstv: '📺',
    gotv: '📺',
    electricity: '⚡',
    water: '💧',
    airtime: '📱',
  };

  const currencySymbol = selectedCountry ? getCurrencySymbol(selectedCountry.currency) : '₦';

  return (
    <ScreenWrapper>
    <ScrollView
      className="bg-slate-50"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-blue-600 px-4 py-6 pt-12">
        <Text className="text-white text-2xl font-bold">Pay Bills</Text>
        <Text className="text-blue-100 text-sm">Pay electricity, cable, internet & water</Text>
      </View>

      {/* Country Selector */}
      <View className="px-4 py-4 bg-white border-b border-slate-200">
        <CountryPickerButton
          selectedCountry={selectedCountry}
          countries={allCountries}
          onSelectCountry={(country) => {
            setSelectedCountry(country);
            setSelectedProvider(null);
            setSelectedProviderConfig(null);
          }}
          label="Country"
        />
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 gap-2 bg-white border-b border-slate-200">
        {(['pay', 'saved', 'history'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg ${
              tab === t ? 'bg-blue-600' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                tab === t ? 'text-white' : 'text-slate-600'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'pay' && (
        <View className="p-4 gap-4">
          <ProviderGrid
            providers={providers}
            selectedProvider={selectedProvider}
            isLoading={providersLoading}
            currencySymbol={currencySymbol}
            emojis={providerEmojis}
            onSelectProvider={(code, config) => {
              setSelectedProvider(code);
              setSelectedProviderConfig(config);
              setShowPaymentModal(true);
            }}
          />
        </View>
      )}

      {tab === 'saved' && (
        <View className="p-4 gap-4">
          {savedLoading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : savedAccounts.length > 0 ? (
            <FlatList
              data={savedAccounts}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Card className="mb-3 p-4 flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-800">{item.nickname}</Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      {item.provider}
                    </Text>
                    {item.isDefault && (
                      <Text className="text-xs text-blue-600 font-semibold mt-1">Default</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteSaved.mutate({ id: item.id } as any)}
                    className="ml-2 p-2"
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </Card>
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View className="items-center py-8">
              <Ionicons name="bookmark-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 mt-2">No saved accounts</Text>
            </View>
          )}
        </View>
      )}

      {tab === 'history' && (
        <View className="p-4 gap-4">
          {historyLoading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : paymentHistory.length > 0 ? (
            <FlatList
              data={paymentHistory}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Card className="mb-3 p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-slate-800">{item.provider}</Text>
                      <Text className="text-xs text-slate-400 mt-1">
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-bold text-slate-800">{currencySymbol}{item.amount.toLocaleString()}</Text>
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
          ) : (
            <View className="items-center py-8">
              <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 mt-2">No payment history</Text>
            </View>
          )}
        </View>
      )}

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Pay {selectedProviderConfig?.name}</Text>
              <Pressable onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-slate-600 font-semibold mb-2">Account Number</Text>
                <TextInput
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  className="border border-slate-300 rounded-lg px-4 py-3"
                />
              </View>

              <View>
                <Text className="text-slate-600 font-semibold mb-2">Amount</Text>
                <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
                  <Text className="text-slate-600 font-semibold">{selectedCountry?.currency}</Text>
                  <TextInput
                    placeholder="0"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    className="flex-1 ml-2"
                  />
                </View>
                {selectedProviderConfig && (
                  <Text className="text-xs text-slate-500 mt-1">
                    Min: {currencySymbol}{selectedProviderConfig.minAmount} | Max: {currencySymbol}{selectedProviderConfig.maxAmount}
                  </Text>
                )}
              </View>

              <View className="flex-row items-center gap-2 py-2">
                <TouchableOpacity
                  onPress={() => setSaveAccount(!saveAccount)}
                  className={`w-6 h-6 rounded border-2 ${
                    saveAccount ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                  } justify-center items-center`}
                >
                  {saveAccount && <Ionicons name="checkmark" size={16} color="white" />}
                </TouchableOpacity>
                <Text className="text-slate-600">Save account for future</Text>
              </View>

              {saveAccount && (
                <View>
                  <Text className="text-slate-600 font-semibold mb-2">Account Nickname</Text>
                  <TextInput
                    placeholder="e.g., My DSTV"
                    value={accountNickname}
                    onChangeText={setAccountNickname}
                    className="border border-slate-300 rounded-lg px-4 py-3"
                  />
                </View>
              )}
            </View>

            <Button
              onPress={handlePayment}
              className="mt-4"
              disabled={createPayment.isPending}
            >
              {createPayment.isPending ? 'Processing...' : `Pay ${currencySymbol}${amount || '0'}`}
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </ScreenWrapper>
  );
}
