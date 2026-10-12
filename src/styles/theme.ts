export type ThemeMode = 'dark' | 'light';

export const palette = {
  emerald: '#10B981',
  emeraldSubtle: 'rgba(16, 185, 129, 0.15)',
  amber: '#F59E0B',
  amberSubtle: 'rgba(245, 158, 11, 0.15)',
  rose: '#EF4444',
  roseSubtle: 'rgba(239, 68, 68, 0.15)',
  indigo: '#6366F1',
  indigoSubtle: 'rgba(99, 102, 241, 0.15)',
};

export const themes = {
  dark: {
    mode: 'dark' as ThemeMode,
    bg: '#0B0F17',
    card: '#161F30',
    cardElevated: '#1E293B',
    border: '#27354A',
    borderFocus: '#6366F1',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: palette.indigo,
    stageSafe: palette.emerald,
    stageWarning: palette.amber,
    stageDanger: palette.rose,
    overlayBg: 'rgba(11, 15, 23, 0.88)',
    headerBg: '#101726',
    tabBarBg: '#0E1420',
  },
  light: {
    mode: 'light' as ThemeMode,
    bg: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#F1F5F9',
    border: '#E2E8F0',
    borderFocus: '#6366F1',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    accent: palette.indigo,
    stageSafe: palette.emerald,
    stageWarning: palette.amber,
    stageDanger: palette.rose,
    overlayBg: 'rgba(15, 23, 42, 0.75)',
    headerBg: '#FFFFFF',
    tabBarBg: '#FFFFFF',
  },
};

export type AppTheme = typeof themes.dark;
