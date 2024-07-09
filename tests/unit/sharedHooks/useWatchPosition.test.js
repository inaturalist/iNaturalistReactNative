import Geolocation from "@react-native-community/geolocation";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useWatchPosition } from "sharedHooks";

const mockPositions = [
  {
    coords: {
      latitude: 1,
      longitude: 1,
      accuracy: 100
    }
  },
  {
    coords: {
      latitude: 2,
      longitude: 2,
      accuracy: 20
    }
  },
  {
    coords: {
      latitude: 3,
      longitude: 3,
      accuracy: 8
    }
  }
];

describe( "useWatchPosition with inaccurate location", ( ) => {
  beforeEach( ( ) => {
    Geolocation.watchPosition.mockReset( );
    // Mock so success gets called immediately and so that three subsequent
    // calls succeed with changing coordinates and improving accuracy
    Geolocation.watchPosition.mockImplementationOnce( success => success( mockPositions[0] ) );
  } );

  // Geolocation.watchPosition should have been called and that roughly
  // marks the end of async effects, so hopefull this prevents "outside of
  // act" warnings
  afterEach( ( ) => waitFor( ( ) => {
    expect( Geolocation.watchPosition ).toHaveBeenCalled( );
  } ) );

  it( "should be loading by default", async ( ) => {
    const { result } = renderHook( ( ) => useWatchPosition( ) );
    await waitFor( ( ) => {
      expect( result.current.isFetchingLocation ).toBeTruthy( );
    } );
  } );

  it( "should return a user location", async ( ) => {
    const { result } = renderHook( ( ) => useWatchPosition( ) );
    await waitFor( ( ) => {
      expect( result.current.userLocation ).toBeDefined( );
    } );
    expect( result?.current?.userLocation?.longitude )
      .toEqual( mockPositions[0].coords.latitude );
  } );
} );

describe( "useWatchPosition with accurate location", ( ) => {
  beforeEach( ( ) => {
    Geolocation.watchPosition.mockReset( );
    // Mock so success gets called immediately and so that three subsequent
    // calls succeed with changing coordinates and improving accuracy
    Geolocation.watchPosition
      .mockImplementationOnce( success => success( mockPositions[0] ) )
      .mockImplementationOnce( success => success( mockPositions[1] ) )
      .mockImplementationOnce( success => success( mockPositions[2] ) );
  } );

  it( "should stop watching position when target accuracy reached", async ( ) => {
    const { result } = renderHook( ( ) => useWatchPosition( ) );
    expect( Geolocation.watchPosition ).not.toHaveBeenCalled( );
    await waitFor( ( ) => {
      // 20240709 amanda - not totally sure why there's an extra call to watchPosition
      // here since we're mocking the implementation 3x
      expect( Geolocation.watchPosition ).toHaveBeenCalledTimes( 4 );
    } );
    await waitFor( ( ) => {
      expect( result.current.userLocation?.positional_accuracy )
        .toEqual( mockPositions[2].coords.accuracy );
    } );
    expect( Geolocation.clearWatch ).toHaveBeenCalledTimes( 1 );
  } );
} );
