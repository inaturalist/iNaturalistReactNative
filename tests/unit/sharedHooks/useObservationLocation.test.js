import { renderHook, waitFor } from "@testing-library/react-native";
import useObservationLocation from "sharedHooks/useObservationLocation";

jest.mock( "@react-navigation/native", () => ( {
  ...jest.requireActual( "@react-navigation/native" ),
  // Run the focus callback via useEffect so we don't need a NavigationContainer
  useFocusEffect: cb => jest.requireActual( "react" ).useEffect( cb, [] ),
} ) );

const mockUseWatchPosition = jest.fn( );
jest.mock( "sharedHooks/useWatchPosition", () => ( {
  __esModule: true,
  default: ( ...args ) => mockUseWatchPosition( ...args ),
} ) );

const mockHasOnlyCoarseLocation = jest.fn( );
jest.mock( "components/SharedComponents/PermissionGateContainer", () => ( {
  hasOnlyCoarseLocation: ( ...args ) => mockHasOnlyCoarseLocation( ...args ),
} ) );

const mockFetchCoarseUserLocation = jest.fn( );
jest.mock( "sharedHelpers/fetchCoarseUserLocation", () => ( {
  __esModule: true,
  default: ( ...args ) => mockFetchCoarseUserLocation( ...args ),
} ) );

const mockCoarseLocation = {
  latitude: 44.95,
  longitude: -93.27,
  positional_accuracy: 2000,
  altitude: null,
  altitudinal_accuracy: null,
};

const mockFineLocation = {
  latitude: 44.9537,
  longitude: -93.2690,
  positional_accuracy: 8,
  altitude: 250,
  altitudinal_accuracy: 3,
};

const defaultWatchResult = {
  isFetchingLocation: false,
  userLocation: null,
};

beforeEach( ( ) => {
  jest.clearAllMocks( );
  mockUseWatchPosition.mockReturnValue( defaultWatchResult );
} );

describe( "useObservationLocation", ( ) => {
  describe( "when only coarse location permission is granted", ( ) => {
    beforeEach( ( ) => {
      mockHasOnlyCoarseLocation.mockResolvedValue( true );
    } );

    it( "fetches coarse location and returns it as userLocation", async ( ) => {
      mockFetchCoarseUserLocation.mockResolvedValue( mockCoarseLocation );

      const { result } = renderHook( ( ) => useObservationLocation( {
        shouldFetchLocation: true,
      } ) );

      await waitFor( ( ) => {
        expect( result.current.userLocation ).toEqual( mockCoarseLocation );
      } );
      expect( result.current.isFetchingLocation ).toBe( false );
      expect( mockFetchCoarseUserLocation ).toHaveBeenCalledTimes( 1 );
    } );

    it( "does not pass shouldFetchLocation to useWatchPosition", async ( ) => {
      mockFetchCoarseUserLocation.mockResolvedValue( mockCoarseLocation );

      renderHook( ( ) => useObservationLocation( {
        shouldFetchLocation: true,
      } ) );

      await waitFor( ( ) => {
        expect( mockHasOnlyCoarseLocation ).toHaveBeenCalled( );
      } );
      const allCalls = mockUseWatchPosition.mock.calls;
      const lastCall = allCalls[allCalls.length - 1];
      expect( lastCall[0].shouldFetchLocation ).toBe( false );
    } );
  } );

  describe( "when fine location permission is granted", ( ) => {
    beforeEach( ( ) => {
      mockHasOnlyCoarseLocation.mockResolvedValue( false );
    } );

    it( "delegates to useWatchPosition and returns its location", async ( ) => {
      mockUseWatchPosition.mockReturnValue( {
        ...defaultWatchResult,
        isFetchingLocation: false,
        userLocation: mockFineLocation,
      } );

      const { result } = renderHook( ( ) => useObservationLocation( {
        shouldFetchLocation: true,
      } ) );

      await waitFor( ( ) => {
        expect( result.current.userLocation ).toEqual( mockFineLocation );
      } );
      expect( mockFetchCoarseUserLocation ).not.toHaveBeenCalled( );
    } );

    it( "passes shouldFetchLocation: true to useWatchPosition", async ( ) => {
      renderHook( ( ) => useObservationLocation( {
        shouldFetchLocation: true,
      } ) );

      await waitFor( ( ) => {
        const allCalls = mockUseWatchPosition.mock.calls;
        const lastCall = allCalls[allCalls.length - 1];
        expect( lastCall[0].shouldFetchLocation ).toBe( true );
      } );
    } );

    it( "reports isFetchingLocation from useWatchPosition", async ( ) => {
      mockUseWatchPosition.mockReturnValue( {
        ...defaultWatchResult,
        isFetchingLocation: true,
      } );

      const { result } = renderHook( ( ) => useObservationLocation( {
        shouldFetchLocation: true,
      } ) );

      await waitFor( ( ) => {
        expect( result.current.isFetchingLocation ).toBe( true );
      } );
    } );
  } );
} );
