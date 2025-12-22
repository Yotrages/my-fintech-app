import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useMutate } from '@/hooks/useFetch';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyAccountScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [userDocument, setUserDocument] = useState<any>(null);

  const { mutate, isLoading } = useMutate('POST', `accounts/${id}/verify`, {
    successMessage: "Verification submitted! We'll review it within 24 hours.",
    onSuccess: () => router.back()
  });

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true
    });

    if (!result.canceled && result.assets[0]) {
      setUserDocument(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    if (!userDocument) return;

    const formData = new FormData();
    formData.append('document', {
      uri: userDocument.uri,
      type: userDocument.mimeType || 'application/pdf',
      name: userDocument.name || 'document.pdf'
    } as any);

    mutate(formData);
  };

  return (
    <View className="flex-1 bg-white px-6 py-8">
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="shield-checkmark" size={40} color="#2563eb" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Verify Your Account</Text>
        <Text className="text-gray-600 text-center">
          Upload a document to verify your bank account
        </Text>
      </View>

      <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <Text className="font-semibold text-blue-900 mb-2">Accepted Documents:</Text>
        <Text className="text-blue-800">• Bank statement (last 3 months)</Text>
        <Text className="text-blue-800">• Void check</Text>
        <Text className="text-blue-800">• Bank letter with account details</Text>
      </View>

      <TouchableOpacity
        onPress={pickDocument}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center mb-6"
      >
        {document ? (
          <>
            <Ionicons name="document-text" size={48} color="#2563eb" />
            <Text className="text-gray-900 font-medium mt-3">{userDocument.name}</Text>
            <Text className="text-gray-500 text-sm">Tap to change</Text>
          </>
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-900 font-medium mt-3">Upload Document</Text>
            <Text className="text-gray-500 text-sm">PDF, JPG, or PNG</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!document || isLoading}
        className={`rounded-xl py-4 items-center ${
          !document || isLoading ? 'bg-gray-300' : 'bg-blue-600'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">Submit for Verification</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
