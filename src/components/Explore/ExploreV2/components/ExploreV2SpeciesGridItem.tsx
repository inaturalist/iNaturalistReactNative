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

import { resultToSubject } from "../helpers/universalSearchSubject";

interface Props {
  count?: number;
  style?: object;
  taxon: ApiTaxon;
}

const ExploreV2SpeciesGridItem = ( {
  count,
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
      subject: resultToSubject( { type: "taxon", taxon } ),
    } );
    dispatch( { type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB, tab: OBSERVATIONS_TAB } );
  }, [dispatch, taxon] );

  return (
    <ExploreTaxonGridItem
      count={count}
      onPress={onPress}
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
