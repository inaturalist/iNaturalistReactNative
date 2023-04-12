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

  return (
    <StickyToolbar containerClass="bottom-6">
      {showMissingEvidenceSheet && (
        <MissingEvidenceSheet
          setShowMissingEvidenceSheet={setShowMissingEvidenceSheet}
        />
      )}
      {currentObservation._synced_at ? (
        <Button
          onPress={async ( ) => {
            setLoading( true );
            await saveObservation( );
            setLoading( false );
            setNextScreen( );
          }}
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
            onPress={async ( ) => {
              setLoading( true );
              await saveObservation( );
              setLoading( false );
              setNextScreen( );
            }}
            testID="ObsEdit.saveButton"
            text={t( "SAVE" )}
            level="neutral"
          />
          <Button
            className="ml-3 grow"
            level={passesEvidenceTest && passesIdentificationTest ? "focus" : "neutral"}
            text={t( "UPLOAD-NOW" )}
            testID="ObsEdit.uploadButton"
            onPress={async ( ) => {
              setLoading( true );
              await saveAndUploadObservation( );
              setLoading( false );
              setNextScreen( );
            }}
          />
        </View>
      )}
    </StickyToolbar>
  );
};

export default BottomButtons;
