// @flow

import * as React from "react";
import { Text, Image, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { imageStyles, textStyles } from "../../styles/sharedComponents/photoScroll";

type Props = {
  photos: Array<Object>
}

const PhotoScroll = ( { photos }: Props ): React.Node => {
  const extractKey = item => item.photo.id;

  const renderImage = ( { item } ) => {
    const photo = item.photo;
    let photoUrl = photo.url.replace( "square", "large" );

    return (
      <>
        <Image testID="PhotoScroll.photo" source={{ uri: photoUrl }} style={imageStyles.fullWidthImage} />
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
