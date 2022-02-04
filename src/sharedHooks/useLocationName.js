// @flow

import { useEffect, useState } from "react";
import Geocoder from "react-native-geocoder";

const useLocationName = ( latitude: ?number, longitude: ?number ): ?string => {
  const [location, setLocation] = useState( null );

  // lifted from SeekReactNative repo
  const setPlaceName = ( results: Array<Object> ) => {
    let placeName = null;

    const { locality, subAdminArea, adminArea, country, feature } = results[0];
    // we could get as specific as sublocality here, but a lot of the results are
    // too specific to be helpful in the U.S. at least. neighborhoods, parks, etc.
    if ( locality ) {
      placeName = locality;
    } else if ( subAdminArea ) {
      placeName = subAdminArea;
    } else if ( adminArea ) {
      placeName = adminArea;
    } else if ( country ) {
      placeName = country;
    } else if ( feature ) {
      // this one shows non-land areas like Channels, Seas, Oceans
      placeName = feature;
    }
    return placeName;
  };



  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLocationName = async ( lat: ?number, lng: ?number ): Promise<?string> => {
      try {
        const results = await Geocoder.geocodePosition( { lat, lng } );
        if ( results.length === 0 || !isCurrent ) { return; }
        setLocation( setPlaceName( results ) );
      } catch ( e ) {
        console.log( e, "couldn't fetch geocoded position with coordinates: ", lat, lng );
      }
    };

    fetchLocationName( latitude, longitude );

    return ( ) => {
      isCurrent = false;
    };
  }, [latitude, longitude] );

  return location;
};

export default useLocationName;
