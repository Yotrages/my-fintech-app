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
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Button, ScreenWrapper } from '@/components';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { qrCodesApi } from '@/libs/axios/api';
import { useAuthStore } from '@/libs/store/authStore';

interface QRCode {
  id: string;
  code: string;
  type: 'payment' | 'profile';
  description?: string;
  fixedAmount?: number;
  createdAt: string;
  scans: number;
  active: boolean;
}

interface ScanHistory {
  id: string;
  qrCodeId: string;
  timestamp: string;
  deviceInfo?: string;
}

type Tab = 'generate' | 'history' | 'scans';

export default function QRCodeScreen() {
  const [tab, setTab] = useState<Tab>('generate');
  const [showModal, setShowModal] = useState(false);
  const [qrType, setQrType] = useState<'payment' | 'profile'>('payment');
  const [fixedAmount, setFixedAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const { user } = useAuthStore();

  // Fetch QR codes
  const { data: qrCodes = [], isLoading: qrLoading, refetch: refetchQR } = useFetch<QRCode[]>(
    '/qr-codes',
    tab !== 'generate'
  );

  // Fetch scan history
  const { data: scanHistory = [], isLoading: scanLoading, refetch: refetchScans } = useFetch<ScanHistory[]>(
    selectedQR ? `/qr-codes/${selectedQR.id}/scans?limit=20&offset=0` : '',
    tab === 'scans' && !!selectedQR
  );

  // Create QR mutation
  const createQR = useMutate('POST', '/qr-codes/payment', {
    onSuccess: () => {
      setShowModal(false);
      setFixedAmount('');
      setDescription('');
      refetchQR();
      alert('QR code created successfully!');
    },
    onError: (error) => {
      alert(`Failed to create QR code: ${error.message}`);
    },
  });

  // Deactivate QR mutation
  const deactivateQR = useMutate('DELETE', `/qr-codes/${selectedQR?.id}`, {
    onSuccess: () => {
      setSelectedQR(null);
      refetchQR();
      alert('QR code deactivated');
    },
  });

  const handleCreateQR = () => {
    if (qrType === 'payment' && !fixedAmount) {
      alert('Please enter an amount');
      return;
    }

    const payload = {
      accountId: user?.id,
      fixedAmount: fixedAmount ? parseFloat(fixedAmount) : undefined,
      description: description || undefined,
    };

    createQR.mutate(payload as any);
  };

  const onRefresh = () => {
    refetchQR();
    if (selectedQR) refetchScans();
  };

  const activeQRCount = qrCodes.filter((qr) => qr.active).length;
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scans, 0);

  return (
    <ScreenWrapper>
    <ScrollView
      className="bg-slate-50"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-gradient-to-b from-indigo-600 to-indigo-700 px-4 py-6 pt-12">
        <Text className="text-white text-2xl font-bold">QR Codes</Text>
        <Text className="text-indigo-100 text-sm">Generate & manage your QR codes</Text>
      </View>

      {/* Stats */}
      <View className="px-4 py-4 flex-row gap-3">
        <Card className="flex-1 p-4 items-center">
          <Text className="text-2xl font-bold text-indigo-600">{activeQRCount}</Text>
          <Text className="text-xs text-slate-600 mt-1">Active</Text>
        </Card>
        <Card className="flex-1 p-4 items-center">
          <Text className="text-2xl font-bold text-emerald-600">{totalScans}</Text>
          <Text className="text-xs text-slate-600 mt-1">Total Scans</Text>
        </Card>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 gap-2 bg-white border-b border-slate-200">
        {(['generate', 'history', 'scans'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg ${
              tab === t ? 'bg-indigo-600' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                tab === t ? 'text-white' : 'text-slate-600'
              }`}
            >
              {t === 'generate' ? 'Generate' : t === 'history' ? 'QR Codes' : 'Scans'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'generate' && (
        <View className="p-4 gap-4">
          <View className="gap-3">
            <Text className="text-slate-700 font-semibold">Select QR Type</Text>
            {(['payment', 'profile'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setQrType(type)}
                className={`p-4 rounded-lg border-2 ${
                  qrType === type ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name={type === 'payment' ? 'qrcode' : 'account-circle'}
                    size={24}
                    color={qrType === type ? '#4f46e5' : '#94a3b8'}
                  />
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-800">
                      {type === 'payment' ? 'Payment QR' : 'Profile QR'}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      {type === 'payment'
                        ? 'Accept payments with fixed amount'
                        : 'Share your profile with others'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {qrType === 'payment' && (
            <View className="gap-3 mt-4">
              <View>
                <Text className="text-slate-600 font-semibold mb-2">Fixed Amount (Optional)</Text>
                <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
                  <Text className="text-slate-600 font-semibold">₦</Text>
                  <TextInput
                    placeholder="0 for variable amount"
                    value={fixedAmount}
                    onChangeText={setFixedAmount}
                    keyboardType="decimal-pad"
                    className="flex-1 ml-2"
                  />
                </View>
              </View>

              <View>
                <Text className="text-slate-600 font-semibold mb-2">Description (Optional)</Text>
                <TextInput
                  placeholder="e.g., Invoice #123"
                  value={description}
                  onChangeText={setDescription}
                  maxLength={100}
                  className="border border-slate-300 rounded-lg px-4 py-3"
                />
                <Text className="text-xs text-slate-500 mt-1">
                  {description.length}/100
                </Text>
              </View>
            </View>
          )}

          <Button
            onPress={() => setShowModal(true)}
            disabled={createQR.isPending}
            className="mt-4"
          >
            {createQR.isPending ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </View>
      )}

      {tab === 'history' && (
        <View className="p-4 gap-4">
          {qrLoading ? (
            <ActivityIndicator size="large" color="#4f46e5" />
          ) : qrCodes.length > 0 ? (
            <FlatList
              data={qrCodes}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Card
                  className="mb-3 p-4 cursor-pointer active:bg-slate-100"
                  onPress={() => {
                    setSelectedQR(item);
                    setTab('scans');
                  }}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <MaterialCommunityIcons
                          name={item.type === 'payment' ? 'qrcode' : 'account-circle'}
                          size={20}
                          color="#4f46e5"
                        />
                        <Text className="font-semibold text-slate-800">
                          {item.type === 'payment' ? 'Payment QR' : 'Profile QR'}
                        </Text>
                        <View
                          className={`px-2 py-1 rounded ${
                            item.active ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              item.active ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {item.active ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                      {item.description && (
                        <Text className="text-sm text-slate-600 mt-2">{item.description}</Text>
                      )}
                      {item.fixedAmount && (
                        <Text className="text-sm font-semibold text-emerald-600 mt-1">
                          ₦{item.fixedAmount.toLocaleString()}
                        </Text>
                      )}
                      <Text className="text-xs text-slate-500 mt-2">
                        {item.scans} scans • Created {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedQR(item);
                        if (confirm('Deactivate this QR code?')) {
                          deactivateQR.mutate({} as any);
                        }
                      }}
                      className="p-2"
                    >
                      <Ionicons name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </Card>
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View className="items-center py-12">
              <MaterialCommunityIcons name="qrcode" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 mt-4">No QR codes yet</Text>
            </View>
          )}
        </View>
      )}

      {tab === 'scans' && (
        <View className="p-4 gap-4">
          {!selectedQR ? (
            <View className="items-center py-12">
              <Text className="text-slate-500">Select a QR code to view scans</Text>
            </View>
          ) : scanLoading ? (
            <ActivityIndicator size="large" color="#4f46e5" />
          ) : scanHistory.length > 0 ? (
            <FlatList
              data={scanHistory}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Card className="mb-3 p-4">
                  <View className="flex-row items-center gap-3">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color="#10b981"
                    />
                    <View className="flex-1">
                      <Text className="font-semibold text-slate-800">Scan Detected</Text>
                      <Text className="text-sm text-slate-600 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </Text>
                      {item.deviceInfo && (
                        <Text className="text-xs text-slate-500 mt-1">{item.deviceInfo}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View className="items-center py-12">
              <MaterialCommunityIcons name="eye-off" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 mt-4">No scans yet</Text>
            </View>
          )}
        </View>
      )}

      {/* Preview Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-3xl p-6 gap-4 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold">QR Code Created</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>

            {/* Placeholder QR */}
            <View className="bg-slate-100 p-8 rounded-lg items-center">
              <MaterialCommunityIcons name="qrcode" size={200} color="#d1d5db" />
            </View>

            <Card className="bg-slate-50 p-4">
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-slate-600">Type:</Text>
                  <Text className="font-semibold text-slate-800">{qrType}</Text>
                </View>
                {fixedAmount && (
                  <View className="flex-row justify-between">
                    <Text className="text-slate-600">Amount:</Text>
                    <Text className="font-semibold text-slate-800">₦{fixedAmount}</Text>
                  </View>
                )}
              </View>
            </Card>

            <View className="flex-row gap-2">
              <Button onPress={() => setShowModal(false)} className="flex-1">
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </ScreenWrapper>
  );
}
