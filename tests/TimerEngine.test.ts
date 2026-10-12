import { describe, it, expect, beforeEach } from 'vitest';
import { useTimerStore, getTodayDateKey } from '../src/store/useTimerStore';
import { StorageService } from '../src/services/StorageService';
import { TIKTOK_PACKAGE, INSTAGRAM_PACKAGE } from '../src/constants/apps';
import { formatDurationCompact, formatDurationDigital, getSessionStage } from '../src/utils/timeFormatters';

describe('Task 3: Timer & Local Storage State Engine', () => {
  beforeEach(() => {
    StorageService.clearAll();
    useTimerStore.getState().stopSession();
  });

  it('increments seconds accurately when target app is active', () => {
    const store = useTimerStore.getState();
    store.startSession(TIKTOK_PACKAGE);

    expect(useTimerStore.getState().isTrackingActive).toBe(true);
    expect(useTimerStore.getState().activeAppId).toBe('tiktok');
    expect(useTimerStore.getState().sessionElapsedSeconds).toBe(0);

    // Simulate 5 ticks
    useTimerStore.getState().tick();
    useTimerStore.getState().tick();
    useTimerStore.getState().tick();
    useTimerStore.getState().tick();
    useTimerStore.getState().tick();

    expect(useTimerStore.getState().sessionElapsedSeconds).toBe(5);
  });

  it('pauses and does NOT increment seconds when target app is inactive or paused', () => {
    const store = useTimerStore.getState();
    store.startSession(INSTAGRAM_PACKAGE);

    // 2 active ticks
    store.tick();
    store.tick();
    expect(useTimerStore.getState().sessionElapsedSeconds).toBe(2);

    // Pause session (e.g. switched away from Reels or app minimized)
    useTimerStore.getState().pauseSession();
    expect(useTimerStore.getState().isTrackingActive).toBe(false);

    // Attempt ticks while paused
    useTimerStore.getState().tick();
    useTimerStore.getState().tick();
    useTimerStore.getState().tick();

    // Must remain 2!
    expect(useTimerStore.getState().sessionElapsedSeconds).toBe(2);

    // Resume session
    useTimerStore.getState().resumeSession();
    expect(useTimerStore.getState().isTrackingActive).toBe(true);
    useTimerStore.getState().tick();
    expect(useTimerStore.getState().sessionElapsedSeconds).toBe(3);
  });

  it('archives data to local storage indexed by date (YYYY-MM-DD)', () => {
    const today = getTodayDateKey();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const store = useTimerStore.getState();
    store.startSession(TIKTOK_PACKAGE);

    // 10 seconds of TikTok
    for (let i = 0; i < 10; i++) {
      useTimerStore.getState().tick();
    }

    const record = StorageService.getDailyRecord(today);
    expect(record).not.toBeNull();
    expect(record?.date).toBe(today);
    expect(record?.tiktokSeconds).toBe(10);
    expect(record?.totalSeconds).toBe(10);
  });

  it('accurately calculates stage transitions from safe to warning to danger', () => {
    // 0 to 14m: safe
    const stage0 = getSessionStage(0, 15, 30);
    expect(stage0.stage).toBe('safe');

    const stage14m = getSessionStage(14 * 60 + 59, 15, 30);
    expect(stage14m.stage).toBe('safe');

    // 15m to 29m: warning (Soft Nudge)
    const stage15m = getSessionStage(15 * 60, 15, 30);
    expect(stage15m.stage).toBe('warning');

    // 30m+: danger (Hard Interruption)
    const stage30m = getSessionStage(30 * 60, 15, 30);
    expect(stage30m.stage).toBe('danger');
  });

  it('formats digital and compact time displays without glitching', () => {
    expect(formatDurationDigital(0)).toBe('00:00');
    expect(formatDurationDigital(65)).toBe('01:05');
    expect(formatDurationDigital(1820)).toBe('30:20');

    expect(formatDurationCompact(45)).toBe('45s');
    expect(formatDurationCompact(14 * 60 + 20)).toBe('14m 20s');
    expect(formatDurationCompact(3600 + 15 * 60)).toBe('1h 15m');
  });
});
