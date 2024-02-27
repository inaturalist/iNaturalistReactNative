// @flow

import {
  DisplayTaxonName,
  Heading1,
  Heading3,
  Heading4
} from "components/SharedComponents";
import SpeciesSeenCheckmark from "components/SharedComponents/SpeciesSeenCheckmark";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  optionalClasses?: any,
  taxon?: {
    rank: string,
    id: number
  }
}

const TaxonDetailsTitle = ( {
  optionalClasses,
  taxon
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <View className="flex-1 flex-col">
      { taxon?.rank && (
        <View className="flex-row items-center">
          <Heading4 className={optionalClasses}>
            {t( `Ranks-${taxon.rank.toUpperCase( )}` )}
          </Heading4>
          <View className="ml-3">
            <SpeciesSeenCheckmark taxonId={taxon.id} />
          </View>
        </View>
      ) }
      <DisplayTaxonName
        taxon={taxon}
        color={optionalClasses}
        topTextComponent={Heading1}
        bottomTextComponent={Heading3}
      />
    </View>
  );
};

export default TaxonDetailsTitle;
