import classnames from "classnames";
import { Body4, DisplayTaxonName } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { useCurrentUser } from "sharedHooks";

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
  const currentUser = useCurrentUser( );

  const taxonName = (
    <DisplayTaxonName
      taxon={taxon}
      withdrawn={withdrawn}
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      prefersCommonNames={currentUser?.prefers_common_names}
      small
      topTextComponent={Body4}
      removeStyling
    />
  );

  return (
    <Trans
      i18nKey="Disagreement"
      values={{ username }}
      components={[
        <Body4 className={
          classnames(
            "italic text-justify",
            {
              "line-through": withdrawn
            }
          )
        }
        />,
        taxonName
      ]}
    />
  );
};

export default DisagreementText;
