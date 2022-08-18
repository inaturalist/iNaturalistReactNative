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
import { useBetween } from "use-between";

import { ObsEditContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/photoLibrary/photoGallery";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import useCameraRollPhotos from "./hooks/useCameraRollPhotos";
import useGalleryPermissions from "./hooks/useGalleryPermissions";
import useSelectedPhotos from "./hooks/useSelectedPhotos";
import PhotoGalleryHeader from "./PhotoGalleryHeader";
import PhotoGalleryImage from "./PhotoGalleryImage";

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
  const useSharedSelectedPhotos = ( ) => useBetween( useSelectedPhotos );
  const {
    selectedPhotos, setSelectedPhotos, rerenderList, setRerenderList
  } = useSharedSelectedPhotos( );
  const canRequestPhotos = useGalleryPermissions( );

  const photoFetchStatus = useCameraRollPhotos( photoOptions, isScrolling, canRequestPhotos );
  const photosFetched = photoFetchStatus.photos;
  const { fetchingPhotos } = photoFetchStatus;

  const { addPhotos } = useContext( ObsEditContext );
  const [photoUris, setPhotoUris] = useState( [] );
  const [showAlert, setShowAlert] = useState( false );
  const { params } = useRoute( );
  const photos = params?.photos;
  const editObs = params?.editObs;
  const clearSelection = params?.clearSelection;
  const updateSelection = params?.updateSelection;

  useEffect( ( ) => {
    if ( clearSelection ) {
      // clear selection when opening photo gallery from camera options modal
      setSelectedPhotos( [] );
    } else if ( updateSelection ) {
      // update selection when opening photo gallery from group photos screen
      setRerenderList( true );
    }
  }, [clearSelection, setSelectedPhotos, updateSelection, setRerenderList] );

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
    if ( photosFetched ) {
      if ( photoGallery[selectedAlbum]
        && photoGallery[selectedAlbum].length === photosFetched.length ) {
        return;
      }

      // store photo details in state so it's possible
      // to select mutiple photos across albums

      const updatedPhotoGallery = {
        ...photoGallery,
        [selectedAlbum]: photosFetched
      };

      setPhotoGallery( updatedPhotoGallery );
      setIsScrolling( false );
    }
  }, [photosFetched, photoGallery, photoOptions, setPhotoGallery, selectedAlbum] );

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

  const renderImage = ( { item } ) => (
    <PhotoGalleryImage
      item={item}
      setShowAlert={setShowAlert}
      selectedAlbum={selectedAlbum}
      getAllPhotos={getAllPhotos}
      updatePhotoGallery={updatePhotoGallery}
    />
  );

  const extractKey = ( item, index ) => `${item}${index}`;

  const fetchMorePhotos = ( ) => setIsScrolling( true );

  const navToGroupPhotos = ( ) => navigation.navigate( "GroupPhotos" );

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
        extraData={rerenderList}
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
