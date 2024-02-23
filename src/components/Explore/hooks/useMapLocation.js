// @flow

import { useFocusEffect, useRoute } from "@react-navigation/native";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer";
import { RealmContext } from "providers/contexts";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import { useCallback, useEffect, useState } from "react";
import { checkMultiple } from "react-native-permissions";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useTranslation } from "sharedHooks";

const logger = log.extend( "useMapLocation" );

const { useRealm } = RealmContext;

const DELTA = 0.2;

const useMapLocation = ( ): Object => {
  const { params } = useRoute( );
  const place = params?.place;
  const realm = useRealm( );
  const { state, dispatch } = useExplore( );
  const [mapBoundaries, setMapBoundaries] = useState( null );
  const [showMapBoundaryButton, setShowMapBoundaryButton] = useState( false );
  const [permissionRequested, setPermissionRequested] = useState( null );
  const [permissionsGranted, setPermissionsGranted] = useState( null );
  const [region, setRegion] = useState( {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  } );
  const { t } = useTranslation( );

  const onPanDrag = ( ) => setShowMapBoundaryButton( true );

  const updateMapBoundaries = async boundaries => {
    const boundaryAPIParams = {
      swlat: boundaries.southWest.latitude,
      swlng: boundaries.southWest.longitude,
      nelat: boundaries.northEast.latitude,
      nelng: boundaries.northEast.longitude,
      place_guess: t( "Map-Area" )
    };

    setMapBoundaries( boundaryAPIParams );
  };

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
    } else {
      const checkLocationPermissions = async ( ) => {
        const permissionResult = permissionResultFromMultiple(
          await checkMultiple( LOCATION_PERMISSIONS )
        );
        logger.info( "location permissions:", permissionResult );
        setPermissionsGranted( permissionResult === "granted" );
      };
      checkLocationPermissions( );
    }
  }, [realm] );

  const showUserLocation = useCallback( ( ) => {
    if ( state.swlat ) { return; }
    logger.info( "location permissions granted: can show user location" );
    const newMapBoundaries = mapBoundaries;
    // $FlowIgnore
    newMapBoundaries.place_guess = t( "Nearby" );
    logger.info( "updating observations with user location", newMapBoundaries );
    dispatch( {
      type: EXPLORE_ACTION.SET_MAP_BOUNDARIES,
      mapBoundaries: newMapBoundaries
    } );
  }, [state, dispatch, t, mapBoundaries] );

  // PermissionGate callbacks need to use useCallback, otherwise they'll
  // trigger re-renders if/when they change
  const onPermissionGranted = useCallback( ( ) => {
    logger.info( "onPermissionGranted" );
    setPermissionRequested( false );
    setPermissionsGranted( true );
  }, [setPermissionRequested, setPermissionsGranted] );

  const onPermissionBlocked = useCallback( ( ) => {
    logger.info( "onPermissionBlocked" );
    setPermissionRequested( false );
    setPermissionsGranted( false );
  }, [setPermissionRequested, setPermissionsGranted] );

  const onPermissionDenied = useCallback( ( ) => {
    logger.info( "onPermissionDenied" );
    setPermissionRequested( false );
    setPermissionsGranted( false );
  }, [setPermissionRequested, setPermissionsGranted] );

  useEffect( ( ) => {
    if ( permissionsGranted && mapBoundaries ) {
      showUserLocation( );
    }
  }, [permissionsGranted, showUserLocation, mapBoundaries] );

  useEffect( ( ) => {
    // region gets set when a user is navigating from ExploreLocationSearch
    if ( place ) {
      logger.info( "setting map region based on location search" );
      const { coordinates } = place.point_geojson;
      setRegion( {
        latitude: coordinates[1],
        longitude: coordinates[0],
        latitudeDelta: DELTA,
        longitudeDelta: DELTA
      } );
    }
  }, [place] );

  return {
    onPanDrag,
    onPermissionBlocked,
    onPermissionDenied,
    onPermissionGranted,
    permissionRequested,
    redoSearchInMapArea,
    region,
    showMapBoundaryButton,
    startAtNearby: permissionsGranted && !place,
    updateMapBoundaries
  };
};

export default useMapLocation;
