import { renderHook } from "@testing-library/react-native";
import syncFeatureFlags from "sharedHelpers/syncFeatureFlags";
import useSyncFeatureFlags from "sharedHooks/useSyncFeatureFlags";

jest.mock( "sharedHelpers/syncFeatureFlags", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

const renderSync = ( ) => renderHook(
  ( { userId } ) => useSyncFeatureFlags( userId ),
  { initialProps: { userId: undefined } },
);

describe( "useSyncFeatureFlags", ( ) => {
  beforeEach( ( ) => {
    jest.mocked( syncFeatureFlags ).mockClear( );
  } );

  it( "syncs on mount and not on a re-render with the same user", ( ) => {
    const { rerender } = renderSync( );
    rerender( { userId: undefined } );
    rerender( { userId: undefined } );
    expect( syncFeatureFlags ).toHaveBeenCalledTimes( 1 );
  } );

  it( "syncs again on login and on logout", ( ) => {
    const { rerender } = renderSync( );
    rerender( { userId: 123 } );
    expect( syncFeatureFlags ).toHaveBeenCalledTimes( 2 );
    rerender( { userId: undefined } );
    expect( syncFeatureFlags ).toHaveBeenCalledTimes( 3 );
  } );
} );
