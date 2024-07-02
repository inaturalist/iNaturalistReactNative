import { Body4 } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
    taxon:Object,
    username:string,
    withdrawn?: boolean
}

const DisagreementText = ( { taxon, username, withdrawn }: Props ): Node => {
  const { t } = useTranslation( );
  const taxonPojo = typeof ( taxon.toJSON ) === "function"
    ? taxon.toJSON( )
    : taxon;
  const {
    commonName,
    scientificName
  } = generateTaxonPieces( taxonPojo );

  // TODO add italics and styling to scientific name

  if ( withdrawn ) {
    return (
      <Body4 className="line-through">
        {t( "Disagreement", { username, commonName, scientificName } )}
      </Body4>
    );
  }

  return (
    <Body4>
      {t( "Disagreement", { username, commonName, scientificName } )}
    </Body4>
  );
};

export default DisagreementText;
