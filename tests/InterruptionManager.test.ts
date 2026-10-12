import { describe, it, expect } from 'vitest';
import { InterruptionManager } from '../src/services/InterruptionManager';
import { useDoomStore } from '../src/store/useDoomStore';
import { TIKTOK_PACKAGE } from '../src/constants/apps';

describe('Task 5: Interruption & Hard Stop Trigger', () => {
  it('evaluates stage 0 (Safe) when below soft limit', () => {
    const evalResult = InterruptionManager.evaluate(10 * 60, 15, 30);
    expect(evalResult.level).toBe(0);
    expect(evalResult.color).toBe('#10B981');
  });

  it('evaluates stage 1 (Soft Nudge) at 15 minutes', () => {
    const evalResult = InterruptionManager.evaluate(15 * 60, 15, 30);
    expect(evalResult.level).toBe(1);
    expect(evalResult.color).toBe('#F59E0B');
  });

  it('evaluates stage 2 (Hard Interruption) at 30 minutes', () => {
    const evalResult = InterruptionManager.evaluate(30 * 60, 15, 30);
    expect(evalResult.level).toBe(2);
    expect(evalResult.color).toBe('#EF4444');
  });

  it('triggers hard takeover modal in store when session reaches 30 minutes', () => {
    const store = useDoomStore.getState();
    store.startAppSession(TIKTOK_PACKAGE);

    // Fast-forward to 30m (1800s)
    useDoomStore.setState({ sessionSeconds: 1799 });
    useDoomStore.getState().tickSecond();

    expect(useDoomStore.getState().sessionSeconds).toBe(1800);
    expect(useDoomStore.getState().interruptionLevel).toBe(2);

    // User chooses to quit app
    useDoomStore.getState().acknowledgeHardInterruption('quit');
    expect(useDoomStore.getState().interruptionLevel).toBe(0);
    expect(useDoomStore.getState().isTimerRunning).toBe(false);
  });
});
