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