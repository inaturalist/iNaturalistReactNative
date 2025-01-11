import { useNavigation } from "@react-navigation/native";
import { RealmContext } from "providers/contexts.ts";
import React from "react";
import saveObservation from "sharedHelpers/saveObservation.ts";
import {
  useExitObservationFlow,
  useLocationPermission,
  useTaxon
} from "sharedHooks";
import useStore from "stores/useStore";

import Match from "./Match";

const { useRealm } = RealmContext;

const MatchContainer = ( ) => {
  const currentObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const matchScreenSuggestion = useStore( state => state.matchScreenSuggestion );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const navigation = useNavigation( );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );
  const { taxon } = useTaxon( matchScreenSuggestion?.taxon );
  const realm = useRealm( );
  const exitObservationFlow = useExitObservationFlow( );

  // This might happen when this component is still mounted in the background
  // but the state is getting torn down b/c the user exited the obs flow. If
  // we render the match screen in that scenario we'll get some errors due to
  // the missing taxon.
  if ( !matchScreenSuggestion ) return null;

  const navToTaxonDetails = ( ) => {
    navigation.push( "TaxonDetails", { id: taxon?.id } );
  };

  const handleSaveOrDiscardPress = async action => {
    if ( action === "save" ) {
      updateObservationKeys( {
        taxon,
        owners_identification_from_vision: true
      } );
      await saveObservation( getCurrentObservation( ), cameraRollUris, realm );
    }
    exitObservationFlow( );
  };

  const openLocationPicker = ( ) => {
    navigation.navigate( "LocationPicker" );
  };

  const handleLocationPickerPressed = ( ) => {
    if ( hasPermissions ) {
      openLocationPicker( );
    } else {
      requestPermissions( );
    }
  };

  const confidence = matchScreenSuggestion
    ? Math.round( matchScreenSuggestion.score * 100 )
    : null;

  return (
    <>
      <Match
        observation={currentObservation}
        handleSaveOrDiscardPress={handleSaveOrDiscardPress}
        navToTaxonDetails={navToTaxonDetails}
        taxon={taxon}
        confidence={confidence}
        handleLocationPickerPressed={handleLocationPickerPressed}
      />
      {renderPermissionsGate( { onPermissionGranted: openLocationPicker } )}
    </>
  );
};

export default MatchContainer;
