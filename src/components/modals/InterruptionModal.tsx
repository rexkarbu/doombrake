import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useDoomStore } from '../../store/useDoomStore';
import { formatDurationCompact } from '../../utils/timeFormatters';
import { InterruptionManager } from '../../services/InterruptionManager';

export const InterruptionModal: React.FC = () => {
  const {
    interruptionLevel,
    sessionSeconds,
    hardLimitMinutes,
    activeAppId,
    dismissSoftNudge,
    acknowledgeHardInterruption,
  } = useDoomStore();

  const [frictionDelay, setFrictionDelay] = useState<number>(3);

  // Trigger vibration when level upgrades
  useEffect(() => {
    if (interruptionLevel === 2) {
      InterruptionManager.triggerHapticFeedback(2);
      setFrictionDelay(3); // 3-second friction lock before allow extend button
    } else if (interruptionLevel === 1) {
      InterruptionManager.triggerHapticFeedback(1);
    }
  }, [interruptionLevel]);

  // Countdown for friction lock on secondary button
  useEffect(() => {
    if (interruptionLevel === 2 && frictionDelay > 0) {
      const timer = setTimeout(() => {
        setFrictionDelay((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [interruptionLevel, frictionDelay]);

  // Level 1: Soft Nudge floating banner
  if (interruptionLevel === 1) {
    return (
      <View style={styles.softNudgeContainer}>
        <View style={styles.softNudgeInner}>
          <View style={styles.softNudgeDot} />
          <View style={styles.softNudgeTextCol}>
            <Text style={styles.softNudgeTitle}>Peringatan Waktu (15 Menit)</Text>
            <Text style={styles.softNudgeBody}>
              Kamu sudah scroll {formatDurationCompact(sessionSeconds)}. Pertimbangkan untuk berhenti.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.softNudgeDismiss}
            onPress={dismissSoftNudge}
            accessibilityRole="button"
            accessibilityLabel="Tutup peringatan 15 menit"
          >
            <Text style={styles.softNudgeDismissText}>Paham</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Level 2: Full-screen Hard Takeover
  if (interruptionLevel === 2) {
    return (
      <Modal
        visible={true}
        transparent={false}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.takeoverContainer}>
          {/* Top Stop Icon */}
          <View style={styles.warningCircle}>
            <Text style={styles.warningIcon}>🛑</Text>
          </View>

          {/* Headline & App Context */}
          <Text style={styles.takeoverTitle}>Waktu Scrolling Habis</Text>
          <Text style={styles.appNameBadge}>
            Target: {activeAppId === 'tiktok' ? 'TikTok' : 'Instagram Reels'}
          </Text>

          {/* Elapsed Time Metric */}
          <View style={styles.timeStatCard}>
            <Text style={styles.timeStatValue}>
              {formatDurationCompact(sessionSeconds)}
            </Text>
            <Text style={styles.timeStatLabel}>
              Durasi sesi aktif terus menerus (Batas: {hardLimitMinutes}m)
            </Text>
          </View>

          <Text style={styles.takeoverExplanation}>
            Otakmu sedang dibanjiri dopamin berulang. Hentikan scrolling sekarang untuk menjaga fokus dan energi mentalmu.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtonGroup}>
            {/* Primary Action: Exit App / Stop */}
            <TouchableOpacity
              style={styles.primaryExitBtn}
              onPress={() => acknowledgeHardInterruption('quit')}
              accessibilityRole="button"
              accessibilityLabel="Keluar Aplikasi sekarang"
            >
              <Text style={styles.primaryExitBtnText}>Keluar Aplikasi (Rekomendasi)</Text>
            </TouchableOpacity>

            {/* Secondary Action: Conscious Extension with Friction Delay */}
            <TouchableOpacity
              style={[
                styles.secondaryExtendBtn,
                frictionDelay > 0 && styles.secondaryExtendBtnDisabled,
              ]}
              disabled={frictionDelay > 0}
              onPress={() => acknowledgeHardInterruption('extend')}
              accessibilityRole="button"
              accessibilityLabel="Lanjut scroll dengan perpanjangan waktu 5 menit"
            >
              <Text style={styles.secondaryExtendBtnText}>
                {frictionDelay > 0
                  ? `Tunggu (${frictionDelay}s) untuk Perpanjang`
                  : 'Lanjut Scroll (+5 Menit)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  softNudgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 99999,
  },
  softNudgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E232F',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  softNudgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  softNudgeTextCol: {
    flex: 1,
  },
  softNudgeTitle: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  softNudgeBody: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 15,
  },
  softNudgeDismiss: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  softNudgeDismissText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  takeoverContainer: {
    flex: 1,
    backgroundColor: '#070A0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  warningCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 36,
  },
  takeoverTitle: {
    color: '#F1F5F9',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  appNameBadge: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 24,
  },
  timeStatCard: {
    backgroundColor: '#111722',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 360,
  },
  timeStatValue: {
    color: '#EF4444',
    fontSize: 36,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  timeStatLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  takeoverExplanation: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 340,
    marginBottom: 32,
  },
  actionButtonGroup: {
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
  primaryExitBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryExitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryExtendBtn: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryExtendBtnDisabled: {
    opacity: 0.4,
  },
  secondaryExtendBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
