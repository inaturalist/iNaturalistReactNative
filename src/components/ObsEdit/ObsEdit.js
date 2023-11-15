// @flow

import { useIsFocused, useRoute } from "@react-navigation/native";
import { View } from "components/styledComponents";
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
    currentObservation,
    observations,
    updateObservations,
    resetObsEditContext,
    loading
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
        <View testID="obs-edit" className="bg-white flex-1">
          <Header />
          <KeyboardAwareScrollView className="bg-white mb-[80px]">
            {currentObservation && (
              <>
                {observations.length > 1 && <MultipleObservationsArrows />}
                <EvidenceSectionContainer
                  passesEvidenceTest={passesEvidenceTest}
                  setPassesEvidenceTest={setPassesEvidenceTest}
                />
                <IdentificationSection
                  passesIdentificationTest={passesIdentificationTest}
                  setPassesIdentificationTest={setPassesIdentificationTest}
                />
                <OtherDataSection />
              </>
            )}
            {loading && <ActivityIndicator />}
          </KeyboardAwareScrollView>
        </View>
        <BottomButtons
          passesEvidenceTest={passesEvidenceTest}
          passesIdentificationTest={passesIdentificationTest}
        />
      </>
    )
    : null;
};

export default ObsEdit;
