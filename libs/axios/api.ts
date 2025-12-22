import { api } from './config';
import { Account, Transaction, Notification, UserSettings, ExchangeRate } from '@/types';

/**
 * Auth API
 */
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: FormData) =>
    api.post('/auth/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  
  getMe: () =>
    api.get('/auth/me'),
  
  // OAuth endpoints
  googleLogin: () => {
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    return `${process.env.EXPO_PUBLIC_API_URL}/auth/google?state=${Math.random()}`;
  },
  
  appleLogin: () => {
    const redirectUri = `${window.location.origin}/api/auth/apple/callback`;
    return `${process.env.EXPO_PUBLIC_API_URL}/auth/apple?state=${Math.random()}`;
  },
  
  linkGoogleAccount: () =>
    api.post('/auth/link/google'),
  
  linkAppleAccount: () =>
    api.post('/auth/link/apple'),
  
  unlinkGoogleAccount: () =>
    api.delete('/auth/unlink/google'),
  
  unlinkAppleAccount: () =>
    api.delete('/auth/unlink/apple')
};

/**
 * Accounts API
 */
export const accountsApi = {
  getAll: () =>
    api.get('/accounts'),
  
  getById: (id: string) =>
    api.get(`/accounts/${id}`),
  
  addBankAccount: (data: {
    accountType: string;
    country: string;
    currency: string;
    bankName: string;
    accountNumber: string;
    bankCode?: string;
    swiftCode?: string;
    routingNumber?: string;
  }) =>
    api.post('/accounts/bank-account', data),
  
  submitVerification: (accountId: string, document: File) => {
    const formData = new FormData();
    formData.append('document', document);
    return api.post(`/accounts/${accountId}/verify`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getBalance: (accountId: string) =>
    api.get(`/accounts/${accountId}/balance`)
};

/**
 * Transactions API
 */
export const transactionsApi = {
  initiateTransfer: (data: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    description?: string;
    idempotencyKey: string;
  }) =>
    api.post('/transactions/transfer', data, {
      headers: { 'idempotency-key': data.idempotencyKey }
    }),
  
  calculateCost: (data: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
  }) =>
    api.post('/transactions/calculate-cost', data),
  
  getHistory: (accountId: string, limit = 20, offset = 0) =>
    api.get(`/transactions/history/${accountId}`, {
      params: { limit, offset }
    }),
  
  getById: (transactionId: string) =>
    api.get(`/transactions/${transactionId}`)
};

/**
 * Exchange Rates API
 */
export const exchangeRatesApi = {
  getRate: (from: string, to: string) =>
    api.get('/exchange-rates', { params: { from, to } }),
  
  getAllRates: (base = 'USD') =>
    api.get('/exchange-rates', { params: { base } })
};

/**
 * Notifications API
 */
export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get('/notifications', { params: { page, limit } }),
  
  markAsRead: (notificationId: string) =>
    api.post(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () =>
    api.post('/notifications/read-all'),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count')
};

/**
 * User Settings API
 */
export const userSettingsApi = {
  getSettings: () =>
    api.get('/user-settings'),
  
  updateNotifications: (preferences: Partial<UserSettings>) =>
    api.post('/user-settings/notifications', preferences),
  
  updateSecurity: (settings: Partial<UserSettings>) =>
    api.post('/user-settings/security', settings),
  
  updatePrivacy: (settings: Partial<UserSettings>) =>
    api.post('/user-settings/privacy', settings),
  
  updatePreferences: (preferences: Partial<UserSettings>) =>
    api.post('/user-settings/preferences', preferences)
};

/**
 * Bill Payment API
 */
export const billsApi = {
  getProviders: (category?: string) =>
    api.get('/bills/providers', { params: { category } }),
  
  createPayment: (data: {
    accountId: string;
    providerId: string;
    amount: number;
    billDetails: Record<string, any>;
  }) =>
    api.post('/bills', data),
  
  getHistory: (limit = 20, offset = 0) =>
    api.get('/bills/history', { params: { limit, offset } }),
  
  getDetails: (billId: string) =>
    api.get(`/bills/${billId}`),
  
  saveBillAccount: (data: {
    providerId: string;
    nickname: string;
    billDetails: Record<string, any>;
    isDefault?: boolean;
  }) =>
    api.post('/bills/accounts/save', data),
  
  getSavedAccounts: () =>
    api.get('/bills/accounts/saved'),
  
  deleteSavedAccount: (accountId: string) =>
    api.delete(`/bills/accounts/${accountId}`)
};

/**
 * Airtime API
 */
export const airtimeApi = {
  getProviders: () =>
    api.get('/airtime/providers'),
  
  topUpAirtime: (data: {
    accountId: string;
    phoneNumber: string;
    provider: string;
    amount: number;
  }) =>
    api.post('/airtime', data),
  
  getHistory: (limit = 20, offset = 0) =>
    api.get('/airtime/history', { params: { limit, offset } }),
  
  getTransactionDetails: (transactionId: string) =>
    api.get(`/airtime/${transactionId}`),
  
  retryTransaction: (transactionId: string) =>
    api.post(`/airtime/${transactionId}/retry`)
};

