import { useNavigation, useRoute } from "@react-navigation/native";
import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview";
import { Body4, DisplayTaxonName, INatIcon } from "components/SharedComponents";
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
import { useCurrentUser, useFontScale, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  count: number;
  showSpeciesSeenCheckmark: boolean;
  style?: Object;
  setCurrentExploreView: Function,
  // I guess this is expecting an API response and not a RealmTaxon
  taxon: {
    default_photo: Object;
    iconic_taxon_name: string;
    id: number;
    preferred_common_name: string;
    name: string;
  };
}

const TaxonGridItem = ( {
  count,
  showSpeciesSeenCheckmark = false,
  style,
  taxon,
  setCurrentExploreView
}: Props ): Node => {
  const { dispatch } = useExplore( );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const accessibleName = accessibleTaxonName( taxon, currentUser, t );
  const { isLargeFontScale } = useFontScale();
  const route = useRoute( );

  console.log( "showSpeciesSeenCheckmark", showSpeciesSeenCheckmark );
  const source = {
    uri: Photo.displayLocalOrRemoteMediumPhoto(
      taxon?.default_photo
    )
  };

  const obsPhotosCount = taxon?.default_photo
    ? 1
    : 0;

  return (
    <Pressable
      accessibilityRole="button"
      testID={`TaxonGridItem.Pressable.${taxon.id}`}
      onPress={( ) => (
        navigation.navigate( {
          // Ensure button mashing doesn't open multiple TaxonDetails instances
          key: `${route.key}-TaxonGridItem-TaxonDetails-${taxon.id}`,
          name: "TaxonDetails",
          params: { id: taxon.id }
        } )
      )}
      accessibilityLabel={accessibleName}
    >
      <ObsImagePreview
        source={source}
        style={style}
        isMultiplePhotosTop
        obsPhotosCount={obsPhotosCount}
        testID={`TaxonGridItem.${taxon.id}`}
        iconicTaxonName={taxon.iconic_taxon_name}
      >
        {showSpeciesSeenCheckmark && (
          <View className="absolute top-3 left-3">
            <SpeciesSeenCheckmark />
          </View>
        )}

        {count && (
          <Pressable
            accessibilityRole="button"
            className="absolute top-0 right-0 pr-3 pt-3"
            onPress={( ) => {
              dispatch( {
                type: EXPLORE_ACTION.CHANGE_TAXON,
                taxon,
                taxonId: taxon?.id,
                taxonName: taxon?.preferred_common_name || taxon?.name
              } );
              setCurrentExploreView( "observations" );
            }}
          >
            <INatIcon name="observations" size={15} color={colors.white} dropShadow />
          </Pressable>
        )}

        <View className="absolute bottom-0 flex p-2 w-full">
          {count && (
            <Body4
              maxFontSizeMultiplier={1.5}
              className="text-white py-1"
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
            showOneNameOnly={isLargeFontScale}
          />
        </View>
      </ObsImagePreview>
    </Pressable>
  );
};

export default TaxonGridItem;
