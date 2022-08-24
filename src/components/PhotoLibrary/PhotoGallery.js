// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect, useState
} from "react";
import {
  ActivityIndicator, FlatList, Text, View
} from "react-native";
import { Snackbar } from "react-native-paper";

import { ObsEditContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/photoLibrary/photoGallery";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import useCameraRollPhotos from "./hooks/useCameraRollPhotos";
import PhotoGalleryHeader from "./PhotoGalleryHeader";
import PhotoGalleryImage from "./PhotoGalleryImage";

const MAX_PHOTOS_ALLOWED = 20;

const options = {
  first: 28,
  assetType: "Photos",
  include: ["location"]
};

const PhotoGallery = ( ): Node => {
  const [isScrolling, setIsScrolling] = useState( false );
  const [photoOptions, setPhotoOptions] = useState( options );
  const [photoGallery, setPhotoGallery] = useState( {
    All: {},
    rerenderFlatList: false
  } );
  const [selectedPhotos, setSelectedPhotos] = useState( [] );

  // Whether or not usePhotos can fetch photos now, e.g. if permissions have
  // been granted (Android), or if it's ok to request permissions (iOS). This
  // should be used by whatever component is using this context so that
  // photos are requested (and permissions are potentially requested) when
  // they are needed and not just when this provider initializes
  const [canRequestPhotos, setCanRequestPhotos] = useState( false );

  const {
    fetchingPhotos,
    photos: galleryPhotos
  } = useCameraRollPhotos( photoOptions, isScrolling, canRequestPhotos );

  const { addPhotos } = useContext( ObsEditContext );
  const [photoUris, setPhotoUris] = useState( [] );
  const [showAlert, setShowAlert] = useState( false );
  const { params } = useRoute( );
  const photos = params?.photos;
  const editObs = params?.editObs;

  // If this component is being rendered we have either already asked for
  // permissions in Android via a PermissionGate parent component, or the
  // user is expecting us to ask for permissions via CameraRoll in iOS.
  // Either way, we need to inform the context that it is now ok to request
  // photos from the operating system.
  useEffect( ( ) => {
    if ( !canRequestPhotos ) {
      setCanRequestPhotos( true );
    }
  }, [canRequestPhotos] );

  // $FlowIgnore
  const selectedAlbum = photoOptions.groupName || "All";

  const updatePhotoGallery = useCallback( rerenderFlatList => {
    setPhotoGallery( {
      ...photoGallery,
      // there might be a better way to do this, but adding this key forces the FlatList
      // to rerender anytime an image is unselected
      rerenderFlatList
    } );
  }, [photoGallery] );

  useEffect( ( ) => {
    if ( galleryPhotos ) {
      if ( photoGallery[selectedAlbum]
        && photoGallery[selectedAlbum].length === galleryPhotos.length ) {
        return;
      }

      // store photo details in state so it's possible
      // to select mutiple photos across albums

      const updatedPhotoGallery = {
        ...photoGallery,
        [selectedAlbum]: galleryPhotos
      };

      setPhotoGallery( updatedPhotoGallery );
      setIsScrolling( false );
    }
  }, [galleryPhotos, photoGallery, photoOptions, setPhotoGallery, selectedAlbum] );

  const totalSelected = selectedPhotos.length;

  useEffect( ( ) => {
    if ( photos?.length > 0 ) {
      setPhotoUris( photos );
    }
  }, [photos] );

  const navigation = useNavigation( );

  const navToObsEdit = ( ) => {
    if ( !selectedPhotos ) return;
    addPhotos( selectedPhotos );
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

  const getAllPhotos = ( ) => [...photoUris, ...selectedPhotos];

  const selectPhoto = p => {
    const newSelection = selectedPhotos.concat( p ).sort( ( a, b ) => b.timestamp - a.timestamp );
    setSelectedPhotos( newSelection );
  };

  const unselectPhoto = item => {
    const newSelection = selectedPhotos;
    const selectedIndex = selectedPhotos.findIndex( p => p.image.uri === item.image.uri );
    newSelection.splice( selectedIndex, 1 );
    setSelectedPhotos( newSelection );
  };

  const handlePhotoSelection = ( item, selected ) => {
    if ( !selected ) {
      selectPhoto( item );
      updatePhotoGallery( false );
    } else {
      unselectPhoto( item );
      updatePhotoGallery( true );
    }
  };

  const checkSelected = item => {
    const uri = item?.image?.uri;
    const albumGroupName = selectedAlbum === "All" ? "All Photos" : selectedAlbum;
    const selectedInCurrentAlbum = selectedPhotos.filter( p => p.group_name === albumGroupName );
    return selectedInCurrentAlbum.some( p => p.image.uri === uri );
  };

  const renderImage = ( { item } ) => {
    const uri = item?.image?.uri;
    const isSelected = checkSelected( item );

    const handleImagePress = ( ) => {
      const allPhotos = getAllPhotos( );
      if ( isSelected || allPhotos.length < MAX_PHOTOS_ALLOWED ) {
        handlePhotoSelection( item, isSelected );
      } else {
        setShowAlert( true );
      }
    };

    return (
      <PhotoGalleryImage
        uri={uri}
        handleImagePress={handleImagePress}
        isSelected={isSelected}
      />
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  const fetchMorePhotos = ( ) => setIsScrolling( true );

  const navToGroupPhotos = ( ) => navigation.navigate( "GroupPhotos", { selectedPhotos } );

  const renderEmptyList = ( ) => {
    if ( fetchingPhotos ) {
      return <ActivityIndicator />;
    }
    return <Text>{t( "No-photos-found" )}</Text>;
  };

  const photosByAlbum = photoGallery[selectedAlbum];

  return (
    <ViewNoFooter>
      <PhotoGalleryHeader updateAlbum={updateAlbum} />
      <FlatList
        // $FlowIgnore
        data={photosByAlbum}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={4}
        renderItem={renderImage}
        onEndReached={fetchMorePhotos}
        testID="PhotoGallery.list"
        ListEmptyComponent={renderEmptyList( )}
      />
      { selectedPhotos.length > 0 && (
        <View style={viewStyles.createObsButton}>
          <RoundGreenButton
            buttonText="Import-X-photos"
            count={totalSelected || 0}
            handlePress={editObs ? navToObsEdit : navToGroupPhotos}
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
