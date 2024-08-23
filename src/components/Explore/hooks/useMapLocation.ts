import { useFocusEffect, useRoute } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  MapBoundaries,
  PLACE_MODE,
  useExplore
} from "providers/ExploreContext.tsx";
import {
  useCallback, useEffect, useRef, useState
} from "react";
import { BoundingBox, Region } from "react-native-maps";
import { initialMapRegion } from "stores/createExploreSlice.ts";

import useCurrentMapRegion from "./useCurrentMapRegion";

const useMapLocation = ( ) => {
  const { params } = useRoute( );
  const worldwide = params?.worldwide;
  const { dispatch, state } = useExplore( );
  const [mapBoundaries, setMapBoundaries] = useState<MapBoundaries>( );
  const [showMapBoundaryButton, setShowMapBoundaryButton] = useState( false );
  const { currentMapRegion, setCurrentMapRegion } = useCurrentMapRegion( );

  const place = state?.place;

  const hasPlace = state.swlat || state.place_id || state.lat;
  const [startAtNearby, setStartAtNearby] = useState( !hasPlace && !worldwide );

  const onPanDrag = ( ) => setShowMapBoundaryButton( true );

  const mapWasReset = state.placeMode === PLACE_MODE.NEARBY
    || state.placeMode === PLACE_MODE.WORLDWIDE;
  const placeIdWasSet = state.place_id;

  // eslint-disable-next-line max-len
  const updateMapBoundaries = useCallback( async ( newRegion: Region, boundaries?: BoundingBox ) => {
    setCurrentMapRegion( newRegion );
    if ( boundaries ) {
      const newMapBoundaries = {
        swlat: boundaries.southWest.latitude,
        swlng: boundaries.southWest.longitude,
        nelat: boundaries.northEast.latitude,
        nelng: boundaries.northEast.longitude
      };
      setMapBoundaries( newMapBoundaries );
      return newMapBoundaries;
    }
    return {};
  }, [
    setMapBoundaries,
    setCurrentMapRegion
  ] );

  const redoSearchInMapArea = ( ) => {
    if ( !mapBoundaries ) return;
    setShowMapBoundaryButton( false );
    dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_MAP_AREA } );
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
    dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_NEARBY } );
    dispatch( {
      type: EXPLORE_ACTION.SET_MAP_BOUNDARIES,
      mapBoundaries: newMapBoundaries
    } );
    setStartAtNearby( false );
  }, [
    dispatch,
    updateMapBoundaries
  ] );

  const previousPlaceGuess = useRef( state.placeMode );
  useEffect( ( ) => {
    // region gets set when a user is navigating from ExploreLocationSearch
    if ( placeIdWasSet ) {
      const { coordinates } = place.point_geojson;
      setCurrentMapRegion( {
        ...initialMapRegion,
        latitude: coordinates[1],
        longitude: coordinates[0]
      } );
    } else if ( mapWasReset ) {
      // map gets set or reset back to nearby/worldwide, but only if the placeMode
      // has changed
      if ( previousPlaceGuess.current === state.placeMode ) {
        return;
      }
      setCurrentMapRegion( {
        ...initialMapRegion,
        latitude: state?.lat,
        longitude: state?.lng
      } );
      previousPlaceGuess.current = state.placeMode;
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
