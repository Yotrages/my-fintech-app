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
import { Card, Button, CountryPickerButton, ScreenWrapper } from '@/components';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { cryptoApi } from '@/libs/axios/api';
import { useAuthStore } from '@/libs/store/authStore';
import { getAllCountries, Country, getCurrencySymbol } from '@/libs/countries';
import { validateCryptoTransaction } from '@/libs/fraud-detection';
import { successNotification, errorNotification, warningNotification } from '@/libs/feedback/notification';

interface Wallet {
  id: string;
  cryptoType: string;
  balance: number;
  usdValue: number;
}

interface CryptoPrice {
  symbol: string;
  name: string;
  priceCurrency: number;
  priceInCurrency: number;
  change24h: number;
}

type Tab = 'wallets' | 'prices';
type ActionType = 'buy' | 'sell';

export default function CryptoScreen() {
  const [tab, setTab] = useState<Tab>('wallets');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('buy');
  const [amount, setAmount] = useState('');
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

  // Fetch wallets
  const { data: wallets = [], isLoading: walletsLoading, refetch: refetchWallets } = useFetch<Wallet[]>(
    '/crypto/wallets',
    tab === 'wallets'
  );

  // Fetch prices for selected currency
  const { data: prices = [], isLoading: pricesLoading, refetch: refetchPrices } = useFetch<CryptoPrice[]>(
    selectedCountry ? `/crypto/prices?currency=${selectedCountry.currency}` : '',
    tab === 'prices' && !!selectedCountry
  );

  // Buy crypto mutation
  const buyCrypto = useMutate('POST', '/crypto/buy', {
    onSuccess: () => {
      setShowActionModal(false);
      setAmount('');
      refetchWallets();
      successNotification('Purchase successful!');
    },
    onError: (error) => {
      errorNotification(`Purchase failed: ${error.message}`);
    },
  });

  // Sell crypto mutation
  const sellCrypto = useMutate('POST', '/crypto/sell', {
    onSuccess: () => {
      setShowActionModal(false);
      setAmount('');
      refetchWallets();
      successNotification('Sale successful!');
    },
    onError: (error) => {
      errorNotification(`Sale failed: ${error.message}`);
    },
  });

  const handleTransaction = () => {
    if (!selectedWallet || !amount || !selectedCountry) {
      errorNotification('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);

    // Comprehensive fraud detection validation
    const validation = validateCryptoTransaction(numAmount, actionType, selectedCountry.code);

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

    const payload = {
      accountId: user?.id,
      walletId: selectedWallet.id,
      [actionType === 'buy' ? 'amount' : 'cryptoAmount']: numAmount,
      currency: selectedCountry.currency,
    };

    if (actionType === 'buy') {
      buyCrypto.mutate(payload as any);
    } else {
      sellCrypto.mutate(payload as any);
    }
  };

  const totalWalletValue = wallets.reduce((sum, wallet) => sum + wallet.usdValue, 0);

  const onRefresh = () => {
    refetchWallets();
    refetchPrices();
  };

  const cryptoEmojis: Record<string, string> = {
    BTC: '₿',
    ETH: 'Ξ',
    USDT: '💵',
    USDC: '💵',
    BNB: '🔶',
  };

  if ((walletsLoading && !wallets.length) || (pricesLoading && !prices.length)) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScreenWrapper>
    <ScrollView
      className="bg-slate-50"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-gradient-to-b from-purple-600 to-purple-700 px-4 py-6 pt-12">
        <Text className="text-white text-2xl font-bold">Crypto Wallet</Text>
        <Text className="text-purple-100 text-sm">Buy, sell & hold cryptocurrencies</Text>
      </View>

      {/* Currency Selector */}
      <View className="px-4 py-4 bg-white border-b border-slate-200">
        <CountryPickerButton
          selectedCountry={selectedCountry}
          countries={allCountries}
          onSelectCountry={setSelectedCountry}
          label="Currency"
        />
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 gap-2 bg-white border-b border-slate-200">
        {(['wallets', 'prices'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg ${
              tab === t ? 'bg-purple-600' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                tab === t ? 'text-white' : 'text-slate-600'
              }`}
            >
              {t === 'wallets' ? 'Wallets' : 'Prices'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'wallets' && (
        <View className="p-4 gap-4">
          {/* Total Balance */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 p-6">
            <Text className="text-purple-100 text-sm font-semibold">Total Balance</Text>
            <Text className="text-white text-3xl font-bold mt-2">
              ${totalWalletValue.toFixed(2)}
            </Text>
            <Text className="text-purple-200 text-xs mt-2">
              {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} active
            </Text>
          </Card>

          {/* Wallets List */}
          {wallets.length > 0 ? (
            <View className="gap-3">
              <Text className="text-slate-700 font-semibold">Your Wallets</Text>
              <FlatList
                data={wallets}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Card className="p-4 mb-3">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center gap-3 flex-1">
                        <Text className="text-3xl">
                          {cryptoEmojis[item.cryptoType] || '💰'}
                        </Text>
                        <View className="flex-1">
                          <Text className="font-bold text-slate-800">{item.cryptoType}</Text>
                          <Text className="text-xs text-slate-500">
                            {item.balance.toFixed(8)} {item.cryptoType}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-slate-800">
                          ${item.usdValue.toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-2 pt-3 border-t border-slate-200">
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedWallet(item);
                          setActionType('buy');
                          setShowActionModal(true);
                        }}
                        className="flex-1 bg-emerald-50 py-2 px-3 rounded-lg flex-row justify-center items-center gap-2"
                      >
                        <Ionicons name="arrow-down" size={16} color="#059669" />
                        <Text className="text-emerald-600 font-semibold">Buy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedWallet(item);
                          setActionType('sell');
                          setShowActionModal(true);
                        }}
                        className="flex-1 bg-red-50 py-2 px-3 rounded-lg flex-row justify-center items-center gap-2"
                      >
                        <Ionicons name="arrow-up" size={16} color="#dc2626" />
                        <Text className="text-red-600 font-semibold">Sell</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          ) : (
            <View className="items-center py-12">
              <Ionicons name="wallet-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 mt-4">No wallets created yet</Text>
              <Button className="mt-4 px-6">Create Wallet</Button>
            </View>
          )}
        </View>
      )}

      {tab === 'prices' && (
        <View className="p-4 gap-4">
          <Text className="text-slate-700 font-semibold mb-2">Live Prices ({selectedCountry?.currency})</Text>
          {prices.length > 0 ? (
            <FlatList
              data={prices}
              scrollEnabled={false}
              renderItem={({ item, index }) => {
                const isPositive = item.change24h >= 0;
                return (
                  <Card className="p-4 mb-3">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center gap-3 flex-1">
                        <Text className="text-3xl">
                          {cryptoEmojis[item.symbol] || '💰'}
                        </Text>
                        <View className="flex-1">
                          <Text className="font-bold text-slate-800">{item.symbol}</Text>
                          <Text className="text-xs text-slate-500">{item.name}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-slate-800">
                          {selectedCountry?.currency}{item.priceInCurrency?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          }) || item.priceCurrency?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          }) || '0.00'}
                        </Text>
                        <Text
                          className={`text-sm font-bold mt-1 ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? '↑' : '↓'} {Math.abs(item.change24h).toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              }}
              keyExtractor={(item, index) => `${item.symbol}-${index}`}
            />
          ) : (
            <View className="items-center py-8">
              <Ionicons name="trending-up" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 mt-2">Unable to load prices</Text>
            </View>
          )}
        </View>
      )}

      {/* Buy/Sell Modal */}
      <Modal visible={showActionModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold">
                {actionType === 'buy' ? 'Buy' : 'Sell'} {selectedWallet?.cryptoType}
              </Text>
              <Pressable onPress={() => setShowActionModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>

            <View className="gap-4 py-2">
              <View>
                <Text className="text-slate-600 font-semibold mb-2">
                  {actionType === 'buy'
                    ? `Amount in ${selectedCountry?.currency}`
                    : `Amount in ${selectedWallet?.cryptoType}`}
                </Text>
                <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
                  <Text className="text-slate-600 font-semibold">
                    {actionType === 'buy' ? selectedCountry?.currency : selectedWallet?.cryptoType}
                  </Text>
                  <TextInput
                    placeholder="0"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    className="flex-1 ml-2"
                  />
                </View>
              </View>

              {/* Summary */}
              {amount && selectedWallet && (
                <Card className="bg-slate-50 p-4">
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-slate-600">
                        {actionType === 'buy' ? 'You pay:' : 'You get:'}
                      </Text>
                      <Text className="text-slate-800 font-semibold">
                        {actionType === 'buy' ? selectedCountry?.currency : '$'}
                        {parseFloat(amount).toLocaleString()}
                      </Text>
                    </View>
                    {actionType === 'buy' && (
                      <View className="flex-row justify-between">
                        <Text className="text-slate-600">You receive:</Text>
                        <Text className="text-slate-800 font-semibold">
                          {(parseFloat(amount) / 1500).toFixed(8)} {selectedWallet?.cryptoType}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              )}
            </View>

            <Button
              onPress={handleTransaction}
              disabled={actionType === 'buy' ? buyCrypto.isPending : sellCrypto.isPending}
              className="mt-2"
            >
              {(actionType === 'buy' ? buyCrypto.isPending : sellCrypto.isPending)
                ? 'Processing...'
                : `${actionType === 'buy' ? 'Buy' : 'Sell'} Now`}
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </ScreenWrapper>
  );
}
