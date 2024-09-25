// @flow

import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { REQUIRED_LOCATION_ACCURACY } from "components/LocationPicker/CrosshairCircle";
import {
  Button,
  StickyToolbar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import saveObservation from "sharedHelpers/saveObservation.ts";
import { useCurrentUser, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import ImpreciseLocationSheet from "./Sheets/ImpreciseLocationSheet";
import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const { useRealm } = RealmContext;

type Props = {
  passesEvidenceTest: boolean,
  observations: Array<Object>,
  currentObservation: Object,
  currentObservationIndex: number,
  setCurrentObservationIndex: Function
}

const BottomButtons = ( {
  passesEvidenceTest,
  currentObservation,
  currentObservationIndex,
  observations,
  setCurrentObservationIndex
}: Props ): Node => {
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const unsavedChanges = useStore( state => state.unsavedChanges );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const setStartUploadObservations = useStore( state => state.setStartUploadObservations );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const resetMyObsOffsetToRestore = useStore( state => state.resetMyObsOffsetToRestore );
  const navigation = useNavigation( );
  const isNewObs = !currentObservation?._created_at;
  const hasPhotos = currentObservation?.observationPhotos?.length > 0;
  const hasImportedPhotos = hasPhotos && cameraRollUris.length === 0;
  const { t } = useTranslation( );
  const realm = useRealm( );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );
  const [showImpreciseLocationSheet, setShowImpreciseLocationSheet] = useState( false );
  const [allowUserToUpload, setAllowUserToUpload] = useState( false );
  const [buttonPressed, setButtonPressed] = useState( null );
  const [loading, setLoading] = useState( false );

  const hasIdentification = currentObservation?.taxon
    && currentObservation?.taxon.rank_level !== 100;

  const passesTests = passesEvidenceTest && hasIdentification;

  const setNextScreen = useCallback( async ( { type }: Object ) => {
    const savedObservation = await saveObservation( currentObservation, cameraRollUris, realm );
    // If we are saving a new observations, reset the stored my obs offset to
    // restore b/c we want MyObs rendered in its default state with this new
    // observation visible at the top
    if ( isNewObs ) {
      resetMyObsOffsetToRestore( );
    }
    if ( type === "upload" ) {
      const { uuid } = savedObservation;
      addTotalToolbarIncrements( savedObservation );
      addToUploadQueue( uuid );
      setStartUploadObservations( );
    }

    if ( observations.length === 1 ) {
      // navigate to ObsList and start upload with uuid
      navigation.navigate( "TabNavigator", {
        screen: "TabStackNavigator",
        params: {
          screen: "ObsList"
        }
      } );
    } else if ( currentObservationIndex === observations.length - 1 ) {
      observations.pop( );
      setCurrentObservationIndex( currentObservationIndex - 1, observations );
      setLoading( false );
    } else {
      observations.splice( currentObservationIndex, 1 );
      // this seems necessary for rerendering the ObsEdit screen
      setCurrentObservationIndex( currentObservationIndex, observations );
      setLoading( false );
    }
  }, [
    addTotalToolbarIncrements,
    addToUploadQueue,
    currentObservation,
    currentObservationIndex,
    isNewObs,
    navigation,
    resetMyObsOffsetToRestore,
    observations,
    setCurrentObservationIndex,
    setStartUploadObservations,
    cameraRollUris,
    realm
  ] );

  useEffect(
    ( ) => {
      // reset button disabled status when scrolling through multiple observations
      if ( currentObservation ) {
        setButtonPressed( null );
      }
    },
    [currentObservation]
  );

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

  const handlePress = useCallback( type => {
    if ( showMissingEvidence( ) ) { return; }
    setLoading( true );
    setButtonPressed( type );
    setNextScreen( { type } );
  }, [setNextScreen, showMissingEvidence] );

  const renderSaveButton = useCallback( ( ) => (
    <Button
      className="px-[25px]"
      onPress={( ) => handlePress( "save" )}
      testID="ObsEdit.saveButton"
      text={t( "SAVE" )}
      level="neutral"
      loading={buttonPressed === "save" && loading}
      disabled={buttonPressed !== null}
    />
  ), [buttonPressed, loading, handlePress, t] );

  const renderSaveChangesButton = useCallback( ( ) => (
    <Button
      onPress={( ) => handlePress( "save" )}
      testID="ObsEdit.saveChangesButton"
      text={t( "SAVE-CHANGES" )}
      level={unsavedChanges
        ? "focus"
        : "neutral"}
      loading={buttonPressed === "save" && loading}
      disabled={buttonPressed !== null}
    />
  ), [buttonPressed, loading, handlePress, t, unsavedChanges] );

  const renderUploadButton = useCallback( ( ) => (
    <Button
      className="ml-3 grow"
      level={passesTests
        ? "focus"
        : "neutral"}
      text={t( "UPLOAD-NOW" )}
      testID="ObsEdit.uploadButton"
      onPress={( ) => handlePress( "upload" )}
      loading={buttonPressed === "upload" && loading}
      disabled={buttonPressed !== null}
    />
  ), [buttonPressed, loading, handlePress, t, passesTests] );

  const renderButtons = useCallback( ( ) => {
    if ( !currentUser || !isConnected ) {
      return renderSaveButton( );
    }
    if ( currentObservation?._synced_at ) {
      return renderSaveChangesButton( );
    }
    return (
      <View className={classnames( "flex-row justify-evenly", {
        "opacity-50": !passesEvidenceTest
      } )}
      >
        {renderSaveButton( )}
        {renderUploadButton( )}
      </View>
    );
  }, [
    currentObservation,
    currentUser,
    isConnected,
    passesEvidenceTest,
    renderSaveButton,
    renderSaveChangesButton,
    renderUploadButton
  ] );

  return (
    <StickyToolbar>
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
      {renderButtons( )}
    </StickyToolbar>
  );
};

export default BottomButtons;