/**
 * Cryptocurrency API
 */
export const cryptoApi = {
  getPrices: () =>
    api.get('/crypto/prices'),
  
  createWallet: (cryptoType: string) =>
    api.post('/crypto/wallets', { cryptoType }),
  
  getWallets: () =>
    api.get('/crypto/wallets'),
  
  getWalletDetails: (walletId: string) =>
    api.get(`/crypto/wallets/${walletId}`),
  
  buyCrypto: (data: {
    accountId: string;
    walletId: string;
    amountInNGN: number;
  }) =>
    api.post('/crypto/buy', data),
  
  sellCrypto: (data: {
    accountId: string;
    walletId: string;
    cryptoAmount: number;
  }) =>
    api.post('/crypto/sell', data),
  
  getTransactionHistory: (walletId: string, limit = 20, offset = 0) =>
    api.get(`/crypto/wallets/${walletId}/history`, { params: { limit, offset } })
};

/**
 * QR Code API
 */
export const qrCodesApi = {
  createPaymentQR: (data: {
    accountId: string;
    fixedAmount?: number;
    description?: string;
    expiresAt?: string;
  }) =>
    api.post('/qr-codes/payment', data),
  
  createProfileQR: () =>
    api.post('/qr-codes/profile'),
  
  getUserQRCodes: () =>
    api.get('/qr-codes'),
  
  deactivateQRCode: (qrCodeId: string) =>
    api.delete(`/qr-codes/${qrCodeId}`),
  
  getScanHistory: (qrCodeId: string, limit = 20, offset = 0) =>
    api.get(`/qr-codes/${qrCodeId}/scans`, { params: { limit, offset } }),
  
  scanQRCode: (code: string, deviceInfo?: Record<string, any>) =>
    api.post(`/qr-codes/scan/${code}`, { deviceInfo })
};

/**
 * Cash Pickup API
 */
export const cashPickupApi = {
  getPickupLocations: (city?: string, state?: string) =>
    api.get('/cash-pickup/locations', { params: { city, state } }),
  
  getNearbyLocations: (latitude: number, longitude: number, radius?: number) =>
    api.get('/cash-pickup/nearby', { params: { latitude, longitude, radius } }),
  
  initiateCashPickup: (data: {
    accountId: string;
    locationId: string;
    amount: number;
    recipientData: {
      name: string;
      phone: string;
      email?: string;
      idType?: string;
      idNumber?: string;
    };
  }) =>
    api.post('/cash-pickup', data),
  
  getUserPickupTransactions: (status?: string, limit = 20, offset = 0) =>
    api.get('/cash-pickup/transactions', { params: { status, limit, offset } }),
  
  getPickupDetails: (transactionId: string) =>
    api.get(`/cash-pickup/${transactionId}`),
  
  completePickup: (transactionId: string, pickupCode: string) =>
    api.post(`/cash-pickup/${transactionId}/complete`, { pickupCode }),
  
  cancelPickup: (transactionId: string, reason: string) =>
    api.post(`/cash-pickup/${transactionId}/cancel`, { reason })
};

/**
 * Recurring Transfer API
 */
export const recurringTransfersApi = {
  create: (data: {
    accountId: string;
    recipientId: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    description?: string;
    startDate: string;
    endDate?: string;
    maxExecutions?: number;
    notifyOnExecution?: boolean;
  }) =>
    api.post('/recurring-transfers', data),
  
  getAll: (status?: string, limit = 20, offset = 0) =>
    api.get('/recurring-transfers', { params: { status, limit, offset } }),
  
  getDetails: (transferId: string) =>
    api.get(`/recurring-transfers/${transferId}`),
  
  pause: (transferId: string) =>
    api.post(`/recurring-transfers/${transferId}/pause`),
  
  resume: (transferId: string) =>
    api.post(`/recurring-transfers/${transferId}/resume`),
  
  cancel: (transferId: string) =>
    api.post(`/recurring-transfers/${transferId}/cancel`)
};

/**
 * Group Payment API
 */
export const groupPaymentsApi = {
  create: (data: {
    accountId: string;
    title: string;
    totalAmount: number;
    splitType: 'equal' | 'percentage' | 'manual';
    participantIds: string[];
    description?: string;
    category?: string;
    dueDate?: string;
    itemList?: Array<{ description: string; amount: number }>;
  }) =>
    api.post('/group-payments', data),
  
  getAll: (status?: string, limit = 20, offset = 0) =>
    api.get('/group-payments', { params: { status, limit, offset } }),
  
  getDetails: (groupPaymentId: string) =>
    api.get(`/group-payments/${groupPaymentId}`),
  
  settlePayment: (groupPaymentId: string, participantId: string) =>
    api.post(`/group-payments/${groupPaymentId}/settle/${participantId}`),
  
  cancel: (groupPaymentId: string) =>
    api.post(`/group-payments/${groupPaymentId}/cancel`)
};
