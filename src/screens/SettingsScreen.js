import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { updateProfile, updatePrivacyLevel } from '../api/userApi';
import useAppStore from '../stores/useAppStore';

const PRIVACY_OPTIONS = [
  { id: 'public', label: '전체 공개', desc: '누구나 내 프로필과 게시물을 볼 수 있어요.', icon: 'location-outline' },
  { id: 'followers', label: '팔로워만', desc: '팔로워만 내 게시물을 볼 수 있어요.', icon: 'people-outline' },
  { id: 'friends', label: '친구만', desc: '서로 팔로우한 친구만 볼 수 있어요.', icon: 'person-add-outline' },
  { id: 'private', label: '나만 보기', desc: '아무도 볼 수 없어요.', icon: 'lock-closed-outline' },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { currentUser, profile, setProfile, logout } = useAppStore();

  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [privacyLevel, setPrivacyLevel] = useState(profile?.privacy_level || 'public');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUsername(profile?.username || '');
    setBio(profile?.bio || '');
    setWebsite(profile?.website || '');
    setPrivacyLevel(profile?.privacy_level || 'public');
  }, [profile]);

  const handlePrivacyChange = (optionId) => {
    setPrivacyLevel(optionId);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const updatedProfile = await updateProfile(currentUser.id, { username, bio, website });
      await updatePrivacyLevel(currentUser.id, privacyLevel);
      setProfile({ ...updatedProfile, privacy_level: privacyLevel });
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSideButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerSideText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 편집</Text>
        <TouchableOpacity style={styles.headerSideButton} onPress={handleSave} disabled={isSaving}>
          <Text style={[styles.headerSideText, styles.headerSaveText]}>
            {isSaving ? '저장 중...' : '완료'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
            <View style={styles.avatarCameraIcon}>
              <Ionicons name="camera" size={14} color="#000" />
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>사진 변경</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>이름</Text>
            <TextInput
              style={styles.fieldInput}
              value={username}
              onChangeText={setUsername}
              placeholder="이름"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>소개</Text>
            <TextInput
              style={styles.fieldInput}
              value={bio}
              onChangeText={setBio}
              placeholder="소개"
              placeholderTextColor="#666"
              multiline
            />
          </View>
          <View style={[styles.fieldRow, styles.fieldRowLast]}>
            <Text style={styles.fieldLabel}>웹사이트</Text>
            <TextInput
              style={styles.fieldInput}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://"
              placeholderTextColor="#666"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>공개 범위</Text>
          <View style={styles.optionsContainer}>
            {PRIVACY_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  index === PRIVACY_OPTIONS.length - 1 && styles.optionRowLast,
                ]}
                onPress={() => handlePrivacyChange(option.id)}
              >
                <Ionicons name={option.icon} size={20} color={colors.white} style={styles.optionIcon} />
                <View style={styles.optionTextWrapper}>
                  <Text style={styles.optionText}>{option.label}</Text>
                  <Text style={styles.optionDesc}>{option.desc}</Text>
                </View>
                <View style={[styles.radioOuter, privacyLevel === option.id && styles.radioOuterActive]}>
                  {privacyLevel === option.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerSideButton: {
    minWidth: 50,
  },
  headerSideText: {
    color: colors.white,
    fontSize: 15,
  },
  headerSaveText: {
    color: '#3897F0',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: '#444',
  },
  avatarCameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  changePhotoText: {
    color: '#3897F0',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldGroup: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 32,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldRowLast: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    width: 80,
    color: '#888',
    fontSize: 14,
  },
  fieldInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
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
  optionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    color: colors.white,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#888',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#3897F0',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3897F0',
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
});

export default SettingsScreen;