import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDoomStore } from '../store/useDoomStore';
import { themes } from '../styles/theme';

export const SettingsScreen: React.FC = () => {
  const {
    themeMode,
    toggleTheme,
    softLimitMinutes,
    hardLimitMinutes,
    dailyBudgetMinutes,
    setLimits,
    hasUsagePermission,
    hasAccessibilityPermission,
    hasOverlayPermission,
    setPermission,
    resetAllStats,
  } = useDoomStore();

  const theme = themes[themeMode];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Theme Preference */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Appearance</Text>
        <View style={styles.settingRow}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Current Theme</Text>
            <Text style={[styles.settingSubtext, { color: theme.textSecondary }]}>
              {themeMode === 'dark' ? 'Obsidian Dark (OLED friendly)' : 'Crisp Light'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Switch theme mode"
          >
            <Text style={[styles.toggleButtonText, { color: theme.textPrimary }]}>
              {themeMode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Threshold Configuration */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Intervention Thresholds</Text>
        <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
          Fine-tune when DoomBrake steps in to interrupt short-form video consumption.
        </Text>

        {/* Soft Limit */}
        <View style={styles.thresholdItem}>
          <View style={styles.thresholdHeader}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Level 1: Soft Nudge</Text>
            <Text style={[styles.thresholdValue, { color: theme.stageWarning }]}>{softLimitMinutes}m</Text>
          </View>
          <Text style={[styles.settingSubtext, { color: theme.textSecondary }]}>
            Vibrating amber overlay appears over reels
          </Text>
          <View style={styles.optionRow}>
            {[10, 15, 20].map((min) => (
              <TouchableOpacity
                key={min}
                style={[
                  styles.optionChip,
                  softLimitMinutes === min && { backgroundColor: theme.stageWarning },
                  { borderColor: theme.border },
                ]}
                onPress={() => setLimits({ soft: min })}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.optionChipText,
                    { color: softLimitMinutes === min ? '#000000' : theme.textPrimary },
                  ]}
                >
                  {min} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hard Limit */}
        <View style={styles.thresholdItem}>
          <View style={styles.thresholdHeader}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Level 2: Hard Takeover</Text>
            <Text style={[styles.thresholdValue, { color: theme.stageDanger }]}>{hardLimitMinutes}m</Text>
          </View>
          <Text style={[styles.settingSubtext, { color: theme.textSecondary }]}>
            Full-screen interruption forces you to exit or take conscious 5m extension
          </Text>
          <View style={styles.optionRow}>
            {[25, 30, 45].map((min) => (
              <TouchableOpacity
                key={min}
                style={[
                  styles.optionChip,
                  hardLimitMinutes === min && { backgroundColor: theme.stageDanger },
                  { borderColor: theme.border },
                ]}
                onPress={() => setLimits({ hard: min })}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.optionChipText,
                    { color: hardLimitMinutes === min ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {min} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Budget */}
        <View style={styles.thresholdItem}>
          <View style={styles.thresholdHeader}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Daily Scrolling Budget</Text>
            <Text style={[styles.thresholdValue, { color: theme.accent }]}>{dailyBudgetMinutes}m</Text>
          </View>
          <View style={styles.optionRow}>
            {[30, 45, 60, 90].map((min) => (
              <TouchableOpacity
                key={min}
                style={[
                  styles.optionChip,
                  dailyBudgetMinutes === min && { backgroundColor: theme.accent },
                  { borderColor: theme.border },
                ]}
                onPress={() => setLimits({ daily: min })}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.optionChipText,
                    { color: dailyBudgetMinutes === min ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {min} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Android System Permissions */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Android System Permissions</Text>

        <View style={styles.permissionRow}>
          <View style={styles.permissionInfo}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Usage Access</Text>
            <Text style={[styles.settingSubtext, { color: theme.textSecondary }]}>
              PACKAGE_USAGE_STATS to detect active app
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.statusChip,
              { backgroundColor: hasUsagePermission ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
            ]}
            onPress={() => setPermission('usage', !hasUsagePermission)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.statusChipText,
                { color: hasUsagePermission ? theme.stageSafe : theme.stageDanger },
              ]}
            >
              {hasUsagePermission ? 'Granted' : 'Missing'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.permissionRow}>
          <View style={styles.permissionInfo}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Accessibility Service</Text>
            <Text style={[styles.settingSubtext, { color: theme.textSecondary }]}>
              Detects active Reels / For You feed vs normal DM
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.statusChip,
              { backgroundColor: hasAccessibilityPermission ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
            ]}
            onPress={() => setPermission('accessibility', !hasAccessibilityPermission)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.statusChipText,
                { color: hasAccessibilityPermission ? theme.stageSafe : theme.stageDanger },
              ]}
            >
              {hasAccessibilityPermission ? 'Granted' : 'Missing'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.permissionRow}>
          <View style={styles.permissionInfo}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Display Over Other Apps</Text>
            <Text style={[styles.settingSubtext, { color: theme.textSecondary }]}>
              SYSTEM_ALERT_WINDOW for floating widget
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.statusChip,
              { backgroundColor: hasOverlayPermission ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
            ]}
            onPress={() => setPermission('overlay', !hasOverlayPermission)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.statusChipText,
                { color: hasOverlayPermission ? theme.stageSafe : theme.stageDanger },
              ]}
            >
              {hasOverlayPermission ? 'Granted' : 'Missing'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danger Zone: Reset stats */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Storage Management</Text>
        <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
          Clear local MMKV records and reset today's session back to zero.
        </Text>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: theme.stageDanger }]}
          onPress={resetAllStats}
          accessibilityRole="button"
        >
          <Text style={[styles.resetButtonText, { color: theme.stageDanger }]}>
            Reset Today & Historical Data
          </Text>
        </TouchableOpacity>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  thresholdItem: {
    marginTop: 14,
  },
  thresholdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  thresholdValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  optionChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
