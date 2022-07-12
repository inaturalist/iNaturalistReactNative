// @flow

import * as React from "react";
import { Image, Pressable, Text } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { imageStyles, textStyles } from "../../styles/sharedComponents/photoScroll";

type Props = {
  photos: Array<Object>
}

const PhotoScroll = ( { photos }: Props ): React.Node => {
  const extractKey = item => item?.uuid || `photo-${item?.id}`;

  const renderImage = ( { item: photo } ) => {
    // check for local file path for unuploaded photos
    const photoUrl = ( photo && photo.url )
      ? photo.url.replace( "square", "large" )
      : photo.localFilePath;

    return (
      <>
        <Image
          testID="PhotoScroll.photo"
          source={{ uri: photoUrl }}
          style={imageStyles.fullWidthImage}
        />
        <Pressable accessibilityRole="button">
          <Text style={textStyles.license}>{photo.licenseCode || photo.license_code}</Text>
        </Pressable>
      </>
    );
  };

  return (
    <FlatList
      horizontal
      keyExtractor={extractKey}
      data={photos}
      renderItem={renderImage}
    />
  );
};

export default PhotoScroll;
