import { useRoute } from "@react-navigation/native";
import {
  Body1
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

import SuggestionsLoading from "./SuggestionsLoading";

interface Props {
  hasTopSuggestion?: boolean,
  isLoading: boolean,
  onTaxonChosen: Function
}

const SuggestionsEmpty = ( {
  hasTopSuggestion = false,
  isLoading,
  onTaxonChosen
}: Props ): Node => {
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const { lastScreen } = params;

  const textClass = "mt-10 px-10 text-center";

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
