import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import useAppStore from '../stores/useAppStore';
import { COLORS } from '../constants/theme';

const { height } = Dimensions.get('window');

export default function FilterSheet({ visible, onClose }) {
  const { filter, updateFilter, resetFilter } = useAppStore();

  const [localRadius, setLocalRadius] = useState(filter.radius);
  const [localGender, setLocalGender] = useState(filter.gender);
  const [localMaxAge, setLocalMaxAge] = useState(filter.maxAge);

  useEffect(() => {
    if (visible) {
      setLocalRadius(filter.radius);
      setLocalGender(filter.gender);
      setLocalMaxAge(filter.maxAge);
    }
  }, [visible, filter]);

  const handleApply = () => {
    updateFilter({
      radius: localRadius,
      gender: localGender,
      maxAge: localMaxAge,
    });
    onClose && onClose();
  };

  const handleReset = () => {
    resetFilter();
    setLocalRadius(5);
    setLocalGender('all');
    setLocalMaxAge(60);
  };

  const genders = [
    { label: '전체', value: 'all' },
    { label: '남성', value: 'male' },
    { label: '여성', value: 'female' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backgroundTouchable} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheetContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>필터</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>성별</Text>
            <View style={styles.row}>
              {genders.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.chip, localGender === g.value && styles.chipActive]}
                  onPress={() => setLocalGender(g.value)}
                >
                  <Text style={[styles.chipText, localGender === g.value && styles.chipTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>반경</Text>
            <Text style={styles.valueText}>{localRadius}km</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={localRadius}
              onValueChange={setLocalRadius}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor="#444"
              thumbTintColor={COLORS.primary}
            />
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeLabelText}>1km</Text>
              <Text style={styles.rangeLabelText}>50km</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>나이</Text>
            <Text style={styles.valueText}>{localMaxAge}세</Text>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={60}
              step={1}
              value={localMaxAge}
              onValueChange={setLocalMaxAge}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor="#444"
              thumbTintColor={COLORS.primary}
            />
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeLabelText}>18</Text>
              <Text style={styles.rangeLabelText}>60+</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backgroundTouchable: {
    flex: 1,
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: height * 0.55,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeIcon: {
    color: COLORS.text,
    fontSize: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 8,
  },
  valueText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabelText: {
    color: '#888',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#333',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 14,
  },
  chipTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  resetButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});