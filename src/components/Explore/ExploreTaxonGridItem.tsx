import type { Props as TaxonGridItemProps } from "components/SharedComponents/TaxonGridItem";
import TaxonGridItem from "components/SharedComponents/TaxonGridItem.tsx";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props extends TaxonGridItemProps {
  count?: number;
}

const ExploreTaxonGridItem = ( {
  count,
  showSpeciesSeenCheckmark = false,
  style,
  taxon
}: Props ) => {
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
    />
  );
};

export default ExploreTaxonGridItem;
