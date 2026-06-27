import { create } from 'zustand';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { supabase, ensureSession, ensureProfile } from '../api/supabaseClient';
import { getUserProfile, getProfileStats } from '../api/userApi';
import { fetchActivePins, fetchUserPosts } from '../api/postApi';
import { getMinZoomLevelForRadius } from '../utils/geoUtils';

const useAppStore = create((set, get) => ({
  // ===================== 인증 / 유저 =====================
  currentUser: null, // { id, ...authUser }
  profile: null, // profiles 테이블 row
  profileStats: { post_count: 0, follower_count: 0, following_count: 0 },
  authReady: false,

  initAuth: async () => {
    const user = await ensureSession();
    if (!user) {
      set({ authReady: true });
      return;
    }
    await ensureProfile(user.id);
    const profile = await getUserProfile(user.id);
    const stats = await getProfileStats(user.id);
    set({ currentUser: user, profile, profileStats: stats, authReady: true });
  },

  refreshProfile: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    const profile = await getUserProfile(currentUser.id);
    const stats = await getProfileStats(currentUser.id);
    set({ profile, profileStats: stats });
  },

  setProfile: (profile) => set({ profile }),

  logout: async () => {
    await supabase.auth.signOut();
    set({
      currentUser: null,
      profile: null,
      profileStats: { post_count: 0, follower_count: 0, following_count: 0 },
      activePins: [],
      userPosts: [],
    });
  },

  // ===================== 위치 / 권한 =====================
  location: null, // { latitude, longitude }
  hasLocationPermission: null, // null = 미확인, true/false = 확정
  cameraPermissionGranted: null,

  requestPermissions: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      set({ hasLocationPermission: granted });

      if (granted) {
        const position = await Location.getCurrentPositionAsync({});
        set({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        get().loadActivePins();
      }
    } catch (error) {
      console.error('위치 권한 요청 오류:', error);
      set({ hasLocationPermission: false });
    }
  },

  requestCameraPermissions: async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      set({ cameraPermissionGranted: status === 'granted' });
    } catch (error) {
      console.error('카메라 권한 요청 오류:', error);
      set({ cameraPermissionGranted: false });
    }
  },

  // ===================== 탐색 레이더 필터 (4번 화면) =====================
  // 뷰포트 잠금 로직의 기준값이 되는 반경 포함
  filter: {
    radius: 5, // km, 1~50
    gender: 'all', // 'all' | 'male' | 'female'
    minAge: 18,
    maxAge: 60,
  },

  updateFilter: (newFilter) => {
    set((state) => ({ filter: { ...state.filter, ...newFilter } }));
    get().loadActivePins();
  },

  resetFilter: () => {
    set({ filter: { radius: 5, gender: 'all', minAge: 18, maxAge: 60 } });
    get().loadActivePins();
  },

  // 현재 필터 반경 기준 지도 최소 줌 레벨 (뷰포트 잠금)
  getMinZoomLevel: () => getMinZoomLevelForRadius(get().filter.radius),

  // ===================== 지도 핀 (1번 화면) =====================
  activePins: [],
  isLoadingPins: false,

  loadActivePins: async () => {
    const { location, filter } = get();
    if (!location) return;

    set({ isLoadingPins: true });
    const pins = await fetchActivePins({
      lat: location.latitude,
      lon: location.longitude,
      radiusKm: filter.radius,
      gender: filter.gender,
      minAge: filter.minAge,
      maxAge: filter.maxAge,
    });
    set({ activePins: pins, isLoadingPins: false });
  },

  // ===================== 프로필 그리드 (5번 화면) =====================
  userPosts: [],
  isLoadingUserPosts: false,

  loadUserPosts: async (userId) => {
    set({ isLoadingUserPosts: true });
    const posts = await fetchUserPosts(userId);
    set({ userPosts: posts, isLoadingUserPosts: false });
  },

  // ===================== UI 상태 (모달 / 바텀시트) =====================
  isFilterSheetOpen: false,
  setFilterSheetOpen: (open) => set({ isFilterSheetOpen: open }),

  isCameraModalOpen: false,
  setCameraModalOpen: (open) => set({ isCameraModalOpen: open }),

  selectedPostId: null,
  setSelectedPostId: (id) => set({ selectedPostId: id }),
}));

export default useAppStore;