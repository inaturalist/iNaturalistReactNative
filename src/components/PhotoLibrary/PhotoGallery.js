// @flow

import React, { useContext } from "react";
import { Pressable, Image, FlatList, ActivityIndicator } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useAndroidPermission from "./hooks/useAndroidPermission";
import { imageStyles } from "../../styles/photoLibrary/photoGallery";
import PhotoGalleryHeader from "./PhotoGalleryHeader";
import { ObsEditContext } from "../../providers/contexts";

const options = {
  first: 28,
  assetType: "Photos",
  include: ["location"]
};

const PhotoGallery = ( ): Node => {
  const {
    photoGallery,
    setIsScrolling,
    photoOptions,
    setPhotoOptions
  } = useContext( ObsEditContext );

  const navigation = useNavigation( );
  // const hasAndroidPermission = useAndroidPermission( );

  const selectPhoto = photo => navigation.navigate( "ObsEdit", { photo } );

  const updateAlbum = album => {
    const newOptions = {
      ...options,
      groupTypes: ( album === null ) ? "All" : "Album"
    };

    if ( album !== null ) {
      // $FlowFixMe
      newOptions.groupName = album;
    }
    setPhotoOptions( newOptions );
  };

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

  const photosByAlbum = photoGallery[photoOptions.groupName || "All"];

  return (
    <ViewWithFooter>
      <PhotoGalleryHeader updateAlbum={updateAlbum} />
      <FlatList
        data={photosByAlbum}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={4}
        renderItem={renderImage}
        onEndReached={fetchMorePhotos}
        testID="PhotoGallery.list"
        ListEmptyComponent={( ) => <ActivityIndicator />}
      />
    </ViewWithFooter>
  );
};

export default PhotoGallery;
