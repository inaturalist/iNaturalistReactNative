import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import { OBSERVATIONS_TAB } from "appConstants/tabs";
import ExploreTaxonGridItem from "components/Explore/ExploreTaxonGridItem";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import type { ExploreStackScreenProps } from "navigation/types";
import { EXPLORE_V2_ACTION, useExploreV2 } from "providers/ExploreV2Context";
import React, { useCallback } from "react";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

interface Props {
  count?: number;
  showSpeciesSeenCheckmark?: boolean;
  style?: object;
  taxon: ApiTaxon;
}

const ExploreV2SpeciesGridItem = ( {
  count,
  showSpeciesSeenCheckmark = false,
  style,
  taxon,
}: Props ) => {
  const { t } = useTranslation( );
  const { dispatch } = useExploreV2( );
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );

  const navToTaxonDetails = useCallback( ( ) => (
    navigation.navigate( "TaxonDetails", { id: taxon.id } )
  ), [navigation, taxon.id] );

  // Tapping the card sets the current search subject to this species and
  // switches to the observations tab.
  const onPress = useCallback( ( ) => {
    dispatch( {
      type: EXPLORE_V2_ACTION.SET_SUBJECT,
      subject: {
        type: "taxon",
        taxon: {
          id: taxon.id as number,
          name: taxon.name as string,
          preferred_common_name: taxon.preferred_common_name,
          default_photo: taxon.default_photo,
          iconic_taxon_name: taxon.iconic_taxon_name,
          rank_level: taxon.rank_level,
        },
      },
    } );
    dispatch( { type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB, tab: OBSERVATIONS_TAB } );
  }, [dispatch, taxon] );

  return (
    <ExploreTaxonGridItem
      count={count}
      onPress={onPress}
      showSpeciesSeenCheckmark={showSpeciesSeenCheckmark}
      style={style}
      taxon={taxon}
      upperRight={(
        <INatIconButton
          icon="info-circle-outline"
          size={19}
          color={String( colors?.white )}
          onPress={navToTaxonDetails}
          accessibilityLabel={t( "More-info" )}
          accessibilityHint={t( "Navigates-to-taxon-details" )}
        />
      )}
    />
  );
};

export default ExploreV2SpeciesGridItem;
