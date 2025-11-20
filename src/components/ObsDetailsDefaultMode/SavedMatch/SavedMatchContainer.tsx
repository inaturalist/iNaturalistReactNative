import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SavedMatch from "components/ObsDetailsDefaultMode/SavedMatch/SavedMatch";
import _ from "lodash";
import React from "react";
import type { RealmObservation } from "realmModels/types";

type Props = {
  observation: RealmObservation,
}

const SavedMatchContainer = ( {
  observation
}: Props ) => {
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, { id?: number }>>>( );

  const navToTaxonDetails
  = ( photo?: { id?: number; isRepresentativeButOtherTaxon?: boolean } ) => {
    const navParams: {
        id?: number;
        firstPhotoID?: number;
        representativePhoto?: unknown;
    } = { id: observation.taxon?.id };
    if ( !photo?.isRepresentativeButOtherTaxon ) {
      navParams.firstPhotoID = photo?.id;
    } else {
      navParams.representativePhoto = photo;
    }
    navigation.push( "TaxonDetails", navParams );
  };

  return (
    <SavedMatch
      observation={observation}
      navToTaxonDetails={navToTaxonDetails}
      isFetchingLocation={false}
      handleAddLocationPressed={() => {}}
    />
  );
};

export default SavedMatchContainer;
