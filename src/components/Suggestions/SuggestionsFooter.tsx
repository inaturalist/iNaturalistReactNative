/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable max-len */
import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  Body3,
  Button,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { formatISONoTimezone } from "sharedHelpers/dateAndTime";
import { useDebugMode, useTranslation } from "sharedHooks";

import Attribution from "./Attribution";

type Props = {
  debugData: Object,
  observers: Array<string>,
  reloadSuggestions: Function,
  showLocationButton: boolean,
  showSuggestionsWithLocation: boolean
};

const SuggestionsFooter = ( {
  debugData,
  observers,
  reloadSuggestions,
  showLocationButton = false,
  showSuggestionsWithLocation
}: Props ): Node => {
  const { t } = useTranslation( );
  const { isDebug } = useDebugMode( );
  const navigation = useNavigation( );
  const navToObsEdit = useCallback( ( ) => navigation.navigate( "ObsEdit", {
    lastScreen: "Suggestions"
  } ), [navigation] );

  return (
    <>
      {showLocationButton && (
        <>
          <View className="px-4 py-6">
            {showSuggestionsWithLocation
              ? (
                <Button
                  text={t( "IGNORE-LOCATION" )}
                  onPress={( ) => reloadSuggestions( { showLocation: false } )}
                  accessibilityLabel={t( "Search-suggestions-without-location" )}
                />
              )
              : (
                <Button
                  text={t( "USE-LOCATION" )}
                  onPress={( ) => reloadSuggestions( { showLocation: true } )}
                  accessibilityLabel={t( "Search-suggestions-with-location" )}
                />

              )}
          </View>
          <Attribution observers={observers} />
        </>
      )}
      <Body1
        className="underline text-center py-6"
        onPress={navToObsEdit}
        accessibilityRole="link"
        accessibilityHint={t( "Navigates-to-observation-edit-screen" )}
      >
        {t( "Add-an-ID-Later" )}
      </Body1>
      { isDebug && (
        <View className="bg-deeppink text-white p-3">
          <Heading4 className="text-white">Diagnostics</Heading4>
          <Body3 className="text-white">Online suggestions URI: {JSON.stringify( debugData?.selectedPhotoUri )}</Body3>
          <Body3 className="text-white">Online suggestions updated at: {formatISONoTimezone( debugData?.onlineSuggestionsUpdatedAt )}</Body3>
          <Body3 className="text-white">Online suggestions timed out: {JSON.stringify( debugData?.timedOut )}</Body3>
          <Body3 className="text-white">Online suggestions using location: {JSON.stringify( debugData?.showSuggestionsWithLocation )}</Body3>
          <Body3 className="text-white">Top suggestion type: {JSON.stringify( debugData?.topSuggestionType )}</Body3>
          <Body3 className="text-white">Num online suggestions: {JSON.stringify( debugData?.onlineSuggestions?.results.length )}</Body3>
          <Body3 className="text-white">Num offline suggestions: {JSON.stringify( debugData?.offlineSuggestions?.length )}</Body3>
          <Body3 className="text-white">Error loading online: {JSON.stringify( debugData?.onlineSuggestionsError )}</Body3>
        </View>
      )}
    </>
  );
};
export default SuggestionsFooter;
