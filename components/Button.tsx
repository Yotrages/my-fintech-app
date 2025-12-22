import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, ViewStyle } from 'react-native';

export interface ButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  testID?: string;
  style?: ViewStyle;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  title,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  testID,
  style,
  className,
}) => {
  const variantStyles = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 active:bg-gray-300',
    danger: 'bg-red-600 active:bg-red-700',
    ghost: 'bg-transparent border border-blue-600 active:bg-blue-50'
  };

  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  const textColors = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    danger: 'text-white',
    ghost: 'text-blue-600'
  };

  const buttonText = title || (typeof children === 'string' ? children : null);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      style={style}
      activeOpacity={0.7}
      className={`${className || ''} rounded-lg flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#1f2937' : '#ffffff'} />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          {buttonText ? (
            <Text className={`font-semibold text-base ${textColors[variant]}`}>
              {buttonText}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
