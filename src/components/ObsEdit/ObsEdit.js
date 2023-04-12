// @flow

import { useRoute } from "@react-navigation/native";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useState
} from "react";
import { ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Photo from "realmModels/Photo";
import useLocalObservation from "sharedHooks/useLocalObservation";

import BottomButtons from "./BottomButtons";
import EvidenceSection from "./EvidenceSection";
import Header from "./Header";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import OtherDataSection from "./OtherDataSection";
import DeleteObservationSheet from "./Sheets/DeleteObservationSheet";

const ObsEdit = ( ): Node => {
  const [deleteSheetVisible, setDeleteSheetVisible] = useState( false );
  const {
    currentObservation,
    observations,
    setObservations,
    resetObsEditContext,
    loading
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos ? Array.from( obsPhotos ).map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  ) : [];
  const { params } = useRoute( );
  const localObservation = useLocalObservation( params?.uuid );

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
      setObservations( [localObservation.toJSON( )] );
    }
  }, [localObservation, setObservations, resetObsEditContext, currentObservation] );

  if ( !currentObservation ) { return null; }

  return (
    <>
      <View testID="obs-edit" className="bg-white flex-1">
        {deleteSheetVisible && (
          <DeleteObservationSheet
            handleClose={( ) => setDeleteSheetVisible( false )}
          />
        )}
        <Header setDeleteSheetVisible={setDeleteSheetVisible} />
        <KeyboardAwareScrollView className="bg-white">
          {observations.length > 1 && <MultipleObservationsArrows />}
          <EvidenceSection
            photoUris={photoUris}
          />
          <IdentificationSection />
          <OtherDataSection />
          {loading && <ActivityIndicator />}
        </KeyboardAwareScrollView>
      </View>
      <BottomButtons />
    </>
  );
};

export default ObsEdit;
