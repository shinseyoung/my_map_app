import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function EmptyMapView() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.badge}>
        <Text style={styles.text}>📍 이 근처엔 아직 기록된 순간이 없어요. 첫 번째 핀의 주인공이 되어보세요!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badge: {
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 40,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});