// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ActivityIndicator,
  Body1,
  Button
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  hasTopSuggestion?: boolean,
  loading: boolean
}

const SuggestionsEmpty = ( {
  hasTopSuggestion = false,
  loading
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { lastScreen } = params;

  const textClass = "mt-10 px-10 text-center";

  if ( loading ) {
    return (
      <View className="justify-center items-center mt-5" testID="SuggestionsList.loading">
        <ActivityIndicator size={50} />
      </View>
    );
  }
  if ( !hasTopSuggestion ) {
    return (
      <>
        <Body1 className={textClass}>
          {t( "iNaturalist-has-no-ID-suggestions-for-this-photo" )}
        </Body1>
        {lastScreen === "CameraWithDevice" && (
          <>
            <Body1 className={textClass}>
              {t( "You-can-upload-this-observation-to-our-community" )}
            </Body1>
            <Button
              className="mx-5 mt-10"
              text={t( "CONTINUE" )}
              onPress={( ) => navigation.navigate( "ObsEdit", { lastScreen: "Suggestions" } )}
              level="focus"
            />
          </>
        )}
      </>
    );
  }
  return null;
};

export default SuggestionsEmpty;
