import classnames from "classnames";
import { ActivityIndicator } from "components/SharedComponents";
import { Image, Pressable } from "components/styledComponents";
import React, { useState } from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "sharedHooks";

const PhotoSlide = ( { photo, onPress } ) => {
  const { t } = useTranslation( );
  const [loadSuccess, setLoadSuccess] = useState( null );
  // check for local file path for unuploaded photos
  const photoUrl = photo?.url
    ? photo.url.replace( "square", "large" )
    : photo.localFilePath;

  const image = (
    <Image
      testID="ObsMediaCarousel.photo"
      source={{ uri: photoUrl }}
      className={classnames(
        "h-72",
        "w-screen",
        loadSuccess === false && "hidden"
      )}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      onLoad={( ) => {
        setLoadSuccess( true );
      }}
      onError={( ) => {
        setLoadSuccess( false );
      }}
      onLoadEnd={( ) => {
        if ( loadSuccess !== true ) {
          setLoadSuccess( false );
        }
      }}
    />
  );
  const loadingIndicator = (
    <ActivityIndicator
      className={classnames(
        "absolute",
        loadSuccess !== null && "hidden"
      )}
    />
  );
  const offlineNotice = loadSuccess === false && (
    <IconMaterial
      name="wifi-off"
      color="white"
      size={100}
      accessibilityRole="image"
      accessibilityLabel={t(
        "Observation-photos-unavailable-without-internet"
      )}
    />
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityHint={t( "View-photo" )}
      className="w-full h-full justify-center items-center"
      accessibilityLabel={photo.attribution}
    >
      {loadingIndicator}
      {image}
      {offlineNotice}
    </Pressable>
  );
};

export default PhotoSlide;
