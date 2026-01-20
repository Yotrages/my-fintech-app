import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRegister } from '@/hooks/useFetch';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { Button, Input, Card } from '@/components';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const { register, handleSubmit, errors, isPending, formMethods } = useRegister();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);

      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const file = {
        uri,
        name: filename,
        type
      } as any;

      formMethods.setValue('avatar', file);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setOauthLoading('google');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
      const result = await WebBrowser.openAuthSessionAsync(
        `${apiUrl}/auth/google`,
        'http://localhost:8081'
      );

      if (result.type === 'success') {
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const refreshToken = url.searchParams.get('refreshToken');

        if (token && refreshToken) {
          router.replace('/');
        }
      }
    } catch (error) {
      console.error('Google sign up error:', error);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      setOauthLoading('apple');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
      const result = await WebBrowser.openAuthSessionAsync(
        `${apiUrl}/auth/apple`,
        'http://localhost:8081'
      );

      if (result.type === 'success') {
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const refreshToken = url.searchParams.get('refreshToken');

        if (token && refreshToken) {
          router.replace('/');
        }
      }
    } catch (error) {
      console.error('Apple sign up error:', error);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-8 mb-8">
          <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="person-add" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
          <Text className="text-gray-600">Join us to start managing your finances</Text>
        </View>

        {/* Social Sign Up Options */}
        <View className="flex-row gap-4 mb-8">
          {/* Google Sign Up */}
          <TouchableOpacity
            disabled={oauthLoading !== null}
            onPress={handleGoogleSignUp}
            className="flex-1 flex-row items-center justify-center border border-gray-300 rounded-lg py-3 bg-white"
            style={{
              opacity: oauthLoading !== null ? 0.6 : 1
            }}
          >
            {oauthLoading === 'google' ? (
              <ActivityIndicator size="small" color="#1f2937" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#1f2937" />
                <Text className="text-gray-700 font-medium ml-2">Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign Up */}
          <TouchableOpacity
            disabled={oauthLoading !== null}
            onPress={handleAppleSignUp}
            className="flex-1 flex-row items-center justify-center border border-gray-300 rounded-lg py-3 bg-white"
            style={{
              opacity: oauthLoading !== null ? 0.6 : 1
            }}
          >
            {oauthLoading === 'apple' ? (
              <ActivityIndicator size="small" color="#1f2937" />
            ) : (
              <>
                <Ionicons name="logo-apple" size={20} color="#1f2937" />
                <Text className="text-gray-700 font-medium ml-2">Apple</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="px-4 text-gray-500 text-sm">Or create with email</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Avatar Upload */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={pickImage}
            className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center border-2 border-dashed border-gray-400"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-full h-full rounded-full" />
            ) : (
              <View className="items-center">
                <Ionicons name="camera" size={24} color="#6b7280" />
                <Text className="text-gray-500 text-xs mt-1">Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <Card variant="default" padding="lg" style={{ marginBottom: 24 }}>
          {/* Username Input */}
          <Input
            {...register('username')}
            label="Username"
            placeholder="Choose a username"
            autoCapitalize="none"
            icon="person"
            error={errors.username?.message}
            required
            containerStyle={{ marginBottom: 16 }}
          />

          {/* Email Input */}
          <Input
            {...register('email')}
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail"
            error={errors.email?.message}
            required
            containerStyle={{ marginBottom: 16 }}
          />

          {/* Password Input */}
          <Input
            {...register('password')}
            label="Password"
            placeholder="Create a password (min. 8 characters)"
            secureTextEntry={!showPassword}
            icon="lock-closed"
            error={errors.password?.message}
            required
            containerStyle={{ marginBottom: 16 }}
          />

          {/* Show Password Toggle */}
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="mb-6">
            <Text className="text-sm text-blue-600 font-medium">
              {showPassword ? 'Hide' : 'Show'} password
            </Text>
          </TouchableOpacity>

          {/* Password Requirements */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <Text className="text-xs text-blue-900 font-medium mb-2">Password must contain:</Text>
            <Text className="text-xs text-blue-800">• At least 8 characters</Text>
            <Text className="text-xs text-blue-800">• Mix of uppercase and lowercase letters</Text>
            <Text className="text-xs text-blue-800">• At least one number</Text>
          </View>

          {/* Sign Up Button */}
          <Button
            title={isPending ? 'Creating Account...' : 'Create Account'}
            onPress={() => handleSubmit()}
            loading={isPending}
            fullWidth
          />
        </Card>

        {/* Sign In Link */}
        <View className="flex-row justify-center items-center mb-12">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}