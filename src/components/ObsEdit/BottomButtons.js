// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Button, StickyToolbar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import Observation from "realmModels/Observation";
import { writeExifToFile } from "sharedHelpers/parseExif";
import uploadObservation from "sharedHelpers/uploadObservation";
import useTranslation from "sharedHooks/useTranslation";

import { log } from "../../../react-native-logs.config";
import ImpreciseLocationSheet from "./Sheets/ImpreciseLocationSheet";
import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const { useRealm } = RealmContext;

const DESIRED_LOCATION_ACCURACY = 4000000;

type Props = {
  passesEvidenceTest: boolean,
  passesIdentificationTest: boolean,
  observations: Array<Object>,
  currentObservation: Object,
  unsavedChanges: boolean,
  currentObservationIndex: number,
  cameraRollUris: Array<string>,
  setCurrentObservationIndex: Function
}

const logger = log.extend( "ObsEditBottomButtons" );

const BottomButtons = ( {
  passesEvidenceTest,
  passesIdentificationTest,
  currentObservation,
  unsavedChanges,
  currentObservationIndex,
  observations,
  cameraRollUris,
  setCurrentObservationIndex
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );
  const [showImpreciseLocationSheet, setShowImpreciseLocationSheet] = useState( false );
  const [allowUserToUpload, setAllowUserToUpload] = useState( false );
  const [buttonPressed, setButtonPressed] = useState( null );
  const [loading, setLoading] = useState( false );

  const writeExifToCameraRollPhotos = async exif => {
    if ( !cameraRollUris || cameraRollUris.length === 0 || !currentObservation ) {
      return;
    }
    // Update all photos taken via the app with the new fetched location.
    cameraRollUris.forEach( uri => {
      logger.info( "writeExifToCameraRollPhotos, writing exif for uri: ", uri );
      writeExifToFile( uri, exif );
    } );
  };

  const saveObservation = async observation => {
    await writeExifToCameraRollPhotos( {
      latitude: observation.latitude,
      longitude: observation.longitude,
      positional_accuracy: observation.positionalAccuracy
    } );
    return Observation.saveLocalObservationForUpload( observation, realm );
  };

  const setNextScreen = async ( { type }: Object ) => {
    logger.info( "saving observation ", currentObservation.uuid );
    const savedObservation = await saveObservation( currentObservation );
    logger.info( "saved observation ", savedObservation.uuid );
    const params = {};
    if ( type === "upload" ) {
      // $FlowIgnore
      uploadObservation( savedObservation, realm );
      params.uuid = savedObservation.uuid;
    }

    if ( observations.length === 1 ) {
      logger.info( "navigating back to MyObs" );
      // navigate to ObsList and start upload with uuid
      navigation.navigate( "TabNavigator", {
        screen: "ObservationsStackNavigator",
        params: {
          screen: "ObsList",
          params
        }
      } );
      logger.info( "navigated back to MyObs" );
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
  };

  useEffect(
    ( ) => {
      // reset button disabled status when scrolling through multiple observations
      if ( currentObservation ) {
        setButtonPressed( null );
      }
    },
    [currentObservation]
  );

  const showMissingEvidence = ( ) => {
    if ( allowUserToUpload ) { return false; }
    // missing evidence sheet takes precedence over the location imprecise sheet
    if ( !passesEvidenceTest ) {
      setShowMissingEvidenceSheet( true );
      setAllowUserToUpload( true );
      return true;
    }
    if ( currentObservation?.positional_accuracy
      && currentObservation?.positional_accuracy > DESIRED_LOCATION_ACCURACY ) {
      setShowImpreciseLocationSheet( true );
      return true;
    }
    return false;
  };

  const handlePress = type => {
    logger.info( `tapped ${type}` );
    if ( showMissingEvidence( ) ) { return; }
    setLoading( true );
    setButtonPressed( type );
    setNextScreen( { type } );
  };

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
      {currentObservation?._synced_at
        ? (
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
        )
        : (
          <View className={classnames( "flex-row justify-evenly", {
            "opacity-50": !passesEvidenceTest
          } )}
          >
            <Button
              className="px-[25px]"
              onPress={( ) => handlePress( "save" )}
              testID="ObsEdit.saveButton"
              text={t( "SAVE" )}
              level="neutral"
              loading={buttonPressed === "save" && loading}
              disabled={buttonPressed !== null}
            />
            <Button
              className="ml-3 grow"
              level={passesEvidenceTest && passesIdentificationTest
                ? "focus"
                : "neutral"}
              text={t( "UPLOAD-NOW" )}
              testID="ObsEdit.uploadButton"
              onPress={( ) => handlePress( "upload" )}
              loading={buttonPressed === "upload" && loading}
              disabled={buttonPressed !== null}
            />
          </View>
        )}
    </StickyToolbar>
  );
};

export default BottomButtons;
