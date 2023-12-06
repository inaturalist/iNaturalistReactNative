// @flow

import { useIsFocused, useRoute } from "@react-navigation/native";
import { ViewWrapper } from "components/SharedComponents";
import type { Node } from "react";
import React, {
  useEffect, useState
} from "react";
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
  const { params } = useRoute( );
  const localObservation = useLocalObservation( params?.uuid );
  const currentObservation = useStore( state => state.currentObservation );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const resetStore = useStore( state => state.resetStore );
  const setCurrentObservationIndex = useStore( state => state.setCurrentObservationIndex );
  const setObservations = useStore( state => state.setObservations );
  const updateObservations = useStore( state => state.updateObservations );
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
          </KeyboardAwareScrollView>
        </ViewWrapper>
        <BottomButtons
          passesEvidenceTest={passesEvidenceTest}
          passesIdentificationTest={passesIdentificationTest}
          currentObservation={currentObservation}
          currentObservationIndex={currentObservationIndex}
          observations={observations}
          setCurrentObservationIndex={setCurrentObservationIndex}
        />
      </>
    )
    : null;
};

export default ObsEdit;
