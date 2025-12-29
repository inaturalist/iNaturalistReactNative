import classnames from "classnames";
import { ActivityIndicator, OfflineNotice } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import React, { useState } from "react";
import type { ImageStyle, StyleProp } from "react-native";
import Photo from "realmModels/Photo";
import { useTranslation } from "sharedHooks";

interface Props {
  photo: {
    id: number;
    url: string;
    localFilePath: string;
    attribution: string;
  };
  onPress: () => void;
  style?: StyleProp<ImageStyle>;
}

const PhotoContainer = ( { photo, onPress, style }: Props ) => {
  const { t } = useTranslation( );
  const [loadSuccess, setLoadSuccess] = useState<boolean | null>( null );

  const imageSources = [];
  if ( photo.localFilePath ) {
    imageSources.push( { uri: Photo.getLocalPhotoUri( photo.localFilePath ) } );
  }
  if ( photo.url ) {
    imageSources.push( {
      uri: photo.url,
      width: 75,
      height: 75,
    } );
    imageSources.push( {
      uri: photo.url.replace( "square", "small" ),
      width: 240,
      height: 240,
    } );
    imageSources.push( {
      uri: photo.url.replace( "square", "medium" ),
      width: 500,
      height: 500,
    } );
    imageSources.push( {
      uri: photo.url.replace( "square", "large" ),
      width: 1024,
      height: 1024,
    } );
  }

  const image = (
    <Image
      testID="ObsMedia.photo"
      source={imageSources}
      progressiveRenderingEnabled
      className={classnames(
        "h-72",
        "w-screen",
        loadSuccess === false && "hidden",
      )}
      style={style}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      onLoad={( ) => {
        setLoadSuccess( true );
      }}
      onError={( ) => {
        setLoadSuccess( false );
      }}
    />
  );

  const renderLoadingIndicator = ( ) => {
    if ( loadSuccess === null ) {
      return (
        <ActivityIndicator className="absolute" />
      );
    }
    return null;
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityHint={t( "View-photo" )}
      className="justify-center items-center"
      accessibilityLabel={photo.attribution}
    >
      {renderLoadingIndicator( )}
      {image}
      {loadSuccess === false && (
        <View className={classnames(
          "h-72",
          "w-screen",
        )}
        >
          <OfflineNotice
            onPress={( ) => setLoadSuccess( null )}
            color="white"
          />
        </View>
      )}
    </Pressable>
  );
};

export default PhotoContainer;
