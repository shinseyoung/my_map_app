import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../stores/useAppStore';
import MainMap from '../components/MainMap';
import PostDetailModal from '../components/PostDetailModal';
import CameraModal from '../components/CameraModal';
import FilterSheet from '../components/FilterSheet';
import PermissionDeniedView from '../components/PermissionDeniedView';
import EmptyMapView from '../components/EmptyMapView';
import { colors } from '../constants/theme';
import { createPost } from '../api/postApi';

const MapScreen = () => {
  const {
    isFilterSheetOpen,
    setFilterSheetOpen,
    isCameraModalOpen,
    setCameraModalOpen,
    selectedPostId,
    setSelectedPostId,
    hasLocationPermission,
    cameraPermissionGranted,
    activePins,
    location,
    currentUser,
    loadActivePins,
  } = useAppStore();

  const [isUploading, setIsUploading] = useState(false);

  if (hasLocationPermission === false || cameraPermissionGranted === false) {
    return <PermissionDeniedView />;
  }

  const selectedPost = activePins?.find((pin) => pin.id === selectedPostId) || null;

  const handlePinPress = (pin) => {
    setSelectedPostId(pin.id);
  };

  const handleSubmitPost = async ({ mainImageUri, subImageUri }) => {
    if (!location || !currentUser) {
      Alert.alert('오류', '위치 정보 또는 로그인 정보를 확인할 수 없습니다.');
      return;
    }

    setIsUploading(true);
    try {
      await createPost({
        userId: currentUser.id,
        mainImageUri,
        subImageUri,
        exactLat: location.latitude,
        exactLon: location.longitude,
      });
      setCameraModalOpen(false);
      loadActivePins(); // 새로 올린 핀이 바로 지도에 보이도록 갱신
    } catch (error) {
      Alert.alert('업로드 실패', '사진을 업로드하는 중 문제가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MainMap onPinPress={handlePinPress} />

        {(!activePins || activePins.length === 0) && (
          <View style={styles.emptyViewOverlay}>
            <EmptyMapView />
          </View>
        )}

        <View style={styles.topRightControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFilterSheetOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="options" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomCenterControls}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setCameraModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.cameraButtonInner} />
          </TouchableOpacity>
        </View>
      </View>

      <PostDetailModal
        visible={!!selectedPostId}
        post={selectedPost}
        onClose={() => setSelectedPostId(null)}
      />
      <CameraModal
        visible={isCameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onSubmit={handleSubmitPost}
        isUploading={isUploading}
      />
      <FilterSheet
        visible={isFilterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapContainer: { flex: 1, position: 'relative' },
  topRightControls: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCenterControls: { position: 'absolute', bottom: 32, alignSelf: 'center', zIndex: 10 },
  cameraButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cameraButtonInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white },
  emptyViewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
});

export default MapScreen;