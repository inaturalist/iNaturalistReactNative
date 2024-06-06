import Geolocation from "@react-native-community/geolocation";
import { renderHook, waitFor } from "@testing-library/react-native";
import useUserLocation from "sharedHooks/useUserLocation.ts";

const mockedGeolocation = jest.mocked( Geolocation );

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
    mockedGeolocation.getCurrentPosition.mockClear( );
    mockedGeolocation.getCurrentPosition
      .mockImplementationOnce( success => success( mockPositions[0] ) )
      .mockImplementationOnce( success => success( mockPositions[1] ) )
      .mockImplementationOnce( success => success( mockPositions[2] ) );
  } );

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
    expect( result?.current?.userLocation?.longitude ).toEqual( mockPositions[0].coords.latitude );
  } );
} );
