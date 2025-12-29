import type { ApiSuggestion } from "api/types";
import { ActivityIndicator, Body2 } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import MatchHeader from "./MatchHeader";

type Props = {
  suggestionsLoading: boolean;
  topSuggestion?: ApiSuggestion;
  hasNoSuggestions: boolean;
  hasOnlyOtherSuggestions: boolean;
}

const MatchScreenTopContent = ( {
  suggestionsLoading,
  topSuggestion,
  hasNoSuggestions,
  hasOnlyOtherSuggestions,
}: Props ) => {
  const { t } = useTranslation( );

  if ( suggestionsLoading ) {
    return <ActivityIndicator size={33} />;
  }

  return (
    <>
      {topSuggestion && <MatchHeader topSuggestion={topSuggestion} />}
      {hasNoSuggestions && (
        <Body2>
          {t( "The-AI-is-not-confident-Upload-to-ask-the-community" )}
        </Body2>
      )}
      {hasOnlyOtherSuggestions && (
        <Body2>
          {t( "The-AI-is-not-confident-It-may-be-one-of-the-IDs-below" )}
        </Body2>
      )}
    </>
  );
};

export default MatchScreenTopContent;
