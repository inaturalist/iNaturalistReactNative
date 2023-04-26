// @flow
import Geocoder from "react-native-geocoder-reborn";

const fetchCoordinates = async ( locationName: ?string ): any => {
  if ( !locationName ) { return null; }
  try {
    const results = await Geocoder.geocodeAddress( locationName );
    if ( results.length === 0 ) { return null; }
    const { position } = results[0];
    return {
      latitude: position.lat,
      longitude: position.lng
    };
  } catch ( e ) {
    return null;
  }
};

export default fetchCoordinates;
