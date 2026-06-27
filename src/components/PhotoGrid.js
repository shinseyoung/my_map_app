import React from 'react';
import { StyleSheet, View, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 3;

export default function PhotoGrid({ posts, onPostPress }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onPostPress && onPostPress(item)}>
      <View style={styles.itemContainer}>
        {item.mainImageUrl ? (
          <Image source={{ uri: item.mainImageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: COLORS.background,
    paddingBottom: 20,
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    padding: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
});