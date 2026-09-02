import type { MapBoundaries } from "providers/ExploreContext";
import type { LatLng, Region } from "react-native-maps";
import createUTFPosition from "sharedHelpers/createUTFPosition";
import { EnvConfig } from "sharedHelpers/envConfig";
import getDataForPixel from "sharedHelpers/fetchUTFGridData";

export const OBSCURATION_CELL_SIZE = 0.2;
const API_URL = EnvConfig.API_URL || process.env.API_URL || "https://api.inaturalist.org/v2";

function getTileUrl( apiUrl: string ) {
  try {
    const parsedUrl = new URL( apiUrl );
    if ( parsedUrl.hostname === "api.inaturalist.org" ) {
      // tiles should be requested from tiles.inaturalist.org for better resource
      // balancing
      parsedUrl.hostname = "tiles.inaturalist.org";
      return parsedUrl.toString();
    }
    return apiUrl;
  } catch {
    return apiUrl;
  }
}
export const TILE_URL = getTileUrl( API_URL );
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

function metersPerDegreeLatitude( latitude: number ): number {
  const phi = ( latitude * Math.PI ) / 180;

  return (
    111132.92
    - 559.82 * Math.cos( 2 * phi )
    + 1.175 * Math.cos( 4 * phi )
    - 0.0023 * Math.cos( 6 * phi )
  );
}

export function metersToLatitudeDelta(
  meters: number,
  latitude: number,
): number {
  return meters / metersPerDegreeLatitude( latitude );
}

export function latitudeDeltaToMeters(
  latitudeDelta: number,
  latitude: number,
): number {
  return latitudeDelta * metersPerDegreeLatitude( latitude );
}

export function regionFromBounds( bounds: MapBoundaries ): Region {
  const {
    nelat, nelng, swlat, swlng,
  } = bounds;
  const latitudeDelta = Math.abs( Number( nelat ) - Number( swlat ) );
  const longitudeDelta = Math.abs( Number( nelng ) - Number( swlng ) );

  return {
    latitude: nelat - ( latitudeDelta / 2 ),
    longitude: nelng - ( longitudeDelta / 2 ),
    latitudeDelta,
    longitudeDelta,
  };
}

export function getMapRegion( totalBounds: MapBoundaries ): Region {
  const { latitudeDelta, longitudeDelta, ...center } = regionFromBounds( totalBounds );

  return {
    ...center,
    latitudeDelta: Math.min( latitudeDelta + latitudeDelta * 0.4, 89 ),
    longitudeDelta: Math.min( longitudeDelta + longitudeDelta * 0.4, 179 ),
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
