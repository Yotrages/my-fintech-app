import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, CountryPickerButton, ProviderGrid, AirtimeModal, AirtimeHistory, ScreenWrapper } from '@/components';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { useAuthStore } from '@/libs/store/authStore';
import { getAllCountries, Country, getCurrencySymbol, validatePhoneNumber } from '@/libs/countries';
import { successNotification, errorNotification } from '@/libs/feedback/notification';

interface Provider {
  name: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
  currencyCode: string;
  phonePrefixes?: string[];
}

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

type Tab = 'topup' | 'history';

export default function AirtimeScreen() {
  const [tab, setTab] = useState<Tab>('topup');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedProviderConfig, setSelectedProviderConfig] = useState<Provider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
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

  // Fetch providers for selected country
  const { data: providers = {}, isLoading: providersLoading, refetch: refetchProviders } = useFetch<Record<string, Provider>>(
    selectedCountry ? `/airtime/providers?country=${selectedCountry.code}` : '',
    tab === 'topup' && !!selectedCountry
  );

  // Fetch history
  const { data: transactions = [], isLoading: historyLoading, refetch: refetchHistory } = useFetch<Transaction[]>(
    '/airtime/history?limit=20&offset=0',
    tab === 'history'
  );

  // Top-up mutation
  const topUp = useMutate('POST', '/airtime/topup', {
    onSuccess: () => {
      setShowModal(false);
      setPhoneNumber('');
      setAmount('');
      setSelectedProvider(null);
      setSelectedProviderConfig(null);
      refetchHistory();
      successNotification('Airtime top-up successful!');
    },
    onError: (error) => {
      errorNotification(`Top-up failed: ${error.message}`);
    },
  });

  const handleTopUp = () => {
    if (!selectedCountry || !selectedProvider || !selectedProviderConfig || !phoneNumber || !amount) {
      errorNotification('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount < selectedProviderConfig.minAmount || numAmount > selectedProviderConfig.maxAmount) {
      errorNotification(
        `Amount must be between ${selectedCountry.currency}${selectedProviderConfig.minAmount} and ${selectedCountry.currency}${selectedProviderConfig.maxAmount}`
      );
      return;
    }

    // Validate phone number - IMPORTANT: Check for fraud
    const phoneValidation = validatePhoneNumber(phoneNumber, selectedCountry.code);
    if (!phoneValidation.isValid) {
      errorNotification(phoneValidation.error || 'Invalid phone number');
      return;
    }

    // Additional validation: Check if phone belongs to selected country
    // This prevents users from using numbers from other countries
    if (selectedProviderConfig.phonePrefixes) {
      const cleaned = phoneNumber.replace(/\D/g, '');
      const isValid = selectedProviderConfig.phonePrefixes.some(prefix => cleaned.startsWith(prefix));
      if (!isValid) {
        errorNotification('Phone number does not match selected provider prefixes');
        return;
      }
    }

    topUp.mutate({
      accountId: user?.id,
      phoneNumber: phoneValidation.formattedNumber || phoneNumber,
      provider: selectedProvider,
      amount: numAmount,
      country: selectedCountry.code,
    } as any);
  };

  const calculateFee = () => {
    if (!selectedProviderConfig || !amount) return 0;
    return parseFloat(amount) * selectedProviderConfig.fee;
  };

  const onRefresh = () => {
    refetchProviders();
    refetchHistory();
  };

  const providerEmojis: Record<string, string> = {
    mtn: '🟡',
    airtel: '🔴',
    '9mobile': '🟣',
    glo: '🟢',
    safaricom: '🔵',
    vodafone: '🟠',
  };

  const handleSelectProvider = (code: string, config: Provider) => {
    setSelectedProvider(code);
    setSelectedProviderConfig(config);
    setShowModal(true);
  };

  const currencySymbol = selectedCountry ? getCurrencySymbol(selectedCountry.currency) : '₦';

  return (
    <ScreenWrapper>
    <ScrollView
      className="bg-slate-50"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-gradient-to-b from-emerald-600 to-emerald-700 px-4 py-6 pt-12">
        <Text className="text-white text-2xl font-bold">Buy Airtime</Text>
        <Text className="text-emerald-100 text-sm">Quick & instant top-up</Text>
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
        {(['topup', 'history'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg ${
              tab === t ? 'bg-emerald-600' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                tab === t ? 'text-white' : 'text-slate-600'
              }`}
            >
              {t === 'topup' ? 'Top-up' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'topup' && (
        <View className="p-4 gap-4">
          <ProviderGrid
            providers={providers}
            selectedProvider={selectedProvider}
            isLoading={providersLoading}
            currencySymbol={currencySymbol}
            emojis={providerEmojis}
            onSelectProvider={handleSelectProvider}
          />
        </View>
      )}

      {tab === 'history' && (
        <View className="p-4 gap-4">
          <AirtimeHistory
            transactions={transactions}
            isLoading={historyLoading}
            currencySymbol={currencySymbol}
            providerEmojis={providerEmojis}
          />
        </View>
      )}

      {/* Airtime Top-up Modal */}
      <AirtimeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        selectedProvider={selectedProviderConfig}
        selectedCountry={selectedCountry}
        phoneNumber={phoneNumber}
        onPhoneChange={setPhoneNumber}
        amount={amount}
        onAmountChange={setAmount}
        onSubmit={handleTopUp}
        isLoading={topUp.isPending}
        calculateFee={calculateFee}
      />
    </ScrollView>
    </ScreenWrapper>
  );
}
