import Geolocation from "@react-native-community/geolocation";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useWatchPosition } from "sharedHooks";

const mockPositions = [
  {
    coords: {
      latitude: 1,
      longitude: 1,
      accuracy: 100,
    },
  },
  {
    coords: {
      latitude: 2,
      longitude: 2,
      accuracy: 20,
    },
  },
  {
    coords: {
      latitude: 3,
      longitude: 3,
      accuracy: 8,
    },
  },
];

const mockWatchPositionSuccess = jest.fn( onSuccess => onSuccess( ) );

describe( "useWatchPosition with inaccurate location", ( ) => {
  beforeEach( ( ) => {
    Geolocation.watchPosition.mockReset( );
    Geolocation.watchPosition.mockImplementation( success => {
      setTimeout( ( ) => mockWatchPositionSuccess( ( ) => success( mockPositions[0] ) ), 100 );
      return 0;
    } );
  } );

  // The success callback should have been called and that roughly
  // marks the end of async effects, so hopefull this prevents "outside of
  // act" warnings
  afterEach( ( ) => waitFor( ( ) => {
    expect( mockWatchPositionSuccess ).toHaveBeenCalled( );
    mockWatchPositionSuccess.mockClear( );
  } ) );

  it( "should be loading by default", async ( ) => {
    const { result } = renderHook( ( ) => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( ( ) => {
      expect( result.current.isFetchingLocation ).toBeTruthy( );
    } );
  } );

  it( "should return a user location", async ( ) => {
    const { result } = renderHook( ( ) => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( ( ) => {
      expect( result.current.userLocation.latitude ).toBeDefined( );
    } );
    expect( result.current.userLocation.latitude ).toEqual( mockPositions[0].coords.latitude );
  } );
} );

describe( "useWatchPosition with accurate location", ( ) => {
  beforeEach( ( ) => {
    Geolocation.watchPosition.mockImplementation( success => {
      setTimeout( ( ) => {
        mockWatchPositionSuccess( ( ) => success( mockPositions[0] ) );
        setTimeout( ( ) => {
          mockWatchPositionSuccess( ( ) => success( mockPositions[1] ) );
          setTimeout( ( ) => {
            mockWatchPositionSuccess( ( ) => success( mockPositions[2] ) );
          }, 100 );
        }, 100 );
      }, 100 );
      return 0;
    } );
  } );

  it( "should stop watching position when target accuracy reached", async ( ) => {
    const { result } = renderHook( ( ) => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( ( ) => {
      expect( result.current.userLocation?.positional_accuracy )
        .toEqual( mockPositions[2].coords.accuracy );
    } );
    expect( Geolocation.clearWatch ).toHaveBeenCalledTimes( 1 );
  } );
} );

describe( "useWatchPosition when shouldn't fetch", ( ) => {
  beforeEach( ( ) => {
    Geolocation.watchPosition.mockReset( );
  } );

  it( "should not watch position when shouldFetchLocation is false", async ( ) => {
    renderHook( ( ) => useWatchPosition( { shouldFetchLocation: false } ) );
    await waitFor( ( ) => {
      expect( Geolocation.watchPosition ).not.toHaveBeenCalled( );
    } );
  } );
} );
