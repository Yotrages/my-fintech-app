import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  closeButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  closeButton = true,
  animationType = 'slide'
}) => {
  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-6 py-6 min-h-1/2">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">{title}</Text>
            {closeButton && (
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};
