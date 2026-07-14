import type { Props as TaxonGridItemProps } from "components/SharedComponents/TaxonGridItem";
import TaxonGridItem from "components/SharedComponents/TaxonGridItem";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props extends TaxonGridItemProps {
  count?: number;
}

const ExploreTaxonGridItem = ( {
  count,
  onPress,
  showSpeciesSeenCheckmark = false,
  style,
  taxon,
  upperRight,
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <TaxonGridItem
      headerText={
        typeof ( count ) === "number"
          ? t( "X-Observations", { count } )
          : undefined
      }
      onPress={onPress}
      showSpeciesSeenCheckmark={showSpeciesSeenCheckmark}
      style={style}
      taxon={taxon}
      upperRight={upperRight}
    />
  );
};

export default ExploreTaxonGridItem;
