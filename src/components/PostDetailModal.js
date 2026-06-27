import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/theme';
import useAppStore from '../stores/useAppStore';
import { fetchLikeInfo, toggleLike, fetchComments, addComment } from '../api/postApi';

export default function PostDetailModal({ visible, post, onClose }) {
  const currentUser = useAppStore((state) => state.currentUser);

  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isCommentsOpen, setCommentsOpen] = useState(false);

  const loadSocialData = useCallback(async () => {
    if (!post) return;
    const { count, likedByMe: liked } = await fetchLikeInfo(post.id, currentUser?.id);
    setLikeCount(count);
    setLikedByMe(liked);
    const commentList = await fetchComments(post.id);
    setComments(commentList);
  }, [post, currentUser]);

  useEffect(() => {
    if (visible && post) {
      loadSocialData();
    } else {
      setCommentsOpen(false);
    }
  }, [visible, post, loadSocialData]);

  if (!post) return null;

  const handleToggleLike = async () => {
    if (!currentUser) return;
    const nextLiked = !likedByMe;
    setLikedByMe(nextLiked);
    setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));
    await toggleLike(post.id, currentUser.id, likedByMe);
  };

  const handleAddComment = async () => {
    if (!currentUser || !commentText.trim()) return;
    const newComment = await addComment(post.id, currentUser.id, commentText.trim());
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {post.main_image_url ? (
            <Image source={{ uri: post.main_image_url }} style={styles.mainImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          {post.sub_image_url && (
            <View style={styles.subImageWrapper}>
              <Image source={{ uri: post.sub_image_url }} style={styles.subImage} resizeMode="cover" />
            </View>
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.infoContainer}
        >
          <View style={styles.headerRow}>
            <View style={styles.profileBox}>
              {post.avatar_url ? (
                <Image source={{ uri: post.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <Text style={styles.username}>{post.username || 'User'}</Text>
            </View>
            <Text style={styles.locationTag}>{post.location_tag || '#위치태그'}</Text>
          </View>

          {post.caption && <Text style={styles.caption}>{post.caption}</Text>}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleToggleLike}>
              <Text style={styles.actionText}>
                {likedByMe ? '♥' : '♡'} 좋아요 {likeCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setCommentsOpen((v) => !v)}>
              <Text style={styles.actionText}>💬 댓글 {comments.length}</Text>
            </TouchableOpacity>
          </View>

          {isCommentsOpen && (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              style={styles.commentList}
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Text style={styles.commentAuthor}>
                    {item.profiles?.username || 'User'}
                  </Text>
                  <Text style={styles.commentContent}>{item.content}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.commentPlaceholder}>아직 댓글이 없어요.</Text>
              }
            />
          )}

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 남겨보세요..."
              placeholderTextColor="#888"
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleAddComment}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Text style={styles.sendText}>게시</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  closeText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 3,
    position: 'relative',
    backgroundColor: '#000',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  subImageWrapper: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 100,
    height: 133,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000',
  },
  subImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
    marginRight: 10,
  },
  username: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  locationTag: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  caption: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionBtn: {
    marginRight: 20,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 15,
  },
  commentList: {
    maxHeight: 120,
    marginBottom: 8,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  commentAuthor: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
    marginRight: 6,
  },
  commentContent: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  commentInput: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 10,
  },
  sendText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  commentPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
});