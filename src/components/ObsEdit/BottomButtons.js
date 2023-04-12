// @flow

import classnames from "classnames";
import {
  Button, StickyToolbar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

import ImpreciseLocationSheet from "./Sheets/ImpreciseLocationSheet";
import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const BottomButtons = ( ): Node => {
  const { t } = useTranslation( );
  const {
    saveObservation,
    saveAndUploadObservation,
    setNextScreen,
    setLoading,
    currentObservation,
    unsavedChanges,
    passesEvidenceTest,
    passesIdentificationTest
  } = useContext( ObsEditContext );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );
  const [showImpreciseLocationSheet, setShowImpreciseLocationSheet] = useState( false );
  const [sheetShown, setSheetShown] = useState( false );

  const showMissingEvidence = ( ) => {
    if ( sheetShown ) { return false; }
    if ( !currentObservation.positional_accuracy
      || currentObservation.positional_accuracy > 10000 ) {
      setShowImpreciseLocationSheet( true );
      setSheetShown( true );
      return true;
    }
    if ( !passesEvidenceTest ) {
      setShowMissingEvidenceSheet( true );
      setSheetShown( true );
      return true;
    }
    return false;
  };

  const handleSave = async ( ) => {
    if ( showMissingEvidence( ) ) { return; }
    setLoading( true );
    await saveObservation( );
    setLoading( false );
    setNextScreen( );
  };

  const handleUpload = async ( ) => {
    if ( showMissingEvidence( ) ) { return; }
    setLoading( true );
    await saveAndUploadObservation( );
    setLoading( false );
    setNextScreen( );
  };

  return (
    <StickyToolbar containerClass="bottom-6">
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
      {currentObservation._synced_at ? (
        <Button
          onPress={handleSave}
          testID="ObsEdit.saveChangesButton"
          text={t( "SAVE-CHANGES" )}
          level={unsavedChanges ? "focus" : "neutral"}
        />
      ) : (
        <View className={classnames( "flex-row justify-evenly", {
          "opacity-50": !passesEvidenceTest
        } )}
        >
          <Button
            className="px-[25px]"
            onPress={handleSave}
            testID="ObsEdit.saveButton"
            text={t( "SAVE" )}
            level="neutral"
          />
          <Button
            className="ml-3 grow"
            level={passesEvidenceTest && passesIdentificationTest ? "focus" : "neutral"}
            text={t( "UPLOAD-NOW" )}
            testID="ObsEdit.uploadButton"
            onPress={handleUpload}
          />
        </View>
      )}
    </StickyToolbar>
  );
};

export default BottomButtons;
