import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SiteFontId =
  | 'montserrat'
  | 'poppins'
  | 'inter'
  | 'plus-jakarta'
  | 'outfit'
  | 'space-grotesk';

export interface FontOption {
  id: SiteFontId;
  name: string;
  family: string;
  badge: string;
  description: string;
  sampleText: string;
}

export const SITE_FONTS: FontOption[] = [
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    badge: 'Editorial & Clean (Default)',
    description: 'Modern geometric typography with balanced cinema proportions',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    badge: 'Friendly & Rounded',
    description: 'Geometric sans-serif with smooth curves and warm modern appeal',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    badge: 'Ultra-Crisp UI',
    description: 'Precision-crafted interface font designed for supreme legibility',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    badge: 'Contemporary Luxury',
    description: 'Refined modern grotesque with sophisticated executive aesthetics',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    badge: 'Dynamic & Stylish',
    description: 'Chic, fashionable and sleek high-end photography character',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    badge: 'Avant-Garde & Bold',
    description: 'Distinctive, tech-forward editorial personality for creative studios',
    sampleText: 'Arjun Films Studio • 2026',
  },
];

export const applySiteFont = (fontId: string) => {
  if (typeof document === 'undefined') return;
  const found = SITE_FONTS.find((f) => f.id === fontId) || SITE_FONTS[0];
  document.documentElement.style.setProperty('--font-sans', found.family);
  document.documentElement.style.setProperty('--font-active', found.family);
  document.body.style.fontFamily = found.family;
};

interface UIState {
  sidebarOpen: boolean;
  filterPanelOpen: boolean; // right filters panel in Images 1 & 3
  notificationDrawerOpen: boolean; // Notification Drawer
  theme: 'light' | 'dark';
  siteFont: SiteFontId;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleFilterPanel: () => void;
  setFilterPanelOpen: (open: boolean) => void;
  toggleNotificationDrawer: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setSiteFont: (font: SiteFontId) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      filterPanelOpen: false,
      notificationDrawerOpen: false,
      theme: 'light',
      siteFont: 'montserrat',
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
      setSiteFont: (font: SiteFontId) => {
        set({ siteFont: font });
        applySiteFont(font);
      },
    }),
    {
      name: 'arjun-ui-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist theme and siteFont
      partialize: (state) => ({ theme: state.theme, siteFont: state.siteFont }),
    }
  )
);
