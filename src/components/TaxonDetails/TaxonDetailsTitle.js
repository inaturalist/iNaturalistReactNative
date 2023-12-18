// @flow

import {
  DisplayTaxonName,
  Heading1,
  Heading3,
  Heading4
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  optionalClasses?: any,
  taxon?: {
    rank: string
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
        <Heading4 className={optionalClasses}>{t( `Ranks-${taxon.rank.toUpperCase( )}` )}</Heading4>
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
