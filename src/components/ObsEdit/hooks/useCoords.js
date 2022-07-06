// @flow

import { useEffect, useState } from "react";
import Geocoder from "react-native-geocoder-reborn";

const useCoords = ( location: string ): Object => {
  const [coords, setCoords] = useState( {
    latitude: null,
    longitude: null
  } );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchCoordsByLocationName = async ( ): Promise<Object> => {
      try {
        const results = await Geocoder.geocodeAddress( location );

        if ( results.length === 0 ) { return; }

        const { position } = results[0];
        if ( !isCurrent ) { return; }
        setCoords( {
          latitude: position.lat,
          longitude: position.lng
        } );
      } catch ( e ) {
        console.log( e, "couldn't fetch coords by location name" );
        if ( !isCurrent ) { return; }
      }
    };

    fetchCoordsByLocationName( );
    return ( ) => {
      isCurrent = false;
    };
  }, [location] );

  return {
    ...coords,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2
  };
};

export default useCoords;


