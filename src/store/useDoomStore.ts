import { create } from 'zustand';
import { ThemeMode } from '../styles/theme';
import { TIKTOK_PACKAGE, INSTAGRAM_PACKAGE } from '../constants/apps';

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  tiktokSeconds: number;
  instagramSeconds: number;
  totalSeconds: number;
  tiktokScrolls: number;
  instagramScrolls: number;
  totalScrolls: number;
  interruptionCount: number;
  timeSavedSeconds: number;
}

export type TabKey = 'dashboard' | 'simulator' | 'settings';

export interface ScrollAlertInfo {
  count: number;
  appName: string;
  message: string;
  timestamp: number;
}

export interface DoomStoreState {
  // Navigation & Theme
  currentTab: TabKey;
  themeMode: ThemeMode;
  setCurrentTab: (tab: TabKey) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;

  // Permissions & Service Status
  isServiceActive: boolean;
  hasUsagePermission: boolean;
  hasAccessibilityPermission: boolean;
  hasOverlayPermission: boolean;
  setServiceActive: (active: boolean) => void;
  setPermission: (type: 'usage' | 'accessibility' | 'overlay', granted: boolean) => void;

  // Thresholds (Minutes)
  softLimitMinutes: number; // Level 1 (Soft Nudge)
  hardLimitMinutes: number; // Level 2 (Hard Interruption)
  dailyBudgetMinutes: number;
  setLimits: (limits: { soft?: number; hard?: number; daily?: number }) => void;

  // Active Session & Live Scroll Telemetry
  activePackage: string | null;
  activeAppId: 'tiktok' | 'instagram' | null;
  sessionSeconds: number;
  sessionScrollCount: number; // Counter berapa kali scroll / video ditonton
  sessionStartTime: number | null;
  isTimerRunning: boolean;

  // Transient on-screen marker saat scroll
  recentScrollAlert: ScrollAlertInfo | null;
  recordScroll: (metadata?: { caption?: string; creator?: string }) => void;
  clearScrollAlert: () => void;

  // Live Overlay
  isOverlayVisible: boolean;
  overlayPosition: { x: number; y: number };
  setOverlayPosition: (pos: { x: number; y: number }) => void;
  setOverlayVisible: (visible: boolean) => void;

  // Interruption Alert
  interruptionLevel: 0 | 1 | 2; // 0=None, 1=Soft (15m), 2=Hard (30m)
  dismissSoftNudge: () => void;
  acknowledgeHardInterruption: (action: 'quit' | 'extend') => void;

  // Daily History Records
  dailyHistory: Record<string, DailyRecord>;
  addSecondsToToday: (appId: 'tiktok' | 'instagram', secondsToAdd: number) => void;
  recordInterruption: () => void;

  // Session Lifecycle actions
  startAppSession: (packageName: string) => void;
  stopAppSession: () => void;
  tickSecond: () => void;
  resetAllStats: () => void;
}

const getTodayDateKey = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const initialSampleHistory: Record<string, DailyRecord> = {
  // Realistically structured initial data for demonstration
  '2026-10-09': {
    date: '2026-10-09',
    tiktokSeconds: 22 * 60,
    instagramSeconds: 14 * 60,
    totalSeconds: 36 * 60,
    tiktokScrolls: 32,
    instagramScrolls: 24,
    totalScrolls: 56,
    interruptionCount: 1,
    timeSavedSeconds: 18 * 60,
  },
  '2026-10-10': {
    date: '2026-10-10',
    tiktokSeconds: 40 * 60,
    instagramSeconds: 25 * 60,
    totalSeconds: 65 * 60,
    tiktokScrolls: 55,
    instagramScrolls: 38,
    totalScrolls: 93,
    interruptionCount: 3,
    timeSavedSeconds: 10 * 60,
  },
  '2026-10-11': {
    date: '2026-10-11',
    tiktokSeconds: 15 * 60,
    instagramSeconds: 12 * 60,
    totalSeconds: 27 * 60,
    tiktokScrolls: 20,
    instagramScrolls: 18,
    totalScrolls: 38,
    interruptionCount: 0,
    timeSavedSeconds: 25 * 60,
  },
  '2026-10-12': {
    date: '2026-10-12',
    tiktokSeconds: 8 * 60,
    instagramSeconds: 6 * 60,
    totalSeconds: 14 * 60,
    tiktokScrolls: 12,
    instagramScrolls: 9,
    totalScrolls: 21,
    interruptionCount: 0,
    timeSavedSeconds: 16 * 60,
  },
};

