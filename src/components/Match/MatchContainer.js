import { useNavigation } from "@react-navigation/native";
import { RealmContext } from "providers/contexts.ts";
import React from "react";
import saveObservation from "sharedHelpers/saveObservation.ts";
import { useLocationPermission, useTaxon } from "sharedHooks";
import useStore from "stores/useStore";

import Match from "./Match";

const { useRealm } = RealmContext;

const MatchContainer = ( ) => {
  const currentObservation = useStore( state => state.currentObservation );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const matchScreenSuggestion = useStore( state => state.matchScreenSuggestion );
  const navigation = useNavigation( );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );
  const { taxon } = useTaxon( matchScreenSuggestion?.taxon );
  const realm = useRealm( );

  const navToTaxonDetails = ( ) => {
    navigation.push( "TaxonDetails", {
      id: taxon?.id,
      hideNavButtons: true
    } );
  };

  const handleSaveOrDiscardPress = async action => {
    if ( action === "save" ) {
      await saveObservation( currentObservation, cameraRollUris, realm );
    }
    navigation.navigate( "TabNavigator", {
      screen: "TabStackNavigator",
      params: {
        screen: "ObsList"
      }
    } );
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
