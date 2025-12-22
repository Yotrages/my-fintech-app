import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Button } from '@/components';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { cashPickupApi } from '@/libs/axios/api';
import { useAuthStore } from '@/libs/store/authStore';

interface PickupLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  operatingHours: string;
}

interface PickupTransaction {
  id: string;
  location: string;
  amount: number;
  recipientName: string;
  recipientPhone: string;
  pickupCode: string;
  status: 'pending' | 'ready' | 'picked-up' | 'cancelled';
  createdAt: string;
  expiresAt: string;
}

type Tab = 'finder' | 'pending' | 'history';

export default function CashPickupScreen() {
  const [tab, setTab] = useState<Tab>('finder');
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PickupLocation | null>(null);
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const { user } = useAuthStore();

  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading, refetch: refetchLocations } = useFetch<PickupLocation[]>(
    `/cash-pickup/locations${searchCity ? `?city=${searchCity}` : ''}`,
    tab === 'finder'
  );

  // Fetch pending & history
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = useFetch<PickupTransaction[]>(
    `/cash-pickup/transactions?status=${tab === 'pending' ? 'pending,ready' : 'picked-up'}&limit=20&offset=0`,
    tab !== 'finder'
  );

  // Initiate pickup mutation
  const initiatePickup = useMutate('POST', '/cash-pickup', {
    onSuccess: () => {
      setShowModal(false);
      setAmount('');
      setRecipientName('');
      setRecipientPhone('');
      setRecipientEmail('');
      setIdType('');
      setIdNumber('');
      refetchTransactions();
      Alert.alert('Success', 'Pickup initiated. Share the code with recipient.');
    },
    onError: (error) => {
      Alert.alert('Error', `Failed: ${error.message}`);
    },
  });

  // Complete pickup mutation
  const completePickup = useMutate('POST', `/cash-pickup/${selectedLocation?.id}/complete`, {
    onSuccess: () => {
      Alert.alert('Success', 'Pickup completed');
      refetchTransactions();
    },
  });

  // Cancel pickup mutation
  const cancelPickup = useMutate('POST', `/cash-pickup/${selectedLocation?.id}/cancel`, {
    onSuccess: () => {
      Alert.alert('Cancelled', 'Pickup cancelled successfully');
      refetchTransactions();
    },
  });

  const handleInitiatePickup = () => {
    if (!selectedLocation || !amount || !recipientName || !recipientPhone) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }

    const payload = {
      accountId: user?.id,
      locationId: selectedLocation.id,
      amount: parseFloat(amount),
      recipientData: {
        name: recipientName,
        phone: recipientPhone,
        email: recipientEmail || undefined,
        idType: idType || undefined,
        idNumber: idNumber || undefined,
      },
    };

    initiatePickup.mutate(payload as any);
  };

  const onRefresh = () => {
    refetchLocations();
    if (tab !== 'finder') refetchTransactions();
  };

  const pendingCount = transactions.filter((t) => t.status === 'pending' || t.status === 'ready').length;

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-gradient-to-b from-orange-600 to-orange-700 px-4 py-6 pt-12">
        <Text className="text-white text-2xl font-bold">Cash Pickup</Text>
        <Text className="text-orange-100 text-sm">Send cash to pickup locations</Text>
      </View>

      {/* Stats */}
      {pendingCount > 0 && (
        <View className="mx-4 mt-4 p-3 bg-yellow-100 rounded-lg flex-row items-center gap-2">
          <MaterialCommunityIcons name="alert" size={20} color="#f59e0b" />
          <View className="flex-1">
            <Text className="font-semibold text-yellow-900">{pendingCount} pickup(s) awaiting</Text>
            <Text className="text-xs text-yellow-800">Ready for collection</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View className="flex-row px-4 py-3 gap-2 bg-white border-b border-slate-200 mt-4">
        {(['finder', 'pending', 'history'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg ${
              tab === t ? 'bg-orange-600' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                tab === t ? 'text-white' : 'text-slate-600'
              }`}
            >
              {t === 'finder' ? 'Locations' : t === 'pending' ? 'Pending' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'finder' && (
        <View className="p-4 gap-4">
          {/* Search */}
          <View>
            <Text className="text-slate-700 font-semibold mb-2">Search by City</Text>
            <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
              <Ionicons name="search" size={20} color="#94a3b8" />
              <TextInput
                placeholder="e.g., Lagos, Abuja"
                value={searchCity}
                onChangeText={setSearchCity}
                className="flex-1 ml-2"
              />
            </View>
          </View>

          {/* Locations */}
          {locationsLoading ? (
            <ActivityIndicator size="large" color="#ea580c" />
          ) : locations.length > 0 ? (
            <FlatList
              data={locations}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Card className="mb-3 p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-start gap-2">
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={20}
                          color="#ea580c"
                        />
                        <View className="flex-1">
                          <Text className="font-bold text-slate-800">{item.name}</Text>
                          <Text className="text-sm text-slate-600 mt-1">{item.address}</Text>
                          <Text className="text-xs text-slate-500 mt-1">
                            {item.city}, {item.state}
                          </Text>
                          {item.distance && (
                            <Text className="text-xs text-orange-600 font-semibold mt-1">
                              {item.distance.toFixed(1)} km away
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="bg-slate-50 p-2 rounded mt-2 mb-3">
                    <Text className="text-xs text-slate-600">
                      ⏰ {item.operatingHours}
                    </Text>
                  </View>

                  <Button
                    onPress={() => {
                      setSelectedLocation(item);
                      setShowModal(true);
                    }}
                    className="w-full"
                  >
                    Send Cash Here
                  </Button>
                </Card>
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View className="items-center py-12">
              <MaterialCommunityIcons name="map-search" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 mt-4">
                {searchCity ? 'No locations found' : 'Enter a city to search'}
              </Text>
            </View>
          )}
        </View>
      )}

      {(tab === 'pending' || tab === 'history') && (
        <View className="p-4 gap-4">
          {transactionsLoading ? (
            <ActivityIndicator size="large" color="#ea580c" />
          ) : transactions.length > 0 ? (
            <FlatList
              data={transactions}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Card className="mb-3 p-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="font-bold text-slate-800">{item.recipientName}</Text>
                      <Text className="text-sm text-slate-600 mt-1">
                        📍 {item.location}
                      </Text>
                      <Text className="text-sm text-slate-600">
                        📱 {item.recipientPhone}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-orange-600">
                        ₦{item.amount.toLocaleString()}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded mt-2 ${
                          item.status === 'picked-up'
                            ? 'bg-green-100'
                            : item.status === 'ready'
                            ? 'bg-blue-100'
                            : 'bg-yellow-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            item.status === 'picked-up'
                              ? 'text-green-700'
                              : item.status === 'ready'
                              ? 'text-blue-700'
                              : 'text-yellow-700'
                          }`}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {tab === 'pending' && (
                    <Card className="bg-blue-50 p-3 my-3 border-l-4 border-l-blue-500">
                      <Text className="text-sm font-bold text-blue-900">
                        Pickup Code: {item.pickupCode}
                      </Text>
                      <Text className="text-xs text-blue-800 mt-1">
                        Share this with the recipient
                      </Text>
                    </Card>
                  )}

                  <View className="text-xs text-slate-500 mt-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </View>

                  {tab === 'pending' && (
                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => {
                          if (confirm('Cancel this pickup?')) {
                            setSelectedLocation({ id: item.id } as any);
                            cancelPickup.mutate({} as any);
                          }
                        }}
                        className="flex-1 bg-red-50 py-2 px-3 rounded-lg flex-row justify-center gap-2"
                      >
                        <Ionicons name="close" size={14} color="#ef4444" />
                        <Text className="text-red-600 font-semibold text-sm">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View className="items-center py-12">
              <MaterialCommunityIcons
                name={tab === 'pending' ? 'clock-outline' : 'history'}
                size={48}
                color="#cbd5e1"
              />
              <Text className="text-slate-500 mt-4">
                No {tab === 'pending' ? 'pending' : 'completed'} pickups
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Send Cash Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-4/5">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold">Send Cash via {selectedLocation?.name}</Text>
                <Pressable onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </Pressable>
              </View>

              <View className="gap-4 py-2">
                <View>
                  <Text className="text-slate-600 font-semibold mb-2">Amount</Text>
                  <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
                    <Text className="text-slate-600 font-semibold">₦</Text>
                    <TextInput
                      placeholder="0"
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      className="flex-1 ml-2"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-slate-600 font-semibold mb-2">Recipient Name *</Text>
                  <TextInput
                    placeholder="Full name"
                    value={recipientName}
                    onChangeText={setRecipientName}
                    className="border border-slate-300 rounded-lg px-4 py-3"
                  />
                </View>

                <View>
                  <Text className="text-slate-600 font-semibold mb-2">Phone Number *</Text>
                  <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
                    <Text className="text-slate-600">🇳🇬 +234</Text>
                    <TextInput
                      placeholder="8012345678"
                      value={recipientPhone}
                      onChangeText={(text) => setRecipientPhone(text.replace(/\D/g, ''))}
                      keyboardType="phone-pad"
                      className="flex-1 ml-2"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-slate-600 font-semibold mb-2">Email (Optional)</Text>
                  <TextInput
                    placeholder="user@example.com"
                    value={recipientEmail}
                    onChangeText={setRecipientEmail}
                    keyboardType="email-address"
                    className="border border-slate-300 rounded-lg px-4 py-3"
                  />
                </View>

                <View>
                  <Text className="text-slate-600 font-semibold mb-2">ID Type (Optional)</Text>
                  <TextInput
                    placeholder="BVN, NIN, Passport"
                    value={idType}
                    onChangeText={setIdType}
                    className="border border-slate-300 rounded-lg px-4 py-3"
                  />
                </View>

                <View>
                  <Text className="text-slate-600 font-semibold mb-2">ID Number (Optional)</Text>
                  <TextInput
                    placeholder="ID number"
                    value={idNumber}
                    onChangeText={setIdNumber}
                    className="border border-slate-300 rounded-lg px-4 py-3"
                  />
                </View>

                {amount && (
                  <Card className="bg-slate-50 p-4 border-l-4 border-l-orange-600">
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-slate-600">Location:</Text>
                        <Text className="font-semibold text-slate-800">{selectedLocation?.name}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-600">Amount:</Text>
                        <Text className="font-bold text-orange-600">₦{parseFloat(amount).toLocaleString()}</Text>
                      </View>
                    </View>
                  </Card>
                )}
              </View>

              <Button
                onPress={handleInitiatePickup}
                disabled={initiatePickup.isPending}
                className="mt-6 mb-4"
              >
                {initiatePickup.isPending ? 'Processing...' : 'Confirm & Send'}
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
