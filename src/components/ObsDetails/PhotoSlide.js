import { Image, Pressable } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

const PhotoSlide = ( { photo, onPress } ) => {
  const { t } = useTranslation( );
  // check for local file path for unuploaded photos
  const photoUrl = photo?.url
    ? photo.url.replace( "square", "large" )
    : photo.localFilePath;

  const image = (
    <Image
      testID="ObsMediaCarousel.photo"
      source={{ uri: photoUrl }}
      className="h-72 w-screen"
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityHint={t( "View-photo" )}
    >
      {image}
    </Pressable>
  );
};

export default PhotoSlide;
