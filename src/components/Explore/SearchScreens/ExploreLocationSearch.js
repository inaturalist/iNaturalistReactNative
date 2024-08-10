// @flow

import fetchSearchResults from "api/search";
import {
  ActivityIndicator,
  Body3,
  Button,
  Heading4,
  INatIconButton,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import inatPlaceTypes from "dictionaries/places";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { FlatList } from "react-native";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4
} );

type Props = {
  closeModal: Function,
  updateLocation: Function
};

const ExploreLocationSearch = ( { closeModal, updateLocation }: Props ): Node => {
  const { t } = useTranslation( );
  const { dispatch, defaultExploreLocation } = useExplore( );

  const [locationName, setLocationName] = useState( "" );

  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );

  const resetPlace = useCallback(
    ( ) => {
      updateLocation( "worldwide" );
      closeModal();
    },
    [updateLocation, closeModal]
  );

  const { data: placeResults, isLoading } = useAuthenticatedQuery(
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
      updateLocation( place );
      closeModal();
    },
    [updateLocation, closeModal]
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

  const data = placeResults || [];

  const setNearbyLocation = useCallback( ( ) => {
    async function getNearbyLocation( ) {
      const exploreLocation = await defaultExploreLocation( );
      // exploreLocation has a placeMode already
      // dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_NEARBY } );
      dispatch( { type: EXPLORE_ACTION.SET_EXPLORE_LOCATION, exploreLocation } );
      closeModal();
    }
    getNearbyLocation( );
  }, [dispatch, defaultExploreLocation, closeModal] );

  const onNearbyPressed = () => {
    if ( !hasPermissions ) {
      requestPermissions( );
    } else {
      setNearbyLocation( );
    }
  };

  return (
    <ViewWrapper testID="explore-location-search">
      <View className="flex-row justify-center p-5 bg-white">
        <INatIconButton
          testID="ExploreTaxonSearch.close"
          size={18}
          icon="back"
          className="absolute top-2 left-3 z-10"
          onPress={( ) => closeModal()}
          accessibilityLabel={t( "SEARCH-LOCATION" )}
        />
        <Heading4>{t( "SEARCH-LOCATION" )}</Heading4>
        <Body3 onPress={resetPlace} className="absolute top-4 right-4">
          {t( "Reset-verb" )}
        </Body3>
      </View>
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
            onPress={onNearbyPressed}
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
      {isLoading
        ? (
          <View className="p-4">
            <ActivityIndicator size={40} />
          </View>
        )
        : (
          <FlatList
            keyboardShouldPersistTaps="always"
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        )}
      {renderPermissionsGate( { onPermissionGranted: setNearbyLocation } )}
    </ViewWrapper>
  );
};

export default ExploreLocationSearch;
