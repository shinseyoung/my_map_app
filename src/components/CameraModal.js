import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../constants/theme';

// 촬영 단계: 'main' (후면/메인 사진) -> 'sub' (전면/셀카) -> 'preview' (확인 후 업로드)
export default function CameraModal({ visible, onClose, onSubmit, isUploading }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState('main');
  const [mainPhotoUri, setMainPhotoUri] = useState(null);
  const [subPhotoUri, setSubPhotoUri] = useState(null);
  const [facing, setFacing] = useState('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  useEffect(() => {
    // 모달이 닫히면 다음에 열 때를 위해 상태 초기화
    if (!visible) {
      setStep('main');
      setMainPhotoUri(null);
      setSubPhotoUri(null);
      setFacing('back');
    }
  }, [visible]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

      if (step === 'main') {
        // 후면(메인) 사진을 찍은 직후, 곧바로 전면 카메라로 전환해 셀카를 찍게 함 (BeReal 방식)
        setMainPhotoUri(photo.uri);
        setFacing('front');
        setStep('sub');
      } else if (step === 'sub') {
        setSubPhotoUri(photo.uri);
        setStep('preview');
      }
    } catch (error) {
      console.error('Camera capture error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setMainPhotoUri(null);
    setSubPhotoUri(null);
    setFacing('back');
    setStep('main');
  };

  const handleSubmit = () => {
    if (!mainPhotoUri) return;
    onSubmit && onSubmit({ mainImageUri: mainPhotoUri, subImageUri: subPhotoUri });
  };

  const handleClose = () => {
    onClose && onClose();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>권한 요청</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {step === 'preview' ? (
          <>
            <View style={styles.previewContainer}>
              {mainPhotoUri && (
                <Image source={{ uri: mainPhotoUri }} style={styles.previewMainImage} resizeMode="cover" />
              )}
              {subPhotoUri && (
                <View style={styles.previewSubImageWrapper}>
                  <Image source={{ uri: subPhotoUri }} style={styles.previewSubImage} resizeMode="cover" />
                </View>
              )}
              <TouchableOpacity style={styles.previewCloseBtn} onPress={handleClose}>
                <Text style={styles.headerBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewControls}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleRetake}
                disabled={isUploading}
              >
                <Text style={styles.retakeBtnText}>다시 찍기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, isUploading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitBtnText}>이 순간 기록하기</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
                <Text style={styles.headerBtnText}>취소</Text>
              </TouchableOpacity>
              <Text style={styles.title}>
                {step === 'main' ? '1/2 · 현재 풍경을 찍어주세요' : '2/2 · 이제 셀카를 찍어주세요'}
              </Text>
              <View style={styles.headerBtn} />
            </View>

            <View style={styles.cameraContainer}>
              <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                onPress={handleCapture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <View style={styles.captureInner} />
                )}
              </TouchableOpacity>
              <Text style={styles.hintText}>2초 안에 순간을 기록하세요</Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: { color: COLORS.text, fontSize: 16, marginBottom: 20 },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  permissionBtnText: { color: '#000', fontWeight: 'bold' },
  closeBtn: { padding: 10 },
  closeBtnText: { color: '#888' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#000',
  },
  headerBtn: { padding: 10, minWidth: 50 },
  headerBtnText: { color: '#FFF', fontSize: 16 },
  title: { color: '#FFF', fontSize: 14, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  cameraContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  camera: { flex: 1 },
  controlsContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#333',
  },
  captureButtonDisabled: { backgroundColor: '#888' },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#000',
  },
  hintText: { color: '#888', fontSize: 12, marginTop: 12 },

  // Preview (BeReal 스타일 합성 미리보기)
  previewContainer: { flex: 1, position: 'relative' },
  previewMainImage: { width: '100%', height: '100%' },
  previewSubImageWrapper: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 110,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  previewSubImage: { width: '100%', height: '100%' },
  previewCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewControls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#000',
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  retakeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  submitBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  submitBtnDisabled: { backgroundColor: '#888' },
  submitBtnText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
});