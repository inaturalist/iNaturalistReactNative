import Geolocation from "@react-native-community/geolocation";
import { renderHook, waitFor } from "@testing-library/react-native";
import useUserLocation from "sharedHooks/useUserLocation.ts";

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

describe( "useUserLocation", ( ) => {
  beforeEach( ( ) => {
    Geolocation.getCurrentPosition.mockReset( );
    // Mock so success gets called immediately and so that three subsequent
    // calls succeed with changing coordinates and improving accuracy
    Geolocation.getCurrentPosition
      .mockImplementationOnce( success => success( mockPositions[0] ) )
      .mockImplementationOnce( success => success( mockPositions[1] ) )
      .mockImplementationOnce( success => success( mockPositions[2] ) );
  } );

  // Geolocation.getCurrentPosition should have been called and that roughly
  // marks the end of async effects, so hopefull this prevents "outside of
  // act" warnings
  afterEach( ( ) => waitFor( ( ) => {
    expect( Geolocation.getCurrentPosition ).toHaveBeenCalled( );
  } ) );

  it( "should be loading by default", async ( ) => {
    const { result } = renderHook( ( ) => useUserLocation( ) );
    await waitFor( ( ) => {
      expect( result.current.isLoading ).toBeTruthy( );
    } );
  } );

  it( "should return a user location", async ( ) => {
    const { result } = renderHook( ( ) => useUserLocation( ) );
    await waitFor( ( ) => {
      expect( result.current.userLocation ).toBeDefined( );
    } );
    expect( result?.current?.userLocation?.longitude )
      .toEqual( mockPositions[0].coords.latitude );
  } );

  describe( "untilAcc", ( ) => {
    it( "should fetch coordinates until target accuracy reached", async ( ) => {
      const { result } = renderHook( ( ) => useUserLocation( {
        untilAcc: 10
      } ) );
      await waitFor( ( ) => {
        expect( result.current.userLocation?.accuracy )
          .toEqual( mockPositions[2].coords.accuracy );
      }, { timeout: 4000, interval: 1000 } );
      expect( Geolocation.getCurrentPosition ).toHaveBeenCalledTimes( 3 );
    } );
  } );
} );
