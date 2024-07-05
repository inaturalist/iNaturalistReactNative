import { Body4 } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { generateTaxonPieces } from "sharedHelpers/taxon";

interface Props {
    taxon:{
        id: number;
        name: string;
        preferred_common_name?: string;
        rank: string;
        rank_level: number;
      },
    username: string,
    withdrawn?: boolean
}

const DisagreementText = ( { taxon, username, withdrawn }: Props ): Node => {
  const taxonPojo = typeof ( taxon.toJSON ) === "function"
    ? taxon.toJSON( )
    : taxon;
  const {
    commonName,
    scientificName
  } = generateTaxonPieces( taxonPojo );

  if ( withdrawn ) {
    return (
      <Trans
        i18nKey="Disagreement"
        values={{ username, commonName, scientificName }}
        components={[
          <Body4 className="line-through" />,
          <Body4 className="line-through italic" />
        ]}
      />
    );
  }

  return (
    <Trans
      i18nKey="Disagreement"
      values={{ username, commonName, scientificName }}
      components={[<Body4 />, <Body4 className="italic" />]}
    />
  );
};

export default DisagreementText;
