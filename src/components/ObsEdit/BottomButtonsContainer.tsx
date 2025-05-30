import {
  useNetInfo
} from "@react-native-community/netinfo";
import { REQUIRED_LOCATION_ACCURACY } from "components/LocationPicker/CrosshairCircle";
import useUploadObservations from "components/MyObservations/hooks/useUploadObservations.ts";
import { RealmContext } from "providers/contexts.ts";
import React, { useCallback, useState } from "react";
import type { RealmObservation } from "realmModels/types";
import saveObservation from "sharedHelpers/saveObservation.ts";
import {
  useCurrentUser,
  useExitObservationFlow
} from "sharedHooks";
import useStore from "stores/useStore";

import type { ButtonType } from "./BottomButtons";
import BottomButtons, { UPLOAD } from "./BottomButtons";
import ImpreciseLocationSheet from "./Sheets/ImpreciseLocationSheet";
import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const { useRealm } = RealmContext;

type Props = {
  passesEvidenceTest: boolean,
  observations: Array<object>,
  currentObservation: RealmObservation,
  currentObservationIndex: number,
  setCurrentObservationIndex: Function,
  transitionAnimation: Function
}

const BottomButtonsContainer = ( {
  passesEvidenceTest,
  currentObservation,
  currentObservationIndex,
  observations,
  setCurrentObservationIndex,
  transitionAnimation
}: Props ) => {
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const unsavedChanges = useStore( state => state.unsavedChanges );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const resetMyObsOffsetToRestore = useStore( state => state.resetMyObsOffsetToRestore );
  const setMyObsOffset = useStore( state => state.setMyObsOffset );
  const setSavedOrUploadedMultiObsFlow = useStore( state => state.setSavedOrUploadedMultiObsFlow );
  const incrementTotalSavedObservations = useStore(
    state => state.incrementTotalSavedObservations
  );
  const isNewObs = !currentObservation._created_at;
  const hasPhotos = currentObservation.observationPhotos?.length > 0;
  const hasImportedPhotos = hasPhotos && cameraRollUris.length === 0;

  const realm = useRealm( );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );
  const [showImpreciseLocationSheet, setShowImpreciseLocationSheet] = useState( false );
  const [allowUserToUpload, setAllowUserToUpload] = useState( false );
  const [buttonPressed, setButtonPressed] = useState<ButtonType>( null );
  const [loading, setLoading] = useState( false );
  const exitObservationFlow = useExitObservationFlow( );

  const hasIdentification = currentObservation.taxon
    && currentObservation.taxon.rank_level !== 100;

  const passesTests = passesEvidenceTest && hasIdentification;

  const canUpload = !!( currentUser && isConnected );
  const { startUploadsFromMultiObsEdit } = useUploadObservations( canUpload );

  const setNextScreen = useCallback( async ( type: ButtonType ) => {
    const savedObservation = await saveObservation( currentObservation, cameraRollUris, realm );
    if ( savedObservation && observations?.length > 1 ) {
      transitionAnimation();
      setSavedOrUploadedMultiObsFlow( );
    }
    // If we are saving a new observations, reset the stored my obs offset to
    // restore b/c we want MyObs rendered in its default state with this new
    // observation visible at the top
    if ( isNewObs ) {
      resetMyObsOffsetToRestore( );
      setMyObsOffset( 0 );
    }
    if ( type === UPLOAD ) {
      const { uuid } = savedObservation;
      addTotalToolbarIncrements( savedObservation );
      addToUploadQueue( uuid );
      transitionAnimation();
      startUploadsFromMultiObsEdit( );
    } else {
      incrementTotalSavedObservations( );
    }

    if ( observations.length === 1 ) {
      setButtonPressed( null );
      // If this is the last observation, we're done
      exitObservationFlow( );
    } else if ( currentObservationIndex === observations.length - 1 ) {
      observations.pop( );
      setCurrentObservationIndex( currentObservationIndex - 1, observations );
      setLoading( false );
      setButtonPressed( null );
    } else {
      observations.splice( currentObservationIndex, 1 );
      // this seems necessary for rerendering the ObsEdit screen
      setCurrentObservationIndex( currentObservationIndex, observations );
      setLoading( false );
      setButtonPressed( null );
    }
  }, [
    addToUploadQueue,
    addTotalToolbarIncrements,
    cameraRollUris,
    currentObservation,
    currentObservationIndex,
    exitObservationFlow,
    incrementTotalSavedObservations,
    isNewObs,
    observations,
    realm,
    resetMyObsOffsetToRestore,
    setCurrentObservationIndex,
    setMyObsOffset,
    setSavedOrUploadedMultiObsFlow,
    startUploadsFromMultiObsEdit,
    transitionAnimation
  ] );

  const showMissingEvidence = useCallback( ( ) => {
    if ( allowUserToUpload ) { return false; }
    // missing evidence sheet takes precedence over the location imprecise sheet

    if (
      currentObservation?.positional_accuracy
      && currentObservation?.positional_accuracy > REQUIRED_LOCATION_ACCURACY
      // Don't check for valid positional accuracy in case of a new observation with imported photos
      && ( !isNewObs || !hasImportedPhotos )
    ) {
      setShowImpreciseLocationSheet( true );
      return true;
    }
    if ( !passesEvidenceTest ) {
      setShowMissingEvidenceSheet( true );
      setAllowUserToUpload( true );
      return true;
    }

    return false;
  }, [
    allowUserToUpload,
    currentObservation,
    hasImportedPhotos,
    isNewObs,
    passesEvidenceTest
  ] );

  const handlePress = useCallback( ( type: ButtonType ) => {
    if ( showMissingEvidence( ) ) { return; }
    setLoading( true );
    setButtonPressed( type );
    setNextScreen( type );
  }, [setNextScreen, showMissingEvidence] );

  return (
    <>
      {showMissingEvidenceSheet && (
        <MissingEvidenceSheet
          setShowMissingEvidenceSheet={setShowMissingEvidenceSheet}
        />
      )}
      {showImpreciseLocationSheet && (
        <ImpreciseLocationSheet
          setShowImpreciseLocationSheet={setShowImpreciseLocationSheet}
        />
      )}
      <BottomButtons
        buttonPressed={buttonPressed}
        canSaveOnly={!currentUser || !isConnected}
        handlePress={handlePress}
        loading={loading}
        showFocusedChangesButton={unsavedChanges}
        showFocusedUploadButton={!!passesTests}
        showHalfOpacity={!passesEvidenceTest}
        wasSynced={!!( currentObservation?._synced_at )}
      />
    </>
  );
};

export default BottomButtonsContainer;
