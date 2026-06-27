import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import useAppStore from './src/stores/useAppStore';

export default function App() {
  const initAuth = useAppStore((state) => state.initAuth);
  const authReady = useAppStore((state) => state.authReady);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!authReady) {
    return null; // 추후 로딩 스플래시로 교체 가능
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}