// @flow

import type { Node } from "react";
import React from "react";
import {
  ActivityIndicator, FlatList, Image, Pressable, View
} from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

import colors from "../../styles/colors";
import { imageStyles, viewStyles } from "../../styles/sharedComponents/photoCarousel";

type Props = {
  emptyComponent?: Function,
  photoUris: Array<string>,
  setSelectedPhotoIndex?: Function,
  selectedPhotoIndex?: number,
  containerStyle?: string,
  handleDelete?: Function,
  savingPhoto?: boolean,
  handleAddEvidence?: Function,
  showAddButton?: boolean
}

const PhotoCarousel = ( {
  photoUris,
  emptyComponent,
  setSelectedPhotoIndex,
  selectedPhotoIndex,
  containerStyle,
  handleDelete,
  savingPhoto,
  handleAddEvidence,
  showAddButton = false

}: Props ): Node => {
  const insets = useSafeAreaInsets( );
  const { colors: themeColors } = useTheme( );
  const renderDeleteButton = photoUri => (
    <Pressable
      onPress={( ) => {
        if ( !handleDelete ) { return; }
        handleDelete( photoUri );
      }}
      style={viewStyles.deleteButton}
    >
      <Avatar.Icon
        icon="delete-forever"
        size={30}
        style={{ backgroundColor: themeColors.background }}
      />
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

  const renderPhoto = ( { item, index } ) => {
    if ( index === photoUris.length ) {
      return (
        <Pressable
          onPress={handleAddEvidence}
        >
          <View style={viewStyles.addEvidenceButton}>
            <Icon name="add" size={40} color={colors.logInGray} />
          </View>
        </Pressable>
      );
    }

    return (
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
  };

  const data = [...photoUris];
  if ( showAddButton ) data.push( "add" );

  return (
    <FlatList
      data={data}
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
