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
    family: "var(--font-montserrat), 'Montserrat', sans-serif",
    badge: 'Editorial & Clean (Default)',
    description: 'Modern geometric typography with balanced cinema proportions',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: "var(--font-poppins), 'Poppins', sans-serif",
    badge: 'Friendly & Rounded',
    description: 'Geometric sans-serif with smooth curves and warm modern appeal',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: "var(--font-inter), 'Inter', sans-serif",
    badge: 'Ultra-Crisp UI',
    description: 'Precision-crafted interface font designed for supreme legibility',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
    badge: 'Contemporary Luxury',
    description: 'Refined modern grotesque with sophisticated executive aesthetics',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: "var(--font-outfit), 'Outfit', sans-serif",
    badge: 'Dynamic & Stylish',
    description: 'Chic, fashionable and sleek high-end photography character',
    sampleText: 'Arjun Films Studio • 2026',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
    badge: 'Avant-Garde & Bold',
    description: 'Distinctive, tech-forward editorial personality for creative studios',
    sampleText: 'Arjun Films Studio • 2026',
  },
];

export const applySiteFont = (fontId: string) => {
  if (typeof document === 'undefined') return;
  const found = SITE_FONTS.find((f) => f.id === fontId) || SITE_FONTS[0];
  
  // Set data-site-font attribute for instant stylesheet rules
  document.documentElement.setAttribute('data-site-font', found.id);
  if (document.body) {
    document.body.setAttribute('data-site-font', found.id);
  }

  // Set CSS variables and inline fontFamily styles
  document.documentElement.style.setProperty('--site-font', found.family);
  document.documentElement.style.setProperty('--font-sans', found.family);
  document.documentElement.style.setProperty('--font-active', found.family);

  // Inject or update highest-precedence style tag in <head> for instant repaint
  try {
    let styleTag = document.getElementById('dynamic-site-font-style') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-site-font-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      html, body, input, button, select, textarea, optgroup, p, span, h1, h2, h3, h4, h5, h6, a, div, .font-sans {
        font-family: ${found.family} !important;
      }
    `;
  } catch (err) {
    console.error('Failed to inject dynamic font style tag:', err);
  }
};

export type ThemeColorId =
  | 'crimson'
  | 'gold'
  | 'sapphire'
  | 'emerald'
  | 'amethyst'
  | 'rose'
  | 'monochrome';

export interface ThemeColorOption {
  id: ThemeColorId;
  name: string;
  badge: string;
  description: string;
  primary: string;
  hover: string;
  rgb: string;
  previewGradient: string;
  surfaceVariantLight: string;
  surfaceVariantDark: string;
  borderLight: string;
  borderDark: string;
  bgGradientLight: string;
  bgGradientDark: string;
}

export const THEME_COLORS: ThemeColorOption[] = [
  {
    id: 'crimson',
    name: 'Cinema Crimson',
    badge: 'Signature Studio (Default)',
    description: 'Iconic high-impact cinema red with bold luxury energy',
    primary: '#e50914',
    hover: '#c00710',
    rgb: '229, 9, 20',
    previewGradient: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)',
    surfaceVariantLight: '#fef2f2',
    surfaceVariantDark: 'rgba(229, 9, 20, 0.12)',
    borderLight: '#fee2e2',
    borderDark: 'rgba(229, 9, 20, 0.25)',
    bgGradientLight: 'radial-gradient(circle at 10% 10%, rgba(229, 9, 20, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(229, 9, 20, 0.03) 0%, transparent 40%), linear-gradient(135deg, #fdf6f6 0%, #f9f0f0 50%, #fdf8f8 100%)',
    bgGradientDark: '#0b0c0e',
  },
  {
    id: 'gold',
    name: 'Royal Gold',
    badge: 'Opulent Luxury',
    description: 'Rich champagne amber and golden wedding warmth',
    primary: '#d97706',
    hover: '#b45309',
    rgb: '217, 119, 6',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    surfaceVariantLight: '#fffbeb',
    surfaceVariantDark: 'rgba(217, 119, 6, 0.12)',
    borderLight: '#fde68a',
    borderDark: 'rgba(217, 119, 6, 0.25)',
    bgGradientLight: 'radial-gradient(circle at 10% 10%, rgba(217, 119, 6, 0.05) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(245, 158, 11, 0.04) 0%, transparent 40%), linear-gradient(135deg, #fffdf8 0%, #fef8eb 50%, #fffdf8 100%)',
    bgGradientDark: '#0d0c09',
  },
  {
    id: 'sapphire',
    name: 'Royal Sapphire',
    badge: 'Modern Executive',
    description: 'Vibrant cobalt blue with ultra-clean professional clarity',
    primary: '#2563eb',
    hover: '#1d4ed8',
    rgb: '37, 99, 235',
    previewGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    surfaceVariantLight: '#eff6ff',
    surfaceVariantDark: 'rgba(37, 99, 235, 0.12)',
    borderLight: '#bfdbfe',
    borderDark: 'rgba(37, 99, 235, 0.25)',
    bgGradientLight: 'radial-gradient(circle at 10% 10%, rgba(37, 99, 235, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(59, 130, 246, 0.03) 0%, transparent 40%), linear-gradient(135deg, #f8faff 0%, #eff5ff 50%, #f8faff 100%)',
    bgGradientDark: '#080a11',
  },
  {
    id: 'emerald',
    name: 'Emerald Jade',
    badge: 'Organic & Fresh',
    description: 'Serene botanical emerald with refined cinematic calmness',
    primary: '#059669',
    hover: '#047857',
    rgb: '5, 150, 105',
    previewGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    surfaceVariantLight: '#ecfdf5',
    surfaceVariantDark: 'rgba(5, 150, 105, 0.12)',
    borderLight: '#bbf7d0',
    borderDark: 'rgba(5, 150, 105, 0.25)',
    bgGradientLight: 'radial-gradient(circle at 10% 10%, rgba(5, 150, 105, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(16, 185, 129, 0.03) 0%, transparent 40%), linear-gradient(135deg, #f6fdf9 0%, #effcf4 50%, #f6fdf9 100%)',
    bgGradientDark: '#080e0a',
  },
  {
    id: 'amethyst',
    name: 'Amethyst Violet',
    badge: 'Avant-Garde Studio',
    description: 'Chic editorial purple and neon violet for creative filmmakers',
    primary: '#7c3aed',
    hover: '#6d28d9',
    rgb: '124, 58, 237',
    previewGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    surfaceVariantLight: '#f5f3ff',
    surfaceVariantDark: 'rgba(124, 58, 237, 0.12)',
    borderLight: '#ddd6fe',
    borderDark: 'rgba(124, 58, 237, 0.25)',
    bgGradientLight: 'radial-gradient(circle at 10% 10%, rgba(124, 58, 237, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(139, 92, 246, 0.03) 0%, transparent 40%), linear-gradient(135deg, #faf7ff 0%, #f4effe 50%, #faf7ff 100%)',
    bgGradientDark: '#0c0913',
  },
  {
    id: 'rose',
    name: 'Rose & Coral',
    badge: 'Romantic Bridal',
    description: 'Warm romantic coral tailored for pre-wedding & bridal stories',
    primary: '#f43f5e',
    hover: '#e11d48',
    rgb: '244, 63, 94',
    previewGradient: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
    surfaceVariantLight: '#fff1f2',
    surfaceVariantDark: 'rgba(244, 63, 94, 0.12)',
    borderLight: '#fecdd3',
    borderDark: 'rgba(244, 63, 94, 0.25)',
    bgGradientLight: 'radial-gradient(circle at 10% 10%, rgba(244, 63, 94, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(251, 113, 133, 0.03) 0%, transparent 40%), linear-gradient(135deg, #fff5f6 0%, #ffecee 50%, #fff5f6 100%)',
    bgGradientDark: '#11090b',
  },
  {
    id: 'monochrome',
    name: 'Obsidian Mono',
    badge: 'Minimalist Luxe',
    description: 'Crisp black & white editorial minimalism for distraction-free focus',
    primary: '#18181b',
    hover: '#09090b',
    rgb: '24, 24, 27',
    previewGradient: 'linear-gradient(135deg, #3f3f46 0%, #09090b 100%)',
    surfaceVariantLight: '#f4f4f5',
    surfaceVariantDark: 'rgba(255, 255, 255, 0.08)',
    borderLight: '#e4e4e7',
    borderDark: 'rgba(255, 255, 255, 0.15)',
    bgGradientLight: 'linear-gradient(135deg, #fafafa 0%, #f4f4f5 50%, #fafafa 100%)',
    bgGradientDark: '#09090b',
  },
];

export const applyThemeColor = (colorId: string) => {
  if (typeof document === 'undefined') return;
  const found = THEME_COLORS.find((c) => c.id === colorId) || THEME_COLORS[0];

  // Set data attribute on html root and body
  document.documentElement.setAttribute('data-theme-color', found.id);
  if (document.body) {
    document.body.setAttribute('data-theme-color', found.id);
  }

  // Set CSS custom properties
  document.documentElement.style.setProperty('--primary-container', found.primary);
  document.documentElement.style.setProperty('--primary-container-hover', found.hover);
  document.documentElement.style.setProperty('--primary-container-rgb', found.rgb);
  document.documentElement.style.setProperty('--theme-border', found.borderLight);
  document.documentElement.style.setProperty('--theme-surface-variant', found.surfaceVariantLight);

  // Dynamic CSS stylesheet injection for instant global theme application
  try {
    let styleTag = document.getElementById('dynamic-theme-color-style') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme-color-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      :root {
        --primary-container: ${found.primary};
        --primary-container-hover: ${found.hover};
        --primary-container-rgb: ${found.rgb};
        --theme-surface-variant: ${found.surfaceVariantLight};
        --theme-border: ${found.borderLight};
        --theme-bg-gradient: ${found.bgGradientLight};
      }
      .dark {
        --primary-container: ${found.id === 'monochrome' ? '#ffffff' : found.primary};
        --primary-container-hover: ${found.id === 'monochrome' ? '#e4e4e7' : found.hover};
        --theme-surface-variant: ${found.surfaceVariantDark};
        --theme-border: ${found.borderDark};
        --theme-bg-gradient: ${found.bgGradientDark};
      }
      .text-\\[\\#e50914\\],
      .text-red-600,
      .text-red-500 {
        color: var(--primary-container) !important;
      }
      .hover\\:text-\\[\\#e50914\\]:hover,
      .hover\\:text-red-600:hover,
      .hover\\:text-red-500:hover {
        color: var(--primary-container-hover) !important;
      }
      .bg-\\[\\#e50914\\],
      .bg-red-600,
      .bg-red-500 {
        background-color: var(--primary-container) !important;
      }
      .hover\\:bg-\\[\\#e50914\\]:hover,
      .hover\\:bg-red-700:hover,
      .hover\\:bg-red-600:hover {
        background-color: var(--primary-container-hover) !important;
      }
      .border-\\[\\#e50914\\],
      .border-red-500,
      .border-red-600 {
        border-color: var(--primary-container) !important;
      }
      .focus\\:border-\\[\\#e50914\\]:focus {
        border-color: var(--primary-container) !important;
      }
      .focus\\:ring-\\[\\#e50914\\]:focus,
      .ring-\\[\\#e50914\\],
      .ring-red-500\\/30,
      .ring-red-400\\/20 {
        --tw-ring-color: rgba(var(--primary-container-rgb), 0.3) !important;
      }
      .bg-\\[\\#fdf6f6\\],
      .bg-\\[\\#fdf6f6\\]\\/60,
      .bg-\\[\\#fef2f2\\],
      .bg-\\[\\#fef2f2\\]\\/60,
      .bg-\\[\\#fef2f2\\]\\/80,
      .bg-red-500\\/10,
      .bg-red-500\\/5 {
        background-color: var(--theme-surface-variant) !important;
      }
      .border-\\[\\#fee2e2\\],
      .border-\\[\\#fee2e2\\]\\/70,
      .border-\\[\\#fecaca\\],
      .border-red-500\\/20 {
        border-color: var(--theme-border) !important;
      }
      .shadow-red-500\\/5,
      .shadow-red-500\\/10,
      .shadow-red-500\\/20 {
        --tw-shadow-color: rgba(var(--primary-container-rgb), 0.15) !important;
      }
      body:not(.dark) {
        background: var(--theme-bg-gradient) !important;
        background-attachment: fixed !important;
      }
    `;
  } catch (err) {
    console.error('Failed to inject dynamic theme color style tag:', err);
  }
};

