import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDoomStore, DailyRecord } from '../../store/useDoomStore';
import { themes } from '../../styles/theme';
import { formatDurationCompact } from '../../utils/timeFormatters';
import { TRACKED_APPS, TIKTOK_PACKAGE, INSTAGRAM_PACKAGE } from '../../constants/apps';

export interface DailyChartProps {
  onSelectDate?: (record: DailyRecord) => void;
}

export const DailyChart: React.FC<DailyChartProps> = ({ onSelectDate }) => {
  const { dailyHistory, themeMode, dailyBudgetMinutes } = useDoomStore();
  const theme = themes[themeMode];

  const dates = Object.keys(dailyHistory).sort();
  const todayKey = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  // Maximum minutes for proportional height scaling
  const budgetMinutes = dailyBudgetMinutes;
  const maxMinutesInHistory = Math.max(
    budgetMinutes,
    ...dates.map((d) => Math.round(dailyHistory[d].totalSeconds / 60))
  );
  const chartHeight = 140;

  const formatDateLabel = (dateStr: string): string => {
    if (dateStr === todayKey) return 'Today';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  const activeRecord = dailyHistory[selectedDate] || dailyHistory[todayKey];

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>7-Day Doomscroll History</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Breakdown across Reels and TikTok
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TRACKED_APPS[TIKTOK_PACKAGE].brandColor }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>TikTok</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TRACKED_APPS[INSTAGRAM_PACKAGE].brandColor }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Reels</Text>
          </View>
        </View>
      </View>

      {/* Chart Bars Canvas */}
      <View style={[styles.chartArea, { height: chartHeight }]}>
        {/* Budget Reference Guideline */}
        <View
          style={[
            styles.budgetLine,
            {
              bottom: `${(budgetMinutes / maxMinutesInHistory) * 100}%`,
              borderColor: 'rgba(239, 68, 68, 0.4)',
            },
          ]}
        >
          <Text style={[styles.budgetLineLabel, { color: theme.stageDanger }]}>
            Budget ({budgetMinutes}m)
          </Text>
        </View>

        {/* Render day bars */}
        <View style={styles.barsRow}>
          {dates.map((dateStr) => {
            const record = dailyHistory[dateStr];
            const totalMin = Math.round(record.totalSeconds / 60);
            const tiktokMin = Math.round(record.tiktokSeconds / 60);

            const totalHeightPercent = Math.min(
              100,
              Math.max(4, (totalMin / maxMinutesInHistory) * 100)
            );
            const tiktokPortion = totalMin > 0 ? (tiktokMin / totalMin) * 100 : 50;
            const isSelected = selectedDate === dateStr;

            return (
              <TouchableOpacity
                key={dateStr}
                style={styles.barColumn}
                onPress={() => {
                  setSelectedDate(dateStr);
                  if (onSelectDate) onSelectDate(record);
                }}
                accessibilityRole="button"
                accessibilityLabel={`View stats for ${dateStr}`}
              >
                <View style={[styles.barWrapper, { height: '100%' }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${totalHeightPercent}%`,
                        borderColor: isSelected ? theme.accent : 'transparent',
                        borderWidth: isSelected ? 2 : 0,
                      },
                    ]}
                  >
                    {/* Instagram portion (top) */}
                    <View
                      style={{
                        flex: 100 - tiktokPortion,
                        backgroundColor: TRACKED_APPS[INSTAGRAM_PACKAGE].brandColor,
                      }}
                    />
                    {/* TikTok portion (bottom) */}
                    <View
                      style={{
                        flex: tiktokPortion,
                        backgroundColor: TRACKED_APPS[TIKTOK_PACKAGE].brandColor,
                      }}
                    />
                  </View>
                </View>

                {/* Day label */}
                <Text
                  style={[
                    styles.dateLabel,
                    {
                      color: isSelected ? theme.accent : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {formatDateLabel(dateStr)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Day Inspector */}
      {activeRecord && (
        <View style={[styles.detailBox, { backgroundColor: theme.cardElevated }]}>
          <Text style={[styles.detailDate, { color: theme.textPrimary }]}>
            {formatDateLabel(activeRecord.date)}: {formatDurationCompact(activeRecord.totalSeconds)} total
          </Text>
          <View style={styles.detailStats}>
            <Text style={[styles.detailStatText, { color: TRACKED_APPS[TIKTOK_PACKAGE].brandColor }]}>
              TikTok: {formatDurationCompact(activeRecord.tiktokSeconds)}
            </Text>
            <Text style={[styles.detailStatText, { color: TRACKED_APPS[INSTAGRAM_PACKAGE].brandColor }]}>
              Reels: {formatDurationCompact(activeRecord.instagramSeconds)}
            </Text>
            <Text style={[styles.detailStatText, { color: theme.stageSafe }]}>
              Saved: {formatDurationCompact(activeRecord.timeSavedSeconds)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chartArea: {
    position: 'relative',
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  budgetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  budgetLineLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: -14,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 20,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    minWidth: 44,
  },
  barWrapper: {
    width: 22,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  dateLabel: {
    fontSize: 10,
    marginTop: 6,
    position: 'absolute',
    bottom: 0,
  },
  detailBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  detailDate: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailStatText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
