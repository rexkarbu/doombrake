import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDoomStore } from '../store/useDoomStore';
import { themes } from '../styles/theme';
import { formatDurationCompact, getSessionStage } from '../utils/timeFormatters';
import { TRACKED_APPS, TIKTOK_PACKAGE, INSTAGRAM_PACKAGE } from '../constants/apps';
import { StatCard } from '../components/dashboard/StatCard';
import { DailyChart } from '../components/dashboard/DailyChart';

export const DashboardScreen: React.FC = () => {
  const {
    themeMode,
    dailyHistory,
    softLimitMinutes,
    hardLimitMinutes,
    dailyBudgetMinutes,
    isTimerRunning,
    activeAppId,
    sessionSeconds,
    sessionScrollCount,
    setCurrentTab,
  } = useDoomStore();

  const theme = themes[themeMode];

  const todayKey = new Date().toISOString().split('T')[0];
  const todayRecord = dailyHistory[todayKey] || {
    date: todayKey,
    tiktokSeconds: 0,
    instagramSeconds: 0,
    totalSeconds: 0,
    interruptionCount: 0,
    timeSavedSeconds: dailyBudgetMinutes * 60,
  };

  const budgetSeconds = dailyBudgetMinutes * 60;
  const timeSavedSeconds = Math.max(0, budgetSeconds - todayRecord.totalSeconds);
  const budgetPercent = Math.min(100, Math.round((todayRecord.totalSeconds / budgetSeconds) * 100));

  const stageInfo = getSessionStage(sessionSeconds, softLimitMinutes, hardLimitMinutes);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Active Live Session Banner */}
      {isTimerRunning && activeAppId && (
        <View style={[styles.liveBanner, { backgroundColor: stageInfo.bgColor, borderColor: stageInfo.color }]}>
          <View style={styles.liveBannerRow}>
            <View style={[styles.pulseDot, { backgroundColor: stageInfo.color }]} />
            <Text style={[styles.liveBannerTitle, { color: stageInfo.color }]}>
              Sesi Aktif: {activeAppId === 'tiktok' ? 'TikTok' : 'Instagram Reels'} • 🎬 {sessionScrollCount} Video di-scroll
            </Text>
          </View>
          <Text style={[styles.liveBannerTimer, { color: theme.textPrimary }]}>
            {formatDurationCompact(sessionSeconds)} ({stageInfo.label})
          </Text>
        </View>
      )}

      {/* Hero Card: Today Doomscrolling Overview */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.heroTop}>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            TODAY TOTAL CONSUMPTION
          </Text>
          <View
            style={[
              styles.budgetPill,
              {
                backgroundColor:
                  budgetPercent > 90
                    ? 'rgba(239, 68, 68, 0.15)'
                    : budgetPercent > 60
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.budgetPillText,
                {
                  color:
                    budgetPercent > 90
                      ? theme.stageDanger
                      : budgetPercent > 60
                      ? theme.stageWarning
                      : theme.stageSafe,
                },
              ]}
            >
              {budgetPercent}% of {dailyBudgetMinutes}m budget
            </Text>
          </View>
        </View>

        <Text style={[styles.mainMetric, { color: theme.textPrimary }]}>
          {formatDurationCompact(todayRecord.totalSeconds)}
        </Text>

        {/* Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: theme.cardElevated }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${budgetPercent}%`,
                backgroundColor:
                  budgetPercent > 90
                    ? theme.stageDanger
                    : budgetPercent > 60
                    ? theme.stageWarning
                    : theme.stageSafe,
              },
            ]}
          />
        </View>

        {/* Saved Time Highlight */}
        <View style={styles.savedRow}>
          <Text style={[styles.savedText, { color: theme.stageSafe }]}>
            Time Saved Today: {formatDurationCompact(timeSavedSeconds)}
          </Text>
          <Text style={[styles.savedSubtext, { color: theme.textMuted }]}>
            vs {dailyBudgetMinutes}m limit
          </Text>
        </View>
      </View>

      {/* Quick Metrics Grid: Time per platform */}
      <View style={styles.gridRow}>
        <StatCard
          label="TikTok Feed"
          value={formatDurationCompact(todayRecord.tiktokSeconds)}
          subtext="Target: musically"
          icon="🎵"
          badgeText="Active"
          badgeColor={TRACKED_APPS[TIKTOK_PACKAGE].brandColor}
          style={styles.gridCard}
        />
        <StatCard
          label="Instagram Reels"
          value={formatDurationCompact(todayRecord.instagramSeconds)}
          subtext="Target: Reels viewer"
          icon="📸"
          badgeText="Active"
          badgeColor={TRACKED_APPS[INSTAGRAM_PACKAGE].brandColor}
          style={styles.gridCard}
        />
      </View>

      {/* Quick Metrics Grid: Video Scroll Counter (Tanda Scroll Berapa) */}
      <View style={styles.gridRow}>
        <StatCard
          label="Total Video Di-scroll"
          value={`${todayRecord.totalScrolls || 0} Video`}
          subtext={`${todayRecord.tiktokScrolls || 0} TikTok • ${todayRecord.instagramScrolls || 0} Reels`}
          icon="🎬"
          badgeText={todayRecord.totalScrolls && todayRecord.totalScrolls > 30 ? 'Over Limit' : 'Tercatat'}
          badgeColor={todayRecord.totalScrolls && todayRecord.totalScrolls > 30 ? theme.stageDanger : theme.stageSafe}
          style={styles.gridCard}
        />
        <StatCard
          label="Rata-rata / Video"
          value={todayRecord.totalScrolls ? `${Math.round(todayRecord.totalSeconds / todayRecord.totalScrolls)}s` : '0s'}
          subtext="Durasi per video yang ditonton"
          icon="⚡"
          badgeText="Pacing"
          badgeColor="#6366F1"
          style={styles.gridCard}
        />
      </View>

      {/* Daily History Chart */}
      <DailyChart />

      {/* Interruption Interventions Summary */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          DOPAMINE BRAKES SUMMARY
        </Text>
        <View style={styles.interruptionRow}>
          <View>
            <Text style={[styles.interruptionNumber, { color: theme.stageWarning }]}>
              {todayRecord.interruptionCount}
            </Text>
            <Text style={[styles.interruptionLabel, { color: theme.textSecondary }]}>
              Friction interventions triggered today
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={() => setCurrentTab('simulator')}
            accessibilityRole="button"
            accessibilityLabel="Launch Live Simulator"
          >
            <Text style={styles.actionButtonText}>Test Live Simulator</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 96,
    gap: 16,
  },
  liveBanner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  liveBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  liveBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBannerTimer: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  budgetPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  budgetPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mainMetric: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedText: {
    fontSize: 13,
    fontWeight: '700',
  },
  savedSubtext: {
    fontSize: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
  },
  interruptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  interruptionNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  interruptionLabel: {
    fontSize: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
