import {
  Body3,
  INatIconButton,
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import {
  MY_OBSERVATIONS_ACTION,
  useMyObservations,
} from "providers/MyObservationsContext";
import React from "react";
import type { RealmUser } from "realmModels/types";
import { useCurrentUser, useTranslation } from "sharedHooks";

const SearchedTaxonBanner = ( ) => {
  const { t } = useTranslation( );
  const { state, dispatch } = useMyObservations( );
  const { searchedTaxon } = state;

  // The Realm `User` class doesn't declare its schema fields as typed
  // instance properties (see realmModels/User.ts), so cast to the typed
  // RealmUser interface to access the user's name-display prefs.
  const currentUser = useCurrentUser( ) as RealmUser | null;

  if ( !searchedTaxon ) return null;

  // Mirrors DisplayTaxonName: show scientific name when the user has
  // opted into scientific-first or opted out of common names;
  // otherwise show common name (falling back to scientific if missing).
  const preferScientific = currentUser?.prefers_scientific_name_first === true
    || currentUser?.prefers_common_names === false;
  const displayName = preferScientific
    ? searchedTaxon.name
    : ( searchedTaxon.preferredCommonName || searchedTaxon.name );

  return (
    <View
      className="flex-row items-center bg-white space-x-[20px]"
      testID="SearchedTaxonBanner"
    >
      <View className="flex-1 flex-row items-center space-x-[10px]">
        <View className="w-[44px] h-[44px] bg-lightGray">
          {searchedTaxon.iconUri && (
            <Image
              source={{ uri: searchedTaxon.iconUri }}
              className="w-full h-full"
              accessibilityIgnoresInvertColors
            />
          )}
        </View>
        <Body3 className="flex-1" numberOfLines={1}>
          {displayName}
        </Body3>
      </View>
      <INatIconButton
        icon="close"
        size={14}
        accessibilityLabel={t( "Close-search" )}
        onPress={( ) => dispatch( {
          type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH,
        } )}
      />
    </View>
  );
};

export default SearchedTaxonBanner;
