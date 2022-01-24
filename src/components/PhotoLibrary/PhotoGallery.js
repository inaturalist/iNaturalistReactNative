// @flow

import React, { useState, useEffect } from "react";
import { Pressable, Image, FlatList } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useAndroidPermission from "./hooks/useAndroidPermission";
import usePhotos from "./hooks/usePhotos";
import { imageStyles } from "../../styles/photoLibrary/photoGallery";

const PhotoGallery = ( ): Node => {
  const navigation = useNavigation( );
  const [isScrolling, setIsScrolling] = useState( true );
  const [numPhotosShown, setNumPhotosShown] = useState( 0 );
  const options = {
    first: 28,
    assetType: "Photos",
    include: ["location"]
  };

  const [photoOptions, setPhotoOptions] = useState( options );
  // const hasAndroidPermission = useAndroidPermission( );

  // photos are fetched from the server on initial render
  // and anytime a user scrolls through the photo gallery
  const photos = usePhotos( photoOptions, isScrolling );

  const selectPhoto = photo => navigation.navigate( "ObsEdit", { photo } );

  const renderImage = ( { item } ) => {
    const imageUri = { uri: item.uri };
    return (
      <Pressable
        onPress={( ) => selectPhoto( item )}
        testID={`PhotoGallery.${item.uri}`}
      >
        <Image
          testID="PhotoGallery.photo"
          source={imageUri}
          style={imageStyles.galleryImage}
        />
      </Pressable>
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  const fetchMorePhotos = ( ) => setIsScrolling( true );

  useEffect( ( ) => {
    // reset scroll when more photos are fetched from the server
    if ( photos.length > numPhotosShown ) {
      setIsScrolling( false );
      setNumPhotosShown( photos.length );
    }
  }, [photos.length, numPhotosShown] );

  return (
    <ViewWithFooter>
      <FlatList
        data={photos}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={4}
        renderItem={renderImage}
        onEndReached={fetchMorePhotos}
        testID="PhotoGallery.list"
      />
    </ViewWithFooter>
  );
};

export default PhotoGallery;
