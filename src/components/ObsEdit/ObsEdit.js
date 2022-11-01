// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import MediaViewer from "components/MediaViewer/MediaViewer";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import Button from "components/SharedComponents/Buttons/Button";
import ScrollNoFooter from "components/SharedComponents/ScrollNoFooter";
import { Text, View } from "components/styledComponents";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext, useEffect, useRef, useState
} from "react";
import { useTranslation } from "react-i18next";
import { BackHandler } from "react-native";
import Photo from "realmModels/Photo";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";
import useLocalObservation from "sharedHooks/useLocalObservation";
import useLoggedIn from "sharedHooks/useLoggedIn";
import { viewStyles } from "styles/obsEdit/obsEdit";

import AddEvidenceModal from "./AddEvidenceModal";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import ObsEditHeader from "./ObsEditHeader";
import OtherDataSection from "./OtherDataSection";

const { useRealm } = RealmContext;

const INITIAL_POSITIONAL_ACCURACY = 99999;
const TARGET_POSITIONAL_ACCURACY = 10;

const ObsEdit = ( ): Node => {
  const {
    currentObsIndex,
    observations,
    saveObservation,
    saveAndUploadObservation,
    setObservations,
    updateObservationKeys
  } = useContext( ObsEditContext );
  const currentObs = observations[currentObsIndex];
  const obsPhotos = currentObs?.observationPhotos;
  const photoUris = obsPhotos && Array.from( obsPhotos ).map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { t } = useTranslation( );
  const localObservation = useLocalObservation( params?.uuid );

  useEffect( ( ) => {
    // when opening an observation from ObsDetails, fetch the local
    // observation from realm
    if ( localObservation ) {
      setObservations( [localObservation] );
    }
  }, [localObservation, observations.length, setObservations] );

  const lastScreen = params?.lastScreen;

  const isLoggedIn = useLoggedIn( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [shouldFetchLocation, setShouldFetchLocation] = useState( !currentObs?._created_at );
  const [fetchingLocation, setFetchingLocation] = useState( false );
  const [positionalAccuracy, setPositionalAccuracy] = useState( INITIAL_POSITIONAL_ACCURACY );
  const mountedRef = useRef( true );
  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState( false );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const handleBackButtonPress = useCallback( async ( ) => {
    setObservations( [] );
    if ( lastScreen === "StandardCamera" ) {
      navigation.navigate( "StandardCamera", { photos: photoUris } );
    } else {
      // show modal to dissuade user from going back
      navigation.goBack( );
    }
  }, [lastScreen, navigation, photoUris, setObservations] );

  useFocusEffect(
    useCallback( ( ) => {
      // make sure an Android user cannot back out to MyObservations with the back arrow
      // and see a stale observation context state
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
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

  const addEvidence = ( ) => setShowAddEvidenceModal( true );

  if ( !currentObs ) { return null; }

  return (
    <>
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
        <ObsEditHeader handleBackButtonPress={handleBackButtonPress} />
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
        <AddEvidenceModal
          showAddEvidenceModal={showAddEvidenceModal}
          setShowAddEvidenceModal={setShowAddEvidenceModal}
        />
      </ScrollNoFooter>
    </>
  );
};

export default ObsEdit;
