import { act, renderHook } from "@testing-library/react-native";
import useDebouncedValue from "sharedHooks/useDebouncedValue";

const DELAY = 400;

beforeEach( ( ) => {
  jest.useFakeTimers( );
} );

afterEach( ( ) => {
  jest.useRealTimers( );
} );

describe( "useDebouncedValue", ( ) => {
  it( "returns the initial value immediately", ( ) => {
    const { result } = renderHook( ( ) => useDebouncedValue( "start", DELAY ) );

    expect( result.current.debouncedValue ).toEqual( "start" );
  } );

  it( "does not update the value until the delay elapses", ( ) => {
    const { result } = renderHook( ( ) => useDebouncedValue( "", DELAY ) );

    act( ( ) => {
      result.current.debounce( "later" );
      jest.advanceTimersByTime( DELAY - 1 );
    } );

    expect( result.current.debouncedValue ).toEqual( "" );

    act( ( ) => {
      jest.advanceTimersByTime( 1 );
    } );

    expect( result.current.debouncedValue ).toEqual( "later" );
  } );

  it( "coalesces rapid calls so only the last value lands", ( ) => {
    const { result } = renderHook( ( ) => useDebouncedValue( "", DELAY ) );

    act( ( ) => {
      result.current.debounce( "a" );
      jest.advanceTimersByTime( DELAY - 100 );
      // A second call before the first fired resets the timer.
      result.current.debounce( "b" );
      jest.advanceTimersByTime( DELAY - 100 );
    } );

    // The pending "a" was cancelled, and "b" hasn't reached its full delay yet.
    expect( result.current.debouncedValue ).toEqual( "" );

    act( ( ) => {
      jest.advanceTimersByTime( 100 );
    } );

    expect( result.current.debouncedValue ).toEqual( "b" );
  } );

  it( "setImmediately applies the value now and cancels a pending debounce", ( ) => {
    const { result } = renderHook( ( ) => useDebouncedValue( "", DELAY ) );

    act( ( ) => {
      result.current.debounce( "pending" );
      result.current.setImmediately( "now" );
    } );

    expect( result.current.debouncedValue ).toEqual( "now" );

    // The pending debounce must not overwrite the immediate value later.
    act( ( ) => {
      jest.advanceTimersByTime( DELAY );
    } );

    expect( result.current.debouncedValue ).toEqual( "now" );
  } );

  it( "cancels a pending debounce on unmount", ( ) => {
    const clearTimeoutSpy = jest.spyOn( global, "clearTimeout" );
    const { result, unmount } = renderHook( ( ) => useDebouncedValue( "", DELAY ) );

    act( ( ) => {
      result.current.debounce( "never" );
    } );

    unmount( );

    expect( clearTimeoutSpy ).toHaveBeenCalled( );
    clearTimeoutSpy.mockRestore( );
  } );
} );
