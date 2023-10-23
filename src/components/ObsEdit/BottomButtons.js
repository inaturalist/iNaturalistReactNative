// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Button, StickyToolbar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

import ImpreciseLocationSheet from "./Sheets/ImpreciseLocationSheet";
import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const DESIRED_LOCATION_ACCURACY = 4000000;

const BottomButtons = ( ): Node => {
  const { t } = useTranslation( );
  const {
    setNextScreen,
    currentObservation,
    unsavedChanges,
    passesEvidenceTest,
    passesIdentificationTest
  } = useContext( ObsEditContext );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );
  const [showImpreciseLocationSheet, setShowImpreciseLocationSheet] = useState( false );
  const [allowUserToUpload, setAllowUserToUpload] = useState( false );
  const [buttonPressed, setButtonPressed] = useState( null );
  const navigation = useNavigation( );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        setButtonPressed( null );
      } );
    },
    [navigation]
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
    if ( showMissingEvidence( ) ) { return; }
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
            loading={buttonPressed === "save"}
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
              loading={buttonPressed === "save"}
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
              loading={buttonPressed === "upload"}
              disabled={buttonPressed !== null}
            />
          </View>
        )}
    </StickyToolbar>
  );
};

export default BottomButtons;