export const useDoomStore = create<DoomStoreState>((set, get) => ({
  // Navigation & Theme
  currentTab: 'dashboard',
  themeMode: 'dark',
  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleTheme: () =>
    set((state) => ({ themeMode: state.themeMode === 'dark' ? 'light' : 'dark' })),
  setThemeMode: (mode) => set({ themeMode: mode }),

  // Permissions & Service Status
  isServiceActive: true,
  hasUsagePermission: true,
  hasAccessibilityPermission: true,
  hasOverlayPermission: true,
  setServiceActive: (active) => set({ isServiceActive: active }),
  setPermission: (type, granted) =>
    set((state) => {
      if (type === 'usage') return { hasUsagePermission: granted };
      if (type === 'accessibility') return { hasAccessibilityPermission: granted };
      if (type === 'overlay') return { hasOverlayPermission: granted };
      return state;
    }),

  // Thresholds
  softLimitMinutes: 15,
  hardLimitMinutes: 30,
  dailyBudgetMinutes: 45,
  setLimits: ({ soft, hard, daily }) =>
    set((state) => ({
      softLimitMinutes: soft !== undefined ? soft : state.softLimitMinutes,
      hardLimitMinutes: hard !== undefined ? hard : state.hardLimitMinutes,
      dailyBudgetMinutes: daily !== undefined ? daily : state.dailyBudgetMinutes,
    })),

  // Active Session & Live Scroll Telemetry
  activePackage: null,
  activeAppId: null,
  sessionSeconds: 0,
  sessionScrollCount: 0,
  sessionStartTime: null,
  isTimerRunning: false,
  recentScrollAlert: null,

  recordScroll: (_metadata) => {
    const state = get();
    const newCount = state.sessionScrollCount + 1;
    const appId = state.activeAppId || 'instagram';
    const appName = appId === 'tiktok' ? 'TikTok' : 'Instagram Reels';

    let message = `Scroll #${newCount} (${appName})`;
    if (newCount % 10 === 0) {
      message = `🛑 Waspada: Sudah ${newCount} video di-scroll!`;
    } else if (newCount % 5 === 0) {
      message = `⚠️ Sadar diri: Kamu sudah ${newCount} video di ${appName}`;
    }

    // Update today's record in history
    const today = getTodayDateKey();
    const history = { ...state.dailyHistory };
    const current = history[today] || {
      date: today,
      tiktokSeconds: 0,
      instagramSeconds: 0,
      totalSeconds: 0,
      tiktokScrolls: 0,
      instagramScrolls: 0,
      totalScrolls: 0,
      interruptionCount: 0,
      timeSavedSeconds: 0,
    };

    const newTiktokScrolls = appId === 'tiktok' ? (current.tiktokScrolls || 0) + 1 : (current.tiktokScrolls || 0);
    const newInstagramScrolls = appId === 'instagram' ? (current.instagramScrolls || 0) + 1 : (current.instagramScrolls || 0);

    history[today] = {
      ...current,
      tiktokScrolls: newTiktokScrolls,
      instagramScrolls: newInstagramScrolls,
      totalScrolls: newTiktokScrolls + newInstagramScrolls,
    };

    set({
      sessionScrollCount: newCount,
      recentScrollAlert: {
        count: newCount,
        appName,
        message,
        timestamp: Date.now(),
      },
      dailyHistory: history,
    });
  },

  clearScrollAlert: () => set({ recentScrollAlert: null }),

  // Live Overlay
  isOverlayVisible: false,
  overlayPosition: { x: 24, y: 120 },
  setOverlayPosition: (pos) => set({ overlayPosition: pos }),
  setOverlayVisible: (visible) => set({ isOverlayVisible: visible }),

  // Interruption
  interruptionLevel: 0,
  dismissSoftNudge: () => set({ interruptionLevel: 0 }),
  acknowledgeHardInterruption: (action) => {
    if (action === 'quit') {
      get().stopAppSession();
      set({ interruptionLevel: 0 });
    } else {
      // 5 minutes extension
      set({ interruptionLevel: 0 });
    }
  },

  // Daily History Records
  dailyHistory: initialSampleHistory,
  addSecondsToToday: (appId, secondsToAdd) => {
    const today = getTodayDateKey();
    const history = { ...get().dailyHistory };
    const current = history[today] || {
      date: today,
      tiktokSeconds: 0,
      instagramSeconds: 0,
      totalSeconds: 0,
      interruptionCount: 0,
      timeSavedSeconds: 0,
    };

    const newTiktok = appId === 'tiktok' ? current.tiktokSeconds + secondsToAdd : current.tiktokSeconds;
    const newInstagram = appId === 'instagram' ? current.instagramSeconds + secondsToAdd : current.instagramSeconds;
    const newTotal = newTiktok + newInstagram;
    const budgetSeconds = get().dailyBudgetMinutes * 60;
    const timeSaved = Math.max(0, budgetSeconds - newTotal);

    history[today] = {
      ...current,
      tiktokSeconds: newTiktok,
      instagramSeconds: newInstagram,
      totalSeconds: newTotal,
      timeSavedSeconds: timeSaved,
    };

    set({ dailyHistory: history });
  },

  recordInterruption: () => {
    const today = getTodayDateKey();
    const history = { ...get().dailyHistory };
    const current = history[today] || {
      date: today,
      tiktokSeconds: 0,
      instagramSeconds: 0,
      totalSeconds: 0,
      interruptionCount: 0,
      timeSavedSeconds: 0,
    };
    history[today] = {
      ...current,
      interruptionCount: current.interruptionCount + 1,
    };
    set({ dailyHistory: history });
  },

  startAppSession: (packageName: string) => {
    let appId: 'tiktok' | 'instagram' | null = null;
    if (packageName === TIKTOK_PACKAGE) appId = 'tiktok';
    if (packageName === INSTAGRAM_PACKAGE) appId = 'instagram';

    if (!appId) {
      get().stopAppSession();
      return;
    }

    set({
      activePackage: packageName,
      activeAppId: appId,
      isTimerRunning: true,
      sessionStartTime: Date.now(),
      isOverlayVisible: true,
    });
  },

  stopAppSession: () => {
    set({
      activePackage: null,
      activeAppId: null,
      isTimerRunning: false,
      sessionSeconds: 0,
      sessionScrollCount: 0,
      recentScrollAlert: null,
      sessionStartTime: null,
      isOverlayVisible: false,
      interruptionLevel: 0,
    });
  },

  tickSecond: () => {
    const state = get();
    if (!state.isTimerRunning || !state.activeAppId) return;

    const newSeconds = state.sessionSeconds + 1;
    const softLimitSec = state.softLimitMinutes * 60;
    const hardLimitSec = state.hardLimitMinutes * 60;

    let level: 0 | 1 | 2 = 0;
    if (newSeconds >= hardLimitSec) {
      level = 2;
    } else if (newSeconds >= softLimitSec) {
      level = 1;
    }

    if (level > state.interruptionLevel) {
      state.recordInterruption();
    }

    state.addSecondsToToday(state.activeAppId, 1);

    set({
      sessionSeconds: newSeconds,
      interruptionLevel: level,
    });
  },

  resetAllStats: () => {
    const today = getTodayDateKey();
    const freshToday: Record<string, DailyRecord> = {
      [today]: {
        date: today,
        tiktokSeconds: 0,
        instagramSeconds: 0,
        totalSeconds: 0,
        tiktokScrolls: 0,
        instagramScrolls: 0,
        totalScrolls: 0,
        interruptionCount: 0,
        timeSavedSeconds: get().dailyBudgetMinutes * 60,
      },
    };
    set({
      dailyHistory: freshToday,
      sessionSeconds: 0,
      sessionScrollCount: 0,
      recentScrollAlert: null,
      interruptionLevel: 0,
    });
  },
}));
