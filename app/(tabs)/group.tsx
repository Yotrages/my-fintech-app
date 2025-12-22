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
import { groupPaymentsApi } from '@/libs/axios/api';
import { useAuthStore } from '@/libs/store/authStore';

interface GroupPayment {
  id: string;
  title: string;
  totalAmount: number;
  creatorName: string;
  participants: Array<{
    id: string;
    name: string;
    phone: string;
    share: number;
    paid: number;
    status: 'pending' | 'settled';
  }>;
  splitType: 'equal' | 'percentage' | 'manual';
  status: 'pending' | 'settled' | 'cancelled';
  category: string;
  dueDate?: string;
  createdAt: string;
  items?: Array<{ description: string; amount: number }>;
}

interface Participant {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

type Tab = 'create' | 'active' | 'settled';
type SplitType = 'equal' | 'percentage' | 'manual';

export default function GroupPaymentScreen() {
  const [tab, setTab] = useState<Tab>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupPayment | null>(null);
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [itemInput, setItemInput] = useState('');
  const [items, setItems] = useState<Array<{ description: string; amount: number }>>([]);
  const { user } = useAuthStore();

  // Fetch group payments
  const { data: groupPayments = [], isLoading: groupsLoading, refetch: refetchGroups } = useFetch<GroupPayment[]>(
    `/group-payments?status=${tab === 'settled' ? 'settled' : 'pending'}&limit=20&offset=0`
  );

  // Create group payment mutation
  const createGroup = useMutate('POST', '/group-payments', {
    onSuccess: () => {
      setShowCreateModal(false);
      setTitle('');
      setTotalAmount('');
      setSplitType('equal');
      setCategory('');
      setDueDate('');
      setParticipants([]);
      setItems([]);
      refetchGroups();
      Alert.alert('Success', 'Group payment created!');
    },
    onError: (error) => {
      Alert.alert('Error', `Failed: ${error.message}`);
    },
  });

  // Settle payment mutation
  const settlePayment = useMutate('POST', `/group-payments/${selectedGroup?.id}/settle`, {
    onSuccess: () => {
      Alert.alert('Success', 'Payment marked as settled');
      refetchGroups();
      setShowSettleModal(false);
    },
  });

  // Cancel group mutation
  const cancelGroup = useMutate('POST', `/group-payments/${selectedGroup?.id}/cancel`, {
    onSuccess: () => {
      Alert.alert('Cancelled', 'Group payment cancelled');
      refetchGroups();
      setSelectedGroup(null);
    },
  });

  const handleCreateGroup = () => {
    if (!title || !totalAmount || participants.length < 2) {
      Alert.alert('Missing Info', 'Need title, amount, and at least 2 participants');
      return;
    }

    const payload = {
      accountId: user?.id,
      title,
      totalAmount: parseFloat(totalAmount),
      splitType,
      participantIds: participants.map((p) => p.id),
      category: category || undefined,
      dueDate: dueDate || undefined,
      itemList: items.length > 0 ? items : undefined,
    };

    createGroup.mutate(payload as any);
  };

  const addParticipant = () => {
    if (!participantInput) return;

    // Simple parsing: "Name, Phone" format
    const parts = participantInput.split(',').map((p) => p.trim());
    if (parts.length < 2) {
      Alert.alert('Invalid', 'Use format: Name, Phone');
      return;
    }

    const newParticipant: Participant = {
      id: `p_${Date.now()}`,
      name: parts[0],
      phone: parts[1],
      email: parts[2] || undefined,
    };

    setParticipants([...participants, newParticipant]);
    setParticipantInput('');
  };

  const addItem = () => {
    if (!itemInput) return;

    const parts = itemInput.split('-').map((p) => p.trim());
    if (parts.length < 2) {
      Alert.alert('Invalid', 'Use format: Description - Amount');
      return;
    }

    setItems([
      ...items,
      {
        description: parts[0],
        amount: parseFloat(parts[1]) || 0,
      },
    ]);
    setItemInput('');
  };

  const onRefresh = () => {
    refetchGroups();
  };

  const activeGroups = groupPayments.filter((g) => g.status !== 'settled');
  const totalToBePaid = activeGroups.reduce((sum, g) => sum + g.totalAmount, 0);
  const settledCount = groupPayments.filter((g) => g.status === 'settled').length;

  const categories = ['Dinner', 'Trip', 'Event', 'Rent', 'Utilities', 'Other'];

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-gradient-to-b from-pink-600 to-pink-700 px-4 py-6 pt-12">
        <Text className="text-white text-2xl font-bold">Group Payments</Text>
        <Text className="text-pink-100 text-sm">Split expenses with friends</Text>
      </View>

      {/* Stats */}
      <View className="px-4 py-4 flex-row gap-3">
        <Card className="flex-1 p-4 items-center">
          <Text className="text-2xl font-bold text-pink-600">{activeGroups.length}</Text>
          <Text className="text-xs text-slate-600 mt-1">Active</Text>
        </Card>
        <Card className="flex-1 p-4 items-center">
          <Text className="text-lg font-bold text-pink-600">
            ₦{totalToBePaid.toLocaleString()}
          </Text>
          <Text className="text-xs text-slate-600 mt-1">To be paid</Text>
        </Card>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 gap-2 bg-white border-b border-slate-200">
        {(['create', 'active', 'settled'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg ${
              tab === t ? 'bg-pink-600' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                tab === t ? 'text-white' : 'text-slate-600'
              }`}
            >
              {t === 'create' ? 'Create' : t === 'active' ? 'Active' : 'Settled'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'create' && (
        <View className="p-4 gap-4">
          <View>
            <Text className="text-slate-700 font-semibold mb-2">Group Title</Text>
            <TextInput
              placeholder="e.g., Dinner at Lekki"
              value={title}
              onChangeText={setTitle}
              className="border border-slate-300 rounded-lg px-4 py-3"
            />
          </View>

          <View>
            <Text className="text-slate-700 font-semibold mb-2">Total Amount</Text>
            <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
              <Text className="text-slate-600 font-semibold">₦</Text>
              <TextInput
                placeholder="0"
                value={totalAmount}
                onChangeText={setTotalAmount}
                keyboardType="decimal-pad"
                className="flex-1 ml-2"
              />
            </View>
          </View>

          <View>
            <Text className="text-slate-700 font-semibold mb-2">Split Type</Text>
            <View className="flex-row gap-2">
              {(['equal', 'percentage', 'manual'] as SplitType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSplitType(type)}
                  className={`flex-1 py-2 px-3 rounded-lg border ${
                    splitType === type
                      ? 'border-pink-600 bg-pink-50'
                      : 'border-slate-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold text-center ${
                      splitType === type ? 'text-pink-700' : 'text-slate-600'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-slate-700 font-semibold mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-full ${
                      category === cat ? 'bg-pink-600' : 'bg-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        category === cat ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text className="text-slate-700 font-semibold mb-2">Due Date (Optional)</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
              className="border border-slate-300 rounded-lg px-4 py-3"
            />
          </View>

          {/* Participants */}
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-slate-700 font-semibold">Participants</Text>
              <Text className="text-xs text-slate-500">{participants.length} added</Text>
            </View>
            <View className="flex-row gap-2 mb-3">
              <TextInput
                placeholder="Name, Phone, Email?"
                value={participantInput}
                onChangeText={setParticipantInput}
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3"
              />
              <TouchableOpacity
                onPress={addParticipant}
                className="bg-pink-600 px-4 py-3 rounded-lg justify-center"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
            {participants.length > 0 && (
              <View className="gap-2">
                {participants.map((p) => (
                  <Card key={p.id} className="p-3 flex-row justify-between items-center">
                    <View>
                      <Text className="font-semibold text-slate-800">{p.name}</Text>
                      <Text className="text-xs text-slate-500">{p.phone}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setParticipants(participants.filter((x) => x.id !== p.id))
                      }
                    >
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}
          </View>

          {/* Items (Optional) */}
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-slate-700 font-semibold">Items (Optional)</Text>
              <Text className="text-xs text-slate-500">{items.length} items</Text>
            </View>
            <View className="flex-row gap-2 mb-3">
              <TextInput
                placeholder="Description - Amount"
                value={itemInput}
                onChangeText={setItemInput}
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3"
              />
              <TouchableOpacity
                onPress={addItem}
                className="bg-slate-200 px-4 py-3 rounded-lg justify-center"
              >
                <Ionicons name="add" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {items.length > 0 && (
              <View className="gap-2 bg-slate-50 p-3 rounded-lg">
                {items.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between items-center">
                    <Text className="text-sm text-slate-700">{item.description}</Text>
                    <Text className="font-semibold text-slate-800">₦{item.amount.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Button
            onPress={handleCreateGroup}
            disabled={createGroup.isPending}
            className="mt-4"
          >
            {createGroup.isPending ? 'Creating...' : 'Create Group'}
          </Button>
        </View>
      )}

      {(tab === 'active' || tab === 'settled') && (
        <View className="p-4 gap-4">
          {groupsLoading ? (
            <ActivityIndicator size="large" color="#ec4899" />
          ) : (tab === 'active' ? groupPayments.filter((g) => g.status !== 'settled') : groupPayments.filter((g) => g.status === 'settled')).length > 0 ? (
            <FlatList
              data={tab === 'active' ? groupPayments.filter((g) => g.status !== 'settled') : groupPayments.filter((g) => g.status === 'settled')}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const settlementProgress = item.participants.filter(
                  (p) => p.status === 'settled'
                ).length;
                const totalParticipants = item.participants.length;

                return (
                  <Card className="mb-3 p-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="font-bold text-slate-800 text-lg">{item.title}</Text>
                        <Text className="text-xs text-slate-500 mt-1">
                          Created by {item.creatorName}
                        </Text>
                        {item.category && (
                          <Text className="text-xs text-pink-600 font-semibold mt-1">
                            {item.category}
                          </Text>
                        )}
                      </View>
                      <Text className="text-lg font-bold text-pink-600">
                        ₦{item.totalAmount.toLocaleString()}
                      </Text>
                    </View>

                    {/* Progress */}
                    <View className="bg-slate-100 rounded-full h-2 my-2">
                      <View
                        className="bg-pink-600 h-2 rounded-full"
                        style={{
                          width: `${(settlementProgress / totalParticipants) * 100}%`,
                        }}
                      />
                    </View>
                    <Text className="text-xs text-slate-600 mb-3">
                      {settlementProgress}/{totalParticipants} settled
                    </Text>

                    {/* Participants */}
                    <View className="gap-2 mb-3">
                      {item.participants.slice(0, 3).map((p) => (
                        <View key={p.id} className="flex-row justify-between items-center">
                          <View>
                            <Text className="font-semibold text-slate-800">{p.name}</Text>
                            <Text className="text-xs text-slate-500">
                              Share: ₦{p.share.toLocaleString()} • Paid: ₦{p.paid.toLocaleString()}
                            </Text>
                          </View>
                          <View
                            className={`px-2 py-1 rounded ${
                              p.status === 'settled'
                                ? 'bg-green-100'
                                : 'bg-yellow-100'
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                p.status === 'settled'
                                  ? 'text-green-700'
                                  : 'text-yellow-700'
                              }`}
                            >
                              {p.status}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {tab === 'active' && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedGroup(item);
                          setShowSettleModal(true);
                        }}
                        className="bg-pink-50 py-2 px-3 rounded-lg flex-row justify-center items-center gap-2"
                      >
                        <Ionicons name="checkmark" size={16} color="#ec4899" />
                        <Text className="text-pink-600 font-semibold">Mark Settled</Text>
                      </TouchableOpacity>
                    )}
                  </Card>
                );
              }}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View className="items-center py-12">
              <MaterialCommunityIcons
                name={tab === 'active' ? 'account-multiple' : 'check-circle'}
                size={48}
                color="#cbd5e1"
              />
              <Text className="text-slate-500 mt-4">
                No {tab === 'active' ? 'active' : 'settled'} groups
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
