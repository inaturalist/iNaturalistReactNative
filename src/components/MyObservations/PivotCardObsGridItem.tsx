import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview";
import { photoFromObservation } from "components/ObservationsFlashList/util";
import { Body2, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React from "react";
import Observation from "realmModels/Observation";
import Photo from "realmModels/Photo";
import { useCurrentUser } from "sharedHooks";

const { useObject } = RealmContext;

// one-off simplified version of ObsGridItem for the Onboarding PivotCard
const PivotCardObsGridItem = ( { uuid }: { uuid: string } ) => {
  const obs = useObject<{ uuid: string }>( "Observation", uuid );
  const currentUser = useCurrentUser( );
  if ( !obs ) return null;
  const photo = photoFromObservation( obs );
  const photoUri = Photo.displayLocalOrRemoteMediumPhoto( photo );
  const taxon = obs.taxon
    ? Observation.mapTaxonForMyObs( obs.taxon )
    : undefined;
  return (
    <ObsImagePreview
      height="h-[200px]"
      width="w-[200px]"
      iconicTaxonName={taxon?.iconic_taxon_name}
      isMultiplePhotosTop
      source={photoUri
        ? { uri: photoUri }
        : undefined}
      testID="PivotCardGridItem"
      useShortGradient
      white
    >
      <View className="absolute bottom-0 items-start p-2">
        <DisplayTaxonName
          bottomTextComponent={Body2}
          color="text-white"
          ellipsizeCommonName
          layout="vertical"
          prefersCommonNames={currentUser?.prefers_common_names}
          scientificNameFirst={currentUser?.prefers_scientific_name_first}
          showOneNameOnly
          taxon={taxon}
        />
      </View>
    </ObsImagePreview>
  );
};

export default PivotCardObsGridItem;
