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

const useMapLocation = ( currentMapRegion, setCurrentMapRegion ) => {
  const { dispatch, state } = useExplore( );
  const [mapBoundaries, setMapBoundaries] = useState<MapBoundaries>( );
  const [showMapBoundaryButton, setShowMapBoundaryButton] = useState( false );

  const place = state?.place;

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

  const previousPlaceGuess = useRef( state.placeMode );
  useEffect( ( ) => {
    // region gets set when a user is navigating from ExploreLocationSearch
    if ( placeIdWasSet ) {
      const coordinates = place?.point_geojson?.coordinates
        ? place.point_geojson.coordinates
        : place?.bounding_box_geojson?.coordinates;
      if ( coordinates ) {
        setCurrentMapRegion( {
          ...initialMapRegion,
          latitude: coordinates[1],
          longitude: coordinates[0]
        } );
      }
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
    redoSearchInMapArea,
    region: currentMapRegion,
    showMapBoundaryButton,
    updateMapBoundaries
  };
};

export default useMapLocation;
