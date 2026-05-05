import { useNavigation } from "@react-navigation/native";
import SavedMatch from "components/ObsDetailsDefaultMode/SavedMatch/SavedMatch";
import type { TabStackScreenProps } from "navigation/types";
import React from "react";
import type { RealmObservation } from "realmModels/types";

interface Props {
  observation: RealmObservation;
}

const SavedMatchContainer = ( { observation }: Props ) => {
  const navigation = useNavigation<TabStackScreenProps<"ObsDetails">["navigation"]>( );

  const navToTaxonDetails = () => {
    const navParams = { id: observation.taxon?.id };
    navigation.push( "TaxonDetails", navParams );
  };

  return (
    <SavedMatch
      observation={observation}
      navToTaxonDetails={navToTaxonDetails}
    />
  );
};

export default SavedMatchContainer;
