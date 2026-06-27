import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import useAppStore from '../stores/useAppStore';
import { COLORS } from '../constants/theme';
import EmptyMapView from './EmptyMapView';
import PermissionDeniedView from './PermissionDeniedView';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

export default function MainMap({ onPinPress, onRequestFilter }) {
  const mapRef = useRef(null);
  const {
    location,
    filterRadius,
    activePins,
    hasLocationPermission,
    requestPermissions,
  } = useAppStore();

  useEffect(() => {
    if (!hasLocationPermission) {
      requestPermissions();
    }
  }, [hasLocationPermission, requestPermissions]);

  useEffect(() => {
    if (mapRef.current && location) {
      const latitudeDelta = (filterRadius / 111.32) * 2.2;
      const longitudeDelta = latitudeDelta * ASPECT_RATIO;
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta,
        longitudeDelta,
      }, 1000);
    }
  }, [location, filterRadius]);

  if (hasLocationPermission === false) {
    return <PermissionDeniedView />;
  }

  if (!location) {
    return <View style={styles.container} />;
  }

  const minZoomLevel = Math.max(0, 15 - Math.log2(filterRadius));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={darkMapStyle}
        minZoomLevel={minZoomLevel}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: (filterRadius / 111.32) * 2.2,
          longitudeDelta: ((filterRadius / 111.32) * 2.2) * ASPECT_RATIO,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {activePins && activePins.length > 0 && activePins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            onPress={() => onPinPress(pin)}
          />
        ))}
      </MapView>
      {(!activePins || activePins.length === 0) && <EmptyMapView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];