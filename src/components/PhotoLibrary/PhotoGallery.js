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
    setPhotoGallery,
    setIsScrolling,
    photoOptions,
    setPhotoOptions,
    selectedPhotos,
    setSelectedPhotos
  } = useContext( ObsEditContext );

  // const navigation = useNavigation( );
  // const hasAndroidPermission = useAndroidPermission( );

  // const selectPhoto = photo => navigation.navigate( "ObsEdit", { photo } );

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

  const selectedAlbum = photoOptions.groupName || "All";
  const photosByAlbum = photoGallery[selectedAlbum];
  const photosSelectedInAlbum = selectedPhotos[selectedAlbum] || [];

  const updatePhotoGallery = ( rerenderFlatList ) => {
    setPhotoGallery( {
      ...photoGallery,
      // there might be a better way to do this, but adding this key forces the FlatList
      // to rerender anytime an image is unselected
      rerenderFlatList
     } );
  };

  const selectPhoto = ( isSelected, item ) => {
    if ( !isSelected ) {
      setSelectedPhotos( {
        ...selectedPhotos,
        [selectedAlbum]: photosSelectedInAlbum.concat( item )
      } );
      updatePhotoGallery( false );
    } else {
      const newSelection = photosSelectedInAlbum;
      const selectedIndex = photosSelectedInAlbum.indexOf( item );
      newSelection.splice( selectedIndex, 1 );

      setSelectedPhotos( {
        ...selectedPhotos,
        [selectedAlbum]: newSelection
      } );
      updatePhotoGallery( true );
    }
  };

  const renderImage = ( { item } ) => {
    const isSelected = photosSelectedInAlbum.some( photo => photo.uri === item.uri );

    const handlePress = ( ) => selectPhoto( isSelected, item );

    const imageUri = { uri: item.uri };
    return (
      <Pressable
        onPress={handlePress}
        testID={`PhotoGallery.${item.uri}`}
      >
        <Image
          testID="PhotoGallery.photo"
          source={imageUri}
          style={[
            imageStyles.galleryImage,
            isSelected ? imageStyles.selected : null
          ]}
        />
      </Pressable>
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  const fetchMorePhotos = ( ) => setIsScrolling( true );

  return (
    <ViewWithFooter>
      <PhotoGalleryHeader updateAlbum={updateAlbum} />
      <FlatList
        data={photosByAlbum}
        extraData={selectedPhotos}
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
