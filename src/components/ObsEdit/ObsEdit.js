// @flow

import { useIsFocused } from "@react-navigation/native";
import { ViewWrapper } from "components/SharedComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStore from "stores/useStore";

import BottomButtons from "./BottomButtons";
import EvidenceSectionContainer from "./EvidenceSectionContainer";
import Header from "./Header";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import OtherDataSection from "./OtherDataSection";

const ObsEdit = ( ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const setCurrentObservationIndex = useStore( state => state.setCurrentObservationIndex );
  const updateObservations = useStore( state => state.updateObservations );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const [passesEvidenceTest, setPassesEvidenceTest] = useState( false );
  const [passesIdentificationTest, setPassesIdentificationTest] = useState( false );

  const isFocused = useIsFocused( );

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
