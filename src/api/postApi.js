import { supabase } from './supabaseClient';
import { applyPinBlur } from '../utils/geoUtils';

export const fetchActivePins = async (lat, lon, radiusKm) => {
  const { data, error } = await supabase.rpc('get_active_pins_within_radius', {
    user_lat: lat,
    user_lon: lon,
    radius_km: radiusKm,
  });

  if (error) {
    console.error('Error in fetchActivePins:', error);
    return [];
  }
  return data;
};

export const createPost = async (userId, imageUrl, exactLat, exactLon) => {
  const { lat: blurredLat, lon: blurredLon } = applyPinBlur(exactLat, exactLon);

  const { data, error } = await supabase.from('posts').insert([
    {
      user_id: userId,
      image_url: imageUrl,
      location: `POINT(${blurredLon} ${blurredLat})`,
    },
  ]).select();

  if (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
  return data;
};

export const fetchUserPosts = async (userId) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error in fetchUserPosts:', error);
    return [];
  }
  return data;
};