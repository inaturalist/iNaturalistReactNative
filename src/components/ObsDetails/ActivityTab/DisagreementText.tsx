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

  const showTaxonName = fontComponent => (
    <DisplayTaxonName
      prefersCommonNames={currentUser?.prefers_common_names}
      removeStyling
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      small
      taxon={taxon}
      topTextComponent={fontComponent}
      withdrawn={withdrawn}
    />
  );

  return (
    <Trans
      i18nKey="Disagreement"
      values={{ username }}
      components={[
        <Body4 className={
          classnames(
            {
              "line-through": withdrawn
            }
          )
        }
        />,
        showTaxonName( Body4 )
      ]}
    />
  );
};

export default DisagreementText;
