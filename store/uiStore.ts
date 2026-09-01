import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  filterPanelOpen: boolean; // right filters panel in Images 1 & 3
  notificationDrawerOpen: boolean; // Notification Drawer
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleFilterPanel: () => void;
  setFilterPanelOpen: (open: boolean) => void;
  toggleNotificationDrawer: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      filterPanelOpen: false,
      notificationDrawerOpen: false,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleFilterPanel: () => set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
      setFilterPanelOpen: (open: boolean) => set({ filterPanelOpen: open }),
      toggleNotificationDrawer: () => set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),
      setNotificationDrawerOpen: (open: boolean) => set({ notificationDrawerOpen: open }),
      toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        return { theme: nextTheme };
      }),
    }),
    {
      name: 'arjun-ui-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the theme state
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
