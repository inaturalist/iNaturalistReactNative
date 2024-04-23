// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  Body3,
  Button,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import { Pressable, View } from "components/styledComponents";
import inatPlaceTypes from "dictionaries/places";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import { FlatList } from "react-native";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4
} );

const ExploreLocationSearch = ( ): Node => {
  const navigation = useNavigation();
  const { t } = useTranslation( );

  const [locationName, setLocationName] = useState( "" );
  const [permissionNeeded, setPermissionNeeded] = useState( false );

  const resetPlace = useCallback( ( ) => navigation.navigate( "Explore", {
    worldwide: true
  } ), [navigation] );

  const { data: placeResults } = useAuthenticatedQuery(
    ["fetchSearchResults", locationName],
    optsWithAuth => fetchSearchResults(
      {
        q: locationName,
        sources: "places",
        fields:
            "place,place.display_name,place.point_geojson,place.place_type",
        per_page: 50
      },
      optsWithAuth
    ),
    {
      enabled: locationName.length > 0
    }
  );

  const onPlaceSelected = useCallback(
    place => {
      navigation.navigate( "Explore", { place } );
    },
    [navigation]
  );

  const renderItem = useCallback(
    ( { item: place } ) => (
      <Pressable
        accessibilityRole="button"
        key={place.id}
        className="p-2 border-[0.5px] border-lightGray"
        onPress={() => onPlaceSelected( place )}
      >
        <Body3>{place.display_name}</Body3>
        {!!place.place_type && (
          <Body3>{inatPlaceTypes[place.place_type]}</Body3>
        )}
      </Pressable>
    ),
    [onPlaceSelected]
  );

  useEffect( ( ) => {
    const resetButton = ( ) => (
      <Body3 onPress={resetPlace}>
        {t( "Reset" )}
      </Body3>
    );

    navigation.setOptions( {
      headerRight: resetButton
    } );
  }, [navigation, t, resetPlace] );

  const data = placeResults || [];

  return (
    <ViewWrapper testID="explore-location-search">
      <View
        className="bg-white pt-2 pb-5"
        style={DROP_SHADOW}
      >
        <View className="px-6">
          <SearchBar
            handleTextChange={locationText => setLocationName( locationText )}
            value={locationName}
            testID="LocationPicker.locationSearch"
          />
        </View>
        <View className="flex-row px-3 mt-5 justify-evenly">
          <Button
            className="w-1/2"
            onPress={( ) => setPermissionNeeded( true )}
            text={t( "NEARBY" )}
          />
          <View className="px-2" />
          <Button
            className="w-1/2"
            onPress={resetPlace}
            text={t( "WORLDWIDE" )}
          />
        </View>
      </View>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <LocationPermissionGate
        permissionNeeded={permissionNeeded}
        withoutNavigation
        onPermissionGranted={( ) => {
          setPermissionNeeded( false );
          navigation.navigate( "Explore", { nearby: true } );
        }}
        onPermissionDenied={( ) => {
          setPermissionNeeded( false );
        }}
        onPermissionBlocked={( ) => {
          setPermissionNeeded( false );
        }}
      />
    </ViewWrapper>
  );
};

export default ExploreLocationSearch;
