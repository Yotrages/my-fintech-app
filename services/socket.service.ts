import io, { Socket } from 'socket.io-client';
import { tokenStorage } from '@/libs/storage/token-storage';
import { useNotificationStore } from '@/libs/store/notificationStore';
import { successNotification, infoNotification } from '@/libs/feedback/notification';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = await tokenStorage.getToken();
    if (!token) {
      console.log('No token available for socket connection');
      return;
    }

    const SOCKET_URL = __DEV__ 
      ? 'http://localhost:5000'
      : 'https://api.yourfintech.com';

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, need to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
      }
    });

    // Notification events
    this.socket.on('notification', (data) => {
      console.log('📬 New notification:', data);
      
      const notificationStore = useNotificationStore.getState();
      notificationStore.addNotification({
        id: data.id || Date.now().toString(),
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
        createdAt: data.timestamp || new Date().toISOString(),
        actionUrl: data.actionUrl
      });

      // Show in-app notification
      infoNotification(data.message);
    });

    // Transaction events
    this.socket.on('transaction:status', (data) => {
      console.log('💳 Transaction status:', data);
      infoNotification(`Transaction ${data.status}`);
    });

    this.socket.on('transaction:sent', (data) => {
      console.log('📤 Money sent:', data);
      successNotification(data.message);
    });

    this.socket.on('transaction:received', (data) => {
      console.log('📥 Money received:', data);
      successNotification(data.message);
    });

    // Ping/Pong for connection health
    this.socket.on('pong', () => {
      console.log('🏓 Pong received');
    });

    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  // Subscribe to transaction updates
  subscribeToTransaction(transactionId: string) {
    this.socket?.emit('transaction:subscribe', transactionId);
  }

  // Unsubscribe from transaction
  unsubscribeFromTransaction(transactionId: string) {
    this.socket?.emit('transaction:unsubscribe', transactionId);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
