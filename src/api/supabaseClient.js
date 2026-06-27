import { supabase } from './supabaseClient';

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
  return data;
};

// 5번 화면 상단 카운터 (게시물/팔로워/팔로잉)
export const getProfileStats = async (userId) => {
  const { data, error } = await supabase
    .rpc('get_profile_stats', { profile_id: userId })
    .single();

  if (error) {
    console.error('Error in getProfileStats:', error);
    return { post_count: 0, follower_count: 0, following_count: 0 };
  }
  return data;
};

// 6번 화면: 프로필 편집 (이름/소개/웹사이트)
export const updateProfile = async (userId, { username, bio, website, avatarUrl }) => {
  const updates = {};
  if (username !== undefined) updates.username = username;
  if (bio !== undefined) updates.bio = bio;
  if (website !== undefined) updates.website = website;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
  return data;
};

// 6번 화면: 공개 범위 설정
export const updatePrivacyLevel = async (userId, privacyLevel) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ privacy_level: privacyLevel })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error in updatePrivacyLevel:', error);
    throw error;
  }
  return data;
};

// 4번 화면 필터(성별/나이)에 쓰일 본인 정보 갱신용
export const updateDemographics = async (userId, { gender, birthYear }) => {
  const updates = {};
  if (gender !== undefined) updates.gender = gender;
  if (birthYear !== undefined) updates.birth_year = birthYear;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error in updateDemographics:', error);
    throw error;
  }
  return data;
};

export const followUser = async (followerId, followingId) => {
  const { error } = await supabase
    .from('follows')
    .insert([{ follower_id: followerId, following_id: followingId }]);
  if (error) console.error('Error following user:', error);
};

export const unfollowUser = async (followerId, followingId) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  if (error) console.error('Error unfollowing user:', error);
};