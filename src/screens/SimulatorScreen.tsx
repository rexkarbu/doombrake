import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDoomStore } from '../store/useDoomStore';
import { themes } from '../styles/theme';
import { TIKTOK_PACKAGE, INSTAGRAM_PACKAGE } from '../constants/apps';
import { formatDurationDigital, getSessionStage } from '../utils/timeFormatters';

const SAMPLE_VIDEOS = [
  {
    id: 1,
    creator: 'burgerconversation',
    handle: '@burgerconversation',
    caption: 'E58 - Chili dog. When Sonic takes a short break on Netflix 🦔🌭',
    likes: '4.851',
    comments: '74',
    shares: '233',
    remixes: '247',
    tag: 'Sonic & Friends',
    bgColor: '#1E1B4B',
  },
  {
    id: 2,
    creator: 'kucing_barbar',
    handle: '@kucing_barbar',
    caption: 'Lompat indah dari kulkas tapi terpeleset 😹🐾 #catlovers #fail',
    likes: '14.2k',
    comments: '412',
    shares: '1.2k',
    remixes: '180',
    tag: 'Pet Comedy',
    bgColor: '#451A03',
  },
  {
    id: 3,
    creator: 'streetfood_jkt',
    handle: '@streetfood_jkt',
    caption: 'Martabak manis keju susu melimpah ruah! Porsi monster 🤤🧀',
    likes: '38.9k',
    comments: '920',
    shares: '4.5k',
    remixes: '512',
    tag: 'Food ASMR',
    bgColor: '#3B0764',
  },
  {
    id: 4,
    creator: 'programmer_life',
    handle: '@programmer_life',
    caption: 'POV: Push ke production hari jumat jam 17:00 dan error 500 💀🚀',
    likes: '51.3k',
    comments: '1.4k',
    shares: '8.1k',
    remixes: '940',
    tag: 'Tech Humor',
    bgColor: '#0F172A',
  },
  {
    id: 5,
    creator: 'japan_walks',
    handle: '@japan_walks',
    caption: 'Suasana gerimis sore hari di Kyoto, damai dan hening banget 🌧️⛩️',
    likes: '84.6k',
    comments: '2.1k',
    shares: '12.4k',
    remixes: '1.3k',
    tag: 'Cinematic Travel',
    bgColor: '#042F2E',
  },
];

