import {
  getGeojsonRadiusMeters,
  latitudeDeltaToMeters,
} from "components/SharedComponents/Map/helpers/mapHelpers";
import haversineDistance from "haversine-distance";

describe( "getGeojsonRadiusMeters", ( ) => {

  test( "should give 0 for no bounding box", ( ) => {
    const radius = getGeojsonRadiusMeters( [0, 0], []);
    expect( radius ).toBe( 0 );
  } );

  test( "should give 0 for single point", ( ) => {
    const radius = getGeojsonRadiusMeters( [0, 0], [[ [0, 0] ]] );
    expect( radius ).toBe( 0 );
  } );

  test( "should be correct for 1 degree latitude", ( ) => {
    const radius = getGeojsonRadiusMeters( [0, 0], [[ [1, 0], [0, 1], [-1, 0], [0, -1] ]] );
    const expected = haversineDistance( [0, 0], [1, 0] );
    expect( radius ).toBe( expected );
  } );

  test( "should be correct for a point other than 0,0", ( ) => {
    const radius = getGeojsonRadiusMeters( [1, 1], [[ [2, 1], [1, 2] ]] );
    const expected = haversineDistance( [1, 1], [1, 2] );
    expect( radius ).toBe( expected );
  } );

  test( "should be correct for multiple rings", ( ) => {
    const radius = getGeojsonRadiusMeters( [0, 0], [ [[1, 0]], [[2, 0]] ] );
    const expected = haversineDistance( [0, 0], [2, 0] );
    expect( radius ).toBe( expected );
  } );
} );
