import { INatIcon } from "components/SharedComponents";
import type { Props as TaxonGridItemProps } from "components/SharedComponents/TaxonGridItem";
import TaxonGridItem from "components/SharedComponents/TaxonGridItem.tsx";
import { Pressable } from "components/styledComponents";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props extends TaxonGridItemProps {
  count?: number;
  setCurrentExploreView: ( exploreView: "observations" ) => void
}

const ExploreTaxonGridItem = ( {
  count,
  showSpeciesSeenCheckmark = false,
  style,
  taxon,
  setCurrentExploreView
}: Props ) => {
  const { dispatch } = useExplore( );
  const { t } = useTranslation( );
  return (
    <TaxonGridItem
      headerText={
        typeof ( count ) === "number"
          ? t( "X-Observations", { count } )
          : undefined
      }
      showSpeciesSeenCheckmark={showSpeciesSeenCheckmark}
      style={style}
      taxon={taxon}
      upperRight={count && (
        <Pressable
          accessibilityRole="button"
          onPress={( ) => {
            if ( !( taxon?.id && taxon?.name ) ) return;
            dispatch( {
              type: EXPLORE_ACTION.CHANGE_TAXON,
              taxon: { id: taxon.id },
              taxonId: taxon?.id,
              taxonName: taxon?.preferred_common_name || taxon?.name
            } );
            setCurrentExploreView( "observations" );
          }}
        >
          <INatIcon name="observations" size={15} color={String( colors?.white )} dropShadow />
        </Pressable>
      )}
    />
  );
};

export default ExploreTaxonGridItem;
