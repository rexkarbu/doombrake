import { Vibration } from 'react-native';

export interface InterruptionEvaluation {
  level: 0 | 1 | 2;
  title: string;
  message: string;
  color: string;
}

class InterruptionManagerService {
  public evaluate(
    sessionSeconds: number,
    softLimitMinutes: number = 15,
    hardLimitMinutes: number = 30
  ): InterruptionEvaluation {
    const softSeconds = softLimitMinutes * 60;
    const hardSeconds = hardLimitMinutes * 60;

    if (sessionSeconds >= hardSeconds) {
      return {
        level: 2,
        title: 'Batas Waktu Maksimal Tercapai',
        message: `Kamu sudah menonton video pendek selama ${Math.floor(sessionSeconds / 60)} menit terus-menerus. Saatnya berhenti dan istirahatkan matamu.`,
        color: '#EF4444',
      };
    }

    if (sessionSeconds >= softSeconds) {
      return {
        level: 1,
        title: 'Peringatan Waktu (15 Menit)',
        message: 'Perhatian: Kamu sudah berada di dalam feed reels selama 15 menit.',
        color: '#F59E0B',
      };
    }

    return {
      level: 0,
      title: 'Aman',
      message: 'Penggunaan dalam batas wajar.',
      color: '#10B981',
    };
  }

  public triggerHapticFeedback(level: 1 | 2): void {
    try {
      if (level === 2) {
        // Double heavy vibration for hard takeover
        Vibration.vibrate([0, 400, 150, 400]);
      } else {
        // Single gentle nudge
        Vibration.vibrate([0, 200]);
      }
    } catch {
      // Vibration not supported in environment
    }
  }
}

export const InterruptionManager = new InterruptionManagerService();
