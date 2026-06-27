import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { COLORS } from '../constants/theme';

export default function PostDetailModal({ visible, post, onClose }) {
  if (!post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {post.mainImageUrl ? (
            <Image source={{ uri: post.mainImageUrl }} style={styles.mainImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          {post.subImageUrl && (
            <View style={styles.subImageWrapper}>
              <Image source={{ uri: post.subImageUrl }} style={styles.subImage} resizeMode="cover" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <View style={styles.profileBox}>
              <View style={styles.avatar} />
              <Text style={styles.username}>{post.authorUsername || 'User'}</Text>
            </View>
            <Text style={styles.locationTag}>{post.locationTag || '#위치태그'}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionText}>♥ 좋아요</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionText}>💬 댓글</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.commentPlaceholder}>댓글을 남겨보세요...</Text>
          </View>
        </View>
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
    marginBottom: 20,
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
  actionRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  actionBtn: {
    marginRight: 20,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 16,
  },
  commentSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  commentPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
});