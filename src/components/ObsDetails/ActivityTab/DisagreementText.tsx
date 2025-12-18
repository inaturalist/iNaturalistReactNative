import { Body4, DisplayTaxonName } from "components/SharedComponents";
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
  };
  username: string;
  withdrawn?: boolean;
}

// TODO replace when we've properly typed Realm object
interface User {
  prefers_common_names?: boolean;
  prefers_scientific_name_first?: boolean;
}

const DisagreementText = ( { taxon, username, withdrawn }: Props ) => {
  const currentUser = useCurrentUser( ) as User;

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
          <DisplayTaxonName
            key="0"
            layout="horizontal"
            prefersCommonNames={currentUser?.prefers_common_names}
            removeStyling
            scientificNameFirst={currentUser?.prefers_scientific_name_first}
            small
            taxon={taxon}
            topTextComponent={Body4}
            withdrawn={withdrawn}
          />
        ]}
      />
    </Body4>
  );
};

export default DisagreementText;
