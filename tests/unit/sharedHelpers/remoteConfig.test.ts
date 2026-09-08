import {
  fetchAndActivate,
  getValue,
  setConfigSettings,
  setDefaults,
} from "@react-native-firebase/remote-config";
import { fetchAndActivateFeatureFlags } from "sharedHelpers/remoteConfig";
import { FeatureFlag, initialFeatureFlagConfig } from "stores/createFeatureFlagSlice";

const mockGetValue = getValue as jest.Mock;
const mockFetchAndActivate = fetchAndActivate as jest.Mock;

describe( "fetchAndActivateFeatureFlags", () => {
  beforeEach( () => {
    mockGetValue.mockImplementation( () => ( { asBoolean: () => false } ) );
  } );

  afterEach( () => {
    jest.clearAllMocks();
  } );

  it( "sets remote config defaults and fetches before reading flags", async () => {
    await fetchAndActivateFeatureFlags();

    expect( setConfigSettings ).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining( { minimumFetchIntervalMillis: expect.any( Number ) } ),
    );
    expect( setDefaults ).toHaveBeenCalledWith( expect.anything(), initialFeatureFlagConfig );
    expect( fetchAndActivate ).toHaveBeenCalled();
  } );

  it( "returns a boolean for every FeatureFlag, reflecting remote values", async () => {
    mockGetValue.mockImplementation( ( _remoteConfig, key ) => ( {
      asBoolean: () => key === FeatureFlag.NewsEnabled,
    } ) );

    const config = await fetchAndActivateFeatureFlags();

    expect( Object.keys( config ).sort() ).toEqual( Object.values( FeatureFlag ).sort() );
    expect( config[FeatureFlag.NewsEnabled] ).toBe( true );
    expect( config[FeatureFlag.ExploreV2Enabled] ).toBe( false );
  } );

  it( "falls back to the default-backed flag record when fetchAndActivate throws", async () => {
    mockFetchAndActivate.mockRejectedValueOnce( new Error( "network error" ) );

    const config = await fetchAndActivateFeatureFlags();

    expect( config ).toEqual( initialFeatureFlagConfig );
  } );
} );
