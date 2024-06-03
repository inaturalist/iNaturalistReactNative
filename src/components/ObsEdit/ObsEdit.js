// @flow

import { useIsFocused } from "@react-navigation/native";
import { ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStore from "stores/useStore";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

import BottomButtons from "./BottomButtons";
import EvidenceSectionContainer from "./EvidenceSectionContainer";
import Header from "./Header";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import OtherDataSection from "./OtherDataSection";

const DROP_SHADOW = getShadowForColor( colors.black, {
  offsetHeight: -2
} );

const ObsEdit = ( ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const setCurrentObservationIndex = useStore( state => state.setCurrentObservationIndex );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const [passesEvidenceTest, setPassesEvidenceTest] = useState( false );
  const [passesIdentificationTest, setPassesIdentificationTest] = useState( false );
  const [resetScreen, setResetScreen] = useState( false );
  const isFocused = useIsFocused( );

  if ( !isFocused ) return null;

  return (
    <>
      <ViewWrapper testID="obs-edit">
        <Header
          currentObservation={currentObservation}
          observations={observations}
        />
        <KeyboardAwareScrollView className="mb-[80px]">
          {currentObservation && (
            <View
              className="bg-white rounded-t-3xl mt-1"
              style={( observations.length > 1 )
                ? DROP_SHADOW
                : undefined}
            >
              <View className="pb-5">
                {observations.length > 1 && (
                  <MultipleObservationsArrows
                    currentObservationIndex={currentObservationIndex}
                    observations={observations}
                    setCurrentObservationIndex={setCurrentObservationIndex}
                    setResetScreen={setResetScreen}
                  />
                )}
                <EvidenceSectionContainer
                  currentObservation={currentObservation}
                  passesEvidenceTest={passesEvidenceTest}
                  setPassesEvidenceTest={setPassesEvidenceTest}
                  updateObservationKeys={updateObservationKeys}
                />
                <IdentificationSection
                  currentObservation={currentObservation}
                  passesIdentificationTest={passesIdentificationTest}
                  resetScreen={resetScreen}
                  setPassesIdentificationTest={setPassesIdentificationTest}
                  setResetScreen={setResetScreen}
                  updateObservationKeys={updateObservationKeys}
                />
                <OtherDataSection
                  currentObservation={currentObservation}
                  updateObservationKeys={updateObservationKeys}
                />
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>
      </ViewWrapper>
      <BottomButtons
        currentObservation={currentObservation}
        currentObservationIndex={currentObservationIndex}
        observations={observations}
        passesEvidenceTest={passesEvidenceTest}
        passesIdentificationTest={passesIdentificationTest}
        setCurrentObservationIndex={setCurrentObservationIndex}
      />
    </>
  );
};

export default ObsEdit;
