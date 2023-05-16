import { renderHook } from "@testing-library/react-native";
import useObservationUpdatesWhenFocused from "sharedHooks/useObservationUpdatesWhenFocused";

const appStateListeners = {
};

jest.mock( "react-native/Libraries/AppState/AppState", ( ) => ( {
  addEventListener: jest.fn( ( event, callback ) => {
    appStateListeners[event] = callback;
    return {
      remove: jest.fn( () => {
        if ( appStateListeners[event] === callback ) {
          delete appStateListeners[event];
        }
      } )
    };
  } )
} ) );

describe( "useObservationUpdatesWhenFocused", ( ) => {
  it( "should add a change listener on mount", ( ) => {
    renderHook( ( ) => useObservationUpdatesWhenFocused( ) );
    expect( appStateListeners.change ).toBeDefined( );
    expect( appStateListeners.change ).toBeInstanceOf( Function );
  } );

  it( "should remove the change listener on unmount", ( ) => {
    const { unmount } = renderHook( ( ) => useObservationUpdatesWhenFocused( ) );
    unmount( );
    expect( appStateListeners.change ).toBeUndefined( );
  } );
} );
