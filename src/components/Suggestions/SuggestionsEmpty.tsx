import { useRoute } from "@react-navigation/native";
import { Body1 } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import SuggestionsLoading from "./SuggestionsLoading";
import SuggestionsOffline from "./SuggestionsOffline";

interface Props {
  hasTopSuggestion?: boolean;
  isLoading: boolean;
  onTaxonChosen: ( ) => void;
  reloadSuggestions: ( ) => void;
  urlWillCrashOffline: boolean;
}

const SuggestionsEmpty = ( {
  hasTopSuggestion = false,
  isLoading,
  onTaxonChosen,
  reloadSuggestions,
  urlWillCrashOffline,
}: Props ) => {
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const { lastScreen } = params;

  const textClass = "mt-10 px-10 text-center";

  if ( urlWillCrashOffline ) {
    return (
      <SuggestionsOffline reloadSuggestions={reloadSuggestions} />
    );
  }

  if ( isLoading ) {
    return (
      <SuggestionsLoading
        onTaxonChosen={onTaxonChosen}
      />
    );
  }
  if ( !hasTopSuggestion ) {
    return (
      <>
        <Body1 className={textClass}>
          {t( "iNaturalist-has-no-ID-suggestions-for-this-photo" )}
        </Body1>
        {lastScreen === "CameraWithDevice" && (
          <Body1 className={textClass}>
            {t( "You-can-upload-this-observation-to-our-community" )}
          </Body1>
        )}
      </>
    );
  }
  return null;
};

export default SuggestionsEmpty;
