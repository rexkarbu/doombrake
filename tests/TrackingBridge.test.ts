import { describe, it, expect, vi } from 'vitest';
import { TrackingBridge, AppOpenedPayload, AppClosedPayload } from '../src/native/TrackingBridge';
import { TIKTOK_PACKAGE, INSTAGRAM_PACKAGE } from '../src/constants/apps';

describe('Task 2: TrackingBridge Native Event Bridge', () => {
  it('dispatches APP_OPENED event to subscribers with TikTok package', () => {
    const received: AppOpenedPayload[] = [];
    const unsubscribe = TrackingBridge.onAppOpened((payload) => {
      received.push(payload);
    });

    TrackingBridge.emitAppOpened(TIKTOK_PACKAGE, 'TikTok', true);

    expect(received.length).toBe(1);
    expect(received[0].packageName).toBe(TIKTOK_PACKAGE);
    expect(received[0].appName).toBe('TikTok');
    expect(received[0].isReels).toBe(true);

    unsubscribe();
  });

  it('dispatches APP_OPENED event to subscribers with Instagram package and detects Reels flag', () => {
    const received: AppOpenedPayload[] = [];
    const unsubscribe = TrackingBridge.onAppOpened((payload) => {
      received.push(payload);
    });

    TrackingBridge.emitAppOpened(INSTAGRAM_PACKAGE, 'Instagram Reels', true);

    expect(received.length).toBe(1);
    expect(received[0].packageName).toBe(INSTAGRAM_PACKAGE);
    expect(received[0].appName).toBe('Instagram Reels');
    expect(received[0].isReels).toBe(true);

    unsubscribe();
  });

  it('dispatches APP_CLOSED event to subscribers when exiting target app', () => {
    const received: AppClosedPayload[] = [];
    const unsubscribe = TrackingBridge.onAppClosed((payload) => {
      received.push(payload);
    });

    TrackingBridge.emitAppClosed(TIKTOK_PACKAGE);

    expect(received.length).toBe(1);
    expect(received[0].packageName).toBe(TIKTOK_PACKAGE);
    expect(received[0].timestamp).toBeGreaterThan(0);

    unsubscribe();
  });

  it('checks permission statuses via bridge API', async () => {
    const usage = await TrackingBridge.checkUsagePermission();
    const accessibility = await TrackingBridge.checkAccessibilityPermission();
    const overlay = await TrackingBridge.checkOverlayPermission();

    expect(typeof usage).toBe('boolean');
    expect(typeof accessibility).toBe('boolean');
    expect(typeof overlay).toBe('boolean');
  });

  it('dispatches VIDEO_SCROLLED event to subscribers with scroll count', () => {
    let scrolledCount = 0;
    const unsubscribe = TrackingBridge.onVideoScrolled((payload) => {
      scrolledCount = payload.scrollCount;
    });

    TrackingBridge.emitVideoScrolled(INSTAGRAM_PACKAGE, 5);

    expect(scrolledCount).toBe(5);

    unsubscribe();
  });
});
