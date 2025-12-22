import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: true,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
          fontWeight: '600',
        },
      }}
    >
      {/* Main Tabs - Only 5 visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transfer"
        options={{
          title: 'Transfer',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="send" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden tabs - Accessible via home screen or app menu */}
      <Tabs.Screen
        name="bills"
        options={{
          href: null,
          title: 'Bills',
        }}
      />

      <Tabs.Screen
        name="airtime"
        options={{
          href: null,
          title: 'Airtime',
        }}
      />

      <Tabs.Screen
        name="crypto"
        options={{
          href: null,
          title: 'Crypto',
        }}
      />

      <Tabs.Screen
        name="qrcode"
        options={{
          href: null,
          title: 'QR Code',
        }}
      />

      <Tabs.Screen
        name="recurring"
        options={{
          href: null,
          title: 'Recurring',
        }}
      />

      <Tabs.Screen
        name="pickup"
        options={{
          href: null,
          title: 'Cash Pickup',
        }}
      />

      <Tabs.Screen
        name="group"
        options={{
          href: null,
          title: 'Group Pay',
        }}
      />
    </Tabs>
  );
}
