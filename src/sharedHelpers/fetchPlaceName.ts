import NetInfo from "@react-native-community/netinfo";
import type { GeocodingObject } from "react-native-geocoder-reborn";
import Geocoder from "react-native-geocoder-reborn";

// 2.5 seconds, half the time as online Suggestions
// feel free to tweak this but it's here to make the camera feel speedier
// in spotty connectivity
const GEOCODER_TIMEOUT = 2500;
const TIMEOUT_ERROR_MESSAGE = "Geocoder timeout";

// lifted from SeekReactNative repo
const setPlaceName = ( results: GeocodingObject[] ): string => {
  let placeName = "";

  const {
    streetName, locality, adminArea, countryCode,
  } = results[0];
  // we could get as specific as sublocality here, but a lot of the results are
  // too specific to be helpful in the U.S. at least. neighborhoods, parks, etc.

  // this seems to be preferred formatting for iNat web
  // TODO: localize formatting
  // TODO: throttle requests on iOS so this doesn't error out in location picker
  const appendName = ( name: string ) => ( placeName.length > 0
    ? `, ${name}`
    : name );

  if ( streetName ) {
    placeName += streetName;
  }
  if ( locality ) {
    placeName += appendName( locality );
  }
  if ( adminArea ) {
    placeName += appendName( adminArea );
  }
  if ( countryCode ) {
    placeName += appendName( countryCode );
  }
  return placeName;
};

const fetchPlaceName = async ( lat?: number, lng?: number ): Promise<string | null> => {
  if ( !lat || !lng ) { return null; }
  const { isConnected } = await NetInfo.fetch( );
  if ( !isConnected ) { return null; }
  try {
    const timeoutPromise: Promise<never> = new Promise( ( _, reject ) => {
      setTimeout( ( ) => reject( new Error( TIMEOUT_ERROR_MESSAGE ) ), GEOCODER_TIMEOUT );
    } );

    // Race the geocoder against the timeout
    const results = await Promise.race( [
      Geocoder.geocodePosition( { lat, lng } ),
      timeoutPromise,
    ] );
    if ( results.length === 0 || typeof results !== "object" ) { return null; }
    return setPlaceName( results as GeocodingObject[] );
  } catch ( geocoderError ) {
    if ( ( geocoderError as Error )?.message === TIMEOUT_ERROR_MESSAGE ) {
      console.warn( "Geocoder operation timed out" );
      return null;
    }
    if ( !( geocoderError as Error )?.message?.includes( "geocodePosition failed" ) ) {
      throw geocoderError;
    }
    return null;
  }
};

export default fetchPlaceName;
