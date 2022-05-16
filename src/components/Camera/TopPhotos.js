// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import PhotoCarousel from "../SharedComponents/PhotoCarousel";
import { textStyles } from "../../styles/camera/standardCamera";

type Props = {
  photos: Array<Object>
}

const TopPhotos = ( { photos }: Props ): Node => {
  const navigation = useNavigation( );

  const handleSelection = ( mainPhoto ) => {
    navigation.navigate( "MediaViewer", { photos, mainPhoto } );
  };

  const emptyDescription = ( ) => <Text style={textStyles.topPhotoText}>Photos you take will appear here</Text>;

  return (
    <PhotoCarousel
      photos={photos}
      emptyComponent={emptyDescription}
      containerStyle="camera"
      setSelectedPhoto={handleSelection}
    />
  );
};

export default TopPhotos;
