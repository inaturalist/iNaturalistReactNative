import { Body4, DisplayTaxonName } from "components/SharedComponents";
import type { FC } from "react";
import React, { useCallback } from "react";
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

// TODO replace when we've properly typed Realm object
interface User {
  prefers_common_names?: boolean;
  prefers_scientific_name_first?: boolean
}

const DisagreementText = ( { taxon, username, withdrawn }: Props ) => {
  const currentUser = useCurrentUser( ) as User;

  const showTaxonName = useCallback( ( fontComponent: FC ) => (
    <DisplayTaxonName
      layout="horizontal"
      prefersCommonNames={currentUser?.prefers_common_names}
      removeStyling
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      small
      taxon={taxon}
      topTextComponent={fontComponent}
      withdrawn={withdrawn}
    />
  ), [
    currentUser?.prefers_common_names,
    currentUser?.prefers_scientific_name_first,
    taxon,
    withdrawn
  ] );

  return (
    <Body4
      className={
        withdrawn
          ? "line-through"
          : undefined
      }
    >
      <Trans
        i18nKey="Disagreement"
        values={{ username }}
        components={[
          showTaxonName( Body4 )
        ]}
      />
    </Body4>
  );
};

export default DisagreementText;
