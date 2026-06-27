import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { COLORS } from '../constants/theme';

export default function PermissionDeniedView() {
  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={openSettings}>
        <Text style={styles.buttonText}>서비스를 이용하려면 설정에서 위치와 카메라 권한을 켜주세요</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  button: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 40,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});