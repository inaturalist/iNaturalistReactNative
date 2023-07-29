// @flow

import type { Node } from "react";
import React, { useEffect, useReducer } from "react";
import { useInfiniteScroll, useUserLocation } from "sharedHooks";

import Explore from "./Explore";

const DELTA = 0.2;

const initialState = {
  region: {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
    place_guess: false
  }
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_LOCATION":
      return {
        ...state,
        region: action.region
      };
    default:
      throw new Error( );
  }
};

const ExploreContainer = ( ): Node => {
  // const { t } = useTranslation( );
  const { latLng } = useUserLocation( { skipPlaceGuess: false } );

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    region
  } = state;

  const {
    observations, isFetchingNextPage, fetchNextPage
  } = useInfiniteScroll( { upsert: false } );

  useEffect( ( ) => {
    if ( latLng?.latitude && latLng?.latitude !== region.latitude ) {
      console.log( latLng, "latlng" );
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

  return (
    <Explore
      observations={observations}
      isFetchingNextPage={isFetchingNextPage}
      onEndReached={fetchNextPage}
      region={region}
    />
  );
};

export default ExploreContainer;
