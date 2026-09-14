import {
  getMapRegion,
  regionFromBounds,
} from "components/SharedComponents/Map/helpers/mapHelpers";

describe( "regionFromBounds", ( ) => {
  it( "covers exactly the bounds it was given", ( ) => {
    const region = regionFromBounds( {
      swlat: 10, swlng: 20, nelat: 30, nelng: 40,
    } );

    expect( region.latitude ).toBe( 20 );
    expect( region.longitude ).toBe( 30 );
    expect( region.latitudeDelta ).toBe( 20 );
    expect( region.longitudeDelta ).toBe( 20 );
  } );

  it( "round trips the bounds of a viewport without growing it", ( ) => {
    const bounds = {
      swlat: 37.7, swlng: -122.5, nelat: 37.8, nelng: -122.4,
    };
    const region = regionFromBounds( bounds );

    expect( region.latitude - ( region.latitudeDelta / 2 ) ).toBeCloseTo( bounds.swlat );
    expect( region.longitude - ( region.longitudeDelta / 2 ) ).toBeCloseTo( bounds.swlng );
    expect( region.latitude + ( region.latitudeDelta / 2 ) ).toBeCloseTo( bounds.nelat );
    expect( region.longitude + ( region.longitudeDelta / 2 ) ).toBeCloseTo( bounds.nelng );
  } );

  it( "keeps the latitude delta positive when the latitudes are inverted", ( ) => {
    const region = regionFromBounds( {
      swlat: 30, swlng: 20, nelat: 10, nelng: 40,
    } );

    expect( region.latitude ).toBe( 20 );
    expect( region.latitudeDelta ).toBe( 20 );
  } );

  it( "reads swlng > nelng as a box crossing the antimeridian, not as swapped corners", ( ) => {
    // Fiji, as the API returns it
    const region = regionFromBounds( {
      swlat: -20.61, swlng: 176.86, nelat: -12.49, nelng: -178.23,
    } );

    expect( region.longitudeDelta ).toBeCloseTo( 4.91 );
    expect( region.longitude ).toBeCloseTo( 179.315 );
  } );

  it( "centers a wide antimeridian-crossing box on the correct side of the world", ( ) => {
    // The United States, wrapping via the Aleutians
    const region = regionFromBounds( {
      swlat: 18.8, swlng: 172.61, nelat: 71.44, nelng: -66.8,
    } );

    expect( region.longitudeDelta ).toBeCloseTo( 120.59 );
    expect( region.longitude ).toBeCloseTo( -127.095 );
    expect( region.longitude ).toBeGreaterThanOrEqual( -180 );
    expect( region.longitude ).toBeLessThanOrEqual( 180 );
  } );

  it( "reads a wrap that lands just west of 0 as spanning the globe", ( ) => {
    // What the API returns for Animalia: a 360 degree box encoded as a wrap
    const region = regionFromBounds( {
      swlat: -84.41, swlng: 0, nelat: 89.99, nelng: -1.68e-7,
    } );

    expect( region.longitudeDelta ).toBeCloseTo( 360 );
    expect( region.longitude ).toBeCloseTo( 180 );
  } );

  it( "does not collapse a circumpolar range that wraps just past 0", ( ) => {
    // Polar bear: everywhere except a 4 degree gap over Norway
    const region = regionFromBounds( {
      swlat: 51.3, swlng: 1.04, nelat: 89.99, nelng: -3.08,
    } );

    expect( region.longitudeDelta ).toBeCloseTo( 355.88 );
    expect( region.longitude ).toBeCloseTo( 178.98 );
  } );
} );

describe( "getMapRegion", ( ) => {
  it( "frames the bounds with a bit of padding so the full range is visible", ( ) => {
    const region = getMapRegion( {
      swlat: 10, swlng: 20, nelat: 30, nelng: 40,
    } );

    expect( region.latitude ).toBe( 20 );
    expect( region.longitude ).toBe( 30 );
    expect( region.latitudeDelta ).toBe( 28 );
    expect( region.longitudeDelta ).toBe( 28 );
  } );

  it( "centers on the point when the bounds are a single point", ( ) => {
    const region = getMapRegion( {
      swlat: 37.5, swlng: -122.1, nelat: 37.5, nelng: -122.1,
    } );

    expect( region.latitude ).toBe( 37.5 );
    expect( region.longitude ).toBe( -122.1 );
    expect( region.latitudeDelta ).toBe( 0 );
    expect( region.longitudeDelta ).toBe( 0 );
  } );

  it( "pads the dimension that has range when the bounding box is flat", ( ) => {
    const region = getMapRegion( {
      swlat: 37.5, swlng: -122.5, nelat: 37.5, nelng: -120.5,
    } );

    expect( region.latitude ).toBe( 37.5 );
    expect( region.longitude ).toBe( -121.5 );
    expect( region.latitudeDelta ).toBe( 0 );
    expect( region.longitudeDelta ).toBeCloseTo( 2.8 );
  } );

  it( "does not ask for impossible deltas when the bounds are worldwide", ( ) => {
    const region = getMapRegion( {
      swlat: -90, swlng: -180, nelat: 90, nelng: 180,
    } );

    expect( region.latitude ).toBe( 0 );
    expect( region.longitude ).toBe( 0 );
    expect( region.latitudeDelta ).toBe( 89 );
    expect( region.longitudeDelta ).toBe( 179 );
  } );

  it( "keeps the latitude delta positive when the latitudes are inverted", ( ) => {
    const region = getMapRegion( {
      swlat: 30, swlng: 20, nelat: 10, nelng: 40,
    } );

    expect( region.latitudeDelta ).toBe( 28 );
    expect( region.longitudeDelta ).toBe( 28 );
  } );

  it( "frames an antimeridian-crossing place without leaving the coordinate system", ( ) => {
    // New Zealand, as the API returns it
    const region = getMapRegion( {
      swlat: -52.62, swlng: 165.81, nelat: -29.23, nelng: -175.81,
    } );

    expect( region.longitudeDelta ).toBeCloseTo( 18.38 * 1.4 );
    expect( region.longitude ).toBeCloseTo( 175 );
  } );
} );
