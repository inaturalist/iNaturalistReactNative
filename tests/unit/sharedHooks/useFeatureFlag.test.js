import { renderHook } from "@testing-library/react-native";
import useFeatureFlag, { resolveFeatureFlag } from "sharedHooks/useFeatureFlag";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => null,
} ) );

const layers = overrides => ( {
  override: null,
  apiValue: undefined,
  adminTestFlight: false,
  hardcoded: false,
  ...overrides,
} );

describe( "resolveFeatureFlag", ( ) => {
  it.each( [
    // hardcoded, apiValue, override, expected enabled, expected source
    [false, undefined, null, false, "hardcoded"],
    [true, undefined, null, true, "hardcoded"],
    [false, true, null, true, "api"],
    [true, false, null, false, "api"],
    [true, false, true, true, "override"],
    [true, undefined, false, false, "override"],
    [false, true, false, false, "override"],
  ] )(
    "hardcoded %p, API %p, override %p resolves to %p from %p",
    ( hardcoded, apiValue, override, enabled, source ) => {
      expect( resolveFeatureFlag( layers( { hardcoded, apiValue, override } ) ) )
        .toEqual( { enabled, source } );
    },
  );

  it( "uses the admin TestFlight layer only when the API didn't return the flag", ( ) => {
    expect( resolveFeatureFlag( layers( { adminTestFlight: true } ) ) )
      .toEqual( { enabled: true, source: "adminTestFlight" } );
    expect( resolveFeatureFlag( layers( { adminTestFlight: true, apiValue: false } ) ) )
      .toEqual( { enabled: false, source: "api" } );
  } );
} );

describe( "useFeatureFlag", ( ) => {
  it( "returns the hard-coded default before any API values arrive", ( ) => {
    const { result } = renderHook( ( ) => useFeatureFlag( FeatureFlag.ExploreV2 ) );
    expect( result.current ).toBe( true );
  } );

  it( "lets an API value turn a default-on flag off", ( ) => {
    useStore.getState( ).setFeatureFlagApiValues( { [FeatureFlag.ExploreV2]: false }, true );
    const { result } = renderHook( ( ) => useFeatureFlag( FeatureFlag.ExploreV2 ) );
    expect( result.current ).toBe( false );
  } );

  it( "lets a Debug override win over an API value", ( ) => {
    useStore.getState( ).setFeatureFlagApiValues( { [FeatureFlag.ExploreV2]: false }, true );
    useStore.getState( ).setFeatureFlagDebugOverride( FeatureFlag.ExploreV2, true );
    const { result } = renderHook( ( ) => useFeatureFlag( FeatureFlag.ExploreV2 ) );
    expect( result.current ).toBe( true );
  } );
} );
