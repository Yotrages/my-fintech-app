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
  Switch,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Button } from '@/components';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { recurringTransfersApi } from '@/libs/axios/api';
import { useAuthStore } from '@/libs/store/authStore';

interface RecurringTransfer {
  id: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  nextExecution?: string;
  totalExecuted: number;
  maxExecutions?: number;
}

type Tab = 'active' | 'history';
type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function RecurringTransferScreen() {
  const [tab, setTab] = useState<Tab>('active');
  const [showModal, setShowModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<RecurringTransfer | null>(null);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxExecutions, setMaxExecutions] = useState('');
  const [notifyOnExecution, setNotifyOnExecution] = useState(true);
  const { user } = useAuthStore();

  // Fetch transfers
  const { data: transfers = [], isLoading: transfersLoading, refetch: refetchTransfers } = useFetch<RecurringTransfer[]>(
    `/recurring-transfers?status=${tab === 'active' ? 'active' : 'completed'}&limit=20&offset=0`
  );

  // Create transfer mutation
  const createTransfer = useMutate('POST', '/recurring-transfers', {
    onSuccess: () => {
      setShowModal(false);
      setRecipientPhone('');
      setAmount('');
      setFrequency('monthly');
      setStartDate('');
      setEndDate('');
      setMaxExecutions('');
      refetchTransfers();
      alert('Recurring transfer created!');
    },
    onError: (error) => {
      alert(`Failed: ${error.message}`);
    },
  });

  // Pause transfer mutation
  const pauseTransfer = useMutate('POST', `/recurring-transfers/${selectedTransfer?.id}/pause`, {
    onSuccess: () => {
      setSelectedTransfer(null);
      refetchTransfers();
      alert('Transfer paused');
    },
  });

  // Resume transfer mutation
  const resumeTransfer = useMutate('POST', `/recurring-transfers/${selectedTransfer?.id}/resume`, {
    onSuccess: () => {
      setSelectedTransfer(null);
      refetchTransfers();
      alert('Transfer resumed');
    },
  });

  // Cancel transfer mutation
  const cancelTransfer = useMutate('POST', `/recurring-transfers/${selectedTransfer?.id}/cancel`, {
    onSuccess: () => {
      setSelectedTransfer(null);
      refetchTransfers();
      alert('Transfer cancelled');
    },
  });

  const handleCreateTransfer = () => {
    if (!recipientPhone || !amount || !startDate) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      accountId: user?.id,
      recipientId: recipientPhone, // In real scenario, lookup recipient by phone
      amount: parseFloat(amount),
      frequency,
      startDate,
      endDate: endDate || undefined,
      maxExecutions: maxExecutions ? parseInt(maxExecutions) : undefined,
      notifyOnExecution,
    };

    createTransfer.mutate(payload as any);
  };

  const onRefresh = () => {
    refetchTransfers();
  };

  const frequencyEmojis: Record<FrequencyType, string> = {
    daily: '📅',
    weekly: '📆',
    monthly: '📋',
    yearly: '🎯',
  };

  const frequencyLabels: Record<FrequencyType, string> = {
    daily: 'Every day',
    weekly: 'Every week',
    monthly: 'Every month',
    yearly: 'Every year',
  };

  const activeCount = transfers.filter((t) => t.status === 'active').length;
  const totalAmount = transfers
    .filter((t) => t.status === 'active')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-gradient-to-b from-cyan-600 to-cyan-700 px-4 py-6 pt-12">
        <Text className="text-white text-2xl font-bold">Recurring Transfers</Text>
        <Text className="text-cyan-100 text-sm">Automate your payments</Text>
      </View>

      {/* Stats */}
      <View className="px-4 py-4 flex-row gap-3">
        <Card className="flex-1 p-4 items-center">
          <Text className="text-2xl font-bold text-cyan-600">{activeCount}</Text>
          <Text className="text-xs text-slate-600 mt-1">Active</Text>
        </Card>
        <Card className="flex-1 p-4 items-center">
          <Text className="text-lg font-bold text-cyan-600">
            ₦{totalAmount.toLocaleString()}
          </Text>
          <Text className="text-xs text-slate-600 mt-1">Monthly</Text>
        </Card>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 gap-2 bg-white border-b border-slate-200">
        {(['active', 'history'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg ${
              tab === t ? 'bg-cyan-600' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                tab === t ? 'text-white' : 'text-slate-600'
              }`}
            >
              {t === 'active' ? 'Active' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create Button */}
      <View className="px-4 py-4">
        <Button onPress={() => setShowModal(true)} className="flex-row justify-center gap-2">
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold">New Recurring Transfer</Text>
        </Button>
      </View>

      {/* List */}
      <View className="px-4 gap-4">
        {transfersLoading ? (
          <ActivityIndicator size="large" color="#0891b2" />
        ) : transfers.length > 0 ? (
          <FlatList
            data={transfers}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card className="mb-3 p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xl">👤</Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-slate-800">
                          {item.recipientName}
                        </Text>
                        <Text className="text-xs text-slate-500">
                          {item.recipientPhone}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    className={`px-2 py-1 rounded ${
                      item.status === 'active'
                        ? 'bg-green-100'
                        : item.status === 'paused'
                        ? 'bg-yellow-100'
                        : 'bg-slate-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        item.status === 'active'
                          ? 'text-green-700'
                          : item.status === 'paused'
                          ? 'text-yellow-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View className="gap-2 py-3 border-y border-slate-200">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-600">Amount:</Text>
                    <Text className="font-bold text-slate-800">₦{item.amount.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-600">Frequency:</Text>
                    <Text className="font-semibold text-slate-800">
                      {frequencyEmojis[item.frequency]} {frequencyLabels[item.frequency]}
                    </Text>
                  </View>
                  {item.nextExecution && (
                    <View className="flex-row justify-between">
                      <Text className="text-slate-600">Next:</Text>
                      <Text className="font-semibold text-cyan-600">
                        {new Date(item.nextExecution).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row gap-2 mt-3">
                  {item.status === 'active' ? (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedTransfer(item);
                          if (confirm('Pause this recurring transfer?')) {
                            pauseTransfer.mutate({} as any);
                          }
                        }}
                        className="flex-1 bg-yellow-50 py-2 px-3 rounded-lg flex-row justify-center items-center gap-2"
                      >
                        <Ionicons name="pause" size={14} color="#eab308" />
                        <Text className="text-yellow-600 font-semibold text-sm">Pause</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedTransfer(item);
                          if (confirm('Cancel this recurring transfer?')) {
                            cancelTransfer.mutate({} as any);
                          }
                        }}
                        className="flex-1 bg-red-50 py-2 px-3 rounded-lg flex-row justify-center items-center gap-2"
                      >
                        <Ionicons name="trash" size={14} color="#ef4444" />
                        <Text className="text-red-600 font-semibold text-sm">Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : item.status === 'paused' ? (
                    <Button
                      onPress={() => {
                        setSelectedTransfer(item);
                        resumeTransfer.mutate({} as any);
                      }}
                      className="flex-1"
                    >
                      Resume
                    </Button>
                  ) : null}
                </View>
              </Card>
            )}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View className="items-center py-12">
            <MaterialCommunityIcons name="repeat-variant" size={48} color="#cbd5e1" />
            <Text className="text-slate-500 mt-4">No recurring transfers</Text>
          </View>
        )}
      </View>

      {/* Create Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-4/5">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold">New Recurring Transfer</Text>
                <Pressable onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </Pressable>
              </View>

              <View className="gap-4 py-2">
                <View>
                  <Text className="text-slate-600 font-semibold mb-2">Recipient Phone</Text>
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
                  <Text className="text-slate-600 font-semibold mb-2">Frequency</Text>
                  <View className="flex-row gap-2">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as FrequencyType[]).map((freq) => (
                      <TouchableOpacity
                        key={freq}
                        onPress={() => setFrequency(freq)}
                        className={`flex-1 py-2 px-2 rounded-lg border ${
                          frequency === freq
                            ? 'border-cyan-600 bg-cyan-50'
                            : 'border-slate-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold text-center ${
                            frequency === freq ? 'text-cyan-700' : 'text-slate-600'
                          }`}
                        >
                          {freq}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-slate-600 font-semibold mb-2">Start Date</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={startDate}
                    onChangeText={setStartDate}
                    className="border border-slate-300 rounded-lg px-4 py-3"
                  />
                </View>

                <View>
                  <Text className="text-slate-600 font-semibold mb-2">End Date (Optional)</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD or leave empty"
                    value={endDate}
                    onChangeText={setEndDate}
                    className="border border-slate-300 rounded-lg px-4 py-3"
                  />
                </View>

                <View>
                  <Text className="text-slate-600 font-semibold mb-2">Max Executions (Optional)</Text>
                  <TextInput
                    placeholder="e.g., 12 for 12 payments"
                    value={maxExecutions}
                    onChangeText={setMaxExecutions}
                    keyboardType="number-pad"
                    className="border border-slate-300 rounded-lg px-4 py-3"
                  />
                </View>

                <View className="flex-row items-center justify-between py-2 px-0">
                  <Text className="text-slate-600 font-semibold">Notify on execution</Text>
                  <Switch
                    value={notifyOnExecution}
                    onValueChange={setNotifyOnExecution}
                    trackColor={{ false: '#cbd5e1', true: '#06b6d4' }}
                    thumbColor={notifyOnExecution ? '#0891b2' : '#f1f5f9'}
                  />
                </View>
              </View>

              <Button
                onPress={handleCreateTransfer}
                disabled={createTransfer.isPending}
                className="mt-6 mb-4"
              >
                {createTransfer.isPending ? 'Creating...' : 'Create Transfer'}
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
