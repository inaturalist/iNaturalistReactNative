import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { REQUIRED_LOCATION_ACCURACY } from "components/LocationPicker/CrosshairCircle";
import useUploadObservations from "components/MyObservations/hooks/useUploadObservations";
import { RealmContext } from "providers/contexts";
import React, { useCallback, useState } from "react";
import type { RealmObservation } from "realmModels/types";
import saveObservation from "sharedHelpers/saveObservation";
import {
  useCurrentUser,
  useExitObservationFlow,
} from "sharedHooks";
import useStore from "stores/useStore";

import type { ButtonType, ButtonTypeNonNull } from "./BottomButtons";
import BottomButtons, { SAVE_CHANGES, UPLOAD } from "./BottomButtons";
import ImpreciseLocationSheet from "./Sheets/ImpreciseLocationSheet";
import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const { useRealm } = RealmContext;

interface Props {
  passesEvidenceTest: boolean;
  currentObservation: RealmObservation;
  transitionAnimation: ( ) => void;
}

const BottomButtonsContainer = ( {
  passesEvidenceTest,
  currentObservation,
  transitionAnimation,
}: Props ) => {
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const unsavedChanges = useStore( state => state.unsavedChanges );
  const isMultiObs = useStore( state => state.observations.length > 1 );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const resetMyObsOffsetToRestore = useStore( state => state.resetMyObsOffsetToRestore );
  const setMyObsOffset = useStore( state => state.setMyObsOffset );
  const removeCurrentObservation = useStore( state => state.removeCurrentObservation );
  const setSavedOrUploadedMultiObsFlow = useStore( state => state.setSavedOrUploadedMultiObsFlow );
  const incrementTotalSavedObservations = useStore(
    state => state.incrementTotalSavedObservations,
  );
  const isNewObs = !currentObservation._created_at;
  const wasSynced = !!currentObservation?._synced_at;
  const hasPhotos = currentObservation.observationPhotos?.length > 0;
  const hasImportedPhotos = hasPhotos && cameraRollUris.length === 0;

  const realm = useRealm( );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );
  const [showImpreciseLocationSheet, setShowImpreciseLocationSheet] = useState( false );
  const [allowUserToUpload, setAllowUserToUpload] = useState( false );
  const [buttonPressed, setButtonPressed] = useState<ButtonType>( null );
  const exitObservationFlow = useExitObservationFlow( );

  const hasIdentification = currentObservation.taxon
    && currentObservation.taxon.rank_level !== 100;

  const passesTests = passesEvidenceTest && hasIdentification;

  const isOffline = isConnected === false;

  const canUpload = !!currentUser && !isOffline;
  const { startUploadsFromMultiObsEdit } = useUploadObservations( canUpload );

  const setNextScreen = useCallback( async ( type: ButtonTypeNonNull ) => {
    const savedObservation = await saveObservation( currentObservation, cameraRollUris, realm );
    if ( savedObservation && isMultiObs ) {
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
    const shouldUpload = type === UPLOAD || ( type === SAVE_CHANGES && unsavedChanges );
    if ( shouldUpload ) {
      const { uuid } = savedObservation;
      addTotalToolbarIncrements( savedObservation );
      addToUploadQueue( uuid );
      startUploadsFromMultiObsEdit( );
    } else {
      incrementTotalSavedObservations( );
    }

    setButtonPressed( null );
    if ( isMultiObs ) {
      removeCurrentObservation( );
    } else {
      // If this is the last observation, we're done
      exitObservationFlow( );
    }
  }, [
    addToUploadQueue,
    addTotalToolbarIncrements,
    cameraRollUris,
    currentObservation,
    exitObservationFlow,
    incrementTotalSavedObservations,
    isMultiObs,
    isNewObs,
    realm,
    removeCurrentObservation,
    resetMyObsOffsetToRestore,
    setMyObsOffset,
    setSavedOrUploadedMultiObsFlow,
    startUploadsFromMultiObsEdit,
    transitionAnimation,
    unsavedChanges,
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
    passesEvidenceTest,
  ] );

  const handlePress = useCallback( ( type: ButtonTypeNonNull ) => {
    if ( showMissingEvidence( ) ) { return; }
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
        canSaveOnly={!currentUser || isOffline}
        handlePress={handlePress}
        showFocusedChangesButton={unsavedChanges}
        showFocusedUploadButton={!!passesTests}
        showHalfOpacity={!passesEvidenceTest}
        wasSynced={wasSynced}
      />
    </>
  );
};

export default BottomButtonsContainer;
