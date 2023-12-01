// @flow

import { useIsFocused, useRoute } from "@react-navigation/native";
import { ViewWrapper } from "components/SharedComponents";
import type { Node } from "react";
import React, {
  useEffect, useState
} from "react";
import { ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useLocalObservation from "sharedHooks/useLocalObservation";
import useStore from "stores/useStore";

import BottomButtons from "./BottomButtons";
import EvidenceSectionContainer from "./EvidenceSectionContainer";
import Header from "./Header";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import OtherDataSection from "./OtherDataSection";

const ObsEdit = ( ): Node => {
  const resetStore = useStore( state => state.resetStore );
  const observations = useStore( state => state.observations );
  const setObservations = useStore( state => state.setObservations );
  const updateObservations = useStore( state => state.updateObservations );
  const setPhotoEvidenceUris = useStore( state => state.setPhotoEvidenceUris );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const currentObservation = useStore( state => state.currentObservation );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const photoEvidenceUris = useStore( state => state.photoEvidenceUris );
  const savingPhoto = useStore( state => state.savingPhoto );
  const setCurrentObservationIndex = useStore( state => state.setCurrentObservationIndex );
  const unsavedChanges = useStore( state => state.unsavedChanges );
  const loading = useStore( state => state.loading );
  const { params } = useRoute( );
  const localObservation = useLocalObservation( params?.uuid );
  const [passesEvidenceTest, setPassesEvidenceTest] = useState( false );
  const [passesIdentificationTest, setPassesIdentificationTest] = useState( false );

  const isFocused = useIsFocused( );

  const updateObservationKeys = keysAndValues => {
    const updatedObservations = observations;
    const updatedObservation = {
      ...( currentObservation.toJSON
        ? currentObservation.toJSON( )
        : currentObservation ),
      ...keysAndValues
    };
    updatedObservations[currentObservationIndex] = updatedObservation;
    updateObservations( [...updatedObservations] );
  };

  useEffect( ( ) => {
    // when first opening an observation from ObsDetails, fetch local observation from realm
    // and set this in obsEditContext

    // If the obs requested in params is not the observation in context, clear
    // the context and set the obs requested in params as the current
    // observation
    const obsChanged = localObservation && localObservation?.uuid !== currentObservation?.uuid;
    if ( obsChanged ) {
      resetStore( );
      // need .toJSON( ) to be able to add evidence to an existing local observation
      // otherwise, get a realm error about modifying managed objects outside of a write transaction
      setObservations( [localObservation.toJSON( )] );
    }
  }, [localObservation, setObservations, resetStore, currentObservation] );

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
