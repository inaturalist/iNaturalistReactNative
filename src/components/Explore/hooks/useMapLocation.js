// @flow

import { useFocusEffect, useRoute } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import { useCallback, useEffect, useState } from "react";
// import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useTranslation } from "sharedHooks";
import { initialMapRegion } from "stores/createExploreSlice.ts";

import useCurrentMapRegion from "./useCurrentMapRegion";

// const logger = log.extend( "useMapLocation" );

const { useRealm } = RealmContext;

const useMapLocation = ( ): Object => {
  const { params } = useRoute( );
  const worldwide = params?.worldwide;
  const realm = useRealm( );
  const { dispatch, state } = useExplore( );
  const [mapBoundaries, setMapBoundaries] = useState( null );
  const [showMapBoundaryButton, setShowMapBoundaryButton] = useState( false );
  const [permissionRequested, setPermissionRequested] = useState( null );
  const { currentMapRegion, setCurrentMapRegion } = useCurrentMapRegion( );

  const place = state?.place;

  const hasPlace = state.swlat || state.place_id || state.lat;
  const [startAtNearby, setStartAtNearby] = useState( !hasPlace && !worldwide );
  const { t } = useTranslation( );

  const onPanDrag = ( ) => setShowMapBoundaryButton( true );

  const mapWasReset = state.place_guess === t( "Nearby" ) || state.place_guess === t( "Worldwide" );
  const placeIdWasSet = state.place_id;
  const mapWasPanned = state?.lat !== currentMapRegion.lat;

  const updateMapBoundaries = useCallback( async ( newRegion, boundaries ) => {
    const boundaryAPIParams = {
      swlat: boundaries?.southWest?.latitude,
      swlng: boundaries?.southWest?.longitude,
      nelat: boundaries?.northEast?.latitude,
      nelng: boundaries?.northEast?.longitude,
      place_guess: t( "Map-Area" )
    };

    setMapBoundaries( boundaryAPIParams );
    setCurrentMapRegion( newRegion );
    return boundaryAPIParams;
  }, [t, setMapBoundaries, setCurrentMapRegion] );

  const redoSearchInMapArea = ( ) => {
    setShowMapBoundaryButton( false );
    dispatch( { type: EXPLORE_ACTION.SET_MAP_BOUNDARIES, mapBoundaries } );
  };

  useFocusEffect(
    useCallback( ( ) => {
      setShowMapBoundaryButton( false );
    }, [] )
  );

  useEffect( ( ) => {
    // ensure LocationPermissionGate only pops up on fresh install of the app
    const localPrefs = realm.objects( "LocalPreferences" )[0];
    if ( !localPrefs || localPrefs?.explore_location_permission_shown === false ) {
      // logger.debug( "showing LocationPermissionGate in Explore, first install only" );
      setPermissionRequested( true );
      safeRealmWrite( realm, ( ) => {
        if ( !localPrefs ) {
          realm.create( "LocalPreferences", { explore_location_permission_shown: true } );
        } else {
          localPrefs.explore_location_permission_shown = true;
        }
      }, "setting explore location permission shown to true in ExploreContainer" );
    }
  }, [realm] );

  const onZoomToNearby = useCallback( async nearbyBoundaries => {
    const newMapBoundaries = await updateMapBoundaries( nearbyBoundaries );
    newMapBoundaries.place_guess = t( "Nearby" );
    dispatch( {
      type: EXPLORE_ACTION.SET_MAP_BOUNDARIES,
      mapBoundaries: newMapBoundaries
    } );
    setStartAtNearby( false );
  }, [
    dispatch,
    updateMapBoundaries,
    t
  ] );

  // PermissionGate callbacks need to use useCallback, otherwise they'll
  // trigger re-renders if/when they change
  const onPermissionGranted = useCallback( ( ) => {
    // logger.debug( "onPermissionGranted" );
    setPermissionRequested( false );
  }, [setPermissionRequested] );

  const onPermissionBlocked = useCallback( ( ) => {
    // logger.debug( "onPermissionBlocked" );
    setPermissionRequested( false );
  }, [setPermissionRequested] );

  const onPermissionDenied = useCallback( ( ) => {
    // logger.debug( "onPermissionDenied" );
    setPermissionRequested( false );
  }, [setPermissionRequested] );

  useEffect( ( ) => {
    // region gets set when a user is navigating from ExploreLocationSearch
    if ( placeIdWasSet ) {
      // logger.debug( "setting map region based on location search" );
      const { coordinates } = place.point_geojson;
      setCurrentMapRegion( {
        ...initialMapRegion,
        latitude: coordinates[1],
        longitude: coordinates[0]
      } );
    } else if ( mapWasReset ) {
    // map gets set or reset back to nearby/worldwide
      // logger.debug( "setting initial nearby or worldwide map region" );
      setCurrentMapRegion( {
        ...initialMapRegion,
        latitude: state?.lat,
        longitude: state?.lng
      } );
    }
  }, [
    mapWasReset,
    mapWasPanned,
    place,
    placeIdWasSet,
    setCurrentMapRegion,
    state
  ] );

  return {
    onPanDrag,
    onPermissionBlocked,
    onPermissionDenied,
    onPermissionGranted,
    onZoomToNearby,
    permissionRequested,
    redoSearchInMapArea,
    region: currentMapRegion,
    showMapBoundaryButton,
    startAtNearby,
    updateMapBoundaries
  };
};

export default useMapLocation;
