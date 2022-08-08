// @flow

import type { Node } from "react";
import React from "react";
import {
  ActivityIndicator, FlatList, Image, Pressable, View
} from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { imageStyles, viewStyles } from "../../styles/sharedComponents/photoCarousel";

type Props = {
  emptyComponent?: Function,
  photoUris: Array<string>,
  setSelectedPhotoIndex?: Function,
  selectedPhotoIndex?: number,
  containerStyle?: string,
  handleDelete?: Function,
  savingPhoto?: boolean
}

const PhotoCarousel = ( {
  photoUris,
  emptyComponent,
  setSelectedPhotoIndex,
  selectedPhotoIndex,
  containerStyle,
  handleDelete,
  savingPhoto
}: Props ): Node => {
  const insets = useSafeAreaInsets( );
  const { colors } = useTheme( );
  const renderDeleteButton = photoUri => (
    <Pressable
      onPress={( ) => {
        if ( !handleDelete ) { return; }
        handleDelete( photoUri );
      }}
      style={viewStyles.deleteButton}
    >
      <Avatar.Icon icon="delete-forever" size={30} style={{ backgroundColor: colors.background }} />
    </Pressable>
  );

  const renderSkeleton = ( ) => {
    if ( savingPhoto ) {
      return (
        <View style={viewStyles.photoLoading}>
          <ActivityIndicator />
        </View>
      );
    }
    return null;
  };

  const renderPhoto = ( { item, index } ) => (
    <>
      <Pressable
        onPress={( ) => {
          if ( setSelectedPhotoIndex ) {
            setSelectedPhotoIndex( index );
          }
        }}
      >
        <Image
          source={{ uri: item }}
          style={[
            imageStyles.photo,
            selectedPhotoIndex === index && viewStyles.greenSelectionBorder,
            ( containerStyle === "camera" ) && imageStyles.photoStandardCamera
          ]}
          testID="ObsEdit.photo"
        />
        {( containerStyle === "camera" ) && renderDeleteButton( item )}
      </Pressable>
      {index === photoUris.length - 1 && renderSkeleton( )}
    </>
  );

  return (
    <FlatList
      data={photoUris}
      contentContainerStyle={( containerStyle === "camera" ) && [
        viewStyles.photoContainer, {
          top: insets.top
        }]}
      renderItem={renderPhoto}
      horizontal
      ListEmptyComponent={savingPhoto ? renderSkeleton( ) : emptyComponent}
    />
  );
};

export default PhotoCarousel;
