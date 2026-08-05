import {
  Body1,
  Button,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import {
  MY_OBSERVATIONS_ACTION,
  useMyObservations,
} from "providers/MyObservationsContext";
import React from "react";
import { useTranslation } from "sharedHooks";

const SearchEmptyState = ( ) => {
  const { t } = useTranslation( );
  const { dispatch } = useMyObservations( );

  return (
    <View className="flex-1 px-5 items-center justify-center">
      <Body1 className="text-center mb-6">
        {t( "Looks-like-you-havent-observed-this-yet-time-to-keep-exploring" )}
      </Body1>
      <Button
        level="focus"
        className="w-full"
        text={t( "RESET-SEARCH" )}
        onPress={( ) => dispatch( {
          type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH,
        } )}
        testID="MyObservationsSearchEmptyState.reset"
      />
    </View>
  );
};

export default SearchEmptyState;
