import { DailyRecord } from '../store/useDoomStore';

const STORAGE_KEYS = {
  DAILY_PREFIX: 'doombrake:daily:',
  ALL_DATES: 'doombrake:dates',
  THRESHOLDS: 'doombrake:thresholds',
  THEME: 'doombrake:theme',
};

export interface StoredThresholds {
  softLimitMinutes: number;
  hardLimitMinutes: number;
  dailyBudgetMinutes: number;
}

class StorageServiceImpl {
  private memoryFallback: Map<string, string> = new Map();

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public setString(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fall back to memory
      }
    }
    this.memoryFallback.set(key, value);
  }

  public getString(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) return item;
      } catch {
        // Fall back to memory
      }
    }
    return this.memoryFallback.get(key) || null;
  }

  public delete(key: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // fallback
      }
    }
    this.memoryFallback.delete(key);
  }

  public saveDailyRecord(record: DailyRecord): void {
    const key = `${STORAGE_KEYS.DAILY_PREFIX}${record.date}`;
    this.setString(key, JSON.stringify(record));

    // Update list of stored dates
    const dates = this.getStoredDates();
    if (!dates.includes(record.date)) {
      dates.push(record.date);
      this.setString(STORAGE_KEYS.ALL_DATES, JSON.stringify(dates));
    }
  }

  public getDailyRecord(date: string): DailyRecord | null {
    const key = `${STORAGE_KEYS.DAILY_PREFIX}${date}`;
    const raw = this.getString(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DailyRecord;
    } catch {
      return null;
    }
  }

  public getStoredDates(): string[] {
    const raw = this.getString(STORAGE_KEYS.ALL_DATES);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  public getAllDailyRecords(): Record<string, DailyRecord> {
    const dates = this.getStoredDates();
    const result: Record<string, DailyRecord> = {};
    for (const d of dates) {
      const rec = this.getDailyRecord(d);
      if (rec) result[d] = rec;
    }
    return result;
  }

  public saveThresholds(thresholds: StoredThresholds): void {
    this.setString(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
  }

  public getThresholds(): StoredThresholds | null {
    const raw = this.getString(STORAGE_KEYS.THRESHOLDS);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredThresholds;
    } catch {
      return null;
    }
  }

  public clearAll(): void {
    const dates = this.getStoredDates();
    for (const d of dates) {
      this.delete(`${STORAGE_KEYS.DAILY_PREFIX}${d}`);
    }
    this.delete(STORAGE_KEYS.ALL_DATES);
    this.memoryFallback.clear();
  }
}

export const StorageService = new StorageServiceImpl();
