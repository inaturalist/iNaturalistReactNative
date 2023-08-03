// @flow

import type { Node } from "react";
import React, { useEffect, useReducer } from "react";
import { useInfiniteObservationsScroll, useUserLocation } from "sharedHooks";

import Explore from "./Explore";

const DELTA = 0.2;

const initialState = {
  region: {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
    place_guess: false
  },
  exploreParams: {
    taxon_id: 3,
    lat: 0.0,
    lng: 0.0
  },
  exploreView: "observations"
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_LOCATION":
      return {
        ...state,
        region: action.region,
        exploreParams: {
          ...state.exploreParams,
          lat: action.region.latitude,
          lng: action.region.longitude
        }
      };
    case "CHANGE_EXPLORE_VIEW":
      return {
        ...state,
        exploreView: action.exploreView
      };
    default:
      throw new Error( );
  }
};

const ExploreContainer = ( ): Node => {
  const { latLng } = useUserLocation( { skipPlaceGuess: false } );

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    region,
    exploreParams,
    exploreView
  } = state;

  const {
    observations, isFetchingNextPage, fetchNextPage
  } = useInfiniteObservationsScroll( { upsert: false, params: exploreParams } );

  useEffect( ( ) => {
    if ( latLng?.latitude && latLng?.latitude !== region.latitude ) {
      dispatch( {
        type: "SET_LOCATION",
        region: {
          ...region,
          latitude: latLng.latitude,
          longitude: latLng.longitude,
          place_guess: latLng.place_guess
        }
      } );
    }
  }, [latLng, region] );

  const changeExploreView = newView => {
    dispatch( {
      type: "CHANGE_EXPLORE_VIEW",
      exploreView: newView
    } );
  };

  return (
    <Explore
      observations={observations}
      isFetchingNextPage={isFetchingNextPage}
      onEndReached={fetchNextPage}
      region={region}
      exploreView={exploreView}
      changeExploreView={changeExploreView}
    />
  );
};

export default ExploreContainer;
