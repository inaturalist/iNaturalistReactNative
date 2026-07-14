import { waitFor } from "@testing-library/react-native";
import useResolvedNearbyLocation
  from "components/Explore/ExploreV2/hooks/useResolvedNearbyLocation";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import { queryClient, renderHookInApp } from "tests/helpers/render";

jest.mock( "sharedHelpers/fetchCoarseUserLocation", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const fetchCoarseUserLocation = require( "sharedHelpers/fetchCoarseUserLocation" ).default;

jest.mock( "sharedHelpers/geolocationWrapper", ( ) => ( {
  __esModule: true,
  checkLocationPermissions: jest.fn( ),
} ) );
const { checkLocationPermissions } = require( "sharedHelpers/geolocationWrapper" );

beforeEach( ( ) => {
  fetchCoarseUserLocation.mockReset( );
  checkLocationPermissions.mockReset( );
  // The resolver caches with staleTime/gcTime Infinity under a fixed key, so
  // clear it between tests to avoid one test's result bleeding into the next.
  queryClient.clear( );
} );

describe( "useResolvedNearbyLocation", ( ) => {
  it( "stays idle and resolves nothing when not enabled", async ( ) => {
    const { result } = renderHookInApp( ( ) => useResolvedNearbyLocation( false ) );

    expect( result.current.isResolving ).toBe( false );
    expect( result.current.resolved ).toBeUndefined( );
    expect( fetchCoarseUserLocation ).not.toHaveBeenCalled( );
  } );

  it( "resolves to NEARBY with coordinates when a fix is available", async ( ) => {
    fetchCoarseUserLocation.mockResolvedValue( { latitude: 10, longitude: 20 } );

    const { result } = renderHookInApp( ( ) => useResolvedNearbyLocation( true ) );

    await waitFor( ( ) => expect( result.current.resolved ).toEqual( {
      placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
      lat: 10,
      lng: 20,
      radius: 1,
    } ) );
    expect( result.current.isResolving ).toBe( false );
  } );

  it( "resolves to WORLDWIDE when there's no fix but permission is granted", async ( ) => {
    fetchCoarseUserLocation.mockResolvedValue( null );
    checkLocationPermissions.mockResolvedValue( true );

    const { result } = renderHookInApp( ( ) => useResolvedNearbyLocation( true ) );

    await waitFor( ( ) => expect( result.current.resolved ).toEqual( {
      placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE,
    } ) );
  } );

  it( "resolves to NEEDS_PERMISSION when there's no fix and permission is missing", async ( ) => {
    fetchCoarseUserLocation.mockResolvedValue( null );
    checkLocationPermissions.mockResolvedValue( false );

    const { result } = renderHookInApp( ( ) => useResolvedNearbyLocation( true ) );

    await waitFor( ( ) => expect( result.current.resolved ).toEqual( {
      placeMode: EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION,
    } ) );
  } );
} );