export const SimulatorScreen: React.FC = () => {
  const {
    themeMode,
    activeAppId,
    sessionSeconds,
    sessionScrollCount,
    recordScroll,
    isTimerRunning,
    startAppSession,
    stopAppSession,
    tickSecond,
    softLimitMinutes,
    hardLimitMinutes,
    interruptionLevel,
  } = useDoomStore();

  const theme = themes[themeMode];
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [currentVideoIdx, setCurrentVideoIdx] = useState<number>(0);

  // Simulation tick loop
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      tickSecond();
    }, 1000 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isTimerRunning, speedMultiplier, tickSecond]);

  const currentVideo = SAMPLE_VIDEOS[currentVideoIdx];
  const stage = getSessionStage(sessionSeconds, softLimitMinutes, hardLimitMinutes);

  const handleNextScroll = () => {
    // Increment reel/video index circularly
    setCurrentVideoIdx((prev) => (prev + 1) % SAMPLE_VIDEOS.length);
    // Record scroll in DoomBrake store (Tanda habis scroll berapa!)
    recordScroll({
      caption: currentVideo.caption,
      creator: currentVideo.creator,
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Top Header & App Controls */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Foreground App & Doomscroll Simulator
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Simulasikan pengalaman menonton Instagram Reels atau TikTok. Setiap kali Anda melakukan scroll/swipe ke video berikutnya, DoomBrake akan mencatat dan menandai jumlah video yang telah Anda tonton.
        </Text>

        {/* Current status pill */}
        <View style={[styles.statusBox, { backgroundColor: theme.cardElevated }]}>
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Status Aplikasi Aktif:</Text>
          <Text style={[styles.statusValue, { color: activeAppId ? theme.accent : theme.textMuted }]}>
            {activeAppId === 'tiktok'
              ? `${TIKTOK_PACKAGE} (TikTok Running)`
              : activeAppId === 'instagram'
              ? `${INSTAGRAM_PACKAGE} (Reels Viewer Running)`
              : 'Tidak Ada (Berada di Home Screen)'}
          </Text>
        </View>

        {/* App Trigger Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.appButton,
              activeAppId === 'tiktok' && styles.appButtonActive,
              { backgroundColor: '#1E1E2E' },
            ]}
            onPress={() => {
              if (activeAppId === 'tiktok') {
                stopAppSession();
              } else {
                startAppSession(TIKTOK_PACKAGE);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Toggle TikTok Session"
          >
            <View style={[styles.dot, { backgroundColor: '#FE2C55' }]} />
            <Text style={styles.appButtonText}>
              {activeAppId === 'tiktok' ? 'Tutup TikTok' : 'Buka TikTok'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.appButton,
              activeAppId === 'instagram' && styles.appButtonActive,
              { backgroundColor: '#261B2E' },
            ]}
            onPress={() => {
              if (activeAppId === 'instagram') {
                stopAppSession();
              } else {
                startAppSession(INSTAGRAM_PACKAGE);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Toggle Instagram Reels Session"
          >
            <View style={[styles.dot, { backgroundColor: '#E1306C' }]} />
            <Text style={styles.appButtonText}>
              {activeAppId === 'instagram' ? 'Tutup Instagram' : 'Buka Instagram Reels'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stop / Minimize Button */}
        {activeAppId && (
          <TouchableOpacity
            style={[styles.stopButton, { borderColor: theme.stageDanger }]}
            onPress={stopAppSession}
            accessibilityRole="button"
          >
            <Text style={[styles.stopButtonText, { color: theme.stageDanger }]}>
              Simulasi Keluar / Tekan Home
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Interactive Short-Form Video Feed Player (Tanda Scroll Berapa) */}
      {activeAppId && (
        <View style={[styles.feedPlayerCard, { borderColor: stage.color }]}>
          {/* Mock Status Header */}
          <View style={styles.mockStatusHeader}>
            <Text style={styles.mockTime}>23:55</Text>
            <View style={styles.feedAppBadge}>
              <Text style={styles.feedAppBadgeText}>
                {activeAppId === 'tiktok' ? '🎵 TikTok Feed' : '📸 Instagram Reels'}
              </Text>
            </View>
            <View style={styles.mockIcons}>
              <Text style={styles.mockIconText}>📶 🔋</Text>
            </View>
          </View>

          {/* Video Container Mock */}
          <View style={[styles.videoContainer, { backgroundColor: currentVideo.bgColor }]}>
            {/* Top Reel Counter Indicator Banner (Tanda Habis Scroll Berapa) */}
            <View style={styles.scrollTrackerHeader}>
              <View style={[styles.scrollTrackerPill, { borderColor: stage.color }]}>
                <View style={[styles.pulseDot, { backgroundColor: stage.color }]} />
                <Text style={styles.scrollTrackerText}>
                  🎬 Video ke-
                  <Text style={[styles.scrollTrackerNumber, { color: stage.color }]}>
                    {sessionScrollCount + 1}
                  </Text>
                  {' '}(Total: {sessionScrollCount} di-scroll)
                </Text>
              </View>
            </View>

            {/* Video Content Overlay */}
            <View style={styles.videoOverlay}>
              {/* Creator Info & Caption */}
              <View style={styles.videoMeta}>
                <View style={styles.creatorRow}>
                  <View style={styles.creatorAvatar}>
                    <Text style={styles.creatorAvatarText}>👤</Text>
                  </View>
                  <Text style={styles.creatorName}>{currentVideo.creator}</Text>
                  <View style={styles.followBadge}>
                    <Text style={styles.followText}>Ikuti</Text>
                  </View>
                </View>

                <Text style={styles.captionText}>{currentVideo.caption}</Text>

                <View style={styles.audioRow}>
                  <Text style={styles.audioIcon}>🎵</Text>
                  <Text style={styles.audioText}>{currentVideo.tag}</Text>
                </View>
              </View>

              {/* Reels Action Rail on Right (Like, Comment, Share) */}
              <View style={styles.actionsRail}>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🤍</Text>
                  <Text style={styles.actionCount}>{currentVideo.likes}</Text>
                </View>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionCount}>{currentVideo.comments}</Text>
                </View>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🔁</Text>
                  <Text style={styles.actionCount}>{currentVideo.shares}</Text>
                </View>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>✈️</Text>
                  <Text style={styles.actionCount}>{currentVideo.remixes}</Text>
                </View>
              </View>
            </View>

            {/* Big Interactive Scroll / Swipe Action Button */}
            <TouchableOpacity
              style={[styles.swipeNextButton, { backgroundColor: stage.color }]}
              onPress={handleNextScroll}
              accessibilityRole="button"
              accessibilityLabel="Swipe ke Video Berikutnya"
            >
              <Text style={styles.swipeNextIcon}>👆</Text>
              <Text style={styles.swipeNextText}>
                GESER / SCROLL KE VIDEO BERIKUTNYA (+1)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Live Session Telemetry & Accelerator */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Telemetri Konsumsi & Akselerator Waktu
        </Text>

        <View style={styles.telemetryGrid}>
          {/* Scroll Counter Box */}
          <View style={[styles.telemetryBox, { backgroundColor: theme.cardElevated, borderColor: stage.color }]}>
            <Text style={[styles.telemetryLabel, { color: theme.textSecondary }]}>
              TOTAL VIDEO DI-SCROLL
            </Text>
            <Text style={[styles.telemetryValue, { color: stage.color }]}>
              {sessionScrollCount}
            </Text>
            <Text style={[styles.telemetrySub, { color: theme.textMuted }]}>
              Video ditonton sesi ini
            </Text>
          </View>

          {/* Time Elapsed Box */}
          <View style={[styles.telemetryBox, { backgroundColor: theme.cardElevated, borderColor: stage.color }]}>
            <Text style={[styles.telemetryLabel, { color: theme.textSecondary }]}>
              DURASI SESI AKTIF
            </Text>
            <Text style={[styles.telemetryValue, { color: stage.color }]}>
              {formatDurationDigital(sessionSeconds)}
            </Text>
            <Text style={[styles.telemetrySub, { color: theme.textMuted }]}>
              {stage.label}
            </Text>
          </View>
        </View>

        {/* Speed multiplier for rapid testing */}
        <Text style={[styles.speedLabel, { color: theme.textSecondary }]}>
          Akselerator Waktu (untuk verifikasi ambang batas):
        </Text>
        <View style={styles.speedRow}>
          {[1, 10, 60].map((multiplier) => (
            <TouchableOpacity
              key={multiplier}
              style={[
                styles.speedButton,
                speedMultiplier === multiplier && { backgroundColor: theme.accent },
                { borderColor: theme.border },
              ]}
              onPress={() => setSpeedMultiplier(multiplier)}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.speedButtonText,
                  { color: speedMultiplier === multiplier ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                {multiplier}x {multiplier === 60 ? '(1 mnt/dtk)' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interruption indicator */}
        <View style={[styles.interruptionStatus, { backgroundColor: theme.cardElevated }]}>
          <Text style={[styles.interruptionStatusText, { color: theme.textSecondary }]}>
            Status Sistem Interupsi:
          </Text>
          <Text
            style={[
              styles.interruptionStateValue,
              {
                color:
                  interruptionLevel === 2
                    ? theme.stageDanger
                    : interruptionLevel === 1
                    ? theme.stageWarning
                    : theme.stageSafe,
              },
            ]}
          >
            {interruptionLevel === 2
              ? 'Level 2: Full-screen Hard Takeover Aktif (Friction Lock 3s)'
              : interruptionLevel === 1
              ? 'Level 1: Soft Nudge Banner Peringatan Berdenyut'
              : 'Normal: Belum melewati ambang batas'}
          </Text>
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
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  statusBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  appButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 48,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  appButtonActive: {
    borderColor: '#6366F1',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  appButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  stopButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  stopButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedPlayerCard: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  mockStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  mockTime: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  feedAppBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  feedAppBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mockIcons: {
    flexDirection: 'row',
  },
  mockIconText: {
    fontSize: 11,
  },
  videoContainer: {
    minHeight: 380,
    justifyContent: 'space-between',
    padding: 16,
    position: 'relative',
  },
  scrollTrackerHeader: {
    alignItems: 'center',
    marginTop: 4,
  },
  scrollTrackerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollTrackerText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollTrackerNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  videoOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 16,
  },
  videoMeta: {
    flex: 1,
    paddingRight: 16,
    gap: 8,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarText: {
    fontSize: 14,
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  followBadge: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  followText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  captionText: {
    color: '#F1F5F9',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioIcon: {
    fontSize: 12,
  },
  audioText: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  actionsRail: {
    alignItems: 'center',
    gap: 16,
  },
  actionItem: {
    alignItems: 'center',
    gap: 2,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  swipeNextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  swipeNextIcon: {
    fontSize: 18,
  },
  swipeNextText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  telemetryBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  telemetryValue: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  telemetrySub: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  speedLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  speedButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  speedButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  interruptionStatus: {
    padding: 12,
    borderRadius: 10,
  },
  interruptionStatusText: {
    fontSize: 12,
    marginBottom: 2,
  },
  interruptionStateValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default SimulatorScreen;
