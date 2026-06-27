import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileHeader from '../components/ProfileHeader';
import PhotoGrid from '../components/PhotoGrid';
import PostDetailModal from '../components/PostDetailModal';
import useAppStore from '../stores/useAppStore';
import { colors } from '../constants/theme';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {
    currentUser,
    profile,
    profileStats,
    userPosts,
    loadUserPosts,
    selectedPostId,
    setSelectedPostId,
  } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      loadUserPosts(currentUser.id);
    }
  }, [currentUser, loadUserPosts]);

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handlePostPress = (post) => {
    setSelectedPostId(post.id);
  };

  const selectedPost = userPosts?.find((p) => p.id === selectedPostId) || null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProfileHeader
          user={profile}
          postCount={profileStats.post_count}
          followerCount={profileStats.follower_count}
          followingCount={profileStats.following_count}
          onEditProfile={handleSettingsPress}
        />
        <PhotoGrid
          posts={userPosts.map((p) => ({ id: p.id, mainImageUrl: p.main_image_url }))}
          onPostPress={handlePostPress}
        />
      </View>

      <PostDetailModal
        visible={!!selectedPostId}
        post={
          selectedPost
            ? {
                ...selectedPost,
                main_image_url: selectedPost.main_image_url,
                sub_image_url: selectedPost.sub_image_url,
                username: profile?.username,
                avatar_url: profile?.avatar_url,
              }
            : null
        }
        onClose={() => setSelectedPostId(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});

export default ProfileScreen;