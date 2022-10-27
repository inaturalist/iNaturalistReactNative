// @flow

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera";
import MediaViewer from "components/MediaViewer/MediaViewer";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import Button from "components/SharedComponents/Buttons/Button";
import EvidenceButton from "components/SharedComponents/Buttons/EvidenceButton";
import KebabMenu from "components/SharedComponents/KebabMenu";
import ScrollNoFooter from "components/SharedComponents/ScrollNoFooter";
import { Pressable, Text, View } from "components/styledComponents";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import Photo from "realmModels/Photo";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";
import useLoggedIn from "sharedHooks/useLoggedIn";
import colors from "styles/colors";
import { textStyles, viewStyles } from "styles/obsEdit/obsEdit";

import DeleteObservationDialog from "./DeleteObservationDialog";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import OtherDataSection from "./OtherDataSection";

const { useRealm } = RealmContext;

const INITIAL_POSITIONAL_ACCURACY = 99999;
const TARGET_POSITIONAL_ACCURACY = 10;

const ObsEdit = ( ): Node => {
  const {
    currentObsIndex,
    setCurrentObsIndex,
    observations,
    openSavedObservation,
    saveObservation,
    saveAndUploadObservation,
    setObservations,
    updateObservationKeys
  } = useContext( ObsEditContext );
  const currentObs = observations[currentObsIndex];
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { t } = useTranslation( );
  const bottomSheetModalRef = useRef( null );

  const lastScreen = params?.lastScreen;

  const isLoggedIn = useLoggedIn( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [photoUris, setPhotoUris] = useState( [] );
  const [snapPoint, setSnapPoint] = useState( 150 );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );
  const [shouldFetchLocation, setShouldFetchLocation] = useState( !currentObs?._created_at );
  const [fetchingLocation, setFetchingLocation] = useState( false );
  const [positionalAccuracy, setPositionalAccuracy] = useState( INITIAL_POSITIONAL_ACCURACY );
  const mountedRef = useRef( true );

  const disableAddingMoreEvidence = photoUris.length >= MAX_PHOTOS_ALLOWED;

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const showNextObservation = ( ) => setCurrentObsIndex( currentObsIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObsIndex( currentObsIndex - 1 );

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => setDeleteDialogVisible( false );

  const handleBackButtonPress = ( ) => {
    setObservations( [] );
    if ( lastScreen === "StandardCamera" ) {
      navigation.navigate( "StandardCamera", { photos: photoUris } );
    } else {
      // show modal to dissuade user from going back
      navigation.goBack( );
    }
  };

  const renderKebabMenu = ( ) => (
    <>
      <DeleteObservationDialog
        deleteDialogVisible={deleteDialogVisible}
        hideDialog={hideDialog}
      />
      <KebabMenu>
        <Menu.Item
          onPress={showDialog}
          title={t( "Delete" )}
        />
      </KebabMenu>
    </>
  );

  const renderHeader = ( ) => (
    <View className="flex-row justify-between">
      <HeaderBackButton onPress={handleBackButtonPress} tintColor={colors.black} />
      {observations.length === 1
        ? <Text className="text-2xl">{t( "New-Observation" )}</Text>
        : (
          <View className="flex-row items-center">
            <Pressable onPress={showPrevObservation} className="w-16">
              {currentObsIndex !== 0 && <Icon name="keyboard-arrow-left" size={30} />}
            </Pressable>
            <Text className="text-2xl">{`${currentObsIndex + 1} of ${observations.length}`}</Text>
            <Pressable onPress={showNextObservation} className="w-16">
              {( currentObsIndex !== observations.length - 1 )
                && <Icon name="keyboard-arrow-right" size={30} />}
            </Pressable>
          </View>
        )}
      {renderKebabMenu( )}
    </View>
  );

  // Hook version of componentWillUnmount. We use a ref to track mounted
  // state (not useState, which might get frozen in a closure for other
  // useEffects), and set it to false in the cleanup cleanup function. The
  // effect has an empty dependency array so it should only run when the
  // component mounts and when it unmounts, unlike in the cleanup effects of
  // other hooks, which will run when any of there dependency values change,
  // and maybe even before other hooks execute. If we ever need to do this
  // again we could probably wrap this into its own hook, like useMounted
  // ( ).
  useEffect( ( ) => {
    mountedRef.current = true;
    return function cleanup( ) {
      mountedRef.current = false;
    };
  }, [] );

  useEffect( ( ) => {
    if ( !currentObs ) return;

    if ( !shouldFetchLocation ) return;

    if ( fetchingLocation ) return;

    const fetchLocation = async () => {
      // If the component is gone, you won't be able to updated it
      if ( !mountedRef.current ) return;

      if ( !shouldFetchLocation ) return;
      setFetchingLocation( false );

      const location = await fetchUserLocation( );

      // If we're still receiving location updates and location is blank,
      // then we don't know where we are any more and the obs should update
      // to reflect that
      updateObservationKeys( {
        place_guess: location?.place_guess,
        latitude: location?.latitude,
        longitude: location?.longitude,
        positional_accuracy: location?.positional_accuracy
      } );

      // The local state version of positionalAccuracy needs to be a number,
      // so don't set it to
      const newPositionalAccuracy = location?.positional_accuracy || INITIAL_POSITIONAL_ACCURACY;
      setPositionalAccuracy( newPositionalAccuracy );
    };

    if (
      // If we're already fetching we don't need to fetch again
      !fetchingLocation
      // We only need to fetch when we're above the target
      && positionalAccuracy >= TARGET_POSITIONAL_ACCURACY
    ) {
      setFetchingLocation( true );
      // No need to fetch more than once a second
      setTimeout( fetchLocation, 1000 );
    } else {
      setShouldFetchLocation( false );
    }
  }, [
    currentObs,
    fetchingLocation,
    positionalAccuracy,
    setFetchingLocation,
    setShouldFetchLocation,
    shouldFetchLocation,
    updateObservationKeys
  ] );

  const realm = useRealm( );

  const setPhotos = uris => {
    const updatedObservations = observations;
    const updatedObsPhotos = Array.from( currentObs.observationPhotos ).filter( obsPhoto => {
      const { photo } = obsPhoto;
      if ( uris.includes( photo.url || photo.localFilePath ) ) {
        return obsPhoto;
      }
      return false;
    } );
    // when updatedObsPhotos is an empty array, Realm apparently writes to the
    // db immediately when you assign, so if you don't do this in write
    // callback it raises an exception
    realm?.write( ( ) => {
      currentObs.observationPhotos = updatedObsPhotos;
    } );
    setObservations( [...updatedObservations] );
  };

  const handleSelection = photo => {
    setInitialPhotoSelected( photo );
    showModal( );
  };

  useEffect( ( ) => {
    if ( !currentObs || !currentObs.observationPhotos ) { return; }
    const uris = Array.from( currentObs.observationPhotos ).map(
      obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
    );
    setPhotoUris( uris );
  }, [currentObs] );

  useEffect( ( ) => {
    if ( currentObs ) return;
    if ( !params?.uuid ) return;

    // This should set the current obs in the context
    openSavedObservation( params?.uuid );
  }, [currentObs, openSavedObservation, params?.uuid] );

  const addEvidence = () => {
    bottomSheetModalRef.current?.present();
  };

  if ( !currentObs ) { return null; }

  const renderBackdrop = props => (
    <BottomSheetBackdrop
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      pressBehavior="close"
      appearsOnIndex={0}
      disappearsOnIndex={-1}
    />
  );

  const onImportPhoto = async () => {
    navigation.navigate( "PhotoGallery", { photos: photoUris, skipGroupPhotos: true } );

    bottomSheetModalRef.current?.dismiss();
  };

  const onTakePhoto = async () => {
    navigation.navigate( "StandardCamera", { photos: photoUris } );

    bottomSheetModalRef.current?.dismiss();
  };

  const onRecordSound = () => {
    // TODO - need to implement
    console.log( "Record sound" );
  };

  return (
    <BottomSheetModalProvider>
      <MediaViewerModal
        mediaViewerVisible={mediaViewerVisible}
        hideModal={hideModal}
      >
        <MediaViewer
          initialPhotoSelected={initialPhotoSelected}
          photoUris={photoUris}
          setPhotoUris={setPhotos}
          hideModal={hideModal}
        />
      </MediaViewerModal>
      <ScrollNoFooter style={mediaViewerVisible && viewStyles.mediaViewerSafeAreaView}>
        {renderHeader( )}
        <Text className="text-2xl ml-4">{t( "Evidence" )}</Text>
        <EvidenceSection
          handleSelection={handleSelection}
          photoUris={photoUris}
          handleAddEvidence={addEvidence}
        />
        <Text className="text-2xl ml-4 mt-4">{t( "Identification" )}</Text>
        <IdentificationSection />
        <Text className="text-2xl ml-4">{t( "Other-Data" )}</Text>
        <OtherDataSection />
        <View style={viewStyles.buttonRow}>
          <Button
            onPress={saveObservation}
            testID="ObsEdit.saveButton"
            text={t( "SAVE" )}
            level="neutral"

          />
          <Button
            level="primary"
            text="UPLOAD-OBSERVATION"
            testID="ObsEdit.uploadButton"
            onPress={saveAndUploadObservation}
            disabled={!isLoggedIn}
          />
        </View>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          enableOverDrag={false}
          enablePanDownToClose={false}
          snapPoints={[snapPoint]}
          backdropComponent={renderBackdrop}
        >
          <View
            className="items-center p-10"
            onLayout={( {
              nativeEvent: {
                layout: { height }
              }
            } ) => {
              setSnapPoint( height + 50 );
            }}
          >
            <Text className="text-2xl ml-4 mb-4">{t( "Add-evidence" )}</Text>
            {disableAddingMoreEvidence
              && (
              <Text style={textStyles.evidenceWarning}>
                {t( "You-can-only-upload-20-media" )}
              </Text>
              )}
            <View className="flex-row w-full justify-around">
              <EvidenceButton
                icon="perm-media"
                handlePress={onImportPhoto}
                disabled={disableAddingMoreEvidence}
              />
              <EvidenceButton
                icon="photo-camera"
                handlePress={onTakePhoto}
                disabled={disableAddingMoreEvidence}
              />
              <EvidenceButton
                icon="keyboard-voice"
                handlePress={onRecordSound}
                disabled={disableAddingMoreEvidence}
              />
            </View>
            <Text
              className="underline mt-5"
              onPress={( () => bottomSheetModalRef.current?.dismiss() )}
            >
              {t( "Cancel" )}
            </Text>
          </View>
        </BottomSheetModal>
      </ScrollNoFooter>
    </BottomSheetModalProvider>
  );
};

export default ObsEdit;
