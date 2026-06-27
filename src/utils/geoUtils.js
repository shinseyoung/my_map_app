// 실제 좌표에 50~100m 랜덤 오차를 적용한 좌표를 반환 (안심 오차범위 / Pin-blur)
export const applyPinBlur = (latitude, longitude) => {
  const R = 6371000; // 지구 반지름 (m)

  const minOffset = 50;
  const maxOffset = 100;
  const distance = Math.random() * (maxOffset - minOffset) + minOffset;

  const angle = Math.random() * 2 * Math.PI;

  const deltaLat = (distance * Math.cos(angle)) / R;
  const deltaLng = (distance * Math.sin(angle)) / (R * Math.cos((latitude * Math.PI) / 180));

  return {
    lat: latitude + (deltaLat * 180) / Math.PI,
    lon: longitude + (deltaLng * 180) / Math.PI,
  };
};

// 두 좌표 간 거리 (km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 필터 반경(km)에 맞춰 지도의 latitudeDelta/longitudeDelta 계산
// (뷰포트 잠금 로직: 이 델타가 곧 '최대 축소 한계선'이 됨)
export const getRegionDeltaForRadius = (radiusKm, aspectRatio) => {
  const latitudeDelta = (radiusKm / 111.32) * 2.2;
  const longitudeDelta = latitudeDelta * aspectRatio;
  return { latitudeDelta, longitudeDelta };
};

// 반경(km)에 따른 지도 최소 줌 레벨 (뷰포트 잠금: 이 이하로는 축소 불가)
export const getMinZoomLevelForRadius = (radiusKm) => {
  return Math.max(0, 15 - Math.log2(radiusKm));
};