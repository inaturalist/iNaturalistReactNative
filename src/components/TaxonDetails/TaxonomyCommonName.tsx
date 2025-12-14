import classnames from "classnames";
import { Body2 } from "components/SharedComponents";
import React from "react";

interface Props {
  commonName: string;
  scientificNameFirst?: boolean;
  isCurrentTaxon?: boolean;
}

const TaxonomyCommonName = ( {
  commonName,
  scientificNameFirst,
  isCurrentTaxon
}: Props ) => (
  <Body2
    className={
      classnames( {
        "font-bold mr-1": !scientificNameFirst,
        "text-inatGreen": isCurrentTaxon,
        underline: !isCurrentTaxon && !scientificNameFirst
      } )
    }
  >
    {scientificNameFirst && commonName && "("}
    {commonName}
    {scientificNameFirst && commonName && ")"}
  </Body2>
);

export default TaxonomyCommonName;
