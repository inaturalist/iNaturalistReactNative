import { useNavigation } from "@react-navigation/native";
import { Body4, DisplayTaxonName } from "components/SharedComponents";
import ObsImagePreview from "components/SharedComponents/ObservationsFlashList/ObsImagePreview";
import SpeciesSeenCheckmark from "components/SharedComponents/SpeciesSeenCheckmark";
import { Pressable, View } from "components/styledComponents";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import { useCurrentUser, useTranslation } from "sharedHooks";

interface Props {
  count: number,
  style?: Object,
  taxon: Object,
  setCurrentExploreView: Function,
  showSpeciesSeenCheckmark: boolean
}

const TaxonGridItem = ( {
  count,
  style,
  taxon,
  setCurrentExploreView,
  showSpeciesSeenCheckmark = false
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const {
    dispatch
  } = useExplore( );

  const accessibleName = accessibleTaxonName( taxon, currentUser, t );

  return (
    <Pressable
      accessibilityRole="button"
      testID={`TaxonGridItem.Pressable.${taxon.id}`}
      onPress={( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
      accessibilityLabel={accessibleName}
    >
      <ObsImagePreview
        source={{
          uri: Photo.displayLocalOrRemoteMediumPhoto(
            taxon?.default_photo
          )
        }}
        width="w-full"
        style={style}
        isMultiplePhotosTop
        obsPhotosCount={taxon?.default_photo
          ? 1
          : 0}
        testID={`TaxonGridItem.${taxon.id}`}
        iconicTaxonName={taxon.iconic_taxon_name}
      >
        {showSpeciesSeenCheckmark && (
          <View className="absolute top-3 left-3">
            <SpeciesSeenCheckmark />
          </View>
        )}

        <View className="absolute bottom-0 flex p-2 w-full">
          {count && (
            <Body4
              className="text-white py-1"
              onPress={( ) => {
                dispatch( {
                  type: EXPLORE_ACTION.CHANGE_TAXON,
                  taxon,
                  taxonId: taxon?.id,
                  taxonName: taxon?.preferred_common_name || taxon?.name
                } );
                setCurrentExploreView( "observations" );
              }}
              accessibilityRole="link"
            >
              {t( "X-Observations", { count } )}
            </Body4>
          )}
          <DisplayTaxonName
            keyBase={taxon?.id}
            taxon={taxon}
            scientificNameFirst={currentUser?.prefers_scientific_name_first}
            prefersCommonNames={currentUser?.prefers_common_names}
            layout="vertical"
            color="text-white"
          />
        </View>
      </ObsImagePreview>
    </Pressable>
  );
};

export default TaxonGridItem;
