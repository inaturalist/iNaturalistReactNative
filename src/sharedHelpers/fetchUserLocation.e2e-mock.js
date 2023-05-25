type UserLocation = {
  latitude: number,
  longitude: number,
  positional_accuracy: number,
  place_guess: string

}
const fetchUserLocation = async ( ): Promise<UserLocation> => new Promise( resolve => {
  setTimeout( ( ) => resolve( {
    place_guess: "San Francisco",
    latitude: -122.4194,
    longitude: 37.7749,
    positional_accuracy: 5
  } ), 1000 );
} );

export default fetchUserLocation;
