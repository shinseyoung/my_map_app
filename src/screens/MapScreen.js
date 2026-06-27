import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../stores/useAppStore';
import MainMap from '../components/MainMap';
import PostDetailModal from '../components/PostDetailModal';
import CameraModal from '../components/CameraModal';
import FilterSheet from '../components/FilterSheet';
import PermissionDeniedView from '../components/PermissionDeniedView';
import EmptyMapView from '../components/EmptyMapView';
import { colors } from '../constants/theme';

const MapScreen = () => {
  const {
    isFilterSheetOpen,
    setFilterSheetOpen,
    isCameraModalOpen,
    setCameraModalOpen,
    selectedPostId,
    locationPermissionGranted,
    cameraPermissionGranted,
    activePins
  } = useAppStore();

  if (locationPermissionGranted === false || cameraPermissionGranted === false) {
    return <PermissionDeniedView />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MainMap />
        
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

      {selectedPostId && <PostDetailModal />}
      {isCameraModalOpen && <CameraModal />}
      {isFilterSheetOpen && <FilterSheet />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  topRightControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCenterControls: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    zIndex: 10,
  },
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
  cameraButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
  emptyViewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  }
});

export default MapScreen;