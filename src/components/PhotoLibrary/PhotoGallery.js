// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Image, Pressable, Text, View
} from "react-native";
import { Snackbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { ObsEditContext, PhotoGalleryContext } from "../../providers/contexts";
import colors from "../../styles/colors";
import { imageStyles, viewStyles } from "../../styles/photoLibrary/photoGallery";
import Button from "../SharedComponents/Buttons/Button";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import PhotoGalleryHeader from "./PhotoGalleryHeader";

const MAX_PHOTOS_ALLOWED = 20;

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
  const { addPhotos } = useContext( ObsEditContext );
  const [photoUris, setPhotoUris] = useState( [] );
  const [showAlert, setShowAlert] = useState( false );
  const { params } = useRoute( );
  const photos = params?.photos;
  const editObs = params?.editObs;

  useEffect( ( ) => {
    if ( photos?.length > 0 ) {
      setPhotoUris( photos );
    }
  }, [photos] );

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

  const getSelectedPhotos = () => ( ( selectedPhotos && selectedPhotos.All )
    ? selectedPhotos.All.map( x => x.image.uri ) : [] );

  const getAllPhotos = () => [...photoUris, ...getSelectedPhotos()];

  const navToObsEdit = ( ) => {
    if ( !selectedPhotos ) return;
    addPhotos( getAllPhotos() );
    navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );
  };

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

    const handlePress = ( ) => {
      const allPhotos = getAllPhotos();
      if ( isSelected || allPhotos.length < MAX_PHOTOS_ALLOWED ) {
        selectPhoto( isSelected, item );
      } else {
        setShowAlert( true );
      }
    };

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
      { getSelectedPhotos().length > 0 && (
        <View style={viewStyles.createObsButton}>
          <Button
            level="primary"
            text="Import-X-photos"
            count={totalSelected || 0}
            onPress={editObs ? navToObsEdit : navToGroupPhotos}
            testID="PhotoGallery.createObsButton"
          />
        </View>
      ) }

      <Snackbar
        visible={showAlert}
        onDismiss={() => setShowAlert( false )}
      >
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </ViewNoFooter>
  );
};

export default PhotoGallery;
