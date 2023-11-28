// @flow

import { useIsFocused, useRoute } from "@react-navigation/native";
import { ViewWrapper } from "components/SharedComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useState
} from "react";
import { ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useLocalObservation from "sharedHooks/useLocalObservation";

import BottomButtons from "./BottomButtons";
import EvidenceSectionContainer from "./EvidenceSectionContainer";
import Header from "./Header";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import OtherDataSection from "./OtherDataSection";

const ObsEdit = ( ): Node => {
  const {
    cameraRollUris,
    currentObservation,
    currentObservationIndex,
    loading,
    observations,
    photoEvidenceUris,
    resetObsEditContext,
    savingPhoto,
    setCurrentObservationIndex,
    setPhotoEvidenceUris,
    unsavedChanges,
    updateObservations,
    updateObservationKeys
  } = useContext( ObsEditContext );
  const { params } = useRoute( );
  const localObservation = useLocalObservation( params?.uuid );
  const [passesEvidenceTest, setPassesEvidenceTest] = useState( false );
  const [passesIdentificationTest, setPassesIdentificationTest] = useState( false );

  const isFocused = useIsFocused( );

  useEffect( ( ) => {
    // when first opening an observation from ObsDetails, fetch local observation from realm
    // and set this in obsEditContext

    // If the obs requested in params is not the observation in context, clear
    // the context and set the obs requested in params as the current
    // observation
    const obsChanged = localObservation && localObservation?.uuid !== currentObservation?.uuid;
    if ( obsChanged ) {
      resetObsEditContext( );
      // need .toJSON( ) to be able to add evidence to an existing local observation
      // otherwise, get a realm error about modifying managed objects outside of a write transaction
      updateObservations( [localObservation.toJSON( )] );
    }
  }, [localObservation, updateObservations, resetObsEditContext, currentObservation] );

  return isFocused
    ? (
      <>
        <ViewWrapper testID="obs-edit">
          <Header
            observations={observations}
            currentObservation={currentObservation}
            unsavedChanges={unsavedChanges}
            updateObservations={updateObservations}
          />
          <KeyboardAwareScrollView className="bg-white mb-[80px]">
            {currentObservation && (
              <>
                {observations.length > 1 && (
                  <MultipleObservationsArrows
                    currentObservationIndex={currentObservationIndex}
                    setCurrentObservationIndex={setCurrentObservationIndex}
                    observations={observations}
                  />
                )}
                <EvidenceSectionContainer
                  passesEvidenceTest={passesEvidenceTest}
                  setPassesEvidenceTest={setPassesEvidenceTest}
                  currentObservation={currentObservation}
                  updateObservationKeys={updateObservationKeys}
                  setPhotoEvidenceUris={setPhotoEvidenceUris}
                  photoEvidenceUris={photoEvidenceUris}
                  savingPhoto={savingPhoto}
                />
                <IdentificationSection
                  passesIdentificationTest={passesIdentificationTest}
                  setPassesIdentificationTest={setPassesIdentificationTest}
                  currentObservation={currentObservation}
                  updateObservationKeys={updateObservationKeys}
                />
                <OtherDataSection
                  currentObservation={currentObservation}
                  updateObservationKeys={updateObservationKeys}
                />
              </>
            )}
            {loading && <ActivityIndicator />}
          </KeyboardAwareScrollView>
        </ViewWrapper>
        <BottomButtons
          passesEvidenceTest={passesEvidenceTest}
          passesIdentificationTest={passesIdentificationTest}
          currentObservation={currentObservation}
          unsavedChanges={unsavedChanges}
          currentObservationIndex={currentObservationIndex}
          observations={observations}
          cameraRollUris={cameraRollUris}
          setCurrentObservationIndex={setCurrentObservationIndex}
        />
      </>
    )
    : null;
};

export default ObsEdit;
