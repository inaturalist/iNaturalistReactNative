// @flow

import { useEffect, useState } from "react";
import Geocoder from "react-native-geocoder";

const useLocationName = ( latitude: ?number, longitude: ?number ): ?string => {
  const [location, setLocation] = useState( null );

  // lifted from SeekReactNative repo
  const setPlaceName = ( results: Array<Object> ) => {
    let placeName = "";

    const {
      streetName, locality, adminArea, countryCode
    } = results[0];
    // we could get as specific as sublocality here, but a lot of the results are
    // too specific to be helpful in the U.S. at least. neighborhoods, parks, etc.

    // this seems to be preferred formatting for iNat web
    // TODO: localize formatting
    // TODO: throttle requests on iOS so this doesn't error out in location picker
    const appendName = name => ( placeName.length > 0 ? `, ${name}` : name );

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

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLocationName = async ( ): Promise<?string> => {
      try {
        const results = await Geocoder.geocodePosition( { lat: latitude, lng: longitude } );
        if ( results.length === 0 || !isCurrent ) { return; }
        setLocation( setPlaceName( results ) );
      } catch ( e ) {
        console.log(
          e,
          "couldn't fetch geocoded position with coordinates: ",
          latitude,
          longitude
        );
      }
    };

    fetchLocationName( );

    return ( ) => {
      isCurrent = false;
    };
  }, [latitude, longitude] );

  return location;
};

export default useLocationName;
