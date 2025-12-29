import type { MapBoundaries } from "providers/ExploreContext";
import Config from "react-native-config";
import type { LatLng, Region } from "react-native-maps";
import createUTFPosition from "sharedHelpers/createUTFPosition";
import getDataForPixel from "sharedHelpers/fetchUTFGridData";

export const OBSCURATION_CELL_SIZE = 0.2;
// tiles should be requested from tiles.inaturalist.org for better resource
// balancing
const API_URL = Config.API_URL || process.env.API_URL || "https://api.inaturalist.org/v2";
export const TILE_URL = API_URL.match( /api\.inaturalist\.org/ )
  ? API_URL.replace( "api.inaturalist", "tiles.inaturalist" )
  : API_URL;
const POINT_TILES_ENDPOINT = `${TILE_URL}/points`;

export function calculateZoom( width: number, delta: number ) {
  return Math.log2( 360 * ( width / 256 / delta ) ) + 1;
}

// Kind of the inverse of calculateZoom. Probably not actually accurate for
// longitude, but works for our purposes
export function zoomToDeltas( zoom: number, screenWidth: number, screenHeight: number ) {
  const longitudeDelta = screenWidth / 256 / ( 2 ** zoom / 360 );
  const latitudeDelta = screenHeight / 256 / ( 2 ** zoom / 360 );
  return [latitudeDelta, longitudeDelta];
}

// Adapted from
// https://github.com/inaturalist/inaturalist/blob/main/app/assets/javascripts/inaturalist/map3.js.erb#L1500
export function obscurationCellForLatLng( lat: number, lng: number ) {
  const coords = [lat, lng];
  const firstCorner = [
    coords[0] - ( coords[0] % OBSCURATION_CELL_SIZE ),
    coords[1] - ( coords[1] % OBSCURATION_CELL_SIZE ),
  ];
  const secondCorner = [firstCorner[0], firstCorner[1]];
  coords.forEach( ( value, index ) => {
    if ( value < secondCorner[index] ) {
      secondCorner[index] -= OBSCURATION_CELL_SIZE;
    } else {
      secondCorner[index] += OBSCURATION_CELL_SIZE;
    }
  } );
  return {
    minLat: Math.min( firstCorner[0], secondCorner[0] ),
    minLng: Math.min( firstCorner[1], secondCorner[1] ),
    maxLat: Math.max( firstCorner[0], secondCorner[0] ),
    maxLng: Math.max( firstCorner[1], secondCorner[1] ),
  };
}

// Adapted from iNat Android LocationChooserActivity.java computeOffset function
const EARTH_RADIUS = 6371000; // Earth radius in meters
export function metersToLatitudeDelta( meters: number, latitude: number ): number {
  // Calculate latitude delta in radians
  const latitudeDeltaRadians
    = meters / ( EARTH_RADIUS * Math.cos( ( latitude * Math.PI ) / 180 ) );

  // Convert latitude delta to degrees
  const latitudeDelta = ( latitudeDeltaRadians * 180 ) / Math.PI;
  return latitudeDelta;
}

export function getMapRegion( totalBounds: MapBoundaries ): Region {
  const {
    nelat, nelng, swlat, swlng,
  } = totalBounds;
  // Deltas shouldn't be negative
  const latDelta = Math.abs( Number( nelat ) - Number( swlat ) );
  const lngDelta = Math.abs( Number( nelng ) - Number( swlng ) );
  const lat = nelat - ( latDelta / 2 );
  const lng = nelng - ( lngDelta / 2 );

  return {
    latitude: lat,
    longitude: lng,
    // Pad the detlas so the user sees the full range, make sure we don't
    // specify impossible deltas like 190 degrees of latitude
    latitudeDelta: Math.min( latDelta + latDelta * 0.4, 89 ),
    longitudeDelta: Math.min( lngDelta + lngDelta * 0.4, 179 ),
  };
}

export async function fetchObservationUUID(
  currentZoom: number,
  latLng: LatLng,
  params: Record<string, unknown>,
) {
  const UTFPosition = createUTFPosition( currentZoom, latLng.latitude, latLng.longitude );
  const {
    mTilePositionX,
    mTilePositionY,
    mPixelPositionX,
    mPixelPositionY,
  } = UTFPosition;
  const tilesParams: Record<string, unknown> = {
    ...params,
    style: "geotilegrid",
  };
  const gridQuery = Object.keys( tilesParams )
    .map( key => `${key}=${tilesParams[key]}` ).join( "&" );

  const gridUrl = `${POINT_TILES_ENDPOINT}/${currentZoom}/${mTilePositionX}/${mTilePositionY}`
    + ".grid.json";
  const gridUrlTemplate = `${gridUrl}?${gridQuery}`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };

  const response = await fetch( gridUrlTemplate, options );
  const json = await response.json( );

  const observation = getDataForPixel( mPixelPositionX, mPixelPositionY, json );
  const uuid = observation?.uuid;
  return uuid;
}
