// @flow

import React from "react";
import { FlatList, Image, Pressable } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import { imageStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import Photo from "../../models/Photo";

type Props = {
  emptyComponent?: Function,
  photos: Array<Object>,
  setSelectedPhoto?: Function,
  selectedPhoto?: number,
  containerStyle?: string
}

const PhotoCarousel = ( {
  photos,
  emptyComponent,
  setSelectedPhoto,
  selectedPhoto,
  containerStyle
}: Props ): Node => {
  const navigation = useNavigation( );

  const renderPhoto = ( { item, index } ) => {
    const uri = Photo.setPlatformSpecificFilePath( item.path );

    const handlePress = ( ) => {
      if ( setSelectedPhoto ) {
        setSelectedPhoto( index );
      }
      navigation.navigate( "MediaViewer", { photos } );
      // return;
    };

    return (
      <Pressable
        // disabled={!setSelectedPhoto}
        onPress={handlePress}
      >
        <Image
          source={{ uri }}
          style={[
            imageStyles.obsPhoto,
            selectedPhoto === index && viewStyles.greenSelectionBorder,
            ( containerStyle === "camera" ) && imageStyles.smallPhoto
          ]}
          testID="ObsEdit.photo"
        />
      </Pressable>
    );
  };

  return (
    <FlatList
      data={photos}
      contentContainerStyle={( containerStyle === "camera" ) && viewStyles.photoContainer}
      renderItem={renderPhoto}
      horizontal
      ListEmptyComponent={emptyComponent}
    />
  );
};

export default PhotoCarousel;
