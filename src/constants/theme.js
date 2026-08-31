export const LIGHT_THEME = {
  colors: {
    bgDark: '#f8fafc',
    bgCard: '#ffffff',
    bgCardHover: '#f1f5f9',
    bgSurface: '#e2e8f0',
    border: '#cbd5e1',
    borderLight: '#94a3b8',
    primary: '#2563eb', // Azul vibrante resaltante
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    accent: '#0284c7',
    success: '#16a34a',
    warning: '#ea580c',
    danger: '#dc2626',
    textMain: '#0f172a',
    textMuted: '#334155',
    textDim: '#64748b',
    binanceYellow: '#f59e0b',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 6, md: 10, lg: 14, full: 9999 }
};

export const DARK_THEME = {
  colors: {
    bgDark: '#0b0f19',
    bgCard: '#111827',
    bgCardHover: '#1f2937',
    bgSurface: '#1e293b',
    border: '#334155',
    borderLight: '#475569',
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
    accent: '#38bdf8',
    success: '#10b981',
    warning: '#f97316',
    danger: '#ef4444',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    textDim: '#64748b',
    binanceYellow: '#f0b90b',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 6, md: 10, lg: 14, full: 9999 }
};

export const getTheme = (mode = 'light') => (mode === 'dark' ? DARK_THEME : LIGHT_THEME);
export const THEME = LIGHT_THEME;
