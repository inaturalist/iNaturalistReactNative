import { fetchSearchResults } from "api/search";
import type { ApiPlace } from "api/types";
import {
  Body1,
  ButtonBar,
  List2,
  SearchBar,
  ViewWrapper,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import inatPlaceTypes from "dictionaries/places";
import {
  EXPLORE_ACTION,
  useExplore,
} from "providers/ExploreContext";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import { FlatList } from "react-native";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import type { RenderLocationPermissionsGateFunction } from "sharedHooks/useLocationPermission";
import { getShadow } from "styles/global";

import EmptySearchResults from "./EmptySearchResults";
import ExploreSearchHeader from "./ExploreSearchHeader";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
} );

const Footer = ( ) => <View className="h-[336px]" />;

interface Props {
  closeModal: () => void;
  hasPermissions?: boolean;
  renderPermissionsGate: RenderLocationPermissionsGateFunction;
  requestPermissions: ( ) => void;
  updateLocation: ( location: "worldwide" | ApiPlace ) => void;
}

const ExploreLocationSearch = ( {
  closeModal,
  hasPermissions,
  renderPermissionsGate,
  requestPermissions,
  updateLocation,
}: Props ) => {
  const { t } = useTranslation( );
  const { dispatch, defaultExploreLocation } = useExplore( );

  const [locationName, setLocationName] = useState( "" );

  const resetPlace = useCallback(
    ( ) => {
      updateLocation( "worldwide" );
      closeModal();
    },
    [updateLocation, closeModal],
  );

  const { data: placeResults, isLoading, refetch }: {
    data: ApiPlace[] | null;
    isLoading: boolean;
    refetch: ( ) => void;
  } = useAuthenticatedQuery(
    ["fetchSearchResults", locationName],
    optsWithAuth => fetchSearchResults(
      {
        q: locationName,
        sources: "places",
        fields:
            "place,place.display_name,place.point_geojson,place.place_type",
        per_page: 50,
      },
      optsWithAuth,
    ),
    {
      enabled: locationName.length > 0,
    },
  );

  const onPlaceSelected = useCallback( ( place: ApiPlace ) => {
    updateLocation( place );
    closeModal();
  }, [updateLocation, closeModal] );

  const renderItem = useCallback(
    ( item: { item: ApiPlace} ) => {
      const { item: place } = item;
      return (
        <Pressable
          accessibilityRole="button"
          key={place.id}
          className="p-3 border-[0.5px] border-lightGray"
          onPress={() => onPlaceSelected( place )}
        >
          <Body1>{place.display_name}</Body1>
          {!!place.place_type && (
            <List2>{inatPlaceTypes[place.place_type]}</List2>
          )}
        </Pressable>
      );
    },
    [onPlaceSelected],
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
    if ( hasPermissions ) {
      setNearbyLocation( );
    } else {
      requestPermissions( );
    }
  };

  const emptyListComponent = useMemo( ( ) => (
    <EmptySearchResults
      isLoading={isLoading}
      searchQuery={locationName}
      refetch={refetch}
    />
  ), [isLoading, locationName, refetch] );

  const buttons = [
    {
      title: t( "NEARBY" ),
      onPress: onNearbyPressed,
      isPrimary: false,
      className: "w-1/2 mx-6",
    },
    {
      title: t( "WORLDWIDE" ),
      onPress: resetPlace,
      isPrimary: false,
      className: "w-1/2 mx-6",
    },
  ];

  return (
    <ViewWrapper testID="explore-location-search">
      <ExploreSearchHeader
        closeModal={closeModal}
        headerText={t( "SEARCH-LOCATION" )}
        resetFilters={resetPlace}
        testID="ExploreLocationSearch.close"
      />
      <View
        className="bg-white pt-2"
        style={DROP_SHADOW}
      >
        <View className="px-6">
          <SearchBar
            handleTextChange={locationText => setLocationName( locationText )}
            value={locationName}
            testID="ExploreLocationSearch.locationSearch"
          />
          <ButtonBar buttonConfiguration={buttons} containerClass="justify-center p-[15px]" />
        </View>
      </View>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={emptyListComponent}
        ListFooterComponent={Footer}
      />
      {renderPermissionsGate( { onPermissionGranted: setNearbyLocation } )}
    </ViewWrapper>
  );
};

export default ExploreLocationSearch;
