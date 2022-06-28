  // @flow

import Geocoder from "react-native-geocoder-reborn";

// lifted from SeekReactNative repo
const setPlaceName = ( results: Array<Object> ) => {
  let placeName = "";

  const { streetName, locality, adminArea, countryCode } = results[0];
  // we could get as specific as sublocality here, but a lot of the results are
  // too specific to be helpful in the U.S. at least. neighborhoods, parks, etc.

  // this seems to be preferred formatting for iNat web
  // TODO: localize formatting
  // TODO: throttle requests on iOS so this doesn't error out in location picker
  const appendName = name => placeName.length > 0 ? `, ${name}` : name;

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

const fetchPlaceName = async ( lat: number, lng: number ): Promise<?string> => {
  try {
    const results = await Geocoder.geocodePosition( { lat, lng } );
    if ( results.length === 0 ) { return; }
    return setPlaceName( results );
  } catch ( e ) {
    console.log( e, "couldn't fetch geocoded position with coordinates: ", lat, lng );
    return null;
  }
};

export default fetchPlaceName;
