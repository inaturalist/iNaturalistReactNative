// @flow

import React, { useContext } from "react";
import { Text } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import ObsEditSearch from "./ObsEditSearch";
import { ObsEditContext } from "../../providers/contexts";

const TaxaSuggestions = ( ): Node => {
  const {
    updateObservationKey
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );

  const updateTaxaId = taxaId => {
    updateObservationKey( "taxon_id", taxaId );
    navigation.navigate( "ObsEdit" );
  };

  return (
    <ViewNoFooter>
      <ObsEditSearch
        source="taxa"
        handlePress={updateTaxaId}
      />
    </ViewNoFooter>
  );
};

export default TaxaSuggestions;
