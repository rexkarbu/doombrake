import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppNavigator } from './navigation/AppNavigator';
import { FloatingTimerView } from './components/overlay/FloatingTimerView';
import { InterruptionModal } from './components/modals/InterruptionModal';

export const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <AppNavigator />
      <FloatingTimerView />
      <InterruptionModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    maxWidth: 540,
    marginHorizontal: 'auto',
  },
});

export default App;
