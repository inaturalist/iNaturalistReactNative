import { Body4 } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
    taxon:Object,
    username:string
}

const DisagreementText = ( { taxon, username }: Props ): Node => {
  const { t } = useTranslation( );
  const taxonPojo = typeof ( taxon.toJSON ) === "function"
    ? taxon.toJSON( )
    : taxon;
  const {
    commonName,
    scientificName
  } = generateTaxonPieces( taxonPojo );

  // TODO add italics to scientific name,
  // and add cross out styling when withdrawn
  return (
    <Body4>
      {t( "Disagreement", { username, commonName, scientificName } )}
    </Body4>
  );
};

export default DisagreementText;
