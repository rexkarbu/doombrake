import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDoomStore } from '../../store/useDoomStore';
import { themes } from '../../styles/theme';

export interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  badgeText?: string;
  badgeColor?: string;
  icon?: string;
  style?: any;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  badgeText,
  badgeColor,
  icon,
  style,
}) => {
  const themeMode = useDoomStore((s) => s.themeMode);
  const theme = themes[themeMode];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        style,
      ]}
      accessibilityRole="summary"
    >
      <View style={styles.topRow}>
        <View style={styles.labelGroup}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        </View>
        {badgeText && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: badgeColor
                  ? `${badgeColor}20`
                  : 'rgba(99, 102, 241, 0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: badgeColor || theme.accent },
              ]}
            >
              {badgeText}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>

      {subtext && (
        <Text style={[styles.subtext, { color: theme.textMuted }]}>{subtext}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
    lineHeight: 16,
  },
});
