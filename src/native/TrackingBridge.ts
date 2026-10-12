import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

export interface AppOpenedPayload {
  packageName: string;
  appName: string;
  isReels: boolean;
  timestamp: number;
}

export interface AppClosedPayload {
  packageName: string;
  timestamp: number;
}

export interface VideoScrolledPayload {
  packageName: string;
  scrollCount: number;
  timestamp: number;
}

type AppOpenedCallback = (payload: AppOpenedPayload) => void;
type AppClosedCallback = (payload: AppClosedPayload) => void;
type VideoScrolledCallback = (payload: VideoScrolledPayload) => void;

class TrackingBridgeService {
  private openedListeners: Set<AppOpenedCallback> = new Set();
  private closedListeners: Set<AppClosedCallback> = new Set();
  private scrolledListeners: Set<VideoScrolledCallback> = new Set();
  private isNativeModuleAvailable: boolean = false;
  private eventEmitter: any = null;

  constructor() {
    const nativeModule = NativeModules?.DoomBrakeTracking;
    if (Platform.OS === 'android' && nativeModule) {
      this.isNativeModuleAvailable = true;
      this.eventEmitter = new NativeEventEmitter(nativeModule);

      this.eventEmitter.addListener('APP_OPENED', (payload: AppOpenedPayload) => {
        console.log('[DoomBrake TrackingBridge] APP_OPENED received from Native:', payload);
        this.openedListeners.forEach((listener) => listener(payload));
      });

      this.eventEmitter.addListener('APP_CLOSED', (payload: AppClosedPayload) => {
        console.log('[DoomBrake TrackingBridge] APP_CLOSED received from Native:', payload);
        this.closedListeners.forEach((listener) => listener(payload));
      });

      this.eventEmitter.addListener('VIDEO_SCROLLED', (payload: VideoScrolledPayload) => {
        console.log('[DoomBrake TrackingBridge] VIDEO_SCROLLED received from Native:', payload);
        this.scrolledListeners.forEach((listener) => listener(payload));
      });
    } else {
      console.log('[DoomBrake TrackingBridge] Running in simulated/cross-platform mode.');
    }
  }

  public async checkUsagePermission(): Promise<boolean> {
    if (this.isNativeModuleAvailable) {
      return await NativeModules.DoomBrakeTracking.checkUsagePermission();
    }
    return true;
  }

  public requestUsagePermission(): void {
    if (this.isNativeModuleAvailable) {
      NativeModules.DoomBrakeTracking.requestUsagePermission();
    } else {
      console.log('[DoomBrake TrackingBridge] Requested usage access permission (simulated)');
    }
  }

  public async checkAccessibilityPermission(): Promise<boolean> {
    if (this.isNativeModuleAvailable) {
      return await NativeModules.DoomBrakeTracking.checkAccessibilityPermission();
    }
    return true;
  }

  public requestAccessibilityPermission(): void {
    if (this.isNativeModuleAvailable) {
      NativeModules.DoomBrakeTracking.requestAccessibilityPermission();
    } else {
      console.log('[DoomBrake TrackingBridge] Requested accessibility permission (simulated)');
    }
  }

  public async checkOverlayPermission(): Promise<boolean> {
    if (this.isNativeModuleAvailable) {
      return await NativeModules.DoomBrakeTracking.checkOverlayPermission();
    }
    return true;
  }

  public requestOverlayPermission(): void {
    if (this.isNativeModuleAvailable) {
      NativeModules.DoomBrakeTracking.requestOverlayPermission();
    } else {
      console.log('[DoomBrake TrackingBridge] Requested display over other apps permission (simulated)');
    }
  }

  public async checkBatteryOptimization(): Promise<boolean> {
    if (this.isNativeModuleAvailable) {
      return await NativeModules.DoomBrakeTracking.checkBatteryOptimization();
    }
    return true;
  }

  public requestIgnoreBatteryOptimizations(): void {
    if (this.isNativeModuleAvailable) {
      NativeModules.DoomBrakeTracking.requestIgnoreBatteryOptimizations();
    } else {
      console.log('[DoomBrake TrackingBridge] Requested ignore battery optimizations (simulated)');
    }
  }

  public async getForegroundApp(): Promise<{ packageName: string | null; isTracking: boolean }> {
    if (this.isNativeModuleAvailable) {
      return await NativeModules.DoomBrakeTracking.getForegroundApp();
    }
    return { packageName: null, isTracking: false };
  }

  public onAppOpened(callback: AppOpenedCallback): () => void {
    this.openedListeners.add(callback);
    return () => {
      this.openedListeners.delete(callback);
    };
  }

  public onAppClosed(callback: AppClosedCallback): () => void {
    this.closedListeners.add(callback);
    return () => {
      this.closedListeners.delete(callback);
    };
  }

  public onVideoScrolled(callback: VideoScrolledCallback): () => void {
    this.scrolledListeners.add(callback);
    return () => {
      this.scrolledListeners.delete(callback);
    };
  }

  public emitAppOpened(packageName: string, appName: string, isReels: boolean = true): void {
    const payload: AppOpenedPayload = {
      packageName,
      appName,
      isReels,
      timestamp: Date.now(),
    };
    console.log('[DoomBrake TrackingBridge] APP_OPENED emitted:', payload);
    this.openedListeners.forEach((listener) => listener(payload));
  }

  public emitAppClosed(packageName: string): void {
    const payload: AppClosedPayload = {
      packageName,
      timestamp: Date.now(),
    };
    console.log('[DoomBrake TrackingBridge] APP_CLOSED emitted:', payload);
    this.closedListeners.forEach((listener) => listener(payload));
  }

  public emitVideoScrolled(packageName: string, scrollCount: number): void {
    const payload: VideoScrolledPayload = {
      packageName,
      scrollCount,
      timestamp: Date.now(),
    };
    console.log('[DoomBrake TrackingBridge] VIDEO_SCROLLED emitted:', payload);
    this.scrolledListeners.forEach((listener) => listener(payload));
  }
}

export const TrackingBridge = new TrackingBridgeService();
