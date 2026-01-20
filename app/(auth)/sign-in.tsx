import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLogin } from '@/hooks/useFetch';
import { useAuthStore } from '@/libs/store/authStore';
import { Link, useRouter } from 'expo-router';
import { Button, Input, Card } from '@/components';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

const SignInScreen = () => {
  const router = useRouter();
  const { register, handleSubmit, errors, isPending } = useLogin();
  const { setAuth, setLoading } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<'google' | 'apple' | null>(null);

  const handleGoogleLogin = async () => {
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
          try {
            // Fetch user profile with the token
            const response = await fetch(`${apiUrl}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              const user = data.user;
              // Persist to auth store with complete user data
              setAuth(user, token, refreshToken);
              router.replace('/(tabs)/home' as any);
            } else {
              console.error('Failed to fetch user profile:', response.status);
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleLogin = async () => {
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
          try {
            // Fetch user profile with the token
            const response = await fetch(`${apiUrl}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              const user = data.user;
              // Persist to auth store with complete user data
              setAuth(user, token, refreshToken);
              router.replace('/(tabs)/home' as any);
            } else {
              console.error('Failed to fetch user profile:', response.status);
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
        }
      }
    } catch (error) {
      console.error('Apple login error:', error);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-6 py-3" showsVerticalScrollIndicator={false}>
        <View className="mt-12 mb-8">
          <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="wallet" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
          <Text className="text-gray-600">Sign in to your FinTech account</Text>
        </View>

        <Card variant="default" padding="sm" style={{ marginBottom: 24 }}>
          <Input
            {...register('email')}
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon="mail"
            error={errors.email?.message}
            required
            containerStyle={{ marginBottom: 16 }}
          />

          <Input
            {...register('password')}
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            icon="lock-closed"
            error={errors.password?.message}
            required
            containerStyle={{ marginBottom: 16 }}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="mb-4">
            <Text className="text-sm text-blue-600 font-medium">
              {showPassword ? 'Hide' : 'Show'} password
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity className="mb-6">
            <Text className="text-sm text-blue-600 font-semibold">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <Button
            title={isPending ? 'Signing in...' : 'Sign In'}
            onPress={() => handleSubmit()}
            loading={isPending}
            fullWidth
          />
        </Card>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center mb-12">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="px-4 text-gray-500 text-sm">Or continue with</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Social Login Options */}
        <View className="flex-row gap-4 mb-8">
          {/* Google Login */}
          <TouchableOpacity
            disabled={oauthLoading !== null}
            onPress={handleGoogleLogin}
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

          {/* Apple Login */}
          <TouchableOpacity
            disabled={oauthLoading !== null}
            onPress={handleAppleLogin}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default SignInScreen;