// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  status: 'active' | 'suspended' | 'closed';
  lastLoginAt?: Date;
}

// Account Types
export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'investment';
  balance: number;
  currency: string;
  country: string;
  status: 'active' | 'frozen' | 'closed';
  bankName: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface Transaction {
  id: string;
  transactionReference: string;
  sourceAccountId: string;
  destinationAccountId?: string;
  amount: number;
  currency: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'verification';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  token?: string;
  refreshToken?: string;
}

// Exchange Rate Types
export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
}

// Transfer Cost Types
export interface TransferCost {
  sourceAmount: number;
  destinationAmount: number;
  rate: number;
  fee: number;
  totalCost: number;
  feePercentage: number;
}

// User Settings Types
export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  verificationAlerts: boolean;
  biometricEnabled: boolean;
  requirePasswordForTransfers: boolean;
  dailyTransferLimit: number;
  profilePublic: boolean;
  showBalanceOnHome: boolean;
  language: string;
  defaultCurrency: string;
  theme: 'light' | 'dark' | 'auto';
}