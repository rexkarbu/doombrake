import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useDoomStore } from '../../store/useDoomStore';
import { getSessionStage, formatDurationCompact } from '../../utils/timeFormatters';
import { TRACKED_APPS } from '../../constants/apps';

export const FloatingTimerView: React.FC = () => {
  const {
    isOverlayVisible,
    activeAppId,
    activePackage,
    sessionSeconds,
    sessionScrollCount,
    recentScrollAlert,
    clearScrollAlert,
    softLimitMinutes,
    hardLimitMinutes,
    stopAppSession,
  } = useDoomStore();

  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Auto-dismiss transient scroll alert after 3 seconds
  React.useEffect(() => {
    if (recentScrollAlert) {
      const timer = setTimeout(() => {
        clearScrollAlert();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recentScrollAlert, clearScrollAlert]);

  // Animated position for dragging
  const pan = useRef(new Animated.ValueXY({ x: 24, y: 80 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  if (!isOverlayVisible || !activeAppId) {
    return null;
  }

  const stage = getSessionStage(sessionSeconds, softLimitMinutes, hardLimitMinutes);
  const appInfo = activePackage ? TRACKED_APPS[activePackage] : null;

  return (
    <>
      {/* Transient On-Screen Scroll Alert Toast (Tanda Tiap Kali Scroll) */}
      {recentScrollAlert && (
        <View style={styles.toastContainer} pointerEvents="none">
          <View style={[styles.toastPill, { borderColor: stage.color }]}>
            <View style={[styles.toastDot, { backgroundColor: stage.color }]} />
            <Text style={styles.toastEmoji}>📱</Text>
            <Text style={styles.toastText}>
              <Text style={styles.toastBold}>Scroll ke-{recentScrollAlert.count}</Text>
              {' '}— {recentScrollAlert.message}
            </Text>
          </View>
        </View>
      )}

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.floatingContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            borderColor: stage.color,
            shadowColor: stage.color,
          },
        ]}
        accessibilityRole="toolbar"
        accessibilityLabel="Draggable Doom-Timer Overlay"
      >
        <View style={[styles.innerBadge, { backgroundColor: '#0B0F17' }]}>
          {/* Pulsing Dot matching stage color */}
          <View style={[styles.pulseIndicator, { backgroundColor: stage.color }]} />

          {/* Platform icon/badge */}
          <View
            style={[
              styles.appBadge,
              { backgroundColor: appInfo ? appInfo.brandColor : '#6366F1' },
            ]}
          >
            <Text style={styles.appBadgeText}>
              {activeAppId === 'tiktok' ? 'TT' : 'IG'}
            </Text>
          </View>

          {/* Scroll Counter Badge (Tanda Habis Scroll Berapa) */}
          <View style={[styles.scrollBadge, { backgroundColor: '#1E293B', borderColor: stage.color }]}>
            <Text style={[styles.scrollBadgeText, { color: stage.color }]}>
              🎬 #{sessionScrollCount}
            </Text>
          </View>

          {/* Live Timer & Scroll Telemetry */}
          <View style={styles.textContainer}>
            <Text style={[styles.timerText, { color: stage.color }]}>
              {formatDurationCompact(sessionSeconds)}
            </Text>
            {!isCompact && (
              <Text style={[styles.stageLabel, { color: '#94A3B8' }]}>
                {sessionScrollCount} video • {stage.label}
              </Text>
            )}
          </View>

          {/* Drag Grip Handle */}
          <View style={styles.dragGrip}>
            <Text style={styles.dragGripText}>⠿</Text>
          </View>

          {/* Compact Toggle */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setIsCompact(!isCompact)}
            accessibilityRole="button"
            accessibilityLabel={isCompact ? 'Expand Doom-Timer' : 'Minimize Doom-Timer'}
          >
            <Text style={styles.actionBtnText}>{isCompact ? '＋' : '－'}</Text>
          </TouchableOpacity>

          {/* Take a break quick stop button */}
          <TouchableOpacity
            style={[styles.stopBtn, { backgroundColor: stage.color }]}
            onPress={stopAppSession}
            accessibilityRole="button"
            accessibilityLabel="Stop scrolling session"
          >
            <Text style={styles.stopBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    borderRadius: 24,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  innerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    gap: 8,
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  appBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  appBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  textContainer: {
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  dragGrip: {
    paddingHorizontal: 4,
    opacity: 0.6,
  },
  dragGripText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  actionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  scrollBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toastEmoji: {
    fontSize: 14,
  },
  toastText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '500',
  },
  toastBold: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  stopBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
