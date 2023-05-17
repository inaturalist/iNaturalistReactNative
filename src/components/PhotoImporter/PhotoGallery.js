// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import useCameraRollPhotos from "components/PhotoImporter/hooks/useCameraRollPhotos";
import usePhotoAlbums from "components/PhotoImporter/hooks/usePhotoAlbums";
import PhotoAlbumPicker from "components/PhotoImporter/PhotoAlbumPicker";
import PhotoGalleryImage from "components/PhotoImporter/PhotoGalleryImage";
import { Button, StickyToolbar } from "components/SharedComponents";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { Text } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Snackbar } from "react-native-paper";

const MAX_PHOTOS_ALLOWED = 20;

const options = {
  first: 28,
  assetType: "Photos",
  include: ["location"],
  groupTypes: "All"
};

const PhotoGallery = (): Node => {
  const [isScrolling, setIsScrolling] = useState( false );
  const [photoOptions, setPhotoOptions] = useState( options );
  const [rerenderList, setRerenderList] = useState( false );
  const [photoGallery, setPhotoGallery] = useState( {
    All: []
  } );

  // Whether or not usePhotos can fetch photos now, e.g. if permissions have
  // been granted (Android), or if it's ok to request permissions (iOS). This
  // should be used by whatever component is using this context so that
  // photos are requested (and permissions are potentially requested) when
  // they are needed and not just when this provider initializes
  const [canRequestPhotos, setCanRequestPhotos] = useState( false );

  const albums = usePhotoAlbums();

  const { fetchingPhotos, photos: galleryPhotos } = useCameraRollPhotos(
    photoOptions,
    isScrolling,
    canRequestPhotos
  );

  // $FlowIgnore
  const selectedAlbum = photoOptions.groupName || "All";

  const {
    createObservationFromGallery,
    galleryUris,
    setGalleryUris,
    allObsPhotoUris,
    addGalleryPhotosToCurrentObservation,
    evidenceToAdd,
    setEvidenceToAdd,
    album
  } = useContext( ObsEditContext );
  const [showAlert, setShowAlert] = useState( false );
  const { params } = useRoute();
  const skipGroupPhotos = params?.skipGroupPhotos;

  const allPhotos: Array<Object> = Object.values( photoGallery ).flat();

  const selectedPhotos = allPhotos.filter( photo => galleryUris?.includes( photo?.image?.uri ) );
  // eslint-disable-next-line max-len
  const selectedEvidenceToAdd = allPhotos.filter( photo => evidenceToAdd?.includes( photo?.image?.uri ) );

  // If this component is being rendered we have either already asked for
  // permissions in Android via a PermissionGate parent component, or the
  // user is expecting us to ask for permissions via CameraRoll in iOS.
  // Either way, we need to inform the context that it is now ok to request
  // photos from the operating system.
  useEffect( () => {
    if ( !canRequestPhotos ) {
      setCanRequestPhotos( true );
    }
  }, [canRequestPhotos] );

  useEffect( () => {
    if ( galleryPhotos ) {
      if (
        photoGallery[selectedAlbum]
        && photoGallery[selectedAlbum].length === galleryPhotos.length
      ) {
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
  }, [galleryPhotos, photoGallery, setPhotoGallery, selectedAlbum] );

  const navigation = useNavigation();

  const selectPhoto = p => {
    setGalleryUris( [...galleryUris, p?.image?.uri] );
    if ( skipGroupPhotos ) {
      setEvidenceToAdd( [...evidenceToAdd, p?.image?.uri] );
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
      setRerenderList( false );
    } else {
      unselectPhoto( item );
      setRerenderList( true );
    }
  };

  const checkSelected = uri => galleryUris?.find( u => u === uri );

  const checkPreviouslySelected = uri => !evidenceToAdd?.includes( uri );

  const renderImage = ( { item } ) => {
    const uri = item?.image?.uri;
    const isSelected = checkSelected( uri );
    const isDisabled = skipGroupPhotos && isSelected && checkPreviouslySelected( uri );

    const handleImagePress = () => {
      if ( isSelected || allObsPhotoUris.length < MAX_PHOTOS_ALLOWED ) {
        handlePhotoSelection( item, isSelected );
      } else {
        setShowAlert( true );
      }
    };

    return (
      <PhotoGalleryImage
        uri={uri}
        timestamp={item.timestamp}
        handleImagePress={handleImagePress}
        isSelected={isSelected}
        isDisabled={isDisabled}
      />
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  const fetchMorePhotos = () => setIsScrolling( true );

  const navToNextScreen = async () => {
    const navToObsEdit = () => navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );
    if ( !selectedPhotos ) return;
    if ( skipGroupPhotos ) {
      // add any newly selected photos
      // to an existing observation after navigating from ObsEdit
      addGalleryPhotosToCurrentObservation( selectedEvidenceToAdd );
      navToObsEdit();
      return;
    }
    if ( selectedPhotos.length === 1 ) {
      // create a new observation and skip group photos screen
      createObservationFromGallery( selectedPhotos[0] );
      navToObsEdit();
      return;
    }
    navigation.navigate( "GroupPhotos", { selectedPhotos } );
  };

  const renderEmptyList = () => {
    if ( fetchingPhotos ) {
      return <ActivityIndicator />;
    }
    return <Text>{t( "No-photos-found" )}</Text>;
  };

  const photosByAlbum = photoGallery[selectedAlbum];

  const totalSelected = skipGroupPhotos
    ? evidenceToAdd.length
    : selectedPhotos.length;

  useEffect( () => {
    // update photo album
    const newOptions = {
      ...options,
      groupTypes: album === null
        ? "All"
        : "Album"
    };

    if ( album !== null ) {
      // $FlowFixMe
      newOptions.groupName = album;
    }
    setPhotoOptions( newOptions );
  }, [album] );

  useEffect( () => {
    const headerTitle = () => <PhotoAlbumPicker albums={albums} />;

    navigation.setOptions( {
      headerTitle
    } );
  }, [navigation, albums] );

  return (
    <ViewWrapper testID="photo-gallery">
      <FlatList
        // $FlowIgnore
        data={photosByAlbum}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={4}
        renderItem={renderImage}
        onEndReached={fetchMorePhotos}
        testID="PhotoGallery.list"
        ListEmptyComponent={renderEmptyList}
        extraData={rerenderList}
      />
      {totalSelected > 0 && (
        <StickyToolbar>
          <Button
            className="mt-2 mx-4"
            level="focus"
            text={t( "Import-X-photos", { count: totalSelected || 0 } )}
            onPress={navToNextScreen}
            testID="PhotoGallery.createObsButton"
          />
        </StickyToolbar>
      )}
      <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </ViewWrapper>
  );
};

export default PhotoGallery;
