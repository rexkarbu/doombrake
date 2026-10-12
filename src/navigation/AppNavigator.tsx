import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useDoomStore, TabKey } from '../store/useDoomStore';
import { themes } from '../styles/theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SimulatorScreen } from '../screens/SimulatorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export const AppNavigator: React.FC = () => {
  const { currentTab, setCurrentTab, themeMode, toggleTheme, isServiceActive, isTimerRunning } =
    useDoomStore();
  const theme = themes[themeMode];

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'simulator', label: 'Simulator', icon: '📱' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTitleRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandIcon}>🛑</Text>
          </View>
          <View>
            <Text style={[styles.appName, { color: theme.textPrimary }]}>DoomBrake</Text>
            <View style={styles.serviceStatusRow}>
              <View
                style={[
                  styles.serviceDot,
                  { backgroundColor: isServiceActive ? theme.stageSafe : theme.stageDanger },
                ]}
              />
              <Text style={[styles.serviceStatusText, { color: theme.textSecondary }]}>
                {isServiceActive
                  ? isTimerRunning
                    ? 'Monitoring active doomscroll'
                    : 'Guard Active'
                  : 'Guard Inactive'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.themeToggleButton, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel="Toggle Dark and Light mode"
        >
          <Text style={styles.themeToggleIcon}>{themeMode === 'dark' ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Screen Content */}
      <View style={styles.screenContainer}>
        {currentTab === 'dashboard' && <DashboardScreen />}
        {currentTab === 'simulator' && <SimulatorScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.tabBarBg, borderTopColor: theme.border }]}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setCurrentTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? theme.accent : theme.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={[styles.activeIndicator, { backgroundColor: theme.accent }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    fontSize: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  serviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  serviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  themeToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleIcon: {
    fontSize: 18,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingTop: 6,
    height: 64,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    position: 'relative',
  },
  tabButtonActive: {},
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});
