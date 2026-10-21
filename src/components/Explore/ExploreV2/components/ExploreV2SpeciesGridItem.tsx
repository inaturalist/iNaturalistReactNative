import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import { OBSERVATIONS_TAB } from "appConstants/tabs";
import ExploreTaxonGridItem from "components/Explore/ExploreTaxonGridItem";
import usePushExplore from "components/Explore/ExploreV2/hooks/usePushExplore";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import type { ExploreStackScreenProps } from "navigation/types";
import { EXPLORE_V2_ACTION, useExploreV2 } from "providers/ExploreV2Context";
import React, { useCallback } from "react";
import type { ViewStyle } from "react-native";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import { resultToSubject } from "../helpers/universalSearchSubject";

interface Props {
  count?: number;
  showSpeciesSeenCheckmark?: boolean;
  style?: ViewStyle;
  taxon: ApiTaxon;
}

const ExploreV2SpeciesGridItem = ( {
  count,
  showSpeciesSeenCheckmark = false,
  style,
  taxon,
}: Props ) => {
  const { t } = useTranslation( );
  const { dispatch, state } = useExploreV2( );
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );
  const pushExplore = usePushExplore( );

  const navToTaxonDetails = useCallback( ( ) => (
    navigation.navigate( "TaxonDetails", { id: taxon.id } )
  ), [navigation, taxon.id] );

  // Tapping the card opens a new search for this species on the observations
  // tab, keeping the rest of the current search, so back returns to this one.
  const onPress = useCallback( ( ) => {
    if ( state.subject?.type === "taxon" && state.subject.taxon.id === taxon.id ) {
      // this block handles tapping the species grid item for the taxon you've currently searched
      // I'm not sure it's necessary or that useful but I think it's fine
      dispatch( { type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB, tab: OBSERVATIONS_TAB } );
      return;
    }
    const {
      location, sortBy, speciesSortBy, filters,
    } = state;
    pushExplore( {
      search: {
        subject: resultToSubject( { type: "taxon", taxon } ),
        location,
        sortBy,
        speciesSortBy,
        filters,
      },
      activeTab: OBSERVATIONS_TAB,
    } );
  }, [dispatch, pushExplore, state, taxon] );

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
