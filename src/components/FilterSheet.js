import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import useAppStore from '../stores/useAppStore';
import { COLORS } from '../constants/theme';

const { height } = Dimensions.get('window');

export default function FilterSheet({ visible, onClose }) {
  const { filterRadius, filterGender, filterAgeGroup, updateFilters } = useAppStore();
  
  const [localRadius, setLocalRadius] = useState(filterRadius);
  const [localGender, setLocalGender] = useState(filterGender);
  const [localAgeGroup, setLocalAgeGroup] = useState(filterAgeGroup);

  useEffect(() => {
    if (visible) {
      setLocalRadius(filterRadius);
      setLocalGender(filterGender);
      setLocalAgeGroup(filterAgeGroup);
    }
  }, [visible, filterRadius, filterGender, filterAgeGroup]);

  const handleApply = () => {
    updateFilters({
      filterRadius: localRadius,
      filterGender: localGender,
      filterAgeGroup: localAgeGroup,
    });
    onClose();
  };

  const genders = [
    { label: '전체', value: 'all' },
    { label: '남성', value: 'male' },
    { label: '여성', value: 'female' },
  ];

  const radii = [1, 5, 10, 50];
  const ages = ['18-24', '25-30', '31-40', '41-60', '60+'];

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
          <View style={styles.handle} />
          
          <Text style={styles.title}>탐색 레이더 필터</Text>

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
            <Text style={styles.sectionTitle}>반경 (km) : {localRadius}km</Text>
            <View style={styles.row}>
              {radii.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, localRadius === r && styles.chipActive]}
                  onPress={() => setLocalRadius(r)}
                >
                  <Text style={[styles.chipText, localRadius === r && styles.chipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>나이</Text>
            <View style={styles.rowWrap}>
              {ages.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.chip, localAgeGroup === a && styles.chipActive, styles.chipMargin]}
                  onPress={() => setLocalAgeGroup(a)}
                >
                  <Text style={[styles.chipText, localAgeGroup === a && styles.chipTextActive]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>적용하기</Text>
          </TouchableOpacity>
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
    minHeight: height * 0.5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  chipMargin: {
    marginVertical: 4,
    flex: 0,
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
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});