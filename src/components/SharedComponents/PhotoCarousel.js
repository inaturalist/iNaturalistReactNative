// @flow

import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  ActivityIndicator, FlatList
} from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

import colors from "../../../tailwind-colors";

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
  const { colors: themeColors } = useTheme( );

  const imageClass = "h-16 w-16 justify-center mx-1.5 rounded-lg";

  const renderDeleteButton = photoUri => (
    <Pressable
      onPress={( ) => {
        if ( !handleDelete ) { return; }
        handleDelete( photoUri );
      }}
      className="absolute top-10 right-0"
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
        <View className={`${imageClass} bg-midGray mt-12`}>
          <ActivityIndicator />
        </View>
      );
    }
    return null;
  };

  const renderPhotoOrEvidenceButton = ( { item, index } ) => {
    if ( index === photoUris.length ) {
      return (
        <Pressable
          onPress={handleAddEvidence}
          className={`${imageClass} border border-midGray items-center justify-center mt-6`}
        >
          <Icon name="add" size={40} color={colors.logInGray} />
        </Pressable>
      );
    }

    const setClassName = ( ) => {
      let className = imageClass;
      if ( containerStyle === "camera" ) {
        className += " mt-12";
      } else {
        className += " mt-6";
      }
      if ( selectedPhotoIndex === index ) {
        className += " border border-selectionGreen border-4";
      }
      return className;
    };

    return (
      <>
        <Pressable
          onPress={( ) => {
            if ( setSelectedPhotoIndex ) {
              setSelectedPhotoIndex( index );
            }
          }}
          className={setClassName( )}
        >
          <Image
            source={{ uri: item }}
            testID="ObsEdit.photo"
            className="w-fit h-full"
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
      renderItem={renderPhotoOrEvidenceButton}
      horizontal
      ListEmptyComponent={savingPhoto ? renderSkeleton( ) : emptyComponent}
    />
  );
};

export default PhotoCarousel;
