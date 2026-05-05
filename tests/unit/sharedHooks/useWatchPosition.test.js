import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useWatchPosition } from "sharedHooks";

const mockFetchAccurateUserLocation = jest.fn();
const mockFetchCoarseUserLocation = jest.fn();
const mockHasOnlyCoarseLocation = jest.fn();
const mockBlurListeners = [];

jest.mock( "../../../src/sharedHelpers/fetchAccurateUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchAccurateUserLocation(),
} ) );

jest.mock( "../../../src/sharedHelpers/fetchCoarseUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchCoarseUserLocation(),
} ) );

jest.mock( "components/SharedComponents/PermissionGateContainer", () => ( {
  hasOnlyCoarseLocation: () => mockHasOnlyCoarseLocation(),
} ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      addListener: ( event, callback ) => {
        if ( event === "blur" ) {
          mockBlurListeners.push( callback );
        }
        return jest.fn();
      },
    } ),
  };
} );

const inaccurateLocation = {
  latitude: 1,
  longitude: 1,
  positional_accuracy: 100,
  altitude: null,
  altitudinal_accuracy: null,
};

const accurateLocation = {
  latitude: 3,
  longitude: 3,
  positional_accuracy: 8,
  altitude: null,
  altitudinal_accuracy: null,
};

const coarseLocation = {
  latitude: 5,
  longitude: 5,
  positional_accuracy: 1000,
  altitude: null,
  altitudinal_accuracy: null,
};

beforeEach( () => {
  mockFetchAccurateUserLocation.mockReset();
  mockFetchCoarseUserLocation.mockReset();
  mockHasOnlyCoarseLocation.mockReset();
  mockHasOnlyCoarseLocation.mockResolvedValue( false );
  mockBlurListeners.length = 0;
} );

describe( "useWatchPosition with inaccurate location", () => {
  beforeEach( () => {
    mockFetchAccurateUserLocation.mockResolvedValue( inaccurateLocation );
  } );

  it( "should be loading by default", async () => {
    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    expect( result.current.isFetchingLocation ).toBeTruthy();
    await waitFor( () => {
      expect( mockFetchAccurateUserLocation ).toHaveBeenCalled();
    } );
  } );

  it( "should return a user location", async () => {
    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( () => {
      expect( result.current.userLocation?.latitude ).toBeDefined();
    } );
    expect( result.current.userLocation.latitude ).toEqual( inaccurateLocation.latitude );
  } );

  it( "should retry up to MAX_ATTEMPTS times when accuracy is not reached", async () => {
    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( () => {
      expect( result.current.isFetchingLocation ).toBeFalsy();
    } );
    expect( mockFetchAccurateUserLocation ).toHaveBeenCalledTimes( 5 );
  } );
} );

describe( "useWatchPosition with accurate location", () => {
  it( "should stop fetching when target accuracy reached", async () => {
    mockFetchAccurateUserLocation
      .mockResolvedValueOnce( inaccurateLocation )
      .mockResolvedValueOnce( accurateLocation );

    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( () => {
      expect( result.current.userLocation?.positional_accuracy )
        .toEqual( accurateLocation.positional_accuracy );
    } );
    expect( mockFetchAccurateUserLocation ).toHaveBeenCalledTimes( 2 );
    expect( result.current.isFetchingLocation ).toBeFalsy();
  } );

  it( "should keep the most accurate location across retries", async () => {
    const lessAccurate = { ...inaccurateLocation, positional_accuracy: 50 };
    mockFetchAccurateUserLocation
      .mockResolvedValueOnce( inaccurateLocation )
      .mockResolvedValueOnce( lessAccurate )
      .mockResolvedValue( inaccurateLocation );

    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( () => {
      expect( result.current.isFetchingLocation ).toBeFalsy();
    } );
    expect( result.current.userLocation?.positional_accuracy )
      .toEqual( lessAccurate.positional_accuracy );
  } );
} );

describe( "useWatchPosition when fetchAccurateUserLocation returns null", () => {
  it( "should stop retrying and leave userLocation null", async () => {
    mockFetchAccurateUserLocation.mockResolvedValue( null );

    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( () => {
      expect( result.current.isFetchingLocation ).toBeFalsy();
    } );
    expect( mockFetchAccurateUserLocation ).toHaveBeenCalledTimes( 1 );
    expect( result.current.userLocation ).toBeNull();
  } );
} );

describe( "useWatchPosition with only coarse location permission", () => {
  beforeEach( () => {
    mockHasOnlyCoarseLocation.mockResolvedValue( true );
    mockFetchCoarseUserLocation.mockResolvedValue( coarseLocation );
  } );

  it( "should fetch coarse location and skip accurate fetch", async () => {
    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( () => {
      expect( result.current.userLocation?.latitude ).toEqual( coarseLocation.latitude );
    } );
    expect( mockFetchCoarseUserLocation ).toHaveBeenCalledTimes( 1 );
    expect( mockFetchAccurateUserLocation ).not.toHaveBeenCalled();
  } );
} );

describe( "useWatchPosition when shouldn't fetch", () => {
  it( "should not fetch when shouldFetchLocation is false", async () => {
    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: false } ) );
    // Give effects a chance to run
    await waitFor( () => {
      expect( result.current.isFetchingLocation ).toBeFalsy();
    } );
    expect( mockFetchAccurateUserLocation ).not.toHaveBeenCalled();
    expect( mockFetchCoarseUserLocation ).not.toHaveBeenCalled();
  } );
} );

describe( "useWatchPosition cancel", () => {
  it( "should mark fetching as false when cancel is called", async () => {
    let resolveLocation;
    mockFetchAccurateUserLocation.mockImplementation(
      () => new Promise( resolve => { resolveLocation = resolve; } ),
    );

    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( () => {
      expect( result.current.isFetchingLocation ).toBeTruthy();
    } );

    act( () => {
      result.current.cancel();
    } );

    expect( result.current.isFetchingLocation ).toBeFalsy();

    await act( async () => {
      resolveLocation( inaccurateLocation );
    } );
    expect( result.current.userLocation ).toBeNull();
  } );
} );

describe( "useWatchPosition on screen blur", () => {
  it( "should cancel an in-flight fetch when the screen blurs", async () => {
    let resolveLocation;
    mockFetchAccurateUserLocation.mockImplementation(
      () => new Promise( resolve => { resolveLocation = resolve; } ),
    );

    const { result } = renderHook( () => useWatchPosition( { shouldFetchLocation: true } ) );
    await waitFor( () => {
      expect( result.current.isFetchingLocation ).toBeTruthy();
    } );
    expect( mockBlurListeners.length ).toBeGreaterThan( 0 );

    act( () => {
      mockBlurListeners.forEach( listener => listener() );
    } );

    expect( result.current.isFetchingLocation ).toBeFalsy();

    await act( async () => {
      resolveLocation( inaccurateLocation );
    } );
    expect( result.current.userLocation ).toBeNull();
  } );
} );
