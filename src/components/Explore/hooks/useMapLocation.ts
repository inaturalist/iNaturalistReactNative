import { useFocusEffect, useRoute } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import {
  useCallback, useEffect, useRef, useState
} from "react";
import { BoundingBox, Region } from "react-native-maps";
// import { log } from "sharedHelpers/logger";
import { useTranslation } from "sharedHooks";
import { initialMapRegion } from "stores/createExploreSlice.ts";

import useCurrentMapRegion from "./useCurrentMapRegion";

// const logger = log.extend( "useMapLocation" );

const useMapLocation = ( ) => {
  const { params } = useRoute( );
  const worldwide = params?.worldwide;
  const { dispatch, state } = useExplore( );
  const [mapBoundaries, setMapBoundaries] = useState<{
    swlat: number | undefined;
    swlng: number | undefined;
    nelat: number | undefined;
    nelng: number | undefined;
    place_guess: string;
  }>( );
  const [showMapBoundaryButton, setShowMapBoundaryButton] = useState( false );
  const { currentMapRegion, setCurrentMapRegion } = useCurrentMapRegion( );

  const place = state?.place;

  const hasPlace = state.swlat || state.place_id || state.lat;
  const [startAtNearby, setStartAtNearby] = useState( !hasPlace && !worldwide );
  const { t } = useTranslation( );

  const onPanDrag = ( ) => setShowMapBoundaryButton( true );

  const mapWasReset = state.place_guess === t( "Nearby" ) || state.place_guess === t( "Worldwide" );
  const placeIdWasSet = state.place_id;

  // eslint-disable-next-line max-len
  const updateMapBoundaries = useCallback( async ( newRegion: Region, boundaries?: BoundingBox ) => {
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
  }, [
    t,
    setMapBoundaries,
    setCurrentMapRegion
  ] );

  const redoSearchInMapArea = ( ) => {
    if ( !mapBoundaries ) return;
    setShowMapBoundaryButton( false );
    dispatch( { type: EXPLORE_ACTION.SET_MAP_BOUNDARIES, mapBoundaries } );
  };

  useFocusEffect(
    useCallback( ( ) => {
      setShowMapBoundaryButton( false );
    }, [] )
  );

  // eslint-disable-next-line max-len
  const onZoomToNearby = useCallback( async ( newRegion: Region, nearbyBoundaries: BoundingBox | undefined ) => {
    const newMapBoundaries = await updateMapBoundaries( newRegion, nearbyBoundaries );
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

  const previousPlaceGuess = useRef( state.place_guess );
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
      // map gets set or reset back to nearby/worldwide, but only if the place_guess
      // has changed
      if ( previousPlaceGuess.current === state.place_guess ) {
        return;
      }
      // logger.debug( "setting initial nearby or worldwide map region" );
      setCurrentMapRegion( {
        ...initialMapRegion,
        latitude: state?.lat,
        longitude: state?.lng
      } );
      previousPlaceGuess.current = state.place_guess;
    }
  }, [
    mapWasReset,
    place,
    placeIdWasSet,
    setCurrentMapRegion,
    state
  ] );

  return {
    onPanDrag,
    onZoomToNearby,
    redoSearchInMapArea,
    region: currentMapRegion,
    showMapBoundaryButton,
    startAtNearby,
    updateMapBoundaries
  };
};

export default useMapLocation;