interface UIState {
  sidebarOpen: boolean;
  filterPanelOpen: boolean; // right filters panel in Images 1 & 3
  notificationDrawerOpen: boolean; // Notification Drawer
  commandPaletteOpen: boolean; // Universal Omnibar / ⌘K Command Palette
  theme: 'light' | 'dark';
  siteFont: SiteFontId;
  themeColor: ThemeColorId;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleFilterPanel: () => void;
  setFilterPanelOpen: (open: boolean) => void;
  toggleNotificationDrawer: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  toggleTheme: () => void;
  setSiteFont: (font: SiteFontId) => void;
  setThemeColor: (color: ThemeColorId) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      filterPanelOpen: false,
      notificationDrawerOpen: false,
      commandPaletteOpen: false,
      theme: 'light',
      siteFont: 'montserrat',
      themeColor: 'crimson',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleFilterPanel: () => set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
      setFilterPanelOpen: (open: boolean) => set({ filterPanelOpen: open }),
      toggleNotificationDrawer: () => set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),
      setNotificationDrawerOpen: (open: boolean) => set({ notificationDrawerOpen: open }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        return { theme: nextTheme };
      }),
      setSiteFont: (font: SiteFontId) => {
        set({ siteFont: font });
        applySiteFont(font);
      },
      setThemeColor: (color: ThemeColorId) => {
        set({ themeColor: color });
        applyThemeColor(color);
      },
    }),
    {
      name: 'arjun-ui-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist theme, siteFont, and themeColor
      partialize: (state) => ({ theme: state.theme, siteFont: state.siteFont, themeColor: state.themeColor }),
    }
  )
);
