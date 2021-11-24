// @flow

import * as React from "react";
import { Text, Image, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { imageStyles, textStyles } from "../../styles/obsDetails";

type Props = {
  photos: Array<Object>
}

const PhotoScroll = ( { photos }: Props ): React.Node => {
  const renderImage = ( { item } ) => {
    const photo = item.photo;
    let photoUrl = photo.url.replace( "square", "large" );

    return (
      <>
        <Image source={{ uri: photoUrl }} style={imageStyles.fullWidthImage} />
        <Pressable>
          <Text style={textStyles.license}>{photo.licenseCode}</Text>
        </Pressable>
      </>
    );
  };

  return (
    <FlatList
      horizontal
      data={photos}
      renderItem={renderImage}
    />
  );
};

export default PhotoScroll;
