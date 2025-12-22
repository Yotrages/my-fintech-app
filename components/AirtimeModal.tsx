import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components';
import { Country } from '@/libs/countries';

interface Provider {
  name: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
  currencyCode: string;
  phonePrefixes?: string[];
}

interface AirtimeModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProvider: Provider | null;
  selectedCountry: Country | null;
  phoneNumber: string;
  onPhoneChange: (text: string) => void;
  amount: string;
  onAmountChange: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  calculateFee: () => number;
}

export const AirtimeModal = ({
  visible,
  onClose,
  selectedProvider,
  selectedCountry,
  phoneNumber,
  onPhoneChange,
  amount,
  onAmountChange,
  onSubmit,
  isLoading,
  calculateFee,
}: AirtimeModalProps) => {
  const total = parseFloat(amount || '0') + calculateFee();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 gap-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">Top-up {selectedProvider?.name || 'Airtime'}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </Pressable>
          </View>

          <View className="gap-4 py-2">
            <View>
              <Text className="text-slate-600 font-semibold mb-2">Phone Number</Text>
              <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
                <Text className="text-slate-600">{selectedCountry?.flag} {selectedCountry?.callingCode}</Text>
                <TextInput
                  placeholder="8012345678"
                  value={phoneNumber}
                  onChangeText={(text) => onPhoneChange(text.replace(/\D/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={15}
                  className="flex-1 ml-2"
                />
              </View>
              <Text className="text-xs text-slate-500 mt-1">Enter a valid phone number</Text>
            </View>

            <View>
              <Text className="text-slate-600 font-semibold mb-2">Amount</Text>
              <View className="flex-row items-center border border-slate-300 rounded-lg px-4 py-3">
                <Text className="text-slate-600 font-semibold">{selectedCountry?.currency}</Text>
                <TextInput
                  placeholder="0"
                  value={amount}
                  onChangeText={onAmountChange}
                  keyboardType="decimal-pad"
                  className="flex-1 ml-2"
                />
              </View>
              {selectedProvider && (
                <Text className="text-xs text-slate-500 mt-1">
                  Min: {selectedCountry?.currency}{selectedProvider?.minAmount} | Max: {selectedCountry?.currency}{selectedProvider?.maxAmount}
                </Text>
              )}
            </View>

            {/* Cost Summary */}
            {amount && selectedProvider && (
              <Card className="bg-slate-50 p-4">
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-600">Amount:</Text>
                    <Text className="text-slate-800 font-semibold">{selectedCountry?.currency}{parseFloat(amount).toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-600">Fee ({(selectedProvider.fee * 100).toFixed(2)}%):</Text>
                    <Text className="text-slate-800 font-semibold">{selectedCountry?.currency}{calculateFee().toLocaleString()}</Text>
                  </View>
                  <View className="border-t border-slate-200 pt-2 flex-row justify-between">
                    <Text className="text-slate-800 font-bold">Total:</Text>
                    <Text className="text-emerald-600 font-bold text-lg">
                      {selectedCountry?.currency}{total.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </Card>
            )}
          </View>

          <Button
            onPress={onSubmit}
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? 'Processing...' : 'Confirm Top-up'}
          </Button>
        </View>
      </View>
    </Modal>
  );
};
