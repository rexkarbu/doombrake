import { create } from 'zustand';
import { StorageService } from '../services/StorageService';
import { DailyRecord } from './useDoomStore';
import { TIKTOK_PACKAGE, INSTAGRAM_PACKAGE } from '../constants/apps';

export interface TimerStoreState {
  activePackage: string | null;
  activeAppId: 'tiktok' | 'instagram' | null;
  isTrackingActive: boolean;
  sessionElapsedSeconds: number;
  sessionStartTimestamp: number | null;
  todayKey: string;

  startSession: (packageName: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  tick: () => void;
  getTodayRecord: () => DailyRecord;
  loadFromStorage: () => void;
}

export const getTodayDateKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  activePackage: null,
  activeAppId: null,
  isTrackingActive: false,
  sessionElapsedSeconds: 0,
  sessionStartTimestamp: null,
  todayKey: getTodayDateKey(),

  loadFromStorage: () => {
    const today = getTodayDateKey();
    set({ todayKey: today });
  },

  startSession: (packageName: string) => {
    let appId: 'tiktok' | 'instagram' | null = null;
    if (packageName === TIKTOK_PACKAGE) appId = 'tiktok';
    if (packageName === INSTAGRAM_PACKAGE) appId = 'instagram';

    if (!appId) {
      get().stopSession();
      return;
    }

    set({
      activePackage: packageName,
      activeAppId: appId,
      isTrackingActive: true,
      sessionStartTimestamp: Date.now(),
      todayKey: getTodayDateKey(),
    });
  },

  pauseSession: () => {
    set({ isTrackingActive: false });
  },

  resumeSession: () => {
    if (get().activeAppId) {
      set({ isTrackingActive: true, sessionStartTimestamp: Date.now() });
    }
  },

  stopSession: () => {
    set({
      activePackage: null,
      activeAppId: null,
      isTrackingActive: false,
      sessionElapsedSeconds: 0,
      sessionStartTimestamp: null,
    });
  },

  tick: () => {
    const { isTrackingActive, activeAppId, sessionElapsedSeconds } = get();
    // When target app is not active or paused, do NOT increment (Strict criteria!)
    if (!isTrackingActive || !activeAppId) return;

    const newElapsed = sessionElapsedSeconds + 1;
    const today = getTodayDateKey();

    // Update today's record in StorageService
    let todayRecord = StorageService.getDailyRecord(today);
    if (!todayRecord) {
      todayRecord = {
        date: today,
        tiktokSeconds: 0,
        instagramSeconds: 0,
        totalSeconds: 0,
        tiktokScrolls: 0,
        instagramScrolls: 0,
        totalScrolls: 0,
        interruptionCount: 0,
        timeSavedSeconds: 45 * 60,
      };
    }

    if (activeAppId === 'tiktok') {
      todayRecord.tiktokSeconds += 1;
    } else if (activeAppId === 'instagram') {
      todayRecord.instagramSeconds += 1;
    }
    todayRecord.totalSeconds = todayRecord.tiktokSeconds + todayRecord.instagramSeconds;
    todayRecord.timeSavedSeconds = Math.max(0, 45 * 60 - todayRecord.totalSeconds);

    StorageService.saveDailyRecord(todayRecord);

    set({
      sessionElapsedSeconds: newElapsed,
      todayKey: today,
    });
  },

  getTodayRecord: () => {
    const today = getTodayDateKey();
    const existing = StorageService.getDailyRecord(today);
    if (existing) return existing;

    return {
      date: today,
      tiktokSeconds: 0,
      instagramSeconds: 0,
      totalSeconds: 0,
      tiktokScrolls: 0,
      instagramScrolls: 0,
      totalScrolls: 0,
      interruptionCount: 0,
      timeSavedSeconds: 45 * 60,
    };
  },
}));
