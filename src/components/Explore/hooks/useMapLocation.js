// @flow

import { useFocusEffect, useRoute } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import { useCallback, useEffect, useState } from "react";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useTranslation } from "sharedHooks";

const logger = log.extend( "useMapLocation" );

const { useRealm } = RealmContext;

const DELTA = 0.2;

const useMapLocation = ( ): object => {
  const { params } = useRoute( );
  const place = params?.place;
  const worldwide = params?.worldwide;
  const realm = useRealm( );
  const { dispatch, state } = useExplore( );
  const [mapBoundaries, setMapBoundaries] = useState( null );
  const [showMapBoundaryButton, setShowMapBoundaryButton] = useState( false );
  const [permissionRequested, setPermissionRequested] = useState( null );
  const [region, setRegion] = useState( {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  } );
  const hasPlace = state.swlat || state.place_id || state.lat;
  const [startAtNearby, setStartAtNearby] = useState( !hasPlace && !worldwide );
  const { t } = useTranslation( );

  const onPanDrag = ( ) => setShowMapBoundaryButton( true );

  const updateMapBoundaries = useCallback( async boundaries => {
    const boundaryAPIParams = {
      swlat: boundaries.southWest.latitude,
      swlng: boundaries.southWest.longitude,
      nelat: boundaries.northEast.latitude,
      nelng: boundaries.northEast.longitude,
      place_guess: t( "Map-Area" )
    };

    setMapBoundaries( boundaryAPIParams );
    return boundaryAPIParams;
  }, [t] );

  const redoSearchInMapArea = ( ) => {
    logger.info( "searching for observations with map boundaries: ", mapBoundaries );
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
      logger.info( "showing LocationPermissionGate in Explore, first install only" );
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
    logger.info( "onPermissionGranted" );
    setPermissionRequested( false );
  }, [setPermissionRequested] );

  const onPermissionBlocked = useCallback( ( ) => {
    logger.info( "onPermissionBlocked" );
    setPermissionRequested( false );
  }, [setPermissionRequested] );

  const onPermissionDenied = useCallback( ( ) => {
    logger.info( "onPermissionDenied" );
    setPermissionRequested( false );
  }, [setPermissionRequested] );

  useEffect( ( ) => {
    // region gets set when a user is navigating from ExploreLocationSearch
    if ( state.place_id ) {
      logger.info( "setting map region based on location search" );
      const { coordinates } = place.point_geojson;
      setRegion( {
        latitude: coordinates[1],
        longitude: coordinates[0],
        latitudeDelta: DELTA,
        longitudeDelta: DELTA
      } );
    } else if ( region?.latitude !== state?.lat ) {
    // map gets reset when the place changes from a selection with a place_id
    // back to nearby/worldwide, like when resetting the ExploreFilters
      logger.info( "setting map region based on filters being reset" );
      setRegion( {
        latitude: state?.lat,
        longitude: state?.lng,
        latitudeDelta: DELTA,
        longitudeDelta: DELTA
      } );
    }
  }, [place, state, region.latitude] );

  return {
    onPanDrag,
    onPermissionBlocked,
    onPermissionDenied,
    onPermissionGranted,
    onZoomToNearby,
    permissionRequested,
    redoSearchInMapArea,
    region,
    showMapBoundaryButton,
    startAtNearby,
    updateMapBoundaries
  };
};

export default useMapLocation;
