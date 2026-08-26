import { act, renderHook } from "@testing-library/react-native";
import useStateResetOn from "sharedHooks/useStateResetOn";

const INITIAL = { open: false };

const renderStateHook = ( ) => renderHook(
  ( { key } ) => useStateResetOn( key, INITIAL ),
  { initialProps: { key: "a" } },
);

describe( "useStateResetOn", ( ) => {
  it( "keeps what was set while the key is unchanged", ( ) => {
    const { rerender, result } = renderStateHook( );

    act( ( ) => result.current[1]( { open: true } ) );
    rerender( { key: "a" } );

    expect( result.current[0] ).toEqual( { open: true } );
  } );

  it( "goes back to the initial value when the key changes", ( ) => {
    const { rerender, result } = renderStateHook( );
    act( ( ) => result.current[1]( { open: true } ) );

    rerender( { key: "b" } );

    expect( result.current[0] ).toBe( INITIAL );
  } );

  it( "resets during the render the new key arrives in, not a render later", ( ) => {
    const values = [];
    const { rerender } = renderHook(
      ( { key } ) => {
        const [value] = useStateResetOn( key, INITIAL );
        values.push( value );
        return null;
      },
      { initialProps: { key: "a" } },
    );

    rerender( { key: "b" } );

    // an effect-based reset would show the stale value once before correcting it
    expect( values.every( value => value === INITIAL ) ).toBe( true );
  } );

  it( "restores what was set under a key when that key comes back", ( ) => {
    const { rerender, result } = renderStateHook( );
    act( ( ) => result.current[1]( { open: true } ) );

    rerender( { key: "b" } );
    expect( result.current[0] ).toBe( INITIAL );

    rerender( { key: "a" } );
    expect( result.current[0] ).toEqual( { open: true } );
  } );

  it( "keeps only the most recent write, so it is one slot rather than a history", ( ) => {
    const { rerender, result } = renderStateHook( );
    act( ( ) => result.current[1]( { open: true } ) );

    rerender( { key: "b" } );
    act( ( ) => result.current[1]( { open: false } ) );
    rerender( { key: "a" } );

    expect( result.current[0] ).toBe( INITIAL );
  } );
} );
