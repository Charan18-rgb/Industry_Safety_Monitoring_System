'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'aegis-auth' },
  ),
);

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'darker';
  activeModal: string | null;
  notifications: Array<{ id: string; message: string; type: string; timestamp: string }>;
  toggleSidebar: () => void;
  setModal: (id: string | null) => void;
  addNotification: (message: string, type?: string) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: 'dark',
      activeModal: null,
      notifications: [],
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setModal: (activeModal) => set({ activeModal }),
      addNotification: (message, type = 'info') => {
        const id = Math.random().toString(36).slice(2);
        set({ notifications: [{ id, message, type, timestamp: new Date().toISOString() }, ...get().notifications.slice(0, 9)] });
        window.setTimeout(() => get().removeNotification(id), 5000);
      },
      removeNotification: (id) => set({ notifications: get().notifications.filter((item) => item.id !== id) }),
    }),
    {
      name: 'aegis-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
    },
  ),
);
