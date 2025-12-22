import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useFetch, useMutate } from '@/hooks/useFetch';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function AdminVerificationsScreen() {
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: accounts, isLoading, refetch } = useFetch<{ data: any[] }>('admin/verifications/pending');

  const { mutate: approve, isLoading: approving } = useMutate('POST', `admin/verifications/${selectedAccount?.id}/approve`, {
    successMessage: 'Verification approved!',
    onSuccess: () => {
      setSelectedAccount(null);
      refetch();
    }
  });

  const { mutate: reject, isLoading: rejecting } = useMutate('POST', `admin/verifications/${selectedAccount?.id}/reject`, {
    successMessage: 'Verification rejected',
    onSuccess: () => {
      setShowRejectModal(false);
      setSelectedAccount(null);
      setRejectReason('');
      refetch();
    }
  });

  const handleApprove = () => {
    approve({});
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      reject({ reason: rejectReason });
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-purple-600 px-6 pt-16 pb-6">
        <Text className="text-white text-2xl font-bold">Pending Verifications</Text>
        <Text className="text-purple-100">{accounts?.data?.length || 0} accounts awaiting review</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {accounts?.data?.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">All caught up! No pending verifications</Text>
          </View>
        ) : (
          accounts?.data?.map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => setSelectedAccount(account)}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row items-start mb-3">
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 mb-1">{account.user?.username}</Text>
                  <Text className="text-gray-600 text-sm">{account.user?.email}</Text>
                </View>
                <View className="bg-yellow-100 px-3 py-1 rounded-full">
                  <Text className="text-yellow-800 text-xs font-semibold">Pending</Text>
                </View>
              </View>

              <View className="bg-gray-50 rounded-lg p-3 mb-3">
                <Text className="text-gray-600 text-sm mb-1">Bank: {account.bankName}</Text>
                <Text className="text-gray-600 text-sm mb-1">Account: {account.accountNumber}</Text>
                <Text className="text-gray-600 text-sm">Country: {account.country} • {account.currency}</Text>
              </View>

              <TouchableOpacity className="flex-row items-center justify-center bg-blue-50 rounded-lg py-2">
                <Ionicons name="document-text" size={16} color="#3b82f6" />
                <Text className="text-blue-600 font-medium ml-2">View Document</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Document Review Modal */}
      <Modal visible={!!selectedAccount} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold">Review Document</Text>
              <TouchableOpacity onPress={() => setSelectedAccount(null)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mb-4">
              {/* User Info */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="font-bold text-gray-900 mb-2">{selectedAccount?.user?.username}</Text>
                <Text className="text-gray-600 text-sm">{selectedAccount?.user?.email}</Text>
                <Text className="text-gray-600 text-sm mt-2">
                  {selectedAccount?.bankName} • {selectedAccount?.accountNumber}
                </Text>
              </View>

              {/* Document Image */}
              {selectedAccount?.verificationDocumentUrl && (
                <Image
                  source={{ uri: selectedAccount.verificationDocumentUrl }}
                  className="w-full h-96 rounded-xl mb-4"
                  resizeMode="contain"
                />
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowRejectModal(true)}
                className="flex-1 bg-red-50 rounded-xl py-4 items-center"
              >
                <Text className="text-red-600 font-semibold">Reject</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleApprove}
                disabled={approving}
                className="flex-1 bg-green-600 rounded-xl py-4 items-center"
              >
                {approving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Approve</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={showRejectModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold mb-4">Reject Verification</Text>
            <Text className="text-gray-600 mb-4">Please provide a reason:</Text>
            
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g., Document is not clear, wrong document type..."
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
              textAlignVertical="top"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
              >
                <Text className="font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleReject}
                disabled={rejecting || !rejectReason.trim()}
                className={`flex-1 rounded-xl py-3 items-center ${
                  rejecting || !rejectReason.trim() ? 'bg-gray-300' : 'bg-red-600'
                }`}
              >
                {rejecting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
