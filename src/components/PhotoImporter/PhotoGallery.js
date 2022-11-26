// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import Button from "components/SharedComponents/Buttons/Button";
import ViewNoFooter from "components/SharedComponents/ViewNoFooter";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect, useState
} from "react";
import {
  ActivityIndicator, FlatList
} from "react-native";
import { Snackbar } from "react-native-paper";

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

  const {
    createObservationFromGallery,
    galleryUris, setGalleryUris, allObsPhotoUris,
    addGalleryPhotosToCurrentObservation,
    evidenceToAdd,
    setEvidenceToAdd
  } = useContext( ObsEditContext );
  const [showAlert, setShowAlert] = useState( false );
  const { params } = useRoute( );
  const skipGroupPhotos = params?.skipGroupPhotos;

  const selectedPhotos = galleryPhotos.filter( photo => galleryUris?.includes( photo.image.uri ) );
  const selectedEvidenceToAdd = galleryPhotos.filter(
    photo => evidenceToAdd?.includes( photo.image.uri )
  );

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

  const selectPhoto = p => {
    setGalleryUris( [...galleryUris, p.image.uri] );
    if ( skipGroupPhotos ) {
      setEvidenceToAdd( [...evidenceToAdd, p.image.uri] );
    }
  };

  const unselectPhoto = item => {
    const newGalleryUris = galleryUris;
    const i = galleryUris?.findIndex( uri => uri === item.image.uri );
    newGalleryUris.splice( i, 1 );
    setGalleryUris( newGalleryUris );
    if ( skipGroupPhotos ) {
      const newEvidenceToAdd = evidenceToAdd;
      const index = evidenceToAdd.findIndex( uri => uri === item.image.uri );
      newEvidenceToAdd.splice( index, 1 );
      setEvidenceToAdd( newEvidenceToAdd );
    }
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

  const checkSelected = uri => galleryUris?.find( u => u === uri );

  const checkPreviouslySelected = uri => !evidenceToAdd?.includes( uri );

  const renderImage = ( { item } ) => {
    const uri = item?.image?.uri;
    const isSelected = checkSelected( uri );
    const isDisabled = skipGroupPhotos && isSelected && checkPreviouslySelected( uri );

    const handleImagePress = ( ) => {
      if ( isSelected || allObsPhotoUris.length < MAX_PHOTOS_ALLOWED ) {
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
        isDisabled={isDisabled}
      />
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  const fetchMorePhotos = ( ) => setIsScrolling( true );

  const navToNextScreen = async ( ) => {
    if ( !selectedPhotos ) return;
    const uris = selectedPhotos.map( galleryPhoto => galleryPhoto.image.uri );
    setGalleryUris( uris );
    if ( skipGroupPhotos ) {
      // add any newly selected photos
      // to an existing observation after navigating from ObsEdit
      addGalleryPhotosToCurrentObservation( selectedEvidenceToAdd );
      navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );
      return;
    }
    if ( selectedPhotos.length === 1 ) {
      // create a new observation and skip group photos screen
      createObservationFromGallery( selectedPhotos[0] );
      navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );
      return;
    }
    navigation.navigate( "GroupPhotos", { selectedPhotos } );
  };

  const renderEmptyList = ( ) => {
    if ( fetchingPhotos ) {
      return <ActivityIndicator />;
    }
    return <Text>{t( "No-photos-found" )}</Text>;
  };

  const photosByAlbum = photoGallery[selectedAlbum];

  const totalSelected = skipGroupPhotos ? evidenceToAdd.length : selectedPhotos.length;

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
      { totalSelected > 0 && (
        <View className="h-16 mt-2 mx-4">
          <Button
            level="secondary"
            text="Import-X-photos"
            count={totalSelected || 0}
            onPress={navToNextScreen}
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
