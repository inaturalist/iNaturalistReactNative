import { renderHook } from "@testing-library/react-native";
import usePerformance from "sharedHooks/usePerformance";

const mockLoggerInfo = jest.fn( );
jest.mock( "sharedHelpers/logger", ( ) => ( {
  log: { extend: ( ) => ( { info: ( ...args: unknown[] ) => mockLoggerInfo( ...args ) } ) },
} ) );

const mockDebugModeEnabled = jest.fn( ( ): boolean => false );
jest.mock( "stores/useStore", ( ) => ( {
  __esModule: true,
  default: {
    getState: ( ) => ( { layout: { debugModeEnabled: mockDebugModeEnabled( ) } } ),
  },
} ) );

const mockNow = jest.fn( ( ): number => 0 );
jest.mock( "react-native-performance", ( ) => ( {
  __esModule: true,
  default: {
    now: ( ) => mockNow( ),
  },
} ) );

describe( "usePerformance", ( ) => {
  beforeEach( ( ) => {
    mockNow.mockReturnValue( 0 );
    mockDebugModeEnabled.mockReturnValue( true );
    mockLoggerInfo.mockClear( );
  } );

  it( "measures elapsed time from mount to stop and prefixes the screen name", ( ) => {
    mockNow.mockReturnValue( 1000 ); // mount
    const { result } = renderHook( ( ) => usePerformance( { screenName: "Test" } ) );

    mockNow.mockReturnValue( 1500 ); // stop
    result.current( );

    expect( mockLoggerInfo ).toHaveBeenCalledWith( "Test Load Time: 500 milliseconds" );
  } );

  it( "stops automatically on mount when isLoading is false", ( ) => {
    mockNow.mockReturnValue( 300 );

    renderHook( ( ) => usePerformance( {
      screenName: "Test",
      isLoading: false,
    } ) );

    expect( mockLoggerInfo ).toHaveBeenCalledWith( "Test Load Time: 0 milliseconds" );
  } );

  it( "stops automatically when isLoading flips to false", ( ) => {
    mockNow.mockReturnValue( 1000 ); // mount
    const { rerender } = renderHook(
      ( { isLoading }: { isLoading: boolean } ) => usePerformance( {
        screenName: "Test",
        isLoading,
      } ),
      { initialProps: { isLoading: true } },
    );

    expect( mockLoggerInfo ).not.toHaveBeenCalled( );

    mockNow.mockReturnValue( 1400 );
    rerender( { isLoading: false } );

    expect( mockLoggerInfo ).toHaveBeenCalledWith( "Test Load Time: 400 milliseconds" );
  } );

  it( "does not log when debug mode is disabled", ( ) => {
    mockDebugModeEnabled.mockReturnValue( false );

    const { result } = renderHook( ( ) => usePerformance( { screenName: "Test" } ) );
    result.current( );

    expect( mockLoggerInfo ).not.toHaveBeenCalled( );
  } );

  it( "returns a stable stop reference across renders", ( ) => {
    const { result, rerender } = renderHook( ( ) => usePerformance( { screenName: "Test" } ) );
    const firstStop = result.current;
    rerender( { } );

    expect( result.current ).toBe( firstStop );
  } );
} );
