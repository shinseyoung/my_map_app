import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { updateUserPrivacy } from '../api/userApi';
import useAppStore from '../stores/useAppStore';

const PRIVACY_OPTIONS = [
  { id: 'public', label: '전체 공개' },
  { id: 'followers', label: '팔로워만' },
  { id: 'friends', label: '친구만' },
  { id: 'private', label: '나만 보기' }
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAppStore();
  const [currentPrivacy, setCurrentPrivacy] = useState(user?.privacy || 'public');

  const handlePrivacyChange = async (optionId) => {
    setCurrentPrivacy(optionId);
    try {
      await updateUserPrivacy(user?.id, optionId);
    } catch (error) {
      Alert.alert('오류', '공개 범위 설정에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>공개 범위 설정</Text>
          <Text style={styles.sectionDesc}>
            게시물이 지도에 표시되는 대상을 선택합니다. (안심 오차범위 50~100m 적용 중)
          </Text>
          
          <View style={styles.optionsContainer}>
            {PRIVACY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  currentPrivacy === option.id && styles.optionRowSelected
                ]}
                onPress={() => handlePrivacyChange(option.id)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                {currentPrivacy === option.id && (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  optionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    fontSize: 16,
    color: colors.white,
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  }
});

export default SettingsScreen;