// @flow

import { Image, Text, View } from "components/styledComponents";
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
      <View>
        <Image
          testID="PhotoScroll.photo"
          source={{ uri: photoUrl }}
          className="h-56 w-screen"
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text className="absolute bottom-5 right-5 text-white">
          {photo.licenseCode || photo.license_code}
        </Text>
      </View>
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
