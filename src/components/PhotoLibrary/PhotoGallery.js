// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React, { useContext, useEffect } from "react";
import {
  ActivityIndicator, FlatList, Image, Pressable, Text, View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { PhotoGalleryContext } from "../../providers/contexts";
import colors from "../../styles/colors";
import { imageStyles, viewStyles } from "../../styles/photoLibrary/photoGallery";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import PhotoGalleryHeader from "./PhotoGalleryHeader";

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
    setSelectedPhotos,
    fetchingPhotos,
    totalSelected,
    canRequestPhotos,
    setCanRequestPhotos
  } = useContext( PhotoGalleryContext );

  // If this component is being rendered we have either already asked for
  // permissions in Android via a PermissionGate parent component, or the
  // user is expecting us to ask for permissions via CameraRoll in iOS.
  // Either way, we need to inform the context that it is now ok to request
  // photos from the operating system.
  useEffect( ( ) => {
    if ( !canRequestPhotos ) {
      setCanRequestPhotos( true );
    }
  } );

  const navigation = useNavigation( );

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

  const updatePhotoGallery = rerenderFlatList => {
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
    const uri = item?.image?.uri;
    const isSelected = photosSelectedInAlbum.some( photo => photo.image.uri === uri );

    const handlePress = ( ) => selectPhoto( isSelected, item );

    const imageUri = { uri };
    return (
      <Pressable
        onPress={handlePress}
        testID={`PhotoGallery.${uri}`}
      >
        <Image
          testID="PhotoGallery.photo"
          source={imageUri}
          style={imageStyles.galleryImage}
        />
        {isSelected && (
          <Icon
            name="check-circle"
            size={30}
            style={imageStyles.selectedIcon}
            color={colors.inatGreen}
          />
        )}
      </Pressable>
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  const fetchMorePhotos = ( ) => setIsScrolling( true );

  const navToGroupPhotos = ( ) => navigation.navigate( "GroupPhotos" );

  const renderEmptyList = ( ) => {
    if ( fetchingPhotos ) {
      return <ActivityIndicator />;
    }
    return <Text>{t( "No-photos-found" )}</Text>;
  };

  return (
    <ViewNoFooter>
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
        ListEmptyComponent={renderEmptyList( )}
      />
      { Object.keys( selectedPhotos ).length > 0 && (
        <View style={viewStyles.createObsButton}>
          <RoundGreenButton
            buttonText="Import-X-photos"
            count={totalSelected || 0}
            handlePress={navToGroupPhotos}
            testID="PhotoGallery.createObsButton"
          />
        </View>
      ) }
    </ViewNoFooter>
  );
};

export default PhotoGallery;
