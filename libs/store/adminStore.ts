import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  
  setAuth: (admin: Admin, token: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,

      setAuth: (admin, token) => {
        set({
          admin,
          token,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'admin-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
