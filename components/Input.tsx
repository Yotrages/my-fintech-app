import React, { forwardRef } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  helperText?: string;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      icon,
      containerStyle,
      helperText,
      required,
      editable = true,
      ...props
    },
    ref
  ) => {
    return (
      <View style={containerStyle}>
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-2">
            {label} {required && <Text className="text-red-500">*</Text>}
          </Text>
        )}

        <View className={`flex-row items-center border rounded-lg px-4 py-3 ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} ${!editable ? 'bg-gray-100' : ''}`}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={error ? '#ef4444' : '#6b7280'}
              style={{ marginRight: 8 }}
            />
          )}
          <TextInput
            ref={ref}
            className="flex-1 text-base text-gray-900"
            placeholderTextColor="#9ca3af"
            editable={editable}
            {...props}
          />
        </View>

        {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
        {helperText && <Text className="text-gray-500 text-xs mt-1">{helperText}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';
