import { supabase } from './supabaseClient';
import { applyPinBlur } from '../utils/geoUtils';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const STORAGE_BUCKET = 'post-images';

// 로컬 파일 uri를 Supabase Storage에 업로드하고 public URL을 반환
const uploadImage = async (userId, localUri, label) => {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const fileExt = localUri.split('.').pop()?.split('?')[0] || 'jpg';
  const filePath = `${userId}/${Date.now()}_${label}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, decode(base64), {
      contentType: `image/${fileExt}`,
      upsert: false,
    });

  if (uploadError) {
    console.error(`Error uploading ${label} image:`, uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

// 반경 내 + 24시간 이내 활성 핀 조회 (필터 포함)
export const fetchActivePins = async ({
  lat,
  lon,
  radiusKm,
  gender = 'all',
  minAge = 18,
  maxAge = 100,
}) => {
  const { data, error } = await supabase.rpc('get_active_pins_within_radius', {
    user_lat: lat,
    user_lon: lon,
    radius_km: radiusKm,
    gender_filter: gender,
    min_age: minAge,
    max_age: maxAge,
  });

  if (error) {
    console.error('Error in fetchActivePins:', error);
    return [];
  }
  return data;
};

// 게시물 생성: 메인(후면) + 서브(전면) 사진 둘 다 업로드 후 DB 기록
export const createPost = async ({
  userId,
  mainImageUri,
  subImageUri,
  exactLat,
  exactLon,
  caption,
  locationTag,
}) => {
  const mainImageUrl = await uploadImage(userId, mainImageUri, 'main');
  const subImageUrl = subImageUri ? await uploadImage(userId, subImageUri, 'sub') : null;

  const { lat: blurredLat, lon: blurredLon } = applyPinBlur(exactLat, exactLon);

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        user_id: userId,
        main_image_url: mainImageUrl,
        sub_image_url: subImageUrl,
        caption: caption || null,
        location_tag: locationTag || null,
        exact_location: `POINT(${exactLon} ${exactLat})`,
        blurred_location: `POINT(${blurredLon} ${blurredLat})`,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
  return data;
};

// 특정 유저의 전체 게시물 (프로필 그리드용, 시간 필터 없음)
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

export const toggleLike = async (postId, userId, isCurrentlyLiked) => {
  if (isCurrentlyLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) console.error('Error unliking post:', error);
  } else {
    const { error } = await supabase
      .from('likes')
      .insert([{ post_id: postId, user_id: userId }]);
    if (error) console.error('Error liking post:', error);
  }
};

export const fetchLikeInfo = async (postId, userId) => {
  const { count, error: countError } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (countError) {
    console.error('Error fetching like count:', countError);
  }

  let likedByMe = false;
  if (userId) {
    const { data, error } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) console.error('Error checking like status:', error);
    likedByMe = !!data;
  }

  return { count: count || 0, likedByMe };
};

export const fetchComments = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(username, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data;
};

export const addComment = async (postId, userId, content) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id: postId, user_id: userId, content }])
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
  return data;
};