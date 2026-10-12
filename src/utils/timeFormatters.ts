export type StageType = 'safe' | 'warning' | 'danger';

export interface StageInfo {
  stage: StageType;
  label: string;
  color: string;
  bgColor: string;
}

export function formatDurationCompact(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function formatDurationDigital(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function getSessionStage(
  seconds: number,
  softLimitMinutes: number = 15,
  hardLimitMinutes: number = 30
): StageInfo {
  const softSeconds = softLimitMinutes * 60;
  const hardSeconds = hardLimitMinutes * 60;

  if (seconds >= hardSeconds) {
    return {
      stage: 'danger',
      label: 'Hard Limit',
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.2)',
    };
  }

  if (seconds >= softSeconds) {
    return {
      stage: 'warning',
      label: 'Soft Nudge',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.2)',
    };
  }

  return {
    stage: 'safe',
    label: 'Under Limit',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
  };
}
