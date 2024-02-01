// @flow

import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import fetchSearchResults from "api/search";
import classnames from "classnames";
import {
  ActivityIndicator,
  Body3,
  Button,
  Map,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useReducer,
  useRef
} from "react";
import { Keyboard } from "react-native";
import { useTheme } from "react-native-paper";
import { useAuthenticatedQuery } from "sharedHooks";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";

const DELTA = 0.02;

const initialState = {
  loading: true,
  mapType: "standard",
  locationName: null,
  region: {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  },
  hidePlaceResults: true,
  place: null
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading
      };
    case "SET_MAP_TYPE":
      return {
        ...state,
        mapType: action.mapType
      };
    case "UPDATE_REGION":
      return {
        ...state,
        region: action.region
      };

    case "SELECT_PLACE_RESULT":
      return {
        ...state,
        locationName: action.locationName,
        region: action.region,
        hidePlaceResults: true,
        place: action.place
      };
    case "UPDATE_LOCATION_NAME":
      return {
        ...state,
        locationName: action.locationName,
        hidePlaceResults: false
      };
    default:
      throw new Error();
  }
};

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

const ExploreLocationSearch = ( ): Node => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const mapViewRef = useRef();
  const locationInput = useRef();

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    hidePlaceResults,
    loading,
    locationName,
    mapType,
    region,
    place
  } = state;

  const updateRegion = async newRegion => {
    // don't update region if map hasn't actually moved
    // otherwise, it's jittery on Android
    if (
      newRegion.latitude.toFixed( 6 ) === region.latitude?.toFixed( 6 )
      && newRegion.longitude.toFixed( 6 ) === region.longitude?.toFixed( 6 )
      && newRegion.latitudeDelta.toFixed( 6 ) === region.latitudeDelta?.toFixed( 6 )
    ) {
      return;
    }

    dispatch( {
      type: "UPDATE_REGION",
      region: newRegion
    } );
  };

  const updateLocationName = useCallback( name => {
    dispatch( { type: "UPDATE_LOCATION_NAME", locationName: name } );
  }, [] );

  const setMapReady = () => dispatch( { type: "SET_LOADING", loading: false } );

  const selectPlaceResult = newPlace => {
    const { coordinates } = newPlace.point_geojson;
    dispatch( {
      type: "SELECT_PLACE_RESULT",
      locationName: newPlace.display_name,
      region: {
        ...region,
        latitude: coordinates[1],
        longitude: coordinates[0]
        // TODO: use a meaningful delta
      },
      place: newPlace
    } );
  };

  // this seems necessary for clearing the cache between searches
  queryClient.invalidateQueries( ["fetchSearchResults"] );

  const { data: placeResults } = useAuthenticatedQuery(
    ["fetchSearchResults", locationName],
    optsWithAuth => fetchSearchResults(
      {
        q: locationName,
        sources: "places",
        fields: "place,place.display_name,place.point_geojson"
      },
      optsWithAuth
    )
  );

  const onPlaceSelected = useCallback(
    () => {
      navigation.navigate( "Explore", { place } );
    },
    [navigation, place]
  );

  return (
    <ViewWrapper testID="explore-location-search" className="flex-1">
      <View className="flex-grow">
        <View className="z-20">
          <View
            className="bg-white h-[27px] rounded-lg absolute top-[85px] right-[26px] left-[26px]"
            style={getShadow( theme.colors.primary )}
          >
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <Body3 className="pt-[7px] pl-[14px]">
              TODO: interacting with the map does not change filters
            </Body3>
          </View>
          <SearchBar
            handleTextChange={locationText => {
              // only update location name when a user is typing,
              // not when a user selects a location from the dropdown
              if ( locationInput?.current?.isFocused() ) {
                updateLocationName( locationText );
              }
            }}
            value={locationName}
            testID="LocationPicker.locationSearch"
            containerClass="absolute top-[20px] right-[26px] left-[26px]"
            hasShadow
            input={locationInput}
          />
          <View
            className="absolute top-[65px] right-[26px] left-[26px] bg-white rounded-lg z-100"
            style={getShadow( theme.colors.primary )}
          >
            {!hidePlaceResults
              && placeResults?.map( p => (
                <Pressable
                  accessibilityRole="button"
                  key={p.id}
                  className="p-2 border-[0.5px] border-lightGray"
                  onPress={() => {
                    selectPlaceResult( p );
                    Keyboard.dismiss();
                  }}
                >
                  <Body3>{p.display_name}</Body3>
                </Pressable>
              ) )}
          </View>
        </View>
        <View className="top-1/2 left-1/2 absolute z-10">
          {loading && (
            <View
              style={getShadow( theme.colors.primary )}
              className={classnames(
                "h-[80px]",
                "w-[80px]",
                "bg-white",
                "right-[40px]",
                "bottom-[40px]",
                "justify-center",
                "rounded-full"
              )}
            >
              <ActivityIndicator size={50} />
            </View>
          )}
        </View>
        <Map
          className="h-full"
          showsCompass={false}
          region={region}
          mapViewRef={mapViewRef}
          mapType={mapType}
          onRegionChangeComplete={async newRegion => {
            updateRegion( newRegion );
          }}
          onMapReady={setMapReady}
          showCurrentLocationButton
          showSwitchMapTypeButton
          obsLatitude={region.latitude}
          obsLongitude={region.longitude}
          testID="ExploreLocationSearch.Map"
        />
      </View>
      <View className="h-[73px] justify-center">
        <Button
          className="mx-[25px]"
          onPress={onPlaceSelected}
          testID="ExploreLocationSearch.saveButton"
          text={t( "SEARCH-LOCATION" )}
          level="neutral"
        />
      </View>
    </ViewWrapper>
  );
};

export default ExploreLocationSearch;
