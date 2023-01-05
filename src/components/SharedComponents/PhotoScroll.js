// @flow

import { Image, Text } from "components/styledComponents";
import * as React from "react";
import { FlatList } from "react-native-gesture-handler";

type Props = {
  photos: Array<Object>
}

const PhotoScroll = ( { photos }: Props ): React.Node => {
  const extractKey = item => (
    item?.uuid || `photo-${item?.id || item?.localFilePath}`
  );

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
          className="object-contain w-screen h-52"
        />
        <Text className="absolute bottom-5 right-5 text-white" accessibilityRole="button">
          {photo.licenseCode || photo.license_code}
        </Text>
      </>
    );
  };

  return (
    <FlatList
      testID="photo-scroll"
      horizontal
      keyExtractor={extractKey}
      data={photos}
      renderItem={renderImage}
    />
  );
};

export default PhotoScroll;
